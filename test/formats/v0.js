import test from 'ava'
import {castValue, formatStyles} from '../../lib/formats/v0'

test('castValue() should return a number if the text is only a number', t => {
  t.is(castValue('12'), 12)
  t.is(castValue(''), '')
  t.is(castValue('this has a 12'), 'this has a 12')
  t.is(castValue('1abc'), '1abc')
})

test('formatStyles() should return an hashmap of style declarations', t => {
  var style = 'color: #000; height: 80px'
  var data = {
    color: '#000',
    height: '80px'
  }
  t.deepEqual(data, formatStyles(style))
})

test('formatStyles() should camelCase CSS properties', t => {
  const style = [
    'background-color: #fff',
    'border-right: 1px solid #000',
    'border-top-left-radius: 4px'
  ].join(';')
  const data = {
    backgroundColor: '#fff',
    borderRight: '1px solid #000',
    borderTopLeftRadius: '4px'
  }
  t.deepEqual(data, formatStyles(style))
})
