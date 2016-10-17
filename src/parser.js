export default function parser (tokens, options) {
  const state = {tokens, options, cursor: 0, stack: [], nodes: []}
  parse(state)
  return state.nodes
}

export function parse (state) {
  const {tokens, options, nodes, stack} = state
  const len = tokens.length
  let {cursor} = state
  while (cursor < len) {
    const token = tokens[cursor]
    if (token.type !== 'tag-start') {
      nodes.push(token)
      cursor++
      continue
    }

    cursor++
    const tagToken = tokens[cursor]
    if (!tagToken || tagToken.type !== 'tag') {
      continue
    }

    cursor++
    const tagName = tagToken.content.toLowerCase()
    if (token.close) {
      let item
      while ((item = stack.pop())) {
        if (tagName === item) break
      }
      while (cursor < len) {
        const endToken = tokens[cursor]
        if (endToken.type !== 'tag-end') break
        cursor++
      }
      break
    }

    stack.push(tagName)
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
    const hasChildren = !(attrToken.close || options.voidTags.includes(tagName))
    if (hasChildren) {
      const innerState = {tokens, options, cursor, stack, nodes: children}
      parse(innerState)
      cursor = innerState.cursor
    }

    nodes.push({
      type: 'element',
      tagName: tagToken.content,
      attributes,
      children
    })
  }
  state.cursor = cursor
}
