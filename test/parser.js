import test from 'ava'
import parser from '../lib/parser'
import lexer from '../lib/lexer'

const lexerOptions = {childlessTags: []}
const parserOptions = {
  voidTags: [],
  closingTags: []
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
      closingTags: ['p']
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
      closingTags: ['p', 'span']
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
