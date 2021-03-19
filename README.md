# api-schema-document

A component to render XML/JSON schema with examples for an API model.

[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-schema-document.svg)](https://www.npmjs.com/package/@api-components/api-schema-document)

[![Tests and publishing](https://github.com/advanced-rest-client/api-schema-document/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/api-schema-document/actions/workflows/deployment.yml)

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Usage

### Installation

```sh
npm install --save @api-components/api-schema-document
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-schema-document/api-schema-document.js';
    </script>
  </head>
  <body>
    <api-schema-document></api-schema-document>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-schema-document/api-schema-document.js';

class SampleElement extends PolymerElement {
  render() {
    return html`
    <api-schema-document .amf="${this.amf}"></api-schema-document>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/api-schema-document
cd api-schema-document
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
