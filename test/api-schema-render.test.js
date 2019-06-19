import { fixture, assert, nextFrame } from '@open-wc/testing';
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
});
