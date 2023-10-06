import type { LocationQueryRaw } from './query'
import { warn } from './warning'

export function stripBase(path: string, base: string) {
  // 这个写的很好
  if (!base || !path.toLowerCase().startsWith(base.toLowerCase())) return path
  return path.slice(base.length) || '/'
}

export function resolveRelativePath(to: string, from: string) {
  if (to.startsWith('/')) return to
  if (!from.startsWith('/')) {
    warn('can not resolve relative path without absolute path')
  }
  if (!to) return from

  const fromFragment = from.split('/')
  const toFragment = to.split('/')

  let fromPosition = fromFragment.length - 1
  let toPosition = 0

  for (; toPosition < toFragment.length; toPosition++) {
    const current = toFragment[toPosition]

    if (current === '.') continue
    else if (current === '..') {
      if (fromPosition > 0) fromPosition--
    } else break
  }

  return (
    fromFragment.slice(0, fromPosition).join('/') +
    '/' +
    toFragment.slice(toPosition).join('/')
  )
}

export function parseURL(
  parseFn: (query: string) => LocationQueryRaw,
  location: string,
  currentLocation: string = '/'
) {
  let queryPosition = location.indexOf('?')
  let hashPosition = location.indexOf('#')
  let queryStr = '',
    hashStr = ''
  let path: string | undefined = undefined
  let query: LocationQueryRaw = {}

  if (hashPosition >= 0 && queryPosition > hashPosition) {
    queryPosition = -1
  }
  if (queryPosition > -1) {
    path = location.slice(0, queryPosition)
    queryStr = location.slice(
      queryPosition + 1,
      hashPosition > -1 ? hashPosition : location.length
    )
    query = parseFn(queryStr)
  }
  if (hashPosition > -1) {
    path = path || location.slice(0, hashPosition)
    hashStr = location.slice(hashPosition)
  }
  path = resolveRelativePath(path != null ? path : location, currentLocation)

  return {
    fullPath: path + (queryStr && '?') + queryStr + hashStr,
    query,
    hash: hashStr,
    path,
  }
}

export function removeTrailingSlash(text: string) {
  return text.replace(/\/$/, '')
}
