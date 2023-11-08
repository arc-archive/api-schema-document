/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { LitElement, html, css } from 'lit-element';
import '@advanced-rest-client/prism-highlight/prism-highlight.js';
import '@advanced-rest-client/clipboard-copy/clipboard-copy.js';

export class ApiSchemaRender extends LitElement {
  get styles() {
    return css`:host {
      display: block;
      background-color: var(--code-background-color, #f5f2f0);
    }

    #output {
      white-space: pre-wrap;
      font-family: var(--arc-font-code-family, initial);
    }
    
    .code-wrapper {
      padding: 0px;
    }
    
    .example-actions {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: flex-end;
      flex-wrap: wrap;
      flex: 1;
    }`;
  }

  /**
   * Resets button icon.
   * @param {HTMLButtonElement} button Button to reset.
   */
  _resetCopyButtonState(button) {
    button.innerText = 'Copy';
    button.disabled = false;
    if ('part' in button) {
      // @ts-ignore
      button.part.remove('content-action-button-disabled');
      // @ts-ignore
      button.part.remove('code-content-action-button-disabled');
    }
    button.focus();
  }

  /**
   * Copies the current response text value to clipboard.
   *
   * @param {Event} e
   */
  _copyToClipboard(e) {
    const button = /** @type HTMLButtonElement */ (e.target);
    const copy = /** @type ClipboardCopyElement */ (this.shadowRoot.querySelector('clipboard-copy'));
    if (copy.copy()) {
      button.innerText = 'Done';
    } else {
      button.innerText = 'Error';
    }
    button.disabled = true;
    if ('part' in button) {
      // @ts-ignore
      button.part.add('content-action-button-disabled');
      // @ts-ignore
      button.part.add('code-content-action-button-disabled');
    }
    setTimeout(() => this._resetCopyButtonState(button), 1000);
  }

  /**
   * @returns {TemplateResult|string} 
   */
  _headerTemplate() {
    const { compatibility } = this;
    return html`
    <div class="example-actions">
        <anypoint-button
          part="content-action-button, code-content-action-button"
          class="action-button"
          data-action="copy"
          @click="${this._copyToClipboard}"
          ?compatibility="${compatibility}"
          title="Copy example to clipboard"
        >Copy</anypoint-button>
    </div>`;
  }


  render() {
    return html`
    ${this._headerTemplate()}
      <style>${this.styles}</style> 
      <div class="code-wrapper part="code-wrapper, example-code-wrapper">
        <prism-highlight ?raw="${this._ignoreType}" .code="${this._codeValue}" .lang="${this.highlightType}"></prism-highlight>
      </div>
      <clipboard-copy .content="${/** @type string */ (this._codeValue)}"></clipboard-copy>`;
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
