import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {afterNextRender} from '../../@polymer/polymer/lib/utils/render-status.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import '../../@polymer/prism-element/prism-theme-default.js';

class ApiSchemaRender extends PolymerElement {
  static get template() {
    return html`
    <style include="prism-theme-default"></style>
    <style>
    :host {
      display: block;
      background-color: var(--code-background-color, #f5f2f0);
      @apply --api-schema-render;
    }

    #output {
      white-space: pre-wrap;
      @apply --code-block;
    }
    </style>
    <code id="output" class="markdown-html"></code>
`;
  }

  static get is() {
    return 'api-schema-render';
  }
  static get properties() {
    return {
      /**
       * Data to render.
       */
      code: {
        type: String,
        observer: '_codeChanged'
      },

      type: {
        type: String,
        readOnly: true,
        observer: '_typeChanged'
      }
    };
  }
  /**
   * Handles highlighting when code changed.
   * Note that the operation is async.
   * @param {String} code
   */
  _codeChanged(code) {
    if (!code) {
      this.$.output.innerHTML = '';
      return;
    }
    let isJson = false;
    try {
      JSON.parse(code);
      isJson = true;
    } catch (_) {}
    this._setType(isJson ? 'json' : 'xml');
    afterNextRender(this, () => {
      this.$.output.innerHTML = this.highlight(code);
    });
  }
  /**
   * Dispatches `syntax-highlight` custom event
   * @param {String} code Code to highlight
   * @return {String} Highlighted code.
   */
  highlight(code) {
    const ev = new CustomEvent('syntax-highlight', {
      bubbles: true,
      composed: true,
      detail: {
        code: code,
        lang: this.type || 'xml'
      }
    });
    this.dispatchEvent(ev);
    return ev.detail.code;
  }

  _clearTypeAttribute() {
    const type = this.$.output.dataset.type;
    if (!type) {
      return;
    }
    const attr = 'language-' + type;
    this.$.output.removeAttribute(attr);
  }

  _typeChanged(type) {
    this._clearTypeAttribute();
    if (!type) {
      return;
    }
    const attr = 'language-' + type;
    this.$.output.setAttribute(attr, 'true');
    this.$.output.dataset.type = type;
  }
}
window.customElements.define(ApiSchemaRender.is, ApiSchemaRender);
