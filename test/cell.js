import test from 'ava'
import {parse, parseDefaults} from '../'
import {formatAttributes} from '../lib/cell'

test('formatAttributes() should return an object with passed in attributes', t => {
  const cell = { $type: 'div' }
  const attributes = [
    'foo="bar"',
    'disabled',
    'cake=\'man\''
  ]
  t.deepEqual(formatAttributes(attributes, cell), {
    $type: 'div',
    foo: 'bar',
    disabled: null,
    cake: 'man'
  })
})

test('parse() with cell should build root cell object', t => {
  const html = ''
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': []
  }
  parseDefaults.cell = true
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should pass the Hello World case', t => {
  const html = '<div><h1>    Hello, World    </h1></div>'
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'div',
      '$components': [{
        '$type': 'h1',
        '$html': '    Hello, World    '
      }]
    }]
  }
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should trim white space when option set', t => {
  const html = '<div><h1>    Hello, World    </h1></div>'
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'div',
      '$components': [{
        '$type': 'h1',
        '$html': 'Hello, World'
      }]
    }]
  }
  parseDefaults.trim = true
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should handle new lines', t => {
  const html = `
    <div>
      <h1>
          Hello, World
      </h1>
    </div>
  `
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'div',
      '$components': [{
        '$type': 'h1',
        '$html': 'Hello, World'
      }]
    }]
  }
  parseDefaults.trim = true
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should skip tag lowerCase when option set', t => {
  const html = '<foo><Bar>Custom Tags</Bar></foo>'
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'foo',
      '$components': [{
        '$type': 'Bar',
        '$html': 'Custom Tags'
      }]
    }]
  }
  parseDefaults.lowerCaseTag = false
  t.deepEqual(data, parse(html, parseDefaults))
  parseDefaults.lowerCaseTag = true
})

test('parse() with cell should work for mixed attributes', t => {
  const html = '<div id="test-cell" _items="[1,2,3,4]" ><p>Mixed Attributes</p></div>'
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'div',
      id: 'test-cell',
      _items: '[1,2,3,4]',
      '$components': [{
        '$type': 'p',
        '$html': 'Mixed Attributes'
      }]
    }]
  }
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should work on unclosed tags', t => {
  const html = '<div><p>Unclosed Tag</div>'
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'div',
      '$components': [{
        '$type': 'p',
        '$html': 'Unclosed Tag'
      }]
    }]
  }
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should show custom tags in the ast', t => {
  const html = '<foo><Bar>Custom Tags</Bar></foo>'
  const data = {
    '$type': 'div',
    class: 'cell-root',
    '$cell': true,
    '$components': [{
      '$type': 'foo',
      '$components': [{
        '$type': 'bar',
        '$html': 'Custom Tags'
      }]
    }]
  }
  t.deepEqual(data, parse(html, parseDefaults))
})

test('parse() with cell should override root cell options when option set', t => {
  const html = '<div><p>Root Override</div>'
  const data = {
    '$type': 'html',
    class: 'html-root',
    '$cell': false,
    '$components': [{
      '$type': 'div',
      '$components': [{
        '$type': 'p',
        '$html': 'Root Override'
      }]
    }]
  }
  parseDefaults.root = {
    class: 'html-root',
    type: 'html',
    active: false
  }
  t.deepEqual(data, parse(html, parseDefaults))
})
