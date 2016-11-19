export default function lexer (str, options) {
  const state = {str, options, cursor: 0, tokens: []}
  lex(state)
  return state.tokens
}

export function lex (state) {
  const {str} = state
  const len = str.length
  while (state.cursor < len) {
    const isText = str.charAt(state.cursor) !== '<'
    if (isText) {
      lexText(state)
      continue
    }

    const isComment = str.startsWith('!--', state.cursor + 1)
    if (isComment) {
      lexComment(state)
      continue
    }

    const tagName = lexTag(state)
    if (tagName) {
      const safeTag = tagName.toLowerCase()
      const {childlessTags} = state.options
      if (childlessTags.includes(safeTag)) {
        lexSkipTag(tagName, state)
      }
    }
  }
}

export function lexText (state) {
  const {str, cursor} = state
  const textEnd = str.indexOf('<', cursor)
  const type = 'text'
  if (textEnd === -1) {
    // there is only text left
    const content = str.slice(cursor)
    state.cursor = str.length
    state.tokens.push({type, content})
    return
  }

  if (textEnd === cursor) return

  const content = str.slice(cursor, textEnd)
  state.cursor = textEnd
  state.tokens.push({type, content})
}

export function lexComment (state) {
  state.cursor += 4 // "<!--".length
  const {str, cursor} = state
  const commentEnd = str.indexOf('-->', cursor)
  const type = 'comment'
  if (commentEnd === -1) {
    // there is only the comment left
    const content = str.slice(cursor)
    state.cursor = str.length
    state.tokens.push({type, content})
    return
  }

  const content = str.slice(cursor, commentEnd)
  state.cursor = commentEnd + 3 // "-->".length
  state.tokens.push({type, content})
}

export function lexTag (state) {
  const {str} = state
  {
    const secondChar = str.charAt(state.cursor + 1)
    const close = secondChar === '/'
    state.tokens.push({type: 'tag-start', close})
    state.cursor += close ? 2 : 1
  }
  const tagName = lexTagName(state)
  lexTagAttributes(state)
  {
    const firstChar = str.charAt(state.cursor)
    const close = firstChar === '/'
    state.tokens.push({type: 'tag-end', close})
    state.cursor += close ? 2 : 1
  }
  return tagName
}

export function lexTagName (state) {
  const {str, cursor} = state
  const len = str.length
  let start = cursor
  while (start < len) {
    const char = str.charAt(start)
    const isTagChar = !(char === ' ' || char === '/' || char === '>')
    if (isTagChar) break
    start++
  }

  let end = start + 1
  while (end < len) {
    const char = str.charAt(end)
    const isTagChar = !(char === ' ' || char === '/' || char === '>')
    if (!isTagChar) break
    end++
  }

  state.cursor = end
  const tagName = str.slice(start, end)
  state.tokens.push({type: 'tag', content: tagName})
  return tagName
}

export function lexTagAttributes (state) {
  const {str, tokens} = state
  let cursor = state.cursor
  let quote = null // null, single-, or double-quote
  let wordBegin = cursor // index of word start
  const words = [] // "key", "key=value", "key='value'", etc
  const len = str.length
  while (cursor < len) {
    const char = str.charAt(cursor)
    if (quote) {
      const isQuoteEnd = char === quote
      if (isQuoteEnd) {
        quote = null
      }
      cursor++
      continue
    }

    const isTagEnd = char === '/' || char === '>'
    if (isTagEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor))
      }
      break
    }

    const isWordEnd = char === ' '
    if (isWordEnd) {
      if (cursor !== wordBegin) {
        words.push(str.slice(wordBegin, cursor))
      }
      wordBegin = cursor + 1
      cursor++
      continue
    }

    const isQuoteStart = char === '\'' || char === '"'
    if (isQuoteStart) {
      quote = char
      cursor++
      continue
    }

    cursor++
  }
  state.cursor = cursor

  const wLen = words.length
  const type = 'attribute'
  for (let i = 0; i < wLen; i++) {
    const word = words[i]
    if (!(word && word.length)) continue
    const isNotPair = word.indexOf('=') === -1
    if (isNotPair) {
      const secondWord = words[i + 1]
      if (secondWord && secondWord.startsWith('=')) {
        if (secondWord.length > 1) {
          const newWord = word + secondWord
          tokens.push({type, content: newWord})
          i += 1
          continue
        }
        const thirdWord = words[i + 2]
        i += 1
        if (thirdWord) {
          const newWord = word + '=' + thirdWord
          tokens.push({type, content: newWord})
          i += 1
          continue
        }
      }
    }
    if (word.endsWith('=')) {
      const secondWord = words[i + 1]
      if (secondWord && !secondWord.includes('=')) {
        const newWord = word + secondWord
        tokens.push({type, content: newWord})
        i += 1
        continue
      }

      const newWord = word.slice(0, -1)
      tokens.push({type, content: newWord})
      continue
    }

    tokens.push({type, content: word})
  }
}

export function lexSkipTag (tagName, state) {
  const {str, cursor, tokens} = state
  const len = str.length
  let index = cursor
  while (index < len) {
    const nextTag = str.indexOf('</', index)
    if (nextTag === -1) {
      lexText(state)
      break
    }

    const tagState = {str, cursor: nextTag + 2, tokens: []}
    const name = lexTagName(tagState)
    if (!name) {
      index = nextTag + 2
      continue
    }

    const safeTagName = tagName.toLowerCase()
    if (safeTagName !== name.toLowerCase()) {
      index = tagState.cursor
      continue
    }

    const content = str.slice(cursor, nextTag)
    tokens.push({type: 'text', content})
    const openTag = {type: 'tag-start', close: true}
    const closeTag = {type: 'tag-end', close: false}
    lexTagAttributes(tagState)
    tokens.push(openTag, ...tagState.tokens, closeTag)
    state.cursor = tagState.cursor + 1
    break
  }
}
