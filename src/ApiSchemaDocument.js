/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import { ExampleGenerator } from '@api-components/api-example-generator';
import '../api-schema-render.js';

/** @typedef {import('@advanced-rest-client/arc-types').FormTypes.Example} Example */

/**
 * `api-schema-document`
 *
 * A component to render XML schema with examples.
 *
 * Note, if AMF contains unresolved properties (reference-id without resolving
 * the value) this element will resolve it. `amf` must be set on this
 * element to resolve the references.
 */
export class ApiSchemaDocument extends AmfHelperMixin(LitElement) {
  get styles() {
    return css`:host {
      display: block;
    }`;
  }

  

  static get properties() {
    return {
      /**
       * AMF's shape object object.
       * Values for sheba and examples are computed from this model.
       */
      shape: { type: Object },
      /**
       * A media type of the schema. Currently only `application/json` and
       * `application/xml` is supported.
       */
      mediaType: { type: String },
      /**
       * A parent AMF shape ID, if available.
       * This is to be used when the view renders examples for method documentation
       * and parent type is Payload definition.
       */
      parentTypeId: { type: String },
      /**
       * Computed `http://www.w3.org/ns/shacl#raw`
       */
      _raw: { type: String },
      /**
       * Computed list of examples
       */
      _examples: { type: Array },

      /**
       * Computed value, true when data contains example only
       */
      _exampleOnly: { type: Boolean },
      /**
       * Computed value, true when data contains xml schema only
       */
      _schemaOnly: { type: Boolean },
      /**
       * Computed value, true when data contains example and schema information
       */
      _schemaAndExample: { type: Boolean },
      /**
       * Currently selected tab.
       * Relevant when the example contains both example and schema.
       */
      selectedPage: { type: Number },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean }
    };
  }

  get shape() {
    return this._shape;
  }

  set shape(value) {
    const old = this._shape;
    this._shape = value;
    this.requestUpdate('shape', old);
    this._schemaChanged(value);
  }

  get _mediaType() {
    const { mediaType } = this;
    if (typeof mediaType !== 'string') {
      return null;
    }
    if (mediaType.indexOf('xml') !== -1) {
      return 'xml';
    }
    if (mediaType.indexOf('json') !== -1) {
      return 'json';
    }
    return null
  }

  constructor() {
    super();
    this.selectedPage = 0;
    this.parentTypeId = undefined;
    this.mediaType = undefined;
    this.compatibility = false;
  }

  _selectedPageChanged(e) {
    this.selectedPage = e.detail.value;
  }

  /**
   * Computes basic properties for the view.
   * @param {Object} schema `shape` value
   */
  _schemaChanged(schema) {
    this._examples = undefined;
    this._raw = undefined;
    let exampleOnly = false;
    let schemaOnly = false;
    let schemaAndExample = false;
    let raw;
    let examples;
    if (schema) {
      schema = this._resolve(schema);
      if (this._hasType(schema, this.ns.w3.shacl.SchemaShape) ||
        this._hasType(schema, this.ns.aml.vocabularies.shapes.AnyShape) ||
        this._hasType(schema, this.ns.aml.vocabularies.shapes.ScalarShape) ||
        this._hasType(schema, this.ns.w3.shacl.NodeShape)) {
        raw = this._computeRawValue(schema);
        examples = this._computeModelExamples(schema);
      }
    }
    exampleOnly = !!(examples && examples.length && !raw);
    schemaOnly = !!(!examples && raw);
    schemaAndExample = !!(raw && examples && examples.length);
    this._exampleOnly = exampleOnly;
    this._schemaOnly = schemaOnly;
    this._schemaAndExample = schemaAndExample;
    this._examples = examples;
    this._raw = raw;
  }

  /**
   * @param {any} schema
   * @return {string} 
   */
  _computeRawValue(schema) {
    let raw = /** @type string */ (this._getValue(schema, this.ns.aml.vocabularies.document.raw));
    if (!raw) {
      raw = /** @type string */ (this._getValue(schema, this.ns.w3.shacl.raw));
    }
    if (!raw) {
      // @ts-ignore
      raw = this._computeSourceMapsSchema(schema);
    }
    return raw;
  }

  _computeSourceMapsSchema(schema) {
    const sKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.sources);
    let sources = this._ensureArray(schema[sKey]);
    if (!sources) {
      return undefined;
    }
    [sources] = sources;
    const jKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.parsedJsonSchema);
    let jSchema = this._ensureArray(sources[jKey]);
    if (!jSchema) {
      return undefined;
    }
    [jSchema] = jSchema;
    const vKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.value);
    let result = this._ensureArray(jSchema[vKey]);
    if (Array.isArray(result)) {
      result = result[0]['@value'];
    }
    return result;
  }

  /**
   * Computes list of examples for the Property model.
   *
   * @param {any} model AMF property model
   * @return {Example[]|undefined} List of examples or `undefined` if not
   * defined.
   */
  _computeModelExamples(model) {
    const gen = new ExampleGenerator(this.amf);
    const mt = this.mediaType || 'application/xml';
    return /** @type Example[] */ (gen.computeExamples(model, mt, {
      typeId: this.parentTypeId,
    }));
  }

  render() {
    return html`<style>${this.styles}</style>
    ${this._schemaOnly ? this._schemaOnlyTemplate() : ''}
    ${this._exampleOnly ? this._exampleOnlyTemplate() : ''}
    ${this._schemaAndExample ? this._schemaAndExampleTemplate() : ''}`;
  }

  _exampleOnlyTemplate() {
    const items = this._examples;
    if (!items || !items.length) {
      return '';
    }
    const type = this._mediaType;
    return items.map((item) => html`<api-schema-render
      .code="${/** @type string */ (item.value)}"
      .type="${type}"></api-schema-render>`);
  }

  _schemaAndExampleTemplate() {
    return html`
    <anypoint-tabs
      class="schemas"
      .selected="${this.selectedPage}"
      ?compatibility="${this.compatibility}"
      @selected-changed="${this._selectedPageChanged}"
    >
      <anypoint-tab>Schema</anypoint-tab>
      <anypoint-tab>Examples</anypoint-tab>
    </anypoint-tabs>
    ${this._renderSelectedPage()}`;
  }

  _renderSelectedPage() {
    switch (this.selectedPage) {
      case 0: return this._schemaOnlyTemplate();
      case 1: return this._exampleOnlyTemplate();
      default: return '';
    }
  }

  _schemaOnlyTemplate() {
    return html`<api-schema-render
      .code="${this._raw}"
      .type="${this._mediaType}"></api-schema-render>`;
  }
}
