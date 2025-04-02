import lexer from './lexer'
import parser from './parser'
import { format } from './format'
import { toHTML } from './stringify'
import {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers,
} from './tags'

export const parseDefaults = {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers,
  includePositions: false,
  preferDoubleQuoteAttributes: false,
}

export function parse(str, options = parseDefaults) {
  const tokens = lexer(str, { ...parseDefaults, ...options })
  const nodes = parser(tokens, { ...parseDefaults, ...options })
  return format(nodes, { ...parseDefaults, ...options })
}

export function stringify(ast, options = parseDefaults) {
  return toHTML(ast, { ...parseDefaults, ...options })
}
