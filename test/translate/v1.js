import test from 'ava'
import himalaya from '../../lib'
import format from '../../lib/formats/v1'
import translate from '../../lib/translate/v1'
const {toHTML} = translate

const parseDefaults = Object.assign(
  {},
  himalaya.parseDefaults,
  {format}
)

const parse = html => himalaya.parse(html, parseDefaults)

test('toHTML() should handle simple conversions', t => {
  const str1 = '<h1>Text</h1>'
  t.is(toHTML(parse(str1)), str1)

  const str2 = 'Text'
  t.is(toHTML(parse(str2)), str2)

  const str3 = '<!--Comment-->'
  t.is(toHTML(parse(str3)), str3)
})

test('toHTML() should work for void elements', t => {
  const meta = "<meta charset='utf8'>"
  t.is(toHTML(parse(meta)), meta)

  const link = "<link rel='stylesheet' href='file.css'>"
  t.is(toHTML(parse(link)), link)
})

test('toHTML() should build the class attribute properly', t => {
  const elem = "<div class='foo bar baz'></div>"
  t.is(toHTML(parse(elem)), elem)
})

test('toHTML() should build data-* attributes properly', t => {
  const elem = "<div data-one='5' data-two='five'></div>"
  t.is(toHTML(parse(elem)), elem)
})

test('toHTML() should build the style attribute properly', t => {
  const elem = "<div style='color: #fff; font-size: 12px'></div>"
  t.is(toHTML(parse(elem)), elem)
})

test('toHTML() should do basic escaping if a value contains either single or double quotes', t => {
  const html = '<div data-val="cake is \'good\'"></div>'
  t.is(toHTML(parse(html)), html)
})

test('toHTML() should preserve whitespace', t => {
  const html = [
    '<html>    ',
    '    <h1>    Document    </h1>',
    '</html>   '
  ].join('\n')
  t.is(toHTML(parse(html)), html)
})
