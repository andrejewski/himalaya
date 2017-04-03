import test from 'ava'
import himalaya from '../'

/*
These tests mainly serve as a gauntlet for generic use.
Do not add any more of these kinds of tests, instead
test the more granular bits.

TODO: remove overlapping tests
*/

test('parse() should pass the Hello World case', t => {
  const html = '<html><h1>Hello, World</h1></html>'
  const data = [{
    type: 'Element',
    tagName: 'html',
    attributes: {},
    children: [{
      type: 'Element',
      tagName: 'h1',
      attributes: {},
      children: [{
        type: 'Text',
        content: 'Hello, World'
      }]
    }]
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('parse() should work for mixed attributes', t => {
  const html = "<div class='section widget'><b disabled>Poop</b><p>Pee</p></div>"
  const data = [{
    type: 'Element',
    tagName: 'div',
    attributes: {
      className: ['section', 'widget']
    },
    children: [{
      type: 'Element',
      tagName: 'b',
      attributes: {
        disabled: 'disabled'
      },
      children: [{
        type: 'Text',
        content: 'Poop'
      }]
    }, {
      type: 'Element',
      tagName: 'p',
      attributes: {},
      children: [{
        type: 'Text',
        content: 'Pee'
      }]
    }]
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('parse() should work for commented html', t => {
  const html = '<b><!--comment text-->words</b>'
  const data = [{
    type: 'Element',
    tagName: 'b',
    attributes: {},
    children: [{
      type: 'Comment',
      content: 'comment text'
    }, {
      type: 'Text',
      content: 'words'
    }]
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('parse() should work for style properties', t => {
  const html = "<div style='width: 360px; height: 120px; background-color: #fff'></div>"
  const data = [{
    type: 'Element',
    tagName: 'div',
    attributes: {
      style: {
        width: '360px',
        height: '120px',
        backgroundColor: '#fff'
      }
    },
    children: []
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('parse() should work on data-* attributes', t => {
  const html = "<div data-num=0 data-word='poop' data-cake='2'></div>"
  const data = [{
    type: 'Element',
    tagName: 'div',
    attributes: {
      dataset: {
        num: 0,
        word: 'poop',
        cake: 2
      }
    },
    children: []
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('should work on unclosed tags', t => {
  const html = '<p>One two<p>three four'
  const data = [{
    type: 'Element',
    tagName: 'p',
    attributes: {},
    children: [{
      type: 'Text',
      content: 'One two'
    }]
  }, {
    type: 'Element',
    tagName: 'p',
    attributes: {},
    children: [{
      type: 'Text',
      content: 'three four'
    }]
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('should not set custom attrs to zeroes', t => {
  const html = "<div custom-attr=''></div>"
  const data = [{
    type: 'Element',
    tagName: 'div',
    attributes: {customAttr: ''},
    children: []
  }]
  t.deepEqual(data, himalaya.parse(html))
})

test('custom tags should appear in the ast', t => {
  {
    const html = '<result>Hello</result>'
    const data = [{
      type: 'Element',
      tagName: 'result',
      attributes: {},
      children: [{
        type: 'Text',
        content: 'Hello'
      }]
    }]
    t.deepEqual(data, himalaya.parse(html))
  }

  {
    const html = `<div><h1>Hi there</h1><result></result></div>`
    const data = [{
      type: 'Element',
      tagName: 'div',
      attributes: {},
      children: [{
        type: 'Element',
        tagName: 'h1',
        attributes: {},
        children: [{
          type: 'Text',
          content: 'Hi there'
        }]
      }, {
        type: 'Element',
        tagName: 'result',
        attributes: {},
        children: []
      }]
    }]
    t.deepEqual(data, himalaya.parse(html))
  }
})
