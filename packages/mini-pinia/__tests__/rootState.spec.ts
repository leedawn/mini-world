import { defineStore } from '../src/store'
import { createPinia } from '../src/createPinia'

describe('Root State', () => {
  const useA = defineStore('a', {
    state: () => ({ a: 'a' }),
  })

  const useB = defineStore('b', {
    state: () => ({ b: 'b' }),
  })

  it('works with no stores', () => {
    expect(createPinia().state.value).toEqual({})
  })

  it('retrieves the root state of one store', () => {
    const pinia = createPinia()
    useA(pinia)
    expect(pinia.state.value).toEqual({
      a: { a: 'a' },
    })
  })

  it('does not mix up different applications', () => {
    const pinia1 = createPinia()
    const pinia2 = createPinia()
    useA(pinia1)
    useB(pinia2)
    expect(pinia1.state.value).toEqual({
      a: { a: 'a' },
    })
    expect(pinia2.state.value).toEqual({
      b: { b: 'b' },
    })
  })

  it('can hold multiple stores', () => {
    const pinia1 = createPinia()
    useA(pinia1)
    useB(pinia1)
    expect(pinia1.state.value).toEqual({
      a: { a: 'a' },
      b: { b: 'b' },
    })
  })
})
