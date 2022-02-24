import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import '../api-schema-render.js';

/** @typedef {import('..').ApiSchemaRender} ApiSchemaRender */

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
      element.code = getString();
      element.type = 'xml';
      await aTimeout(50);
      const prism = element.shadowRoot.querySelector('prism-highlight');
      // This is set to 11000 because the actual length is greater than 10001
      assert.isTrue(prism.shadowRoot.querySelector('code#output').textContent.length < 11000);
    });
  });
});
