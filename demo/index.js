/* eslint-disable prefer-destructuring */
import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '../api-schema-document.js';

class ApiDemo extends ApiDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'schemaModel', 'mediaType', 'parentTypeId'
    ]);
    this.endpointsOpened = false;
    this.typesOpened = true;
    this.componentName = 'api-schema-document';
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    this.mediaType = undefined;
    if (type === 'type') {
      this.setData(selected);
    } else if (type === 'method') {
      this.setMethodData(selected);
    } else {
      this.hasData = false;
    }
  }

  setData(id) {
    const declares = this._computeDeclares(this.amf);
    const type = declares.find((item) => item['@id'] === id);
    this.schemaModel = type;
    this.hasData = true;
  }

  setMethodData(id) {
    const webApi = this._computeApi(this.amf);
    
    const method = this._computeMethodModel(webApi, id);
    let expects = this._computeExpects(method);
    if(!expects){
      expects = this._computeReturns(method)[0];
    }
    const payload = this._computePayload(expects)[0];
    this.parentTypeId = payload['@id'];
    this.mediaType = /** @type string */ (this._getValue(payload, this.ns.aml.vocabularies.core.mediaType));
    const schemaKey = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    this.schemaModel = this._ensureArray(payload[schemaKey])[0];
    this.hasData = true;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'ARC demo api'],
      ['jldAsync26', 'Async API'],
      ['payments-initiation', 'SE-13559'],
      ['json-sample-schema', 'W-12646073-json-schema'],
      ['xsd-sample-schema', 'W-12646073-xsd-schema'],
    ].map(([file, label]) => html`
    <anypoint-item data-src="${file}-compact.json">${label} - compact model</anypoint-item>
    <anypoint-item data-src="${file}.json">${label}</anypoint-item>
    `);
  }

  _demoTemplate() {
    if (!this.hasData) {
      return html`<p>Select type in the navigation to see the demo.</p>`;
    }
    const { amf, schemaModel, mediaType, parentTypeId } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <api-schema-document
        .amf="${amf}"
        .mediaType="${mediaType}"
        .parentTypeId="${parentTypeId}"
        .shape="${schemaModel}"
      ></api-schema-document>
    </section>
    `;
  }

  contentTemplate() {
    return html`
    <h2 class="centered main">API schema document</h2>
    ${this._demoTemplate()}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
