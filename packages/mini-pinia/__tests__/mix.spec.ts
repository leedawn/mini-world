import { createPinia, defineStore, setActivePinia } from '../src'
import { storeToRefs } from '../src/storeToRefs'

// 综合了部分测试用例

beforeEach(() => {
  setActivePinia(createPinia())
})

it('storeToRefs', () => {
  const { a, b, c, d } = storeToRefs(
    defineStore('a', {
      state: () => ({ a: null as null | undefined, b: false, c: 1, d: 'd' }),
    })()
  )

  expect(a.value).toBe(null)
  expect(b.value).toBe(false)
  expect(c.value).toBe(1)
  expect(d.value).toBe('d')

  a.value = undefined
  expect(a.value).toBe(undefined)

  b.value = true
  expect(b.value).toBe(true)

  c.value = 2
  expect(c.value).toBe(2)

  d.value = 'e'
  expect(d.value).toBe('e')
})

it('action', () => {
  const useStore = () => {
    return defineStore({
      id: 'main',
      state: () => ({
        a: true,
        nested: {
          foo: 'foo',
          a: { b: 'string' },
        },
      }),
      getters: {
        nonA(): boolean {
          return !this.a
        },
        otherComputed() {
          return this.nonA
        },
      },
      actions: {
        async getNonA() {
          return this.nonA
        },
        simple() {
          this.toggle()
          return 'simple'
        },

        toggle() {
          return (this.a = !this.a)
        },
      },
    })()
  }

  const store = useStore()
  expect(store.$state.a).toBe(true)
  store.toggle()
  expect(store.$state.a).toBe(false)
})

it('actions', () => {
  const useStore = () => {
    return defineStore({
      id: 'main',
      state: () => ({
        user: 'Eduardo',
      }),
      actions: {
        direct(name: string) {
          this.user = name
        },
      },
    })()
  }
  const store = useStore()

  const spy = jest.fn()
  store.$onAction(spy)
  store.direct('Cleiton')
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'direct',
      args: ['Cleiton'],
      store,
    })
  )
})
