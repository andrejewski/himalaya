(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.himalaya = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.stringIncludes = stringIncludes;
exports.isRealNaN = isRealNaN;
exports.arrayIncludes = arrayIncludes;
/*
  We don't want to include babel-polyfill in our project.
    - Library authors should be using babel-runtime for non-global polyfilling
    - Adding babel-polyfill/-runtime increases bundle size significantly

  We will include our polyfill instance methods as regular functions.
*/

function startsWith(str, searchString, position) {
  return str.substr(position || 0, searchString.length) === searchString;
}

function endsWith(str, searchString, position) {
  var index = (position || str.length) - searchString.length;
  var lastIndex = str.lastIndexOf(searchString, index);
  return lastIndex !== -1 && lastIndex === index;
}

function stringIncludes(str, searchString, position) {
  return str.indexOf(searchString, position || 0) !== -1;
}

function isRealNaN(x) {
  return typeof x === 'number' && isNaN(x);
}

function arrayIncludes(array, searchElement, position) {
  var len = array.length;
  if (len === 0) return false;

  var lookupIndex = position | 0;
  var isNaNElement = isRealNaN(searchElement);
  var searchIndex = lookupIndex >= 0 ? lookupIndex : len + lookupIndex;
  while (searchIndex < len) {
    var element = array[searchIndex++];
    if (element === searchElement) return true;
    if (isNaNElement && isRealNaN(element)) return true;
  }

  return false;
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           This format adheres to the v0 ASP spec.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */


exports.default = format;
exports.capitalize = capitalize;
exports.camelCase = camelCase;
exports.castValue = castValue;
exports.unquote = unquote;
exports.splitHead = splitHead;
exports.formatAttributes = formatAttributes;
exports.formatStyles = formatStyles;

var _compat = require('../compat');

function format(nodes) {
  return nodes.map(function (node) {
    var type = capitalize(node.type);
    if (type === 'Element') {
      var tagName = node.tagName.toLowerCase();
      var attributes = formatAttributes(node.attributes);
      var children = format(node.children);
      return { type: type, tagName: tagName, attributes: attributes, children: children };
    }

    return { type: type, content: node.content };
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str) {
  return str.split('-').reduce(function (str, word) {
    return str + word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function castValue(str) {
  if (typeof str !== 'string') return str;
  if (str === '') return str;
  var num = +str;
  if (!isNaN(num)) return num;
  return str;
}

function unquote(str) {
  var car = str.charAt(0);
  var end = str.length - 1;
  var isQuoteStart = car === '"' || car === "'";
  if (isQuoteStart && car === str.charAt(end)) {
    return str.slice(1, end);
  }
  return str;
}

function splitHead(str, sep) {
  var idx = str.indexOf(sep);
  if (idx === -1) return [str];
  return [str.slice(0, idx), str.slice(idx + sep.length)];
}

function formatAttributes(attributes) {
  return attributes.reduce(function (attrs, pair) {
    var _splitHead = splitHead(pair.trim(), '='),
        _splitHead2 = _slicedToArray(_splitHead, 2),
        key = _splitHead2[0],
        value = _splitHead2[1];

    value = value ? unquote(value) : key;
    if (key === 'class') {
      attrs.className = value.split(' ');
    } else if (key === 'style') {
      attrs.style = formatStyles(value);
    } else if ((0, _compat.startsWith)(key, 'data-')) {
      attrs.dataset = attrs.dataset || {};
      var prop = camelCase(key.slice(5));
      attrs.dataset[prop] = castValue(value);
    } else {
      attrs[camelCase(key)] = castValue(value);
    }
    return attrs;
  }, {});
}

function formatStyles(str) {
  return str.trim().split(';').map(function (rule) {
    return rule.trim().split(':');
  }).reduce(function (styles, keyValue) {
    var _keyValue = _slicedToArray(keyValue, 2),
        rawKey = _keyValue[0],
        rawValue = _keyValue[1];

    if (rawValue) {
      var key = camelCase(rawKey.trim());
      var value = castValue(rawValue.trim());
      styles[key] = value;
    }
    return styles;
  }, {});
}

},{"../compat":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseDefaults = undefined;
exports.parse = parse;

var _lexer = require('./lexer');

var _lexer2 = _interopRequireDefault(_lexer);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _v = require('./formats/v0');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  Tags which contain arbitrary non-parsed content
  For example: <script> JavaScript should not be parsed
*/
var childlessTags = ['style', 'script', 'template'];

/*
  Tags which auto-close because they cannot be nested
  For example: <p>Outer<p>Inner is <p>Outer</p><p>Inner</p>
*/
var closingTags = ['html', 'head', 'body', 'p', 'dt', 'dd', 'li', 'option', 'thead', 'th', 'tbody', 'tr', 'td', 'tfoot', 'colgroup'];

/*
  Closing tags which have ancestor tags which
  may exist within them which prevent the
  closing tag from auto-closing.
  For example: in <li><ul><li></ul></li>,
  the top-level <li> should not auto-close.
*/
var closingTagAncestorBreakers = {
  li: ['ul', 'ol', 'menu'],
  dt: ['dl'],
  dd: ['dl']
};

/*
  Tags which do not need the closing tag
  For example: <img> does not need </img>
*/
var voidTags = ['!doctype', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

var parseDefaults = exports.parseDefaults = {
  voidTags: voidTags,
  closingTags: closingTags,
  closingTagAncestorBreakers: closingTagAncestorBreakers,
  childlessTags: childlessTags,
  format: _v2.default // transform for v0 spec
};

function parse(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : parseDefaults;

  var tokens = (0, _lexer2.default)(str, options);
  var nodes = (0, _parser2.default)(tokens, options);
  return (0, _v2.default)(nodes, options);
}

exports.default = { parse: parse, parseDefaults: parseDefaults };

},{"./formats/v0":2,"./lexer":4,"./parser":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = lexer;
exports.lex = lex;
exports.lexText = lexText;
exports.lexComment = lexComment;
exports.lexTag = lexTag;
exports.isWhitespaceChar = isWhitespaceChar;
exports.lexTagName = lexTagName;
exports.lexTagAttributes = lexTagAttributes;
exports.lexSkipTag = lexSkipTag;

var _compat = require('./compat');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function lexer(str, options) {
  var state = { str: str, options: options, cursor: 0, tokens: [] };
  lex(state);
  return state.tokens;
}

function lex(state) {
  var str = state.str;

  var len = str.length;
  while (state.cursor < len) {
    var isText = str.charAt(state.cursor) !== '<';
    if (isText) {
      lexText(state);
      continue;
    }

    var isComment = (0, _compat.startsWith)(str, '!--', state.cursor + 1);
    if (isComment) {
      lexComment(state);
      continue;
    }

    var tagName = lexTag(state);
    if (tagName) {
      var safeTag = tagName.toLowerCase();
      var childlessTags = state.options.childlessTags;

      if ((0, _compat.arrayIncludes)(childlessTags, safeTag)) {
        lexSkipTag(tagName, state);
      }
    }
  }
}

function lexText(state) {
  var str = state.str,
      cursor = state.cursor;

  var textEnd = str.indexOf('<', cursor);
  var type = 'text';
  if (textEnd === -1) {
    // there is only text left
    var _content = str.slice(cursor);
    state.cursor = str.length;
    state.tokens.push({ type: type, content: _content });
    return;
  }

  if (textEnd === cursor) return;

  var content = str.slice(cursor, textEnd);
  state.cursor = textEnd;
  state.tokens.push({ type: type, content: content });
}

function lexComment(state) {
  state.cursor += 4; // "<!--".length
  var str = state.str,
      cursor = state.cursor;

  var commentEnd = str.indexOf('-->', cursor);
  var type = 'comment';
  if (commentEnd === -1) {
    // there is only the comment left
    var _content2 = str.slice(cursor);
    state.cursor = str.length;
    state.tokens.push({ type: type, content: _content2 });
    return;
  }

  var content = str.slice(cursor, commentEnd);
  state.cursor = commentEnd + 3; // "-->".length
  state.tokens.push({ type: type, content: content });
}

function lexTag(state) {
  var str = state.str;

  {
    var secondChar = str.charAt(state.cursor + 1);
    var close = secondChar === '/';
    state.tokens.push({ type: 'tag-start', close: close });
    state.cursor += close ? 2 : 1;
  }
  var tagName = lexTagName(state);
  lexTagAttributes(state);
  {
    var firstChar = str.charAt(state.cursor);
    var _close = firstChar === '/';
    state.tokens.push({ type: 'tag-end', close: _close });
    state.cursor += _close ? 2 : 1;
  }
  return tagName;
}

// There is one regex for whitespace.
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-white-space
var whitespace = /\s/;
function isWhitespaceChar(char) {
  return whitespace.test(char);
}

function lexTagName(state) {
  var str = state.str,
      cursor = state.cursor;

  var len = str.length;
  var start = cursor;
  while (start < len) {
    var char = str.charAt(start);
    var isTagChar = !(isWhitespaceChar(char) || char === '/' || char === '>');
    if (isTagChar) break;
    start++;
  }

  var end = start + 1;
  while (end < len) {
    var _char = str.charAt(end);
    var _isTagChar = !(isWhitespaceChar(_char) || _char === '/' || _char === '>');
    if (!_isTagChar) break;
    end++;
  }

  state.cursor = end;
  var tagName = str.slice(start, end);
  state.tokens.push({ type: 'tag', content: tagName });
  return tagName;
}

function lexTagAttributes(state) {
  var str = state.str,
      tokens = state.tokens;

  var cursor = state.cursor;
  var quote = null; // null, single-, or double-quote
  var wordBegin = cursor; // index of word start
  var words = []; // "key", "key=value", "key='value'", etc
  var len = str.length;
  while (cursor < len) {
    var char = str.charAt(cursor);
    if (quote) {
      var isQuoteEnd = char === quote;
      if (isQuoteEnd) {
        quote = null;
      }
      cursor++;
      continue;
    }

    var isTagEnd = char === '/' || char === '>';
    if (isTagEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor));
      }
      break;
    }

    var isWordEnd = isWhitespaceChar(char);
    if (isWordEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor));
      }
      wordBegin = cursor + 1;
      cursor++;
      continue;
    }

    var isQuoteStart = char === '\'' || char === '"';
    if (isQuoteStart) {
      quote = char;
      cursor++;
      continue;
    }

    cursor++;
  }
  state.cursor = cursor;

  var wLen = words.length;
  var type = 'attribute';
  for (var i = 0; i < wLen; i++) {
    var word = words[i];
    if (!(word && word.length)) continue;
    var isNotPair = word.indexOf('=') === -1;
    if (isNotPair) {
      var secondWord = words[i + 1];
      if (secondWord && (0, _compat.startsWith)(secondWord, '=')) {
        if (secondWord.length > 1) {
          var newWord = word + secondWord;
          tokens.push({ type: type, content: newWord });
          i += 1;
          continue;
        }
        var thirdWord = words[i + 2];
        i += 1;
        if (thirdWord) {
          var _newWord = word + '=' + thirdWord;
          tokens.push({ type: type, content: _newWord });
          i += 1;
          continue;
        }
      }
    }
    if ((0, _compat.endsWith)(word, '=')) {
      var _secondWord = words[i + 1];
      if (_secondWord && !(0, _compat.stringIncludes)(_secondWord, '=')) {
        var _newWord3 = word + _secondWord;
        tokens.push({ type: type, content: _newWord3 });
        i += 1;
        continue;
      }

      var _newWord2 = word.slice(0, -1);
      tokens.push({ type: type, content: _newWord2 });
      continue;
    }

    tokens.push({ type: type, content: word });
  }
}

function lexSkipTag(tagName, state) {
  var str = state.str,
      cursor = state.cursor,
      tokens = state.tokens;

  var len = str.length;
  var index = cursor;
  while (index < len) {
    var nextTag = str.indexOf('</', index);
    if (nextTag === -1) {
      lexText(state);
      break;
    }

    var tagState = { str: str, cursor: nextTag + 2, tokens: [] };
    var name = lexTagName(tagState);
    var safeTagName = tagName.toLowerCase();
    if (safeTagName !== name.toLowerCase()) {
      index = tagState.cursor;
      continue;
    }

    var content = str.slice(cursor, nextTag);
    tokens.push({ type: 'text', content: content });
    var openTag = { type: 'tag-start', close: true };
    var closeTag = { type: 'tag-end', close: false };
    lexTagAttributes(tagState);
    tokens.push.apply(tokens, [openTag].concat(_toConsumableArray(tagState.tokens), [closeTag]));
    state.cursor = tagState.cursor + 1;
    break;
  }
}

},{"./compat":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parser;
exports.hasTerminalParent = hasTerminalParent;
exports.parse = parse;

var _compat = require('./compat');

function parser(tokens, options) {
  var root = { tagName: null, children: [] };
  var state = { tokens: tokens, options: options, cursor: 0, stack: [root] };
  parse(state);
  return root.children;
}

function hasTerminalParent(tagName, stack, terminals) {
  var tagParents = terminals[tagName];
  if (tagParents) {
    var currentIndex = stack.length - 1;
    while (currentIndex >= 0) {
      var parentTagName = stack[currentIndex].tagName;
      if (parentTagName === tagName) {
        break;
      }
      if ((0, _compat.arrayIncludes)(tagParents, parentTagName)) {
        return true;
      }
      currentIndex--;
    }
  }
  return false;
}

function parse(state) {
  var tokens = state.tokens,
      options = state.options;
  var stack = state.stack;

  var nodes = stack[stack.length - 1].children;
  var len = tokens.length;
  var cursor = state.cursor;

  while (cursor < len) {
    var token = tokens[cursor];
    if (token.type !== 'tag-start') {
      nodes.push(token);
      cursor++;
      continue;
    }

    var tagToken = tokens[++cursor];
    cursor++;
    var tagName = tagToken.content.toLowerCase();
    if (token.close) {
      var item = void 0;
      while (item = stack.pop()) {
        if (tagName === item.tagName) break;
      }
      while (cursor < len) {
        var endToken = tokens[cursor];
        if (endToken.type !== 'tag-end') break;
        cursor++;
      }
      break;
    }

    var isClosingTag = (0, _compat.arrayIncludes)(options.closingTags, tagName);
    var shouldRewindToAutoClose = isClosingTag;
    if (shouldRewindToAutoClose) {
      var terminals = options.closingTagAncestorBreakers;

      shouldRewindToAutoClose = !hasTerminalParent(tagName, stack, terminals);
    }

    if (shouldRewindToAutoClose) {
      // rewind the stack to just above the previous
      // closing tag of the same name
      var currentIndex = stack.length - 1;
      while (currentIndex > 0) {
        if (tagName === stack[currentIndex].tagName) {
          stack = stack.slice(0, currentIndex);
          var previousIndex = currentIndex - 1;
          nodes = stack[previousIndex].children;
          break;
        }
        currentIndex = currentIndex - 1;
      }
    }

    var attributes = [];
    var attrToken = void 0;
    while (cursor < len) {
      attrToken = tokens[cursor];
      if (attrToken.type === 'tag-end') break;
      attributes.push(attrToken.content);
      cursor++;
    }

    cursor++;
    var children = [];
    nodes.push({
      type: 'element',
      tagName: tagToken.content,
      attributes: attributes,
      children: children
    });

    var hasChildren = !(attrToken.close || (0, _compat.arrayIncludes)(options.voidTags, tagName));
    if (hasChildren) {
      stack.push({ tagName: tagName, children: children });
      var innerState = { tokens: tokens, options: options, cursor: cursor, stack: stack };
      parse(innerState);
      cursor = innerState.cursor;
    }
  }
  state.cursor = cursor;
}

},{"./compat":1}]},{},[3])(3)
});
//# sourceMappingURL=himalaya.js.map
