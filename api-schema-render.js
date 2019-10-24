import { LitElement, html, css } from 'lit-element';
import prismStyles from '@advanced-rest-client/prism-highlight/prism-styles.js';
/**
 * Transforms input into a content to be rendered in the code view.
 */
export const SafeHtmlUtils = {
  AMP_RE: new RegExp(/&/g),
  GT_RE: new RegExp(/>/g),
  LT_RE: new RegExp(/</g),
  SQUOT_RE: new RegExp(/'/g),
  QUOT_RE: new RegExp(/"/g),
  htmlEscape: function(s) {
    if (typeof s !== 'string') {
      return s;
    }
    if (s.indexOf('&') !== -1) {
      s = s.replace(SafeHtmlUtils.AMP_RE, '&amp;');
    }
    if (s.indexOf('<') !== -1) {
      s = s.replace(SafeHtmlUtils.LT_RE, '&lt;');
    }
    if (s.indexOf('>') !== -1) {
      s = s.replace(SafeHtmlUtils.GT_RE, '&gt;');
    }
    if (s.indexOf('"') !== -1) {
      s = s.replace(SafeHtmlUtils.QUOT_RE, '&quot;');
    }
    if (s.indexOf("'") !== -1) {
      s = s.replace(SafeHtmlUtils.SQUOT_RE, '&#39;');
    }
    return s;
  }
};

class ApiSchemaRender extends LitElement {
  static get styles() {
    const styles = css`:host {
      display: block;
      background-color: var(--code-background-color, #f5f2f0);
    }

    #output {
      white-space: pre-wrap;
      font-family: var(--arc-font-code-family, initial);
    }`;
    return [styles, prismStyles];
  }

  render() {
    return html`<code id="output" part="markdown-html" class="markdown-html"></code>`;
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

  get code() {
    return this._code;
  }

  set code(value) {
    const old = this._code;
    this._code = value;
    this.requestUpdate('code', old);
    this._codeChanged(value);
  }

  get type() {
    return this._type;
  }

  set type(value) {
    const old = this._type;
    this._type = value;
    this.requestUpdate('type', old);
    this._typeChanged(value);
  }

  get output() {
    return this.shadowRoot.querySelector('#output');
  }

  firstUpdated() {
    if (this.code) {
      this._codeChanged(this.code);
    }
    if (this.type) {
      this._typeChanged(this.type);
    }
  }

  _detectType(code) {
    let isJson;
    try {
      JSON.parse(code);
      isJson = true;
    } catch (_) {
      isJson = false;
    }
    this.type = isJson ? 'json' : 'xml';
  }
  /**
   * Handles highlighting when code changed.
   * Note that the operation is async.
   * @param {String} code
   */
  _codeChanged(code) {
    const output = this.output;
    if (!output) {
      return;
    }
    if (!code) {
      output.innerHTML = '';
      return;
    }
    code = String(code);
    if (!this.type) {
      this._detectType(code);;
    }
    setTimeout(() => {
      this.output.innerHTML = this.highlight(code);
    });
  }
  /**
   * Dispatches `syntax-highlight` custom event
   * @param {String} code Code to highlight
   * @return {String} Highlighted code.
   */
  highlight(code) {
    if (code.length > 10000) {
      // schemas that are huge causes browser to choke or hang.
      // This just sanitizes the schema and renders unprocessed data.
      return SafeHtmlUtils.htmlEscape(code);
    }
    const ev = new CustomEvent('syntax-highlight', {
      bubbles: true,
      composed: true,
      detail: {
        code,
        lang: this.type || 'xml'
      }
    });
    this.dispatchEvent(ev);
    return ev.detail.code;
  }

  _clearTypeAttribute() {
    const output = this.output;
    const type = output.dataset.type;
    if (!type) {
      return;
    }
    const attr = 'language-' + type;
    output.removeAttribute(attr);
  }

  _typeChanged(type) {
    const output = this.output;
    if (!output) {
      return;
    }
    this._clearTypeAttribute();
    if (!type) {
      return;
    }
    const attr = 'language-' + type;
    output.setAttribute(attr, 'true');
    output.dataset.type = type;
  }
}
window.customElements.define('api-schema-render', ApiSchemaRender);
