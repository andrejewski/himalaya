import paul from 'paul'
import {
  stringIncludes,
  arrayIncludes
} from './compat'

// c/p'd from ../index.js
const voidTags = [
  '!doctype', 'area', 'base', 'br', 'col', 'command',
  'embed', 'hr', 'img', 'input', 'keygen', 'link',
  'meta', 'param', 'source', 'track', 'wbr'
]

function serializeAttr (attr, value, isXml) {
  if (!isXml && attr === value) return attr
  const text = value.toString()
  const quoteEscape = text.indexOf('\'') !== -1
  const quote = quoteEscape ? '"' : '\''
  return attr + '=' + quote + text + quote
}

// stolen from underscore.string
function dasherize (str) {
  return str.trim()
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .toLowerCase()
}

function inlineStyle (style) {
  return Object.keys(style).reduce((css, key) => {
    return `${css}; ${dasherize(key)}: ${style[key]}`
  }, '').slice(2)
}

const htmlDefaults = {}

function toHTML (tree, options = htmlDefaults) {
  const {doctype} = options
  const isXml = doctype === 'xml'
  const html = paul.walk(tree, (node, walk) => {
    const {type, tagName, attributes, content} = node
    if (type === 'Text') return content
    if (type === 'Comment') return `<!--${content}-->`
    let tag = '<' + tagName
    for (const attr in attributes) {
      const val = attributes[attr]
      if (attr === 'dataset') {
        for (const prop in val) {
          const key = 'data-' + dasherize(prop)
          tag += ' ' + serializeAttr(key, val[prop], isXml)
        }
        continue
      }

      if (attr === 'style') {
        tag += ' ' + serializeAttr(attr, inlineStyle(val))
        continue
      }

      if (attr === 'className') {
        tag += ' ' + serializeAttr('class', val.join(' '))
        continue
      }

      tag += ' ' + serializeAttr(dasherize(attr), val, isXml)
    }

    tag += '>'
    const autoClose = !isXml && arrayIncludes(voidTags, tagName.toLowerCase())
    if (autoClose) return tag

    const innerds = walk(node.children || []).join('')
    return tag + innerds + `</${tagName}>`
  })
  if (html.join) return html.join('')
  return html
}

const newline = '\n'
const jadeDefaults = {
  indentation: '  '
}

function isWhitespaceNode (node) {
  return !(node.type === 'Text' && !node.content.trim())
}

function toJade (tree, options = jadeDefaults) {
  let {doctype} = options
  const multi = multilineText(options.indentation)

  if (tree.filter) tree = tree.filter(isWhitespaceNode)
  const jade = paul.walk(tree, (node, walk, depth) => {
    const {type, tagName, attributes} = node
    if (type === 'Text') {
      return multi(node.content, depth, '| ')
    }
    if (type === 'Comment') {
      const text = node.content
      return ~text.indexOf(newline)
        ? multi('//', depth) + newline + multi(text, depth + 1)
        : multi('//' + text, depth)
    }
    let tag = tagName
    const {id, className} = attributes
    if (id) tag += `#${id}`
    if (className) tag += `.${className.join('.')}`

    const redundantDiv = node.tagName === 'div' && tag.length > 3
    if (redundantDiv) tag = tag.slice(3)

    tag = multi(tag, depth)
    const attrs = node.attributes
    const props = Object.keys(attrs).filter(key => {
      return key !== 'className' && key !== 'id'
    })
    if (props.length) {
      const isXml = doctype === 'xml'
      tag += '('
      tag += props.map(prop => {
        const val = attrs[prop]
        if (prop === 'dataset') {
          return Object.keys(val).map(attr => {
            return serializeAttr('data-' + dasherize(attr), val[attr], isXml)
          }).join(', ')
        }
        if (prop === 'style') return serializeAttr(prop, inlineStyle(val))
        return serializeAttr(dasherize(prop), val, isXml)
      }).join(', ')
      tag += ')'
    }
    const lowTagName = node.tagName.toLowerCase()
    if (arrayIncludes(voidTags, lowTagName)) {
      if (lowTagName === '!doctype') {
        if (!doctype) doctype = doctypeShortcut(tag)
        return multi('doctype ' + doctype, depth)
      }
      return tag
    }

    const {children} = node
    if (!children.length) return tag
    if (children.length === 1 && children[0].type === 'Text') {
      const text = children[0].content
      return ~text.indexOf(newline)
        ? tag + '.' + newline + multi(text, depth + 1)
        : tag + ' ' + text
    }

    return tag + newline +
      walk(children.filter(isWhitespaceNode), depth + 1).join(newline)
  }, 0)
  if (jade.join) return jade.join(newline)
  return jade
}

function multilineText (indentation) {
  let format = line => line
  const hasTab = stringIncludes(indentation, '\t')
  if (hasTab) {
    format = line => line.replace(/\t/g, indentation)
  }

  function indent (depth, str) {
    while (depth--) {
      str = indentation + str
    }
    return str
  }

  return function (str, depth, lead = '') {
    const lines = str
      .split(newline)
      .map(format)
      .filter(line => !!line.trim())

    const start = maxSharedIndent(lines)
    return lines
      .map(line => indent(depth, lead + line.slice(start)))
      .join(newline)
  }
}

function maxSharedIndent (lines) {
  return lines.reduce(function (num, line) {
    return Math.min(num, line.length - line.trimLeft().length)
  }, Infinity)
}

// see http://jade-lang.com/reference/doctype/
function doctypeShortcut (str) {
  if (stringIncludes(str, 'Transitional')) return 'transitional'
  if (stringIncludes(str, 'strict')) return 'strict'
  if (stringIncludes(str, 'Frameset')) return 'frameset'
  if (stringIncludes(str, 'Basic')) return 'basic'
  if (stringIncludes(str, '1.1')) return '1.1'
  if (stringIncludes(str, 'Mobile')) return 'mobile'
  return 'html'
}

module.exports = {
  toHTML,
  toJade,
  toPug: toJade
}
