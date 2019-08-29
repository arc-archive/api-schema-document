import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import '../api-schema-document.js';

describe('<api-schema-document>', function() {
  async function basicFixture() {
    return (await fixture(`<api-schema-document></api-schema-document>`));
  }

  [
    ['Full model', false],
    ['Compact model', true]
  ].forEach((item) => {
    describe(item[0], () => {
      let amfModel;
      before(async () => {
        amfModel = await AmfLoader.load(item[1]);
      });

      describe('JSON schema', () => {
        let element;
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
          await aTimeout();
          const node = element.shadowRoot.querySelector('anypoint-tabs');
          assert.notOk(node);
        });
      });

      describe('XML schema', () => {
        let element;
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
          await aTimeout();
          const node = element.shadowRoot.querySelector('anypoint-tabs');
          assert.ok(node);
        });

        it('renders api-schema-render for default page selection', async () => {
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-schema-render');
          assert.ok(node);
        });

        it('renders api-schema-render', async () => {
          await aTimeout();
          element.selectedPage = 1;
          await aTimeout();
          const node = element.shadowRoot.querySelector('api-schema-render');
          assert.ok(node);
        });
      });

      describe('_schemaChanged()', () => {
        let element;
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
    });
  });

  describe('_processExamples()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns undefined when no argument', () => {
      const result = element._processExamples();
      assert.isUndefined(result);
    });

    it('Returns undefined when argument is empty array', () => {
      const result = element._processExamples([]);
      assert.isUndefined(result);
    });

    it('Calls _resolve() for each item in array', () => {
      const spy = sinon.spy(element, '_resolve');
      element._processExamples([{}, {}]);
      assert.equal(spy.callCount, 2);
    });
  });
});
