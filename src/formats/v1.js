import {splitHead, unquote} from './util'

export default function format (nodes) {
  return nodes.map(node => {
    const type = node.type
    if (type === 'element') {
      const tagName = node.tagName.toLowerCase()
      const attributes = formatAttributes(node.attributes)
      const children = format(node.children)
      return {type, tagName, attributes, children}
    }

    return {type, content: node.content}
  })
}

export function formatAttributes (attributes) {
  return attributes.map(attribute => {
    const parts = splitHead(attribute.trim(), '=')
    const key = parts[0]
    const value = typeof parts[1] === 'string'
      ? unquote(parts[1])
      : null
    return {key, value}
  })
}
