import { getCurrentScope, onScopeDispose } from 'vue'
import type { _fn } from './type'

const noop = () => {}

export function addSubscription<T extends _fn>(
  subscriptions: T[],
  callback: T,
  detached?: boolean,
  cleanUp: () => void = noop
) {
  subscriptions.push(callback)
  const removeSubscription = () => {
    const index = subscriptions.indexOf(callback)
    if (index > -1) {
      subscriptions.splice(index, 1)
      cleanUp()
    }
  }
  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription)
  }
  return removeSubscription
}

export function triggerSubscription<T extends _fn>(
  subscriptions: T[],
  ...args: Parameters<T>
) {
  // 需要进行浅拷贝，不然删除操作会影响这里执行
  subscriptions.slice().forEach(cb => {
    cb(...args)
  })
}
