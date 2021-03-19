/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { LitElement, html, css } from 'lit-element';
import '@advanced-rest-client/prism-highlight/prism-highlight.js';

export class ApiSchemaRender extends LitElement {
  get styles() {
    return css`:host {
      display: block;
      background-color: var(--code-background-color, #f5f2f0);
    }

    #output {
      white-space: pre-wrap;
      font-family: var(--arc-font-code-family, initial);
    }`;
  }

  render() {
    return html`
      <style>${this.styles}</style>
      <prism-highlight .code="${this._codeValue}" .lang="${this.highlightType}" ?raw="${this._ignoreType}"></prism-highlight>`;
  }

  static get properties() {
    return {
      /**
       * Data to render.
       */
      code: { type: String },
      /**
       * A syntax highlighter type. One of PrismJs types.
       */
      type: { type: String }
    };
  }

  get highlightType() {
    return this.type || this._detectedType;
  }

  get code() {
    return this._code;
  }

  set code(value) {
    const old = this._code;
    this._code = value;
    this.requestUpdate('code', old);
    this._codeChanged();
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const old = this._type;
    this._type = value;
    this.requestUpdate('type', old);
    this._codeChanged();
  }

  /**
   * @param {string} code
   */
  _detectType(code) {
    let isJson;
    try {
      JSON.parse(code);
      isJson = true;
    } catch (_) {
      isJson = false;
    }
    this._detectedType = isJson ? 'json' : 'xml';
  }

  /**
   * Computes values for rendering.
   */
  _codeChanged() {
    this._codeValue = undefined;
    this._ignoreType = false;
    const { code } = this;
    if (!code) {
      this.requestUpdate();
      return;
    }
    const value = String(code);
    if (!this.type) {
      this._detectType(value);
    }
    if (value.length > 10000) {
      // examples that are huge causes browser to choke or hang.
      // This just sanitizes the schema and renders unprocessed data.
      this._codeValue = value;
      this._ignoreType = true;
    } else {
      this._codeValue = value
    }
    this.requestUpdate();
  }
}
