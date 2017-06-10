/*
  This format adheres to the v0 ASP spec.
*/
import {startsWith} from '../compat'

export default function format (nodes) {
  return nodes.map(node => {
    const type = capitalize(node.type)
    if (type === 'Element') {
      const tagName = node.tagName.toLowerCase()
      const attributes = formatAttributes(node.attributes)
      const children = format(node.children)
      return {type, tagName, attributes, children}
    }

    return {type, content: node.content}
  })
}

export function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function camelCase (str) {
  return str.split('-').reduce((str, word) => {
    return str + word.charAt(0).toUpperCase() + word.slice(1)
  })
}

export function castValue (str) {
  if (typeof str !== 'string') return str
  if (str === '') return str
  const num = +str
  if (!isNaN(num)) return num
  return str
}

export function unquote (str) {
  const car = str.charAt(0)
  const end = str.length - 1
  const isQuoteStart = car === '"' || car === "'"
  if (isQuoteStart && car === str.charAt(end)) {
    return str.slice(1, end)
  }
  return str
}

export function splitHead (str, sep) {
  const idx = str.indexOf(sep)
  if (idx === -1) return [str]
  return [str.slice(0, idx), str.slice(idx + sep.length)]
}

export function formatAttributes (attributes) {
  return attributes.reduce((attrs, pair) => {
    let [key, value] = splitHead(pair.trim(), '=')
    value = value ? unquote(value) : key
    if (key === 'class') {
      attrs.className = value.split(' ')
    } else if (key === 'style') {
      attrs.style = formatStyles(value)
    } else if (startsWith(key, 'data-')) {
      attrs.dataset = attrs.dataset || {}
      const prop = camelCase(key.slice(5))
      attrs.dataset[prop] = castValue(value)
    } else {
      attrs[camelCase(key)] = castValue(value)
    }
    return attrs
  }, {})
}

export function formatStyles (str) {
  return str.trim().split(';')
    .map(rule => rule.trim().split(':'))
    .reduce((styles, keyValue) => {
      const [rawKey, rawValue] = keyValue
      if (rawValue) {
        const key = camelCase(rawKey.trim())
        const value = castValue(rawValue.trim())
        styles[key] = value
      }
      return styles
    }, {})
}
