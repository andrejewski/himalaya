# Known Quirks
Himalaya is not perfect. Himalaya is first and foremost a parser geared toward being accurate, predictable, and performant, however those goals are often at odds.

## Methodology
Himalaya is designed for the "happy path" or "common case" scenario. If a variant is well-defined, there might be a configurable option that may be passed to Himalaya to cover an edge case at the cost of a performance penalty or functionality guarantee. There is also a `strict` option which will enable coverage for all edge-cases Himalaya can handle (performance be damned).

```js
import himalaya from 'himalaya'
const {
  parse,
  parseDefaults
} = himalaya

let myHtml
const myOptions = Object.assign({}, parseDefaults, {strict: true})
parse(myHtml, myOptions)
```

## Specification
Himalaya was created after HTML5 became mainstream, so Himalaya uses the [W3C HTML spec](https://www.w3.org/TR/html5/) as its guiding document. Currently, there is no HTML version detection and HTML5 is assumed during the parsing process. In the future Himalaya may take advantage of a `doctype` configuration option or the `doctype` tag within the parsed content to specialize aspects of parsing. If this feature is added, this document will be updated to reflect it.

## Workflow
The process for handling quirks follows the following steps:

1. Create an issue.
2. Evaluate the issue to see if it is a new, unaddressed quirk. If it is, then it will be tagged as an `unknown-quirk`.
3. Magic.
4. After the discussion and development of a solution (or not), the resolution will be added here in the "List of Known Quirks" section with a description, example, tradeoffs, and possible configuration options.
5. Close the original issue.

## List of Known Quirks
As unknown quirks become known, they will be added here.
