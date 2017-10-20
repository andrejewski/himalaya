import test from 'ava'
import {formatAttributes} from '../../lib/formats/v1'

test('formatAttributes() should return a key-value array', t => {
  const attributes = [
    'foo="bar"',
    'disabled',
    'cake=\'man\''
  ]
  t.deepEqual(formatAttributes(attributes), [
    {key: 'foo', value: 'bar'},
    {key: 'disabled', value: null},
    {key: 'cake', value: 'man'}
  ])
})
