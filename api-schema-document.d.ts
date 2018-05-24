/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   api-schema-document.html
 */

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../polymer/types/lib/elements/dom-if.d.ts" />
/// <reference path="../polymer/types/lib/elements/dom-repeat.d.ts" />
/// <reference path="../prism-element/prism-highlighter.d.ts" />
/// <reference path="../paper-tabs/paper-tabs.d.ts" />
/// <reference path="../paper-tabs/paper-tab.d.ts" />
/// <reference path="../iron-pages/iron-pages.d.ts" />
/// <reference path="../amf-helper-mixin/amf-helper-mixin.d.ts" />
/// <reference path="../raml-aware/raml-aware.d.ts" />
/// <reference path="api-schema-render.d.ts" />

declare namespace ApiElements {

  /**
   * `api-schema-document`
   *
   * A component to render XML schema with examples.
   *
   * Note, if AMF contains unresolved properties (reference-id without resolving
   * the value) this element will resolve it. `amfModel` must be set on this
   * element to resolve the references.
   *
   * ## Styling
   *
   * `<api-schema-document>` provides the following custom properties and mixins for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--api-schema-document` | Mixin applied to this elment | `{}`
   * `api-schema-render` | Mixin applied to schema renderer element | `{}`
   */
  class ApiSchemaDocument extends
    ApiElements.AmfHelperMixin(
    Polymer.Element) {

    /**
     * `raml-aware` scope property to use.
     */
    aware: string|null|undefined;

    /**
     * AMF's shape object object.
     * Values for sheba and examples are computed from this model.
     */
    shape: object|null|undefined;

    /**
     * Computed `http://www.w3.org/ns/shacl#raw`
     */
    _raw: string|null|undefined;

    /**
     * Computed list of examples
     */
    _examples: any[]|null|undefined;

    /**
     * Computed value, true when data contains example only
     */
    readonly exampleOnly: boolean|null|undefined;

    /**
     * Computed value, true when data contains xml schema only
     */
    readonly schemaOnly: boolean|null|undefined;

    /**
     * Computed value, true when data contains example and schema information
     */
    readonly schemaAndExample: boolean|null|undefined;
    selectedPage: number|null|undefined;

    /**
     * Comnputes besic properties for the view.
     *
     * @param record `shape` change record
     * @returns [description]
     */
    _schemaChanged(record: object|null): any;
    _processExamples(examples: any): any;
    _computeExampleValue(item: any): any;
  }
}

interface HTMLElementTagNameMap {
  "api-schema-document": ApiElements.ApiSchemaDocument;
}
