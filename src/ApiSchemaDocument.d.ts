import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';
import { Example } from '@advanced-rest-client/arc-types/src/forms/FormTypes';

/**
 * `api-schema-document`
 *
 * A component to render XML schema with examples.
 *
 * Note, if AMF contains unresolved properties (reference-id without resolving
 * the value) this element will resolve it. `amf` must be set on this
 * element to resolve the references.
 */
export class ApiSchemaDocument extends AmfHelperMixin(LitElement) {
  get styles(): CSSResult;
  /**
   * AMF's shape object object.
   * Values for sheba and examples are computed from this model.
   */
  shape: any;
  /**
   * A media type of the schema. Currently only `application/json` and
   * `application/xml` is supported.
   * @attribute
   */
  mediaType: string;
  /**
   * A parent AMF shape ID, if available.
   * This is to be used when the view renders examples for method documentation
   * and parent type is Payload definition.
   * @attribute
   */
  parentTypeId: string;
  /**
   * Computed `http://www.w3.org/ns/shacl#raw`
   */
  _raw: any;
  /**
   * Computed list of examples
   */
  _examples: Example[];

  /**
   * Computed value, true when data contains example only
   */
  _exampleOnly: boolean;
  /**
   * Computed value, true when data contains xml schema only
   */
  _schemaOnly: boolean;
  /**
   * Computed value, true when data contains example and schema information
   */
  _schemaAndExample: boolean;
  /**
   * Currently selected tab.
   * Relevant when the example contains both example and schema.
   * @attribute
   */
  selectedPage: number;
  /**
   * Enables compatibility with Anypoint components.
   * @attribute
   */
  compatibility: boolean;

  get _mediaType(): string|null;

  constructor();

  _selectedPageChanged(e: CustomEvent): void;

  /**
   * Computes basic properties for the view.
   * @param schema `shape` value
   */
  _schemaChanged(schema: any): void;

  _computeRawValue(schema: any): string|undefined;

  _computeSourceMapsSchema(schema: any): any|undefined;

  /**
   * Computes list of examples for the Property model.
   *
   * @param {any} model AMF property model
   * @return {Example[]|undefined} List of examples or `undefined` if not
   * defined.
   */
  _computeModelExamples(model: any): Example[]|undefined;

  render(): TemplateResult;

  _exampleOnlyTemplate(): TemplateResult|string;

  _schemaAndExampleTemplate(): TemplateResult;

  _renderSelectedPage(): TemplateResult|string;

  _schemaOnlyTemplate(): TemplateResult;
}
