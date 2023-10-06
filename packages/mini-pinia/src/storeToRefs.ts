import { toRaw, isRef, isReactive, toRef } from 'vue'

export function storeToRefs(store: any) {
  const rawStore = toRaw(store) // toRaw 返回代理对象的原始对象
  let obj: Record<string, any> = {}
  for (const key in rawStore) {
    const value = rawStore[key]
    if (isRef(value) || isReactive(value)) {
      obj[key] = toRef(rawStore, key)
    }
  }
  return obj
}
