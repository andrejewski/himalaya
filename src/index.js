import lexer from './lexer'
import parser from './parser'
import {format} from './format'
import {toHTML} from './stringify'
import {formatCell} from './cell'

import {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers
} from './tags'

export const parseDefaults = {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers
}

export function parse (str) {
  let options = Object.assign(parseDefaults, arguments[1])
  const tokens = lexer(str, options)
  const nodes = parser(tokens, options)
  return !options.cell ? format(nodes, options) : formatCell(nodes, options)
}

export function stringify (ast, options = parseDefaults) {
  return toHTML(ast, options)
}
