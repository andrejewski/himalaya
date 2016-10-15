export default function parser (tokens, options) {
  const state = {tokens, options, stack: [], nodes: []}
  parse(state)
  return state.nodes
}

export function parse (state) {
  const {tokens, options, nodes, stack} = state
  let token
  while ((token = tokens.pop())) {
    const {type} = token
    if (type !== 'tag-start') {
      nodes.push(token)
      continue
    }

    const tagToken = tokens.pop()
    if (tagToken.type !== 'tag') {
      continue
    }

    const tagName = tagToken.content.toLowerCase()
    if (token.close) {
      let item
      while ((item = stack.pop())) {
        if (tagName === item) break
      }
      break
    }

    stack.push(tagName)
    let attributes = []
    let attrToken
    while ((attrToken = tokens.pop())) {
      if (attrToken.type === 'tag-end') break
      attributes.push(attrToken.content)
    }

    const children = []
    const hasChildren = attrToken.close || options.voidTags.includes(tagName)
    if (hasChildren) {
      parse({tokens, options, stack, nodes: children})
    }

    nodes.push({
      type: 'element',
      tagName,
      attributes,
      children
    })
  }
  return nodes
}
