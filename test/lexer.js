import test from 'ava'
import lexer, {
  lexText,
  lexComment,
  lexTag,
  lexTagName,
  lexTagAttributes,
  lexSkipTag
} from '../lib/lexer'

test('lexer should return tokens', t => {
  const str = '<h1>Test case</h1>'
  const options = {childlessTags: []}
  const tokens = lexer(str, options)
  t.deepEqual(tokens, [
    {type: 'tag-start', close: false},
    {type: 'tag', content: 'h1'},
    {type: 'tag-end', close: false},
    {type: 'text', content: 'Test case'},
    {type: 'tag-start', close: true},
    {type: 'tag', content: 'h1'},
    {type: 'tag-end', close: false}
  ])
})

test('lexText should tokenize the next text segment', t => {
  const str = 'text that ends<x>'
  const finish = str.indexOf('<')

  const state = {str, cursor: 0, tokens: []}
  lexText(state)

  t.is(state.cursor, finish)
  const token = state.tokens[0]
  t.deepEqual(token, {
    type: 'text',
    content: 'text that ends'
  })
})

test('lexText should tokenize from the cursor', t => {
  const str = 'abcdtext that ends<x>'
  const finish = str.indexOf('<')

  const state = {str, cursor: 4, tokens: []}
  lexText(state)

  t.is(state.cursor, finish)
  const token = state.tokens[0]
  t.deepEqual(token, {
    type: 'text',
    content: 'text that ends'
  })
})

test('lexText should tokenize safely to string end', t => {
  const str = 'text that does not end'
  const finish = str.length

  const state = {str, cursor: 0, tokens: []}
  lexText(state)

  t.is(state.cursor, finish)
  const token = state.tokens[0]
  t.deepEqual(token, {
    type: 'text',
    content: 'text that does not end'
  })
})

test('lexText should not add a token for an empty text', t => {
  const str = '  <x>never reach here</x>'
  const start = 2
  const finish = 2

  const state = {str, cursor: start, tokens: []}
  lexText(state)

  t.is(state.cursor, finish)
  t.is(state.tokens.length, 0)
})

test('lexComment should tokenize the next comment', t => {
  const str = '<!-- this is a comment -->abcd'
  const finish = str.indexOf('abcd')
  const state = {str, cursor: 0, tokens: []}
  lexComment(state)

  t.is(state.cursor, finish)
  t.deepEqual(state.tokens[0], {
    type: 'comment',
    content: ' this is a comment '
  })
})

test('lexComment should tokenize safely to string end', t => {
  const str = '<!-- this is a comment'
  const finish = str.length
  const state = {str, cursor: 0, tokens: []}
  lexComment(state)

  t.is(state.cursor, finish)
  t.deepEqual(state.tokens[0], {
    type: 'comment',
    content: ' this is a comment'
  })
})

test('lexComment should tokenize from cursor', t => {
  const str = 'abcd<!-- comment text --><x>'
  const finish = str.indexOf('<x>')
  const state = {str, cursor: 4, tokens: []}
  lexComment(state)

  t.is(state.cursor, finish)
  t.deepEqual(state.tokens[0], {
    type: 'comment',
    content: ' comment text '
  })
})

test('lexComment should add a token for an empty comment', t => {
  const str = '<!---->'
  const finish = str.length
  const state = {str, cursor: 0, tokens: []}
  lexComment(state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens[0], {
    type: 'comment',
    content: ''
  })
})

test('lexTag should tokenize the next tag', t => {
  const str = '<img/>abcd'
  const finish = str.indexOf('abcd')
  const state = {str, cursor: 0, tokens: []}
  lexTag(state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens, [
    {type: 'tag-start', close: false},
    {type: 'tag', content: 'img'}, // not a part of this test
    {type: 'tag-end', close: true}
  ])
})

test('lexTagName should tokenize the next tag name', t => {
  const str = 'h1 id="title"> test'
  const finish = 2
  const state = {str, cursor: 0, tokens: []}
  lexTagName(state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens[0], {
    type: 'tag',
    content: 'h1'
  })
})

test('lexTagAttributes should tokenize attibutes until tag end', t => {
  const str = 'yes="no" maybe data-type="array">abcd'
  const finish = str.indexOf('>abcd')
  const state = {str, cursor: 0, tokens: []}
  lexTagAttributes(state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens, [
    {type: 'attribute', content: 'yes="no"'},
    {type: 'attribute', content: 'maybe'},
    {type: 'attribute', content: 'data-type="array"'}
  ])
})

test('lexTagAttributes should tokenize independent of whitespace', t => {
  const str = 'yes =   "no" maybe   data-type= "array" key ="value" >abcd'
  const finish = str.indexOf('>abcd')
  const state = {str, cursor: 0, tokens: []}
  lexTagAttributes(state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens, [
    {type: 'attribute', content: 'yes="no"'},
    {type: 'attribute', content: 'maybe'},
    {type: 'attribute', content: 'data-type="array"'},
    {type: 'attribute', content: 'key="value"'}
  ])
})

test('lexSkipTag should tokenize as text until the matching tag name', t => {
  const str = 'abcd<test><h1>Test case</h1></test><x>'
  const finish = str.indexOf('<x>')
  const state = {str, cursor: 10, tokens: []}
  lexSkipTag('test', state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens, [
    {type: 'text', content: '<h1>Test case</h1>'},
    {type: 'tag-start', close: true},
    {type: 'tag', content: 'test'},
    {type: 'tag-end', close: false}
  ])
})

test('lexSkipTag should stop at the case-insensitive matching tag name', t => {
  const str = '<tEsT>proving <???> the point</TeSt><x>'
  const finish = str.indexOf('<x>')
  const state = {str, cursor: 6, tokens: []}
  lexSkipTag('tEsT', state)
  t.is(state.cursor, finish)
  t.deepEqual(state.tokens, [
    {type: 'text', content: 'proving <???> the point'},
    {type: 'tag-start', close: true},
    {type: 'tag', content: 'TeSt'},
    {type: 'tag-end', close: false}
  ])
})
