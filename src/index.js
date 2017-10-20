import lexer from './lexer'
import parser from './parser'
import format from './formats/v0'
import {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers
} from './tags'

export const parseDefaults = {
  format, // transform for v0 spec
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers
}

export function parse (str, options = parseDefaults) {
  const tokens = lexer(str, options)
  const nodes = parser(tokens, options)
  return options.format(nodes, options)
}

export default {parse, parseDefaults}
