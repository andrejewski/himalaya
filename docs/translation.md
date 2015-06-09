# Himalaya Translations

This document describes the functions included with the Himalaya parser for transforming the [abstract syntax tree](https://github.com/andrejewski/himalaya/tree/master/docs/ast-spec.md) into different HTML-based languages.

The language translations currently included are for HTML and [Jade](http://jade-lang.com/).

All translation functions are used by requiring the `translate` module. 

```js
var translate = require('himalaya/translate');
var toHTML = translate.toHTML;
var toJade = translate.toJade;
```

This module is separated from the core parsing module because developers may only need one or the other. Build tools like Browserify would package both otherwise. Also this provides greater flexibility as these functions may be eventually moved to their own packages.

## toHTML(ast, [options]) HTML
The HTML translator takes a given **ast** and an optional **options** object containing:

- `doctype` which if set to `"xml"` will render boolean attributes and void tags in XML format

```js
var toHTML = require('himalaya/translate').toHTML;
var source = "<img src='bar.png' async>";
var json = require('himalaya').parse(source);

var html = toHTML(json);
// => "<img src='bar.png' async>"

var xml = toHTML(json, {doctype: 'xml'});
// => "<img src='bar.png' async='async'></img>"
```

## toJade(ast, [options]) Jade
The Jade translator takes a given **ast** and an optional **options** object containing:

- `doctype` which if set to `"xml"` will render boolean attributes in XML format
- `indentation` which defaults to two spaces and is used to indent the output

The Jade translator is not a one-to-one translation with HTML. HTML transformed into Jade and then into HTML will lose some of the original's whitespace.

```js
var toJade = require('himalaya/translate').toJade;
var source = "<img src='bar.png' async>";
var json = require('himalaya').parse(source);

var jade = toJade(json);
// => "img(src='bar.png' async)"

var jadeXml = toJade(json, {doctype: 'xml'});
// => "img(src='bar.png', async='async')"
```
