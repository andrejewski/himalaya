import { splitHead, unquote } from './format'

let options = {
  root: {
    type: 'div',
    class: 'cell-root',
    active: true
  },
  trim: false,
  lowerCaseTag: true
}

export function formatCell (nodes, _options) {
  Object.assign(options, _options)
  const rootCell = {
    $type: options.root.type,
    class: options.root.class,
    $cell: options.root.active
  }
  rootCell['$components'] = format(nodes, rootCell)
  return rootCell
}

export function formatAttributes (attributes, cell) {
  attributes.map(attribute => {
    const parts = splitHead(attribute.trim(), '=')
    const key = parts[0]
    const value = typeof parts[1] === 'string'
      ? unquote(parts[1])
      : null
    cell[key] = value
  })
  return cell
}

export function format (nodes, parent) {
  return nodes.filter(node => {
    if (node.type === 'text') {
      return filterCell(node, parent)
    }
    return node
  })
  .map(function (node) { return mapCell(node) })
}

export function filterCell (node, parent) {
  if (options.trim) {
    if (node.content.trim() !== '\n' && node.content.replace(/\s/g, '').length > 0) {
      parent.$html = parent.$html || ''
      parent.$html += node.content.trim()
    }
    return false
  }
  parent.$html = parent.$html || ''
  parent.$html += node.content
  return false
}

export function mapCell (node) {
  let cell = {}
  cell.$type = options.lowerCaseTag
    ? node.tagName.toLowerCase()
    : node.tagName
  formatAttributes(node.attributes, cell)
  let childComponents = format(node.children, cell)
  if (childComponents.length > 0) {
    cell.$components = childComponents
  }
  return cell
}
