import { removeTrailingSlash } from '../location'

export function normalizeBase(base: string) {
  if (!base) {
    if (typeof window !== 'undefined') {
      const baseEl = document.querySelector('base')
      base = baseEl?.getAttribute('href') || '/'
      base = base.replace(/^\w+:\/\/[^\/]+/, '') // 稍微调整了
    }
  }
  return removeTrailingSlash(base)
}
