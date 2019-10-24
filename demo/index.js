import { html } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-navigation/api-navigation.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '../api-schema-document.js';

import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
class DemoElement extends AmfHelperMixin(LitElement) {}

window.customElements.define('demo-element', DemoElement);
class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this.initObservableProperties([
      'hasData', 'schemaModel', 'mediaType', 'partentTypeId'
    ]);
    this.endpointsOpened = false;
    this.typesOpened = true;
    this.hasData = false;
  }

  get helper() {
    return document.getElementById('helper');
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
    const helper = this.helper;
    const declares = helper._computeDeclares(this.amf);
    const type = declares.find((item) => item['@id'] === id);
    this.schemaModel = type;
    this.hasData = true;
  }

  setMethodData(id) {
    const helper = this.helper;
    const webApi = helper._computeWebApi(this.amf);
    const method = helper._computeMethodModel(webApi, id);
    const expects = helper._computeExpects(method);
    const payload = helper._computePayload(expects)[0];
    this.partentTypeId = payload['@id'];
    this.mediaType = helper._getValue(payload, helper.ns.aml.vocabularies.core.mediaType);
    const schemaKey = helper._getAmfKey(helper.ns.aml.vocabularies.shapes.schema);
    this.schemaModel = helper._ensureArray(payload[schemaKey])[0];
    this.hasData = true;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'ARC demo api'],
      ['payments-initiation', 'SE-13559'],
    ].map(([file, label]) => html`
    <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
    <paper-item data-src="${file}.json">${label}</paper-item>
    `);
  }

  contentTemplate() {
    const { amf, schemaModel, mediaType, partentTypeId } = this;
    return html`
    <demo-element id="helper" .amf="${amf}"></demo-element>
    ${this.hasData ?
      html`<api-schema-document .amf="${amf}" .mediaType="${mediaType}" .partentTypeId="${partentTypeId}" .shape="${schemaModel}"></api-schema-document>` :
      html`<p>Select type in the navigation to see the demo.</p>`}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
