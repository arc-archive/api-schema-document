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
    this.endpointsOpened = false;
    this.typesOpened = true;
    this.hasData = false;
  }

  get hasData() {
    return this._hasData;
  }

  set hasData(value) {
    this._setObservableProperty('hasData', value);
  }

  get schemaModel() {
    return this._schemaModel;
  }

  set schemaModel(value) {
    this._setObservableProperty('schemaModel', value);
  }

  get helper() {
    return document.getElementById('helper');
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'type') {
      this.setData(selected);
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

  contentTemplate() {
    return html`
    <demo-element id="helper" .amf="${this.amf}"></demo-element>
    ${this.hasData ?
      html`<api-schema-document aware="demo" .shape="${this.schemaModel}"></api-schema-document>` :
      html`<p>Select type in the navigation to see the demo.</p>`}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
