import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import { SafeHtmlUtils } from '../src/ApiSchemaRender.js';
import '../api-schema-render.js';

describe('<api-schema-render>', function() {
  async function basicFixture() {
    return (await fixture(`<api-schema-render></api-schema-render>`));
  }

  describe('_codeChanged()', () => {
    let element;
    let out;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      out = element.shadowRoot.querySelector('#output');
    });

    it('Clears the output when no code', () => {
      out.innerHTML = 'test';
      element._codeChanged();
      assert.equal(out.innerText.trim(), '');
    });

    it('Sets type to json', () => {
      element._codeChanged('{}');
      assert.equal(element.type, 'json');
    });

    it('Sets type to xml', () => {
      element._codeChanged('<?XML>');
      assert.equal(element.type, 'xml');
    });
  });

  describe('_clearTypeAttribute()', () => {
    let element;
    let out;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      out = element.shadowRoot.querySelector('#output');
    });

    it('Does nothing when no type', () => {
      element._clearTypeAttribute();
    });

    it('Removes the attribute', () => {
      out.dataset.type = 'json';
      out.setAttribute('language-json', 'true');
      element._clearTypeAttribute();
      assert.isFalse(out.hasAttribute('language-json'));
    });
  });

  describe('_typeChanged()', () => {
    let element;
    let out;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      out = element.shadowRoot.querySelector('#output');
    });

    it('Does nothing when no type', () => {
      element._typeChanged();
      assert.isUndefined(out.dataset.type);
    });

    it('Sets data-type attribute', () => {
      element._typeChanged('xml');
      assert.equal(out.dataset.type, 'xml');
    });

    it('Sets language-* attribute', () => {
      element._typeChanged('xml');
      assert.isTrue(out.hasAttribute('language-xml'));
    });
  });

  describe('SafeHtmlUtils', () => {
    describe('htmlEscape()', () => {
      it('returns the same input when no string', () => {
        const result = SafeHtmlUtils.htmlEscape(22);
        assert.equal(result, 22);
      });

      it('replaces "&" characters', () => {
        const result = SafeHtmlUtils.htmlEscape('&a&');
        assert.equal(result, '&amp;a&amp;');
      });

      it('replaces "<" characters', () => {
        const result = SafeHtmlUtils.htmlEscape('<a<');
        assert.equal(result, '&lt;a&lt;');
      });

      it('replaces ">" characters', () => {
        const result = SafeHtmlUtils.htmlEscape('>a>');
        assert.equal(result, '&gt;a&gt;');
      });

      it('replaces quote characters', () => {
        const result = SafeHtmlUtils.htmlEscape('"a"');
        assert.equal(result, '&quot;a&quot;');
      });

      it('replaces single quote characters', () => {
        const result = SafeHtmlUtils.htmlEscape("'a'");
        assert.equal(result, '&#39;a&#39;');
      });
    });
  });

  describe('Huge schema rendering', () => {
    let element;
    let out;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      out = element.shadowRoot.querySelector('#output');
    });

    function getString(size) {
      size = size || 10001;
      let result = '<element>&"\'';
      for (let i = 0; i < size; i++) {
        result += 'a';
      }
      result += '</result>';
      return result;
    }

    it('renders sanitized code', async () => {
      element._codeChanged(getString());
      await aTimeout();
      const result = out.innerHTML;
      // even though the " and ' characters are replaced when reading them back
      // from the output element they are converted to " and '
      assert.equal(result.substr(0, 20), '&lt;element&gt;&amp;');
    });
  });
});
