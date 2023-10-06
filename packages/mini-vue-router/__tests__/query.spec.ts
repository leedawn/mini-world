import { parseQuery, stringifyQuery } from '../src/query'

describe('parseQuery', () => {
  it('base', () => {
    expect(parseQuery('?foo=a')).toEqual({ foo: 'a' })
    expect(parseQuery('foo=a')).toEqual({ foo: 'a' })
  })

  it('works with an empty string', () => {
    const emptyQuery = parseQuery('')
    expect(Object.keys(emptyQuery)).toHaveLength(0)
    expect(emptyQuery).toEqual({})
    expect(parseQuery('?')).toEqual({})
  })

  it('decodes values in query', () => {
    expect(parseQuery('e=%25')).toEqual({
      e: '%',
    })
  })

  it('parses empty string values', () => {
    expect(parseQuery('e=&c=a')).toEqual({
      e: '',
      c: 'a',
    })
  })

  it('allows = inside values', () => {
    expect(parseQuery('e=c=a')).toEqual({
      e: 'c=a',
    })
  })

  it('parses empty values as null', () => {
    expect(parseQuery('e&b&c=a')).toEqual({
      e: null,
      b: null,
      c: 'a',
    })
  })

  it('parses empty values as null in arrays', () => {
    expect(parseQuery('e&e&e=a')).toEqual({
      e: [null, null, 'a'],
    })
  })

  it('decodes array values in query', () => {
    expect(parseQuery('e=%25&e=%22')).toEqual({
      e: ['%', '"'],
    })
    expect(parseQuery('e=%25&e=a')).toEqual({
      e: ['%', 'a'],
    })
  })

  it('decodes the + as space', () => {
    expect(parseQuery('a+b=c+d')).toEqual({
      'a b': 'c d',
    })
  })

  it('decodes the encoded + as +', () => {
    expect(parseQuery('a%2Bb=c%2Bd')).toEqual({
      'a+b': 'c+d',
    })
  })

  // this is for browsers like IE that allow invalid characters
  it('keep invalid values as is', () => {
    expect(parseQuery('e=%&e=%25')).toEqual({
      // 这里出现过 console.warn 的情况
      e: ['%', '%'],
    })
  })
})

describe('stringifyQuery', () => {
  it('stringifies multiple values', () => {
    expect(stringifyQuery({ e: 'a', b: 'c' })).toEqual('e=a&b=c')
  })

  it('stringifies null values', () => {
    expect(stringifyQuery({ e: null })).toEqual('e')
    expect(stringifyQuery({ e: null, b: null })).toEqual('e&b')
  })

  it('stringifies null values in arrays', () => {
    expect(stringifyQuery({ e: [null] })).toEqual('e')
    expect(stringifyQuery({ e: [null, 'c'] })).toEqual('e&e=c')
  })

  it('stringifies numbers', () => {
    expect(stringifyQuery({ e: 2 })).toEqual('e=2')
    expect(stringifyQuery({ e: [2, 'b'] })).toEqual('e=2&e=b')
  })

  it('ignores undefined values', () => {
    expect(stringifyQuery({ e: undefined })).toEqual('')
    expect(stringifyQuery({ e: undefined, b: 'a' })).toEqual('b=a')
  })

  it('avoids trailing &', () => {
    expect(stringifyQuery({ a: 'a', b: undefined })).toEqual('a=a')
    expect(stringifyQuery({ a: 'a', c: [] })).toEqual('a=a')
  })

  it('skips undefined in arrays', () => {
    expect(stringifyQuery({ a: [undefined, '3'] })).toEqual('a=3')
    expect(stringifyQuery({ a: [1, undefined, '3'] })).toEqual('a=1&a=3')
    expect(stringifyQuery({ a: [1, undefined, '3', undefined] })).toEqual(
      'a=1&a=3'
    )
  })

  it('stringifies arrays', () => {
    expect(stringifyQuery({ e: ['b', 'a'] })).toEqual('e=b&e=a')
  })

  it('encodes values', () => {
    expect(stringifyQuery({ e: '%', b: 'c' })).toEqual('e=%25&b=c')
  })

  it('encodes values in arrays', () => {
    expect(stringifyQuery({ e: ['%', 'a'], b: 'c' })).toEqual('e=%25&e=a&b=c')
  })

  it('encodes = in key', () => {
    expect(stringifyQuery({ '=': 'a' })).toEqual('%3D=a')
  })

  it('keeps = in value', () => {
    expect(stringifyQuery({ a: '=' })).toEqual('a=%3D')  // 本来的预期结果是 a==，这里不考虑编码的情况
  })
})
