[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-schema-document.svg)](https://www.npmjs.com/package/@api-components/api-schema-document)

[![Build Status](https://travis-ci.org/api-components/api-schema-document.svg?branch=stage)](https://travis-ci.org/api-components/api-schema-document)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/api-components/api-schema-document)

## &lt;authorization-panel&gt;

A component to render XML/JSON schema with examples.

```html
<authorization-panel></authorization-panel>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-schema-document
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-schema-document/authorization-panel.js';
    </script>
  </head>
  <body>
    <authorization-panel></authorization-panel>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-schema-document/authorization-panel.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <authorization-panel></authorization-panel>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/api-components/api-schema-document
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
