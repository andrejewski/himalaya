import {arrayIncludes} from './compat'

export function formatAttributes (attributes) {
  return attributes.reduce((attrs, attribute) => {
    const {key, value} = attribute
    if (value === null) {
      return `${attrs} ${key}`
    }
    const quoteEscape = value.indexOf('\'') !== -1
    const quote = quoteEscape ? '"' : '\''
    return `${attrs} ${key}=${quote}${value}${quote}`
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
    const safeTagName = options.tagNameToLowerCase ? tagName.toLowerCase() : tagName
    const isSelfClosing = arrayIncludes(options.voidTags, safeTagName)
    return isSelfClosing
      ? `<${safeTagName}${formatAttributes(attributes)}>`
      : `<${safeTagName}${formatAttributes(attributes)}>${toHTML(children, options)}</${safeTagName}>`
  }).join('')
}

export default {toHTML}
