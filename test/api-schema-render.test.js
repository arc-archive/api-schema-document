import { fixture, assert, aTimeout, html, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';
import '../api-schema-render.js';

/** @typedef {import('..').ApiSchemaRender} ApiSchemaRender */
/** @typedef {import('@advanced-rest-client/clipboard-copy').ClipboardCopyElement} ClipboardCopyElement */

describe('ApiSchemaRender', () => {
  /**
   * @return {Promise<ApiSchemaRender>}
   */
  async function basicFixture() {
    return fixture(html`<api-schema-render></api-schema-render>`);
  }

  describe('_detectType()', () => {
    let element = /** @type ApiSchemaRender  */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets json for JSON data', () => {
      element._detectType('{"test": true}');
      assert.equal(element._detectedType, 'json');
    });

    it('sets xml for XML data', () => {
      element._detectType('<api></api>');
      assert.equal(element._detectedType, 'xml');
    });
  });

  describe('_codeChanged()', () => {
    let element = /** @type ApiSchemaRender  */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    function getString(size = 10001) {
      let result = '<element>&"\'';
      for (let i = 0; i < size; i++) {
        result += 'a';
      }
      result += '</result>';
      return result;
    }

    it('clears the _codeValue when no code', () => {
      element._codeValue = 'test';
      element._codeChanged();
      assert.isUndefined(element._codeValue);
    });

    it('detects the type when not set', () => {
      element.code = '{"test": true}';
      assert.equal(element._detectedType, 'json');
    });

    it('sets the _codeValue property', () => {
      element.code = '{"test": true}';
      assert.equal(element._codeValue, element.code);
    });

    it('renders raw content when limit exceeded', async () => {
      element.code = getString();
      element.lang = 'xml';
      await aTimeout(0);
      assert.isTrue(element._ignoreType);
      const prism = element.shadowRoot.querySelector('prism-highlight');
      assert.isTrue(prism.raw);
    });

    it('should not cause duplicated schema when content is too long', async () => {
      // Length 10001
      element.code = getString();
      element.type = 'xml';
      await aTimeout(50);
      const prism = element.shadowRoot.querySelector('prism-highlight');
      // This is set to 11000 because the actual length is greater than 10001, the important part is that it not be twice as long
      assert.isTrue(prism.shadowRoot.querySelector('code#output').textContent.length < 11000);
    });
  });

  // test copy to clipboard
  describe('copy to clipboard', () => {
    let element = /** @type ApiSchemaRender  */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('copies the code to clipboard', async () => {
      element.code = '{"test": true}';
      await aTimeout(0);
      const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('clipboard-copy'))
      button.click();
      element._resetCopyButtonState(button);
      // @ts-ignore
      assert.isFalse(button.part.contains('content-action-button-disabled'));
    });
  });

  describe('_copyToClipboard()', () => {
    let element = /** @type ApiSchemaRender */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
    });

    it('Calls copy() in the `clipboard-copy` element', async () => {
      element._codeValue = '{}';
      await nextFrame();
      const copy = /** @type ClipboardCopyElement */ (element.shadowRoot.querySelector('clipboard-copy'));
      const spy = sinon.spy(copy, 'copy');
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      /** @type HTMLElement */ (button).click();
      assert.isTrue(spy.called);
    });

    it('Changes the label', async () => {
      element._codeValue = '{}';
      await nextFrame();
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('[data-action="copy"]'));
      /** @type HTMLElement */ (button).click();
      assert.notEqual(button.innerText.trim().toLowerCase(), 'copy');
    });

    it('Disables the button', (done) => {
      element._codeValue = '{}';
      setTimeout(() => {
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('[data-action="copy"]'));
        button.click();
        assert.isTrue(button.disabled);
        done();
      });
    });
  });

  describe('_resetCopyButtonState()', () => {
    let element = /** @type ApiSchemaRender */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element._codeValue = '{}';
      await nextFrame();
    });

    it('Changes label back', (done) => {
      element._codeValue = '{}';
      setTimeout(() => {
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('[data-action="copy"]'));
        button.innerText = 'test';
        element._resetCopyButtonState(button);
        assert.equal(button.innerText.trim().toLowerCase(), 'copy');
        done();
      });
    });

    it('Restores disabled state', (done) => {
      element._codeValue = '{}';
      setTimeout(() => {
        const button = /** @type HTMLButtonElement */ (element.shadowRoot.querySelector('[data-action="copy"]'));
        button.click();
        button.disabled = true;
        element._resetCopyButtonState(button);
        assert.isFalse(button.disabled);
        done();
      });
    });
  });
});
