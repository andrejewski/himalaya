export default function formatter (nodes, options) {
  return format(nodes)
}

export function format (nodes) {
  return nodes.map(node => {
    const type = capitialize(node.type)
    if (type === 'Element') {
      const tagName = node.tagName.toLowerCase()
      const attributes = commonAttributes(node.attributes)
      const children = format(node.children)
      return {type, tagName, attributes, children}
    }

    return {type, content: node.content}
  })
}

function capitialize (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function camelCase (str) {
  return str.split('-').reduce((str, word) => {
    return str + word.charAt(0).toUpperCase() + word.slice(1)
  })
}

function castValue (str) {
  if (typeof str !== 'string') return str
  const num = +str
  if (!isNaN(num)) return num
  return str
}

function unquote (str) {
  const car = str.charAt(0)
  const end = str.length - 1
  if (car === '"' || car === "'" && car === str.charAt(end)) {
    return str.slice(1, end)
  }
  return str
}

function splitHead (str, sep) {
  const idx = str.indexOf(sep)
  if (idx === -1) return [str]
  return [str.slice(0, idx), str.slice(idx + sep.length)]
}

export function commonAttributes (attributes) {
  return attributes.reduce((attrs, pair) => {
    let [key, value] = splitHead(pair.trim(), '=')
    value = value ? unquote(value) : key
    if (key === 'class') {
      attrs.className = value.split(' ')
    }
    if (key === 'style') {
      attrs.style = commonStyles(value)
    }
    if (key.startsWith('data-')) {
      attrs.dataset = attrs.dataset || {}
      const prop = camelCase(key.slice(5))
      attrs.dataset[prop] = castValue(value)
    } else {
      attrs[camelCase(key)] = castValue(value)
    }
    return attrs
  }, {})
}

export function commonStyles (str) {
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
