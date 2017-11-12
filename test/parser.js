import test from 'ava'
import parser from '../lib/parser'
import lexer from '../lib/lexer'

const lexerOptions = {childlessTags: []}
const parserOptions = {
  voidTags: [],
  closingTags: [],
  closingTagAncestorBreakers: {}
}

test('parser() should return nodes', t => {
  const str = '<h1>Hello world</h1>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'h1',
    attributes: [],
    children: [{
      type: 'text',
      content: 'Hello world'
    }]
  }])
})

test('parser() should not nest within void tags', t => {
  const str = '<div>abc<img/>def</div>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, {voidTags: 'img', closingTags: []})
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'div',
    attributes: [],
    children: [{
      type: 'text',
      content: 'abc'
    }, {
      type: 'element',
      tagName: 'img',
      attributes: [],
      children: []
    }, {
      type: 'text',
      content: 'def'
    }]
  }])
})

test('parser() should handle optional-close tags', t => {
  {
    const parserOptions = {
      voidTags: [],
      closingTags: ['p'],
      closingTagAncestorBreakers: {}
    }
    const str = '<p>This is one<p>This is two</p>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, parserOptions)
    t.deepEqual(nodes, [{
      type: 'element',
      tagName: 'p',
      attributes: [],
      children: [{
        type: 'text',
        content: 'This is one'
      }]
    }, {
      type: 'element',
      tagName: 'p',
      attributes: [],
      children: [{
        type: 'text',
        content: 'This is two'
      }]
    }])
  }

  {
    const parserOptions = {
      voidTags: [],
      closingTags: ['p', 'span'],
      closingTagAncestorBreakers: {}
    }
    const str = '<p>This is one <span>okay<p>This is two</p>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, parserOptions)
    t.deepEqual(nodes, [{
      type: 'element',
      tagName: 'p',
      attributes: [],
      children: [{
        type: 'text',
        content: 'This is one '
      }, {
        type: 'element',
        tagName: 'span',
        attributes: [],
        children: [{
          type: 'text',
          content: 'okay'
        }]
      }]
    }, {
      type: 'element',
      tagName: 'p',
      attributes: [],
      children: [{
        type: 'text',
        content: 'This is two'
      }]
    }])
  }
})

test('parser() should auto-close unmatched child tags', t => {
  const parserOptions = {
    voidTags: [],
    closingTags: [],
    closingTagAncestorBreakers: {}
  }
  const str = '<div>This is <b>one <span>okay</div>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'div',
    attributes: [],
    children: [{
      type: 'text',
      content: 'This is '
    }, {
      type: 'element',
      tagName: 'b',
      attributes: [],
      children: [{
        type: 'text',
        content: 'one '
      }, {
        type: 'element',
        tagName: 'span',
        attributes: [],
        children: [{
          type: 'text',
          content: 'okay'
        }]
      }]
    }]
  }])
})

test('parser() should handle empty token arrays', t => {
  const tokens = []
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [])
})

test('parser() should report the element attributes', t => {
  const str = '<div class="cake" data-key="abc" disabled></div>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'div',
    attributes: [
      'class="cake"',
      'data-key="abc"',
      'disabled'
    ],
    children: []
  }])
})

test('parser() should handle unclosed elements', t => {
  const str = '<div>abc'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'div',
    attributes: [],
    children: [{
      type: 'text',
      content: 'abc'
    }]
  }])
})

test('parser() should preserve case-sensitive tag names', t => {
  const str = '<You-Know-8>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'You-Know-8',
    attributes: [],
    children: []
  }])
})

test('parser() should match by case-insensitive tags', t => {
  const str = '<div>abc</DIV>def'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, parserOptions)
  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'div',
    attributes: [],
    children: [{
      type: 'text',
      content: 'abc'
    }]
  }, {
    type: 'text',
    content: 'def'
  }])
})

test('parser() should handle ancestor breaker special case (#39)', t => {
  /*
    To summarize, this special case is where a <ul|ol|menu> is
    encountered within an <li>. The default behavior for <li>s
    as closing tags is to rewind up and auto-close the previous
    <li>. However, <li> may contain <ul|ol|menu> before being
    closed so we should not rewind the stack in those cases.

    This edge-case also applies to <dt|dd> in <dl>s.
  */

  {
    const str = '<ul><li>abc<ul><li>def</li></ul></li></ul>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, {
      voidTags: [],
      closingTags: ['li'],
      closingTagAncestorBreakers: {
        li: ['ul']
      }
    })

    t.deepEqual(nodes, [{
      type: 'element',
      tagName: 'ul',
      attributes: [],
      children: [{
        type: 'element',
        tagName: 'li',
        attributes: [],
        children: [{
          type: 'text',
          content: 'abc'
        }, {
          type: 'element',
          tagName: 'ul',
          attributes: [],
          children: [{
            type: 'element',
            tagName: 'li',
            attributes: [],
            children: [{
              type: 'text',
              content: 'def'
            }]
          }]
        }]
      }]
    }])
  }

  {
    const str = '<ul><li>abc<ul><span><li>def</li></span></ul></li></ul>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, {
      voidTags: [],
      closingTags: ['li'],
      closingTagAncestorBreakers: {
        li: ['ul']
      }
    })

    t.deepEqual(nodes, [{
      type: 'element',
      tagName: 'ul',
      attributes: [],
      children: [{
        type: 'element',
        tagName: 'li',
        attributes: [],
        children: [{
          type: 'text',
          content: 'abc'
        }, {
          type: 'element',
          tagName: 'ul',
          attributes: [],
          children: [{
            type: 'element',
            tagName: 'span',
            attributes: [],
            children: [{
              type: 'element',
              tagName: 'li',
              attributes: [],
              children: [{
                type: 'text',
                content: 'def'
              }]
            }]
          }]
        }]
      }]
    }])
  }

  {
    const str = '<ul><li>abc<ul><li>def<li>ghi</li></ul></li></ul>'
    const tokens = lexer(str, lexerOptions)
    const nodes = parser(tokens, {
      voidTags: [],
      closingTags: ['li'],
      closingTagAncestorBreakers: {
        li: ['ul']
      }
    })

    t.deepEqual(nodes, [{
      type: 'element',
      tagName: 'ul',
      attributes: [],
      children: [{
        type: 'element',
        tagName: 'li',
        attributes: [],
        children: [{
          type: 'text',
          content: 'abc'
        }, {
          type: 'element',
          tagName: 'ul',
          attributes: [],
          children: [{
            type: 'element',
            tagName: 'li',
            attributes: [],
            children: [{
              type: 'text',
              content: 'def'
            }]
          }, {
            type: 'element',
            tagName: 'li',
            attributes: [],
            children: [{
              type: 'text',
              content: 'ghi'
            }]
          }]
        }]
      }]
    }])
  }
})

test('parser() should handle nested tables', t => {
  const str = '<table><tbody><tr><td><table><tbody><tr><td></td></tr></tbody></table></td></tr></tbody></table>'
  const tokens = lexer(str, lexerOptions)
  const nodes = parser(tokens, {
    voidTags: [],
    closingTags: ['tbody'],
    closingTagAncestorBreakers: {
      tbody: ['table'],
      tr: ['table'],
      td: ['table']
    }
  })

  t.deepEqual(nodes, [{
    type: 'element',
    tagName: 'table',
    attributes: [],
    children: [{
      type: 'element',
      tagName: 'tbody',
      attributes: [],
      children: [{
        type: 'element',
        tagName: 'tr',
        attributes: [],
        children: [{
          type: 'element',
          tagName: 'td',
          attributes: [],
          children: [{
            type: 'element',
            tagName: 'table',
            attributes: [],
            children: [{
              type: 'element',
              tagName: 'tbody',
              attributes: [],
              children: [{
                type: 'element',
                tagName: 'tr',
                attributes: [],
                children: [{
                  type: 'element',
                  tagName: 'td',
                  attributes: [],
                  children: []
                }]
              }]
            }]
          }]
        }]
      }]
    }]
  }])
})
