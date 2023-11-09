import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async (config = {}) => {
  const { compact=false, fileName='demo-api' } = config;
  const suffix = compact ? '-compact' : '';
  const file = `${fileName}${suffix}.json`;
  const url = `${window.location.protocol}//${window.location.host}/base/demo/${file}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to download ${url}`);
  }
  const result = await response.json();
  return Array.isArray(result) ? result[0] : result;
};

AmfLoader.lookupEndpoint = function(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  const endPoint = AmfLoader.lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

AmfLoader.lookupPayloadSchema = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  const payload = helper._computePayload(expects)[0];
  const mediaType = helper._getValue(payload, helper.ns.aml.vocabularies.core.mediaType);
  const schemaKey = helper._getAmfKey(helper.ns.aml.vocabularies.shapes.schema);
  const schemaModel = helper._ensureArray(payload[schemaKey])[0];
  return [payload['@id'], mediaType, schemaModel];
};
