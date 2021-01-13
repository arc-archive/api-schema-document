import { LitElement, TemplateResult, CSSResult } from 'lit-element';

/**
 * Transforms input into a content to be rendered in the code view.
 */
declare interface SafeHtmlUtils {
  AMP_RE: RegExp;
  GT_RE: RegExp;
  LT_RE: RegExp;
  SQUOT_RE: RegExp;
  QUOT_RE: RegExp;
  htmlEscape(s: any): string;
}

export declare const SafeHtmlUtils: SafeHtmlUtils;

/**
 * @fires syntax-highlight
 */
export declare class ApiSchemaRender extends LitElement {
  get styles(): CSSResult[];

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

  get output(): HTMLElement;

  firstUpdated(): void;

  _detectType(code: string): void;

  /**
   * Handles highlighting when code changed.
   * Note that the operation is async.
   */
  _codeChanged(code: string): void;

  /**
   * Dispatches `syntax-highlight` custom event
   * @param code Code to highlight
   * @return Highlighted code.
   */
  highlight(code: string): string;

  _clearTypeAttribute(): void;

  _typeChanged(type: string): void;
}
