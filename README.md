# Himalaya

Himalaya is a pure JavaScript HTML parser that converts HTML into JSON, which can then be further manipulated by other modules.

```bash
npm install himalaya
```

## Usage

```js
var himalaya = require('himalaya');
var html = require('fs').readFileSync('/webpage.html');
var json = himalaya.parse(html);
```

Installed globally, Himalaya can also be used from the command-line to convert HTML files to JSON files, or as a pipe transform.

```bash
himalaya webpage.html webpage.json
# or as a pipe
echo "<h1>Hello</h1>" | himalaya > hello.json
```

Run `himalaya --help` for more information.

## Parser AST Specification

Himalaya has a specification for its output. Essentially, everything is a node and can either be an `Element`, `Comment`, or `Text` node. The [full specification](https://github.com/andrejewski/himalaya/tree/master/docs/ast-spec.md) provides the complete details.

### Example Input/Output

```html
<div class='post post-featured'>
	<p>Himalaya parsed me...</p>
	<!-- ...and I liked it. -->
</div>
```

```json
[
  {
    "type": "Element",
    "tagName": "div",
    "attributes": {
      "className": [
        "post",
        "post-featured"
      ]
    },
    "children": [
      {
        "type": "Element",
        "tagName": "p",
        "attributes": {},
        "children": [
          {
            "type": "Text",
            "content": "Himalaya parsed me..."
          }
        ]
      },
      {
        "type": "Comment",
        "content": " ...and I liked it. ",
      }
    ]
  }
]
```

*Note:* Text nodes containing only whitespace were removed from the output for readability.

## Features

### Synchronous 
HTML is turned into JSON, that's it. Himalaya is completely synchronous and does not require any complicated callbacks. 

### Parses Attributes
Himalaya does a couple things when processing attributes:
- Camel-cases attribute names
- Attributes without values are set to their names (i.e. `disabled` turns into `disabled="disabled"`)
- Groups `data-*` attributes into a `dataset` object
- Attempts to caste any value to a number if `!Nan`
- Parses the `style` attribute into a hash map

### Handles Weirdness
Himalaya handles a lot of HTML's fringe cases, like:
- Closes unclosed tags `<p><b>...</p>`
- Ignores extra closing tags `<span>...</b></span>`
- Properly handles void tags like `<meta>` and `<img>`
- Properly handles self-closing tags like `<input/>`
- Handles `<!doctype>` and `<-- comments -->`
- Does not parse the contents of `<script>`, `<style>`, and HTML5 `<template>` tags

### Preserves Whitespace
Himalaya does not cut corners and returns an accurate representation of the HTML supplied.

## Going back to HTML
Himalaya provides translation functions that can take the Himalaya AST and output eqivalent HTML and Jade.

The following example does absolutely nothing. It simply parses the HTML to JSON then parses the JSON back into HTML, which is the exact same as the original. (Of course if the original was malformed, Himalaya probably buffed out the kinks.)

```js
var fs = require('fs');
var himalaya = require('himalaya');
var toHTML = require('himalaya/translate').toHTML;

var html = fs.readFileSync('/webpage.html');
var json = himalaya.parse(html);
fs.writeFileSync('/webpage.html', toHTML(json));
```

The same can be done with [Jade](http://jade-lang.com/) using the `toJade` function of the same module. These functions have additional options which can be found in their [reference document for translations](https://github.com/andrejewski/himalaya/tree/master/docs/translation.md).

## Why "Himalaya"?

[First, my friends weren't very helpful.](https://twitter.com/compooter/status/597908517132042240) Except Josh, Josh had my back.

While I was testing the parser, I threw a download of my Twitter homepage in and got a huge JSON blob out. My code editor Sublime Text has a mini-map and looking at it sideways the data looked like a never-ending mountain range. Also, "himalaya" has H, M, L in it.

## Nerd Stuff

My first implementation used look-ahead, found the matching closing tag, and then recursively parsed the inners until a tree was built. That was problematic. This implementation uses no look-ahead and instead uses a stack to keep track of nesting as the source string is cut away. When an end tag is found the stack it cut to match and then parsing picks up again at the higher level. 

This parser was implemented without using any regular expressions. Since I wanted this to double as a learning resource, I wanted the code to be readable sans regexes.

## Contributing

We can always have more tests: if you find a bug, create an issue or be **fabulous** and fix the problem and write the tests up yourself in a coherent pull request.

Run tests with the `npm test` command.

Follow me on [Twitter](https://twitter.com/compooter) for updates or just for the lolz and please check out my other [repositories](https://github.com/andrejewski) if I have earned it. I thank you for reading.
