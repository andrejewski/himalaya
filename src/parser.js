import {arrayIncludes} from './compat'

export default function parser (tokens, options) {
  const root = {tagName: null, children: []}
  const state = {tokens, options, cursor: 0, stack: [root]}
  parse(state)
  return root.children
}

export function hasTerminalParent (tagName, stack, terminals) {
  const tagParents = terminals[tagName]
  if (tagParents) {
    let currentIndex = stack.length - 1
    while (currentIndex >= 0) {
      const parentTagName = stack[currentIndex].tagName
      if (parentTagName === tagName) {
        break
      }
      if (arrayIncludes(tagParents, parentTagName)) {
        return true
      }
      currentIndex--
    }
  }
  return false
}

export function parse (state) {
  const {tokens, options} = state
  let {stack} = state
  let nodes = stack[stack.length - 1].children
  const len = tokens.length
  let {cursor} = state
  while (cursor < len) {
    const token = tokens[cursor]
    if (token.type !== 'tag-start') {
      nodes.push(token)
      cursor++
      continue
    }

    const tagToken = tokens[++cursor]
    cursor++
    const tagName = tagToken.content.toLowerCase()
    if (token.close) {
      let item
      while ((item = stack.pop())) {
        if (tagName === item.tagName) break
      }
      while (cursor < len) {
        const endToken = tokens[cursor]
        if (endToken.type !== 'tag-end') break
        cursor++
      }
      break
    }

    const isClosingTag = arrayIncludes(options.closingTags, tagName)
    let shouldRewindToAutoClose = isClosingTag
    if (shouldRewindToAutoClose) {
      const { closingTagAncestorBreakers: terminals } = options
      shouldRewindToAutoClose = !hasTerminalParent(tagName, stack, terminals)
    }

    if (shouldRewindToAutoClose) {
      // rewind the stack to just above the previous
      // closing tag of the same name
      let currentIndex = stack.length - 1
      while (currentIndex > 0) {
        if (tagName === stack[currentIndex].tagName) {
          stack = stack.slice(0, currentIndex)
          const previousIndex = currentIndex - 1
          nodes = stack[previousIndex].children
          break
        }
        currentIndex = currentIndex - 1
      }
    }

    let attributes = []
    let attrToken
    while (cursor < len) {
      attrToken = tokens[cursor]
      if (attrToken.type === 'tag-end') break
      attributes.push(attrToken.content)
      cursor++
    }

    cursor++
    const children = []
    nodes.push({
      type: 'element',
      tagName: tagToken.content,
      attributes,
      children
    })

    const hasChildren = !(attrToken.close || arrayIncludes(options.voidTags, tagName))
    if (hasChildren) {
      stack.push({tagName, children})
      const innerState = {tokens, options, cursor, stack}
      parse(innerState)
      cursor = innerState.cursor
    }
  }
  state.cursor = cursor
}
