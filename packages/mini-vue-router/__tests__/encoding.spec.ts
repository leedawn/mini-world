import { encodeParam } from '../src/encoding'

describe('Encoding', () => {
  const unreservedSet =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._~'

  describe('params', () => {
    it('does not encode safe chars', () => {
      expect(encodeParam(unreservedSet)).toBe(unreservedSet)
    })

    it('encodes non-ascii', () => {
      expect(encodeParam('é')).toBe('%C3%A9')
    })
  })
})
