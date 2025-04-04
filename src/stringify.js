import { arrayIncludes } from './compat'

export function formatAttributes(attributes, preferDoubleQuoteAttributes) {
  return attributes.reduce((attrs, attribute) => {
    const { key, value } = attribute
    if (value === null) {
      return `${attrs} ${key}`
    }
    let quote
    if (preferDoubleQuoteAttributes) {
      const quoteEscape = value.indexOf('"') !== -1
      quote = quoteEscape ? "'" : '"'
    } else {
      const quoteEscape = value.indexOf("'") !== -1
      quote = quoteEscape ? '"' : "'"
    }
    return `${attrs} ${key}=${quote}${value}${quote}`
  }, '')
}

export function toHTML(tree, options) {
  return tree
    .map((node) => {
      if (node.type === 'text') {
        return node.content
      }
      if (node.type === 'comment') {
        return `<!--${node.content}-->`
      }
      const { tagName, attributes, children } = node
      const isSelfClosing = arrayIncludes(
        options.voidTags,
        tagName.toLowerCase(),
      )
      return isSelfClosing
        ? `<${tagName}${formatAttributes(
            attributes,
            options.preferDoubleQuoteAttributes,
          )}>`
        : `<${tagName}${formatAttributes(
            attributes,
            options.preferDoubleQuoteAttributes,
          )}>${toHTML(children, options)}</${tagName}>`
    })
    .join('')
}

export default { toHTML }
