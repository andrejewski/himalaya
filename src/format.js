export function splitHead (str, sep) {
  const idx = str.indexOf(sep)
  if (idx === -1) return [str]
  return [str.slice(0, idx), str.slice(idx + sep.length)]
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

export function format (nodes) {
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
