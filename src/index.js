import lexer from './lexer'
import parser from './parser'
import format from './formatter'

const childlessTags = ['style', 'script', 'template']
const voidTags = [
  '!doctype', 'area', 'base', 'br', 'col', 'command',
  'embed', 'hr', 'img', 'input', 'keygen', 'link',
  'meta', 'param', 'source', 'track', 'wbr'
]

function parse (str, options = {}) {
  options.childlessTags = options.childlessTags || childlessTags
  options.voidTags = options.voidTags || voidTags
  options.format = options.format || format

  const tokens = lexer(str, options)
  const nodes = parser(tokens, options)
  return format(nodes, options)
}

export default {parse}
