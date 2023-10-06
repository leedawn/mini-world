import { decode, encodeParam } from './encoding'

type ParsedValue = string | null | number | undefined
export type LocationQueryRaw = Record<string, ParsedValue | ParsedValue[]>

export function parseQuery(query: string) {
  const res: LocationQueryRaw = {}
  if (query === '' || query === '?') return res // 1. 单个字符
  const index = query.indexOf('?')
  const parsedQuery = index > -1 ? query.slice(index + 1) : query // 2. 处理问号
  const parsedArr = parsedQuery.split('&') // 3. 拆分成数组
  for (const content of parsedArr) {
    const noPlusContent = content.replace(/\+/g, ' ') // 4. 去掉+
    const equalIndex = noPlusContent.indexOf('=')
    const key = decode(
      equalIndex > 0 ? noPlusContent.slice(0, equalIndex) : noPlusContent
    )
    const value =
      equalIndex > 0 ? decode(noPlusContent.slice(equalIndex + 1)) : null // 5. decode 获取 key 和 value
    if (key in res) {
      // 6. 处理对象中重复 key 的情况
      let resValue = res[key]
      if (!Array.isArray(resValue)) {
        resValue = res[key] = [resValue]
      }
      ;(resValue as ParsedValue[]).push(value)
    } else {
      res[key] = value
    }
  }
  return res
}

export function stringifyQuery(query: LocationQueryRaw) {
  let search = ''
  function addPrefix() {
    search += search.length ? '&' : ''
  }
  for (const key in query) {
    const encodedKey = encodeParam(key)
    const value = query[key]
    if (value === undefined) continue
    if (value === null) {
      addPrefix()
      search += encodedKey
      continue
    }
    const values = Array.isArray(value) ? value : [value]
    values.forEach(v => {
      if (v !== undefined) {
        if (v === null) {
          addPrefix()
          search += encodedKey
        } else {
          addPrefix()
          search += encodedKey + '=' + encodeParam((v + '') as string)
        }
      }
    })
  }

  return search
}
