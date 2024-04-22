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
    }

    .item-container {
      border-left: 3px var(--api-example-accent-color, #FF9800) solid;
      border-radius: 2px;
      background-color: var(--api-example-background-color, var(--code-background-color, #f5f7f9));
      margin: 20px 0;
    }

    .example-title {
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
      font-size: 1rem;
      display: var(--api-example-title-display, block);
      min-height: 36px;
      padding: 0px 12px;
      background-color: var(--api-example-title-background-color, #ff9800);
      color: var(--api-example-title-color, #000);
      border-radius: 0 2px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    .expand-icon {
      height: 25px;
      width: 25px;
      -moz-transform:none;
      -webkit-transform:none;
      -o-transform:none;
      -ms-transform:none;
      transform:none;
      -webkit-transition: transform 0.2s 0.2s ease;
      -moz-transition: transform 0.2s 0.2s ease;
      -o-transition: transform 0.2s 0.2s ease;
      transition: transform 0.2s 0.2s ease;
    }

    .expand-icon-wrapper {
      height: 30px;
      width: 30px;
    }

    .renderer {
      padding: 8px 0;
      display: flex;
      max-height: var(--api-resource-example-document-max-height, 500px);
      -webkit-transition: all 0.4s 0.1s ease-in-out;
      -moz-transition: all 0.4s 0.1s ease-in-out;
      -o-transition: all 0.4s 0.1s ease-in-out;
      transition: all 0.4s 0.1s ease-in-out;
    }

    .collapse {
      max-height: 0;
      margin: 0;
      overflow: hidden;
      padding: 0;
      -webkit-transition: all 0.4s 0.1s ease-in-out;
      -moz-transition: all 0.4s 0.1s ease-in-out;
      -o-transition: all 0.4s 0.1s ease-in-out;
      transition: all 0.4s 0.1s ease-in-out;
    }

    .expand-icon-collapse {
      -moz-transform: rotate(180deg);
      -webkit-transform: rotate(180deg);
      -o-transform: rotate(180deg);
      -ms-transform: rotate(180deg);
      transform: rotate(180deg);
      -webkit-transition: transform 0.2s 0.2s ease;
      -moz-transition: transform 0.2s 0.2s ease;
      -o-transition: transform 0.2s 0.2s ease;
      transition: transform 0.2s 0.2s ease;
    }

    api-schema-render {
      flex: 1;
      background-color: inherit;
      overflow: auto;
      max-width: 100%;
    }

    .example-description {
      padding: 10px 12px;
    }

    .info-icon {
      margin: 0 12px;
      fill: var(--api-example-accent-color, #FF9800);
      width: 24px;
      height: 24px;
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
      compatibility: { type: Boolean },
      /**
       * If enabled, the example panel would be closed
       */
      _collapseExamplePanel: { type: Boolean, reflect: true },
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
    this._collapseExamplePanel = false;
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
    if (!raw) {
      const referenceIdKey = this._getAmfKey(this.ns.aml.vocabularies.document.referenceId);
      const referenceIdData = this._ensureArray(schema[referenceIdKey]);
      if (Array.isArray(referenceIdData) && referenceIdData.length > 0) {
        raw = (this._getValue(referenceIdData[0], this.ns.aml.vocabularies.document.raw));
      }
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


  get _collapseExamplePanel() {
    return this.__collapseExamplePanel
  }

  set _collapseExamplePanel(value) {
    const old = this.__collapseExamplePanel;
    if (old === value) {
      return;
    }
    this.__collapseExamplePanel = value;
    this.requestUpdate('_collapseExamplePanel', old);
  }

  /**
  * @param {Example} example
  * @returns {string}
  */
  _computeExampleDescription(example) {
    const { description } = example
    return !description ? '' : description;
  }

  /**
   * @param {Example} example
   * @returns {TemplateResult|string}
   */
  _descriptionTemplate(example) {
    const isAsync = this._isAsyncAPI(this.amf)
    if (example.isScalar && !isAsync) {
      return '';
    }
    const description = this._computeExampleDescription(example)
    if (!description) {
      return '';
    }
    return html`<div class="example-description">${description}</div>`;
  }


  /**
   * Collapse the current example panel
   */
  _handleCollapsePanel(example, index) {
    const examplePanels = this.shadowRoot.querySelectorAll('.renderer')
    const icons = this.shadowRoot.querySelectorAll('.expand-icon')
    icons[index].classList.toggle('expand-icon-collapse')
    examplePanels[index].classList.toggle('collapse')
    example.opened = !example.opened
  }

  /**
    * Determines whether an example's title is just a variation
    * of the current media type + a number
    * @param {Example} example
    * @returns {Boolean}
  */
  _exampleTitleIsMediaType(example) {
    const { mediaType } = this;
    const { title } = example;
    return Boolean(title.match(`^${mediaType}(\\d)+$`));
  }

  /**
   * Returns title to render for example
   * @param {Example} example
   * @returns {String} 'Example' or the example's title
   */
  _computeExampleTitle(example) {
    if (!example.title || this._exampleTitleIsMediaType(example)) {
      return 'Example';
    }
    return example.title.trim();
  }

  _titleTemplate(example, index) {
    const label = this._computeExampleTitle(example);
    const iconType = example.opened ? 'expandMore' : 'expandLess';
    return html`<div
      class="example-title"
      @click="${() => this._handleCollapsePanel(example, index)}"
      @keyup="${() => this._handleCollapsePanel(example, index)}"
    >
      <span>${label}</span>
      <anypoint-icon-button
        class="expand-icon-wrapper"
        data-action="collapse"
        title="Collapse panel"
        role="button"
      ><arc-icon class="expand-icon" icon="${iconType}"></arc-icon></anypoint-icon-button>
    </div>`;
  }

  _exampleOnlyTemplate() {
    const examples = this._examples.map(e => {
      e.opened = !!this._collapseExamplePanel
      return e
    });
    if (!examples || !examples.length) {
      return '';
    }
    const type = this._mediaType;

    return examples.map((example, index) => (html`
      <div class="item-container">
        ${this._titleTemplate(example, index)}
        ${this._descriptionTemplate(example)}
        <div class="renderer ${example.opened ? 'collapse' : false}">
          <arc-icon class="info-icon" icon="code"></arc-icon>
            <api-schema-render
            .code="${/** @type string */ (example.value)}"
            .type="${type}"></api-schema-render>
        </div>
      </div>
    `));
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
