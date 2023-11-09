import { LitElement, TemplateResult, CSSResult } from 'lit-element';

/**
 * @fires syntax-highlight
 */
export declare class ApiSchemaRender extends LitElement {
  get styles(): CSSResult;

  render(): TemplateResult;

  /**
   * Data to render.
   * @attribute
   */
  code: string;
  /**
   * A syntax highlighter type. One of PrismJs types.
   * @attribute
   */
  type: string;

  get highlightType(): string;

  _detectedType: string;
  _codeValue: string;
  _ignoreType: boolean;

  _detectType(code: string): void;

  /**
   * Handles highlighting when code changed.
   * Note that the operation is async.
   */
  _codeChanged(): void;

  /**
     * Copies the current response text value to clipboard.
     *
     * @param {Event} e
     */
  _copyToClipboard(e: Event): void;

  /**
   * Resets button icon.
   * @param button Button to reset.
   */
  _resetCopyButtonState(button: HTMLButtonElement): void;
}
