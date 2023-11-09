/* eslint-disable prefer-destructuring */
import { fixture, assert, html, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-schema-document.js';

/** @typedef {import('..').ApiSchemaDocument} ApiSchemaDocument */

describe('ApiSchemaDocument', () => {
  /**
   * @param {any} amf
   * @return {Promise<ApiSchemaDocument>}
   */
  async function basicFixture(amf) {
    return (fixture(html`<api-schema-document .amf="${amf}"></api-schema-document>`));
  }

  /**
   * @param {any} amf
   * @param {string} parentTypeId
   * @param {string} mediaType
   * @param {any} shape
   * @return {Promise<ApiSchemaDocument>}
   */
  async function payloadFixture(amf, parentTypeId, mediaType, shape) {
    return (fixture(html`<api-schema-document
      .amf="${amf}"
      .mediaType="${mediaType}"
      .parentTypeId="${parentTypeId}"
      .shape="${shape}"></api-schema-document>`));
  }

  [
    // ['Full model', false],
    ['Compact model', true]
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      let amfModel;
      before(async () => {
        amfModel = await AmfLoader.load(compact);
      });

      describe('JSON schema', () => {
        let element = /** @type ApiSchemaDocument  */ (null);
        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amfModel;
          const decl = element._computeDeclares(amfModel);
          element.shape = decl[1];
          await nextFrame();
        });

        it('exampleOnly is computed', () => {
          assert.isTrue(element._exampleOnly);
        });

        it('schemaOnly is computed', () => {
          assert.isFalse(element._schemaOnly);
        });

        it('schemaAndExample is computed', () => {
          assert.isFalse(element._schemaAndExample);
        });

        it('_examples is computed', () => {
          assert.typeOf(element._examples, 'array');
          assert.lengthOf(element._examples, 1);
        });

        it('_raw is undefined', () => {
          assert.isUndefined(element._raw);
        });

        it('Does not render tabs', async () => {
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('anypoint-tabs');
          assert.notOk(node);
        });
      });

      describe('XML schema', () => {
        let element = /** @type ApiSchemaDocument  */ (null);
        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amfModel;
          const decl = element._computeDeclares(amfModel);
          element.shape = decl[4];
          await nextFrame();
        });

        it('exampleOnly is computed', () => {
          assert.isFalse(element._exampleOnly);
        });

        it('schemaOnly is computed', () => {
          assert.isFalse(element._schemaOnly);
        });

        it('schemaAndExample is computed', () => {
          assert.isTrue(element._schemaAndExample);
        });

        it('_examples is computed', () => {
          assert.typeOf(element._examples, 'array');
          assert.lengthOf(element._examples, 1);
        });

        it('_raw is computed', () => {
          assert.typeOf(element._raw, 'string');
        });

        it('Renders tabs', async () => {
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('anypoint-tabs');
          assert.ok(node);
        });

        it('renders api-schema-render for default page selection', async () => {
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-schema-render');
          assert.ok(node);
        });

        it('renders api-schema-render', async () => {
          await aTimeout(0);
          element.selectedPage = 1;
          await aTimeout(0);
          const node = element.shadowRoot.querySelector('api-schema-render');
          assert.ok(node);
        });
      });

      describe('_schemaChanged()', () => {
        let element = /** @type ApiSchemaDocument  */ (null);
        let declares;
        beforeEach(async () => {
          element = await basicFixture();
          element.amf = amfModel;
          declares = element._computeDeclares(amfModel);
        });

        it('Sets _exampleOnly to false when no shape', () => {
          element._exampleOnly = true;
          element._schemaChanged({});
          assert.isFalse(element._exampleOnly);
        });

        it('Sets _schemaOnly to false when no shape', () => {
          element._schemaOnly = true;
          element._schemaChanged({});
          assert.isFalse(element._schemaOnly);
        });

        it('Sets _schemaAndExample to false when no shape', () => {
          element._schemaAndExample = true;
          element._schemaChanged({});
          assert.isFalse(element._schemaAndExample);
        });

        it('Clears _examples', () => {
          element._examples = [];
          element._schemaChanged({});
          assert.isUndefined(element._examples);
        });

        it('Clears _raw', () => {
          element._raw = [];
          element._schemaChanged({});
          assert.isUndefined(element._raw);
        });

        it('Clears state when @type not supported', () => {
          element._examples = [];
          const shape = declares[1];
          shape['@type'] = [];
          element._schemaChanged(shape);
          assert.isUndefined(element._examples);
        });
      });

      describe('Schema and examples processing', () => {
        // I am not sure how this should work...
        it.skip('renders json schema + example', async () => {
          const [id, mediaType, model] = AmfLoader.lookupPayloadSchema(amfModel, '/json-schema', 'post');
          const element = await payloadFixture(amfModel, id, mediaType, model);
          await aTimeout(0);
          assert.isTrue(element._schemaAndExample, '_schemaAndExample is set');
          assert.include(element._raw, '{\n  "$id": "http://example.com/example.json",', '_raw is set');
          assert.lengthOf(element._examples, 1, '_examples is set');
        });

        it('renders XML schema + example', async () => {
          const [id, mediaType, model] = AmfLoader.lookupPayloadSchema(amfModel, '/xml-schema', 'post');
          const element = await payloadFixture(amfModel, id, mediaType, model);
          await aTimeout(0);
          assert.isTrue(element._schemaAndExample, '_schemaAndExample is set');
          assert.include(element._raw, '<?xml version="1.0" encoding="UTF-8"?>', '_raw is set');
          assert.lengthOf(element._examples, 1, '_examples is set');
        });

        it('renders XML example only for RAML type', async () => {
          const [id, mediaType, model] = AmfLoader.lookupPayloadSchema(amfModel, '/raml-xml-schema', 'post');
          const element = await payloadFixture(amfModel, id, mediaType, model);
          await aTimeout(0);
          assert.isTrue(element._exampleOnly, '_exampleOnly is set');
          assert.isUndefined(element._raw, '_raw is not set');
          assert.lengthOf(element._examples, 1, '_examples is set');
        });

        it('renders JSON example only', async () => {
          const [id, mediaType, model] = AmfLoader.lookupPayloadSchema(amfModel, '/raml-json-simple-schema', 'post');
          const element = await payloadFixture(amfModel, id, mediaType, model);
          await aTimeout(0);
          assert.isTrue(element._exampleOnly, '_schemaOnly is set');
          assert.isUndefined(element._raw, '_raw is not set');
          assert.lengthOf(element._examples, 1, '_examples is set');
        });

        it('generates JSON example', async () => {
          const [id, mediaType, model] = AmfLoader.lookupPayloadSchema(amfModel, '/raml-json-no-example-schema', 'post');
          const element = await payloadFixture(amfModel, id, mediaType, model);
          await aTimeout(0);
          assert.isTrue(element._exampleOnly, '_schemaOnly is set');
          assert.isUndefined(element._raw, '_raw is not set');
          assert.lengthOf(element._examples, 1, '_examples is set');
        });
      });
    });
  });

  [
    ['xsd-sample-schema', true],
    ['json-sample-schema', true]
  ].forEach(([fileName, compact]) => {
    describe('Render examples beauty for .xsd and JSON schema', () => {
      let element;
      let amfModel;
      before(async () => {
        amfModel = await AmfLoader.load({ compact, fileName});
      });

      beforeEach(async () => {
        const [id, mediaType, model] = AmfLoader.lookupPayloadSchema(amfModel, '/createTxn', 'post');
        element = await payloadFixture(amfModel, id, mediaType, model);
        await nextFrame();
      })

      it('should have to examples', () => {
        assert.lengthOf(element._examples, 3);
      });

      it('should render 3 example panels with title and content', async () => {
        // GIVEN
        const tabs = element.shadowRoot.querySelector('anypoint-tabs');

        // WHEN
        tabs.selected = 1;
        await nextFrame();

        // THEN
        const examplePanels = element.shadowRoot.querySelectorAll('.item-container');
        assert.lengthOf(examplePanels, 3);

        const exampleTitles = element.shadowRoot.querySelectorAll('.example-title');
        assert.lengthOf(exampleTitles, 3);
        assert.equal(exampleTitles[0].innerText.trim(), 'One');
        assert.equal(exampleTitles[1].innerText.trim(), 'Two');
        assert.equal(exampleTitles[2].innerText.trim(), 'Three');

        const exampleExpandIcons = element.shadowRoot.querySelectorAll('.expand-icon');
        assert.lengthOf(exampleExpandIcons, 3);

        const exampleContents = element.shadowRoot.querySelectorAll('.renderer');
        assert.lengthOf(exampleContents, 3);
      });

      it('should render panels closed when _collapseExamplePanel is false', async () => {
        // GIVEN
        const tabs = element.shadowRoot.querySelector('anypoint-tabs');

        // WHEN
        tabs.selected = 1;
        await nextFrame();

        element._collapseExamplePanel = false;
        await nextFrame();

        // THEN
        const collapsePanels = element.shadowRoot.querySelectorAll('.collapse');
        assert.lengthOf(collapsePanels, 0);

        const exampleTitles = element.shadowRoot.querySelectorAll('.expand-icon');
        exampleTitles.forEach((item) => {
          assert.match(item.getAttribute('icon'), /^expandLess/, 'Attribute "icon" should start with "expandLess"');
        })
      });

      it('should render panels closed when _collapseExamplePanel is true', async () => {
        // GIVEN
        const tabs = element.shadowRoot.querySelector('anypoint-tabs');

        // WHEN
        tabs.selected = 1;
        await nextFrame();

        element._collapseExamplePanel = true;
        await nextFrame();

        // THEN
        const collapsePanels = element.shadowRoot.querySelectorAll('.collapse');
        assert.lengthOf(collapsePanels, 3);

        const exampleTitles = element.shadowRoot.querySelectorAll('.expand-icon');
        exampleTitles.forEach((item) => {
          assert.match(item.getAttribute('icon'), /^expandMore/, 'Attribute "icon" should start with "expandMore"');
        })
      });

      it('should add collapse class to example when click', async () => {
        // GIVEN
        const tabs = element.shadowRoot.querySelector('anypoint-tabs');

        // WHEN
        tabs.selected = 1;
        await nextFrame();

        // THEN
        const exampleExpandIcons = element.shadowRoot.querySelectorAll('.example-title');
        assert.lengthOf(exampleExpandIcons, 3);

        // AND WHEN
        exampleExpandIcons[1].click();
        await nextFrame();

        // THEN
        const exampleContents = element.shadowRoot.querySelectorAll('.renderer');
        assert.isTrue(exampleContents[1].classList.contains('collapse'));
        const examplesCollapse = element.shadowRoot.querySelectorAll('.collapse');
        assert.lengthOf(examplesCollapse, 1);
      });
    });
  });
});
