# Himalaya Translations

This document describes the functions included with the Himalaya parser for transforming the [abstract syntax tree](https://github.com/andrejewski/himalaya/tree/master/docs/ast-spec.md) into different HTML-based languages.

## Version 1 Translations

```js
import himalaya from 'himalaya'
import {toHTML} from 'himalaya/lib/translate/v1'

const source = "<img src='bar.png' async>"
const json = himalaya.parse(source)

const html = toHTML(json)
// => "<img src='bar.png' async>"
```

*Note: Version 1 does not include the `toPug` transform.*

## Version 0 Translations

The language translations included are for HTML and [Pug](https://pugjs.org/api/getting-started.html).

```js
import himalaya from 'himalaya'
import {toHTML, toPug} from 'himalaya/lib/translate/v0'

const source = "<img src='bar.png' async>"
const json = himalaya.parse(source)

const html = toHTML(json)
// => "<img src='bar.png' async>"

const pug = toPug(json)
// => "img(src='bar.png' async)"

const xml = toHTML(json, {doctype: 'xml'})
// => "<img src='bar.png' async='async'></img>"

const pugXml = toPug(json, {doctype: 'xml'})
// => "img(src='bar.png', async='async')"
```

### toHTML(ast, [options]) HTML
The HTML translator takes a given **ast** and an optional **options** object containing:

- `doctype` which if set to `"xml"` will render boolean attributes and void tags in XML format

### toPug(ast, [options]) Pug
The Pug translator takes a given **ast** and an optional **options** object containing:

- `doctype` which if set to `"xml"` will render boolean attributes in XML format
- `indentation` defaults to two spaces

The Pug translator is not a one-to-one translation with HTML. HTML transformed into Pug and then into HTML will lose some of the original's whitespace.
