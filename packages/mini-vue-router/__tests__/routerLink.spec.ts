import { RouterLink } from '../src/routerLink'
import { mount } from '@vue/test-utils'

interface RouteLocationNormalizedLoaded {
  path: string
  name: string | undefined
  params: Record<string, string>
  query: Record<string, string>
  hash: string
  fullPath: string
  matched: string[]
  meta: Record<string, string>
  redirectedFrom: Record<string, string> | undefined
}

const START_LOCATION_NORMALIZED: RouteLocationNormalizedLoaded = {
  path: '/',
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
}
const locations = {
  basic: {
    string: '/home',
    normalized: {
      href: '/home',
      fullPath: '/home',
      path: '/home',
      params: {},
      meta: {},
      query: {},
      hash: '',
      matched: [{}],
      redirectedFrom: undefined,
      name: 'home',
    },
  },
}

function factory(
  currentLocation: RouteLocationNormalizedLoaded,
  propsData: any,
  resolvedLocation: unknown
) {
  const wrapper = mount(RouterLink, { propsData })
  return {
    wrapper,
  }
}

describe('RouterLink', () => {
  it('display a link with a string prop', async () => {
    const { wrapper } = await factory(
      START_LOCATION_NORMALIZED,
      { to: locations.basic.string },
      locations.basic.normalized
    )
    expect(wrapper.find('a').attributes('href')).toBe('/home')
  })
})
