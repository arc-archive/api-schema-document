import { LitElement, html, css } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@polymer/prism-element/prism-highlighter.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tabs.js';
import '@anypoint-web-components/anypoint-tabs/anypoint-tab.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-example-generator/api-example-generator.js';
import './api-schema-render.js';

/**
 * `api-schema-document`
 *
 * A component to render XML schema with examples.
 *
 * Note, if AMF contains unresolved properties (reference-id without resolving
 * the value) this element will resolve it. `amf` must be set on this
 * element to resolve the references.
 *
 * ## Styling
 *
 * `<api-schema-document>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--api-schema-document` | Mixin applied to this elment | `{}`
 * `api-schema-render` | Mixin applied to schema renderer element | `{}`
 *
 * @customElement
 * @demo demo/index.html
 * @memberof ApiElements
 * @appliesMixin AmfHelperMixin
 */
class ApiSchemaDocument extends AmfHelperMixin(LitElement) {
  get styles() {
    return css`:host {
      display: block;
    }`;
  }

  render() {
    return html`<style>${this.styles}</style>
    <prism-highlighter></prism-highlighter>
    ${this.aware ?
      html`<raml-aware @api-changed="${this._apiChanged}" .scope="${this.aware}"></raml-aware>` : ''}

    ${this._schemaOnly ? this._schemaOnlyTemplate() : ''}
    ${this._exampleOnly ? this._exampleOnlyTemplate() : ''}
    ${this._schemaAndExample ? this._schemaAndExampleTemplate() : ''}`;
  }

  _exampleOnlyTemplate() {
    const items = this._examples;
    if (!items || !items.length) {
      return;
    }
    const type = this._mediaType;
    return items.map((item) => html`<api-schema-render
      .code="${item.value}"
      .type="${type}"></api-schema-render>`);
  }

  _schemaAndExampleTemplate() {
    return html`
    <anypoint-tabs
      class="schemas"
      .selected="${this.selectedPage}"
      ?compatibility="${this.compatibility}"
      @selected-changed="${this._selectedPageChanged}">
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

  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: { type: String },
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
       * A parent AMF schape ID, if available.
       * This is to be used when the view renders examples for method documentation
       * and partent type is Payload definition.
       */
      partentTypeId: { type: String },
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
       * @deprecated Use `compatibility` instead
       */
      legacy: { type: Boolean },
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

  /**
   * @return {Element} Instance of `api-example-generator` element.
   */
  get _exampleGenerator() {
    if (!this.__exampleGenerator) {
      this.__exampleGenerator = document.createElement('api-example-generator');
    }
    return this.__exampleGenerator;
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
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    if (this.__exampleGenerator) {
      delete this.__exampleGenerator;
    }
  }

  _apiChanged(e) {
    this.amf = e.detail.value;
  }

  _selectedPageChanged(e) {
    this.selectedPage = e.detail.value;
  }
  /**
   * Comnputes besic properties for the view.
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

  _computeRawValue(schema) {
    let raw = this._getValue(schema, this.ns.aml.vocabularies.document.raw);
    if (!raw) {
      raw = this._getValue(schema, this.ns.w3.shacl.raw);
    }
    if (!raw) {
      raw = this._computeSourceMapsSchema(schema);
    }
    return raw;
  }

  _computeSourceMapsSchema(schema) {
    const sKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.sources);
    let sources = this._ensureArray(schema[sKey]);
    if (!sources) {
      return;
    }
    sources = sources[0];
    const jKey = this._getAmfKey(this.ns.aml.vocabularies.docSourceMaps.parsedJsonSchema);
    let jSchema = this._ensureArray(sources[jKey]);
    if (!jSchema) {
      return;
    }
    jSchema = jSchema[0];
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
   * @param {Object} model AMF property model
   * @return {Array<Object>|undefined} List of examples or `undefined` if not
   * defined.
   */
  _computeModelExamples(model) {
    const gen = this._exampleGenerator;
    gen.amf = this.amf;
    const mt = this.mediaType || 'application/xml';
    return gen.computeExamples(model, mt, {
      // noAuto: true,
      typeId: this.partentTypeId
    });
  }
}
window.customElements.define('api-schema-document', ApiSchemaDocument);
