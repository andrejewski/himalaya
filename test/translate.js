import test from 'ava'
import himalaya from '../lib'
import translate from '../lib/translate'
const {toHTML, toJade, toPug} = translate

test('toHTML() should handle simple conversions', t => {
  const str1 = '<h1>Text</h1>'
  t.is(toHTML(himalaya.parse(str1)), str1)

  const str2 = 'Text'
  t.is(toHTML(himalaya.parse(str2)), str2)

  const str3 = '<!--Comment-->'
  t.is(toHTML(himalaya.parse(str3)), str3)
})

test('toHTML() should work for void elements', t => {
  const meta = "<meta charset='utf8'>"
  t.is(toHTML(himalaya.parse(meta)), meta)

  const link = "<link rel='stylesheet' href='file.css'>"
  t.is(toHTML(himalaya.parse(link)), link)
})

test('toHTML() should build the class attribute properly', t => {
  const elem = "<div class='foo bar baz'></div>"
  t.is(toHTML(himalaya.parse(elem)), elem)
})

test('toHTML() should build data-* attributes properly', t => {
  const elem = "<div data-one='5' data-two='five'></div>"
  t.is(toHTML(himalaya.parse(elem)), elem)
})

test('toHTML() should build the style attribute properly', t => {
  const elem = "<div style='color: #fff; font-size: 12px'></div>"
  t.is(toHTML(himalaya.parse(elem)), elem)
})

test('toHTML() should do basic escaping if a value contains either single or double quotes', t => {
  const html = '<div data-val="cake is \'good\'"></div>'
  t.is(toHTML(himalaya.parse(html)), html)
})

test('toHTML() should handle receiving a single root node', t => {
  const html = '<div><p>Words are words.</p></div>'
  t.is(toHTML(himalaya.parse(html)[0]), html)
})

test('toHTML() should preserve whitespace', t => {
  const html = [
    '<html>    ',
    '    <h1>    Document    </h1>',
    '</html>   '
  ].join('\n')
  t.is(toHTML(himalaya.parse(html)), html)
})

test('toHTML() should close void tags when doctype is xml', t => {
  const html = "<img src='bar.png'>"
  const xml = "<img src='bar.png'></img>"
  const jsonHTML = himalaya.parse(html)
  const jsonXML = himalaya.parse(xml)

  t.is(toHTML(jsonHTML), html)
  t.is(toHTML(jsonHTML, {
    doctype: 'xml'
  }), xml)

  t.is(toHTML(jsonXML), html)
  t.is(toHTML(jsonXML, {
    doctype: 'xml'
  }), xml)
})

test('toHTML() should write out boolean attributes when doctype is xml', t => {
  const html = "<script src='bar.js' async></script>"
  const xml = "<script src='bar.js' async='async'></script>"
  const jsonHTML = himalaya.parse(html)
  const jsonXML = himalaya.parse(xml)

  t.is(toHTML(jsonHTML), html)
  t.is(toHTML(jsonHTML, {
    doctype: 'xml'
  }), xml)

  t.is(toHTML(jsonXML), html)
  t.is(toHTML(jsonXML, {
    doctype: 'xml'
  }), xml)
})

test('toJade() should handle plain text', t => {
  const html = 'This is text.'
  const jade = '| This is text.'
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should handle multi-line plain text', t => {
  const html = 'This is multiline text.\nLook newlines.'
  const jade = '| This is multiline text.\n| Look newlines.'
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should handle inline comments', t => {
  const html = '<!-- Comment -->'
  const jade = '// Comment '
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should handle multi-line comments', t => {
  const html = [
    '<!--',
    '  This is a multiline comment.',
    '  Look newlines.',
    '-->'
  ].join('\n')
  const jade = [
    '//',
    '  This is a multiline comment.',
    '  Look newlines.'
  ].join('\n')
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should write short-hand tag ids', t => {
  const html = "<article id='story'></article>"
  const jade = 'article#story'
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should write short-hand tag classes', t => {
  const html = "<article class='story story--main'></article>"
  const jade = 'article.story.story--main'
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should ignore `div` if an id or class(es) are provided', t => {
  const htmlId = "<div id='block'></div>"
  const jadeId = '#block'
  t.is(toJade(himalaya.parse(htmlId)), jadeId)

  const htmlClass = "<div class='block'></div>"
  const jadeClass = '.block'
  t.is(toJade(himalaya.parse(htmlClass)), jadeClass)

  const htmlClasses = "<div class='block block--jumbo'></div>"
  const jadeClasses = '.block.block--jumbo'
  t.is(toJade(himalaya.parse(htmlClasses)), jadeClasses)
})

test('toJade() should write attributes', t => {
  const html = "<canvas width='500' height='400'></canvas>"
  const jade = "canvas(width='500', height='400')"
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should write data-* attributes', t => {
  const html = "<div data-one='5' data-two='five'></div>"
  const jade = "div(data-one='5', data-two='five')"
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should do basic escaping if a value contains either single or double quotes', t => {
  const html = '<div data-val="cake is \'good\'"></div>'
  const jade = 'div(data-val="cake is \'good\'")'
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should write the style attribute', t => {
  const html = "<b style='font-weight: bold; font-style: italics'>Word</b>"
  const jade = "b(style='font-weight: bold; font-style: italics') Word"
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should appropriate place tag inner text', t => {
  const htmlInline = '<h1>Hello</h1>'
  const jadeInline = 'h1 Hello'
  t.is(toJade(himalaya.parse(htmlInline)), jadeInline)

  const htmlMultiline = '<h1>Hello\nWorld</h1>'
  const jadeMultiline = 'h1.\n  Hello\n  World'
  t.is(toJade(himalaya.parse(htmlMultiline)), jadeMultiline)
})

test('toJade() should use tabs for indentation if configured', t => {
  const html = '<h1>Hello\nWorld</h1>'
  const jade = 'h1.\n\t\tHello\n\t\tWorld'
  const jadeOptions = {indentation: '\t\t'}
  t.is(toJade(himalaya.parse(html), jadeOptions), jade)
})

test('toJade() should work for script and style tags', t => {
  const htmlScript = "<script type='text/javascript'>console.log('yes');\nconsole.log('no');</script>"
  const jadeScript = "script(type='text/javascript').\n  console.log('yes');\n  console.log('no');"
  t.is(toJade(himalaya.parse(htmlScript)), jadeScript)

  const htmlStyle = '<style>\nh1 {color: #fff;}\n.text {font-size: 12px;}</style>'
  const jadeStyle = 'style.\n  h1 {color: #fff;}\n  .text {font-size: 12px;}'
  t.is(toJade(himalaya.parse(htmlStyle)), jadeStyle)
})

test('toJade() should handle receiving a single root node', t => {
  const html = '<div><p>Words are words.</p></div>'
  const jade = [
    'div',
    '  p Words are words.'
  ].join('\n')
  t.is(toJade(himalaya.parse(html)[0]), jade)
})

test('toJade() should work for void tags', t => {
  const html = '<img src="cake.png"/>'
  const jade = "img(src='cake.png')"
  t.is(toJade(himalaya.parse(html)), jade)
})

test('toJade() should prioritize using a configured doctype', t => {
  const html = '<!doctype html>'
  const jade = 'doctype foobar'
  const jadeOptions = {doctype: 'foobar', indentation: '  '}
  t.is(toJade(himalaya.parse(html), jadeOptions), jade)
})

test('toJade() should produce proper shorthand doctypes', t => {
  const cases = [
    [
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
      'doctype transitional'
    ],
    [
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd">',
      'doctype frameset'
    ],
    [
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
      'doctype strict'
    ],
    [
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
      'doctype basic'
    ],
    [
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
      'doctype 1.1'
    ],
    [
      '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
      'doctype mobile'
    ],
    ['<!doctype html>', 'doctype html']
  ]

  cases.forEach(([html, jade]) => {
    t.is(toJade(himalaya.parse(html)), jade)
  })
})

test('toPug() should be an alias for toJade(ast, options)', t => {
  t.is(toJade, toPug)
})
