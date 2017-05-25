import lexer from './lexer'
import parser from './parser'
import format from './formats/v0'

/*
  Tags which contain arbitrary non-parsed content
  For example: <script> JavaScript should not be parsed
*/
const childlessTags = ['style', 'script', 'template']

/*
  Tags which auto-close because they cannot be nested
  For example: <p>Outer<p>Inner is <p>Outer</p><p>Inner</p>
*/
const closingTags = [
  'html', 'head', 'body', 'p', 'dt', 'dd', 'li', 'option',
  'thead', 'th', 'tbody', 'tr', 'td', 'tfoot', 'colgroup'
]

/*
  Closing tags which have ancestor tags which
  may exist within them which prevent the
  closing tag from auto-closing.
  For example: in <li><ul><li></ul></li>,
  the top-level <li> should not auto-close.
*/
const closingTagAncestorBreakers = {
  li: ['ul', 'ol', 'menu'],
  dt: ['dl'],
  dd: ['dl']
}

/*
  Tags which do not need the closing tag
  For example: <img> does not need </img>
*/
const voidTags = [
  '!doctype', 'area', 'base', 'br', 'col', 'command',
  'embed', 'hr', 'img', 'input', 'keygen', 'link',
  'meta', 'param', 'source', 'track', 'wbr'
]

export const parseDefaults = {
  voidTags,
  closingTags,
  closingTagAncestorBreakers,
  childlessTags,
  format // transform for v0 spec
}

export function parse (str, options = parseDefaults) {
  const tokens = lexer(str, options)
  const nodes = parser(tokens, options)
  return format(nodes, options)
}

export default {parse, parseDefaults}
