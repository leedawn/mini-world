import { normalizeBase } from './common'

export function createWebHistory(base: string = '') {
  base = normalizeBase(base)

//   const createBaseUrl = () => location.protocol + '//' + location.host
  const createBaseUrl = () => 'https:' + '//' + 'example.com' // fake

  function changeLocation(to: string, state: string, replace: boolean) {
    const url = createBaseUrl() + base + to
    history[replace ? 'replaceState' : 'pushState'](to, state, url)
  }

  function push(to: string) {
    changeLocation(to, '', false)
  }

  return {
    base,
    push,
  }
}
