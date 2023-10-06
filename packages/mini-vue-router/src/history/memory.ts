import { normalizeBase } from './common'

type CallbackFn = (to: string, from: string, info: ListenerOptions) => void

interface RouterHistory {
  location: string
  base?: string
  push(to: string): void
  replace(to: string): void
  listen(callback: CallbackFn): () => void
  go(delta: number, shouldTrigger?: boolean): void
  destroy(): void
}
interface ListenerOptions {
  direction: 'forward' | 'back'
  delta: number
  type: 'pop'
}

export function createMemoryHistory(base?: string) {
  const START = ''
  let queue = [START]
  let queuePosition = 0
  let listeners: CallbackFn[] = []

  base = base && normalizeBase(base)

  function changePosition(to: string) {
    queuePosition++
    if (queuePosition !== queue.length) queue.splice(queuePosition) // 发生到退后，再往里面添加内容前，需要删除该坐标及其后面的记录
    queue.push(to)
  }

  function triggerListener(
    to: string,
    from: string,
    { direction, delta }: Omit<ListenerOptions, 'type'>
  ) {
    const info = { direction, delta, type: 'pop' } as ListenerOptions
    for (const cb of listeners) {
      cb(to, from, info)
    }
  }

  const routerHistory: RouterHistory = {
    location: START,
    base,
    push(to) {
      changePosition(to)
    },
    replace(to) {
      queue.splice(queuePosition--, 1)
      changePosition(to)
    },
    listen(callback) {
      listeners.push(callback)
      return () => {
        const index = listeners.indexOf(callback)
        index > -1 && listeners.splice(index, 1)
      }
    },
    destroy() {
      queue = [START]
      queuePosition = 0
      listeners = []
    },
    go(delta, shouldTrigger = true) {
      const from = this.location // 代码更精炼
      queuePosition = Math.max(
        0,
        Math.min(queuePosition + delta, queue.length - 1)
      )  // 限制最大值和最小值
      if (shouldTrigger) {
        triggerListener(this.location, from, {
          direction: delta > 0 ? 'forward' : 'back',
          delta,
        })
      }
    },
  }

  Object.defineProperty(routerHistory, 'location', {
    get() {
      return queue[queuePosition]
    },
  })

  return routerHistory
}
