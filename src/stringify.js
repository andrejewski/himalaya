import {arrayIncludes} from './compat'

export function formatAttributes (attributes, useDoubleQuotes) {
  return attributes.reduce((attrs, attribute) => {
    const {key, value} = attribute
    if (value === null) {
      return `${attrs} ${key}`
    }
    if (useDoubleQuotes) {
      const quoteEscape = value.indexOf('"') !== -1
      const quote = quoteEscape ? "'" : '"'
      return `${attrs} ${key}=${quote}${value}${quote}`
    } else {
      const quoteEscape = value.indexOf("'") !== -1
      const quote = quoteEscape ? '"' : "'"
      return `${attrs} ${key}=${quote}${value}${quote}`
    }
  }, '')
}

export function toHTML (tree, options) {
  return tree.map(node => {
    if (node.type === 'text') {
      return node.content
    }
    if (node.type === 'comment') {
      return `<!--${node.content}-->`
    }
    const {tagName, attributes, children} = node
    const isSelfClosing = arrayIncludes(options.voidTags, tagName.toLowerCase())
    return isSelfClosing
      ? `<${tagName}${formatAttributes(attributes, options.useDoubleQuotes)}>`
      : `<${tagName}${formatAttributes(attributes, options.useDoubleQuotes)}>${toHTML(children, options)}</${tagName}>`
  }).join('')
}

export default {toHTML}
