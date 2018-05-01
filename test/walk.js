import test from 'ava'
import {walk} from '../lib'

test('walk() walks through one node', t => {
  let count = 0
  walk([
    { type: 'text', content: 'foo' }
  ], () => {
    count += 1
  })
  t.deepEqual(count, 1)
})

test('walk() walks through multiple nodes', t => {
  let count = 0
  walk([
    {
      type: 'element',
      tagName: 'div',
      attributes: [],
      children: [
        { type: 'text', content: 'foo' }
      ]
    }
  ], () => {
    count += 1
  })
  t.deepEqual(count, 2)
})

test('walk() walks in correct order', t => {
  const nodes = []
  walk([
    {
      type: 'element',
      tagName: 'div',
      attributes: [],
      children: [
        { type: 'text', content: 'foo' }
      ]
    },
    { type: 'comment', content: 'bar' }
  ], node => {
    nodes.push(node)
  })
  t.deepEqual(nodes[0].type, 'element')
  t.deepEqual(nodes[1].type, 'text')
  t.deepEqual(nodes[2].type, 'comment')
})

test('walk() walks when node is passed', t => {
  const nodes = []
  walk({
    type: 'element',
    tagName: 'div',
    attributes: [],
    children: [
      { type: 'text', content: 'foo' },
      { type: 'comment', content: 'bar' }
    ]
  }, node => {
    nodes.push(node)
  })
  t.deepEqual(nodes[0].type, 'element')
  t.deepEqual(nodes[1].type, 'text')
  t.deepEqual(nodes[2].type, 'comment')
})
