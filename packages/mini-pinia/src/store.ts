import {
  EffectScope,
  effectScope,
  isReactive,
  isRef,
  nextTick,
  reactive,
  toRefs,
  watch,
} from 'vue'
import { Pinia } from './createPinia'
import { activePinia, setActivePinia } from './rootStore'
import { addSubscription, triggerSubscription } from './subscription'
import { _fn } from './type'
import { isComputed, isFunction } from './utils'

interface StoreOptions {
  state?: () => object
  [key: string]: any
}

interface SubscriptionOptions {
  detached?: boolean
  flush?: 'pre' | 'sync' | 'post'
}

export enum MutationType {
  direct = 'direct',
  patchObject = 'patch object',
  patchFunction = 'patch function',
}

const getInitialState = (pinia: Pinia, id: string) => pinia.state.value[id]

function createOptionsStore(id: string, options: StoreOptions, pinia: Pinia) {
  const { actions = {} } = options

  //   const initialState = pinia.state.value[id]  // 去掉

  function setup() {
    // 旧代码
    // const initialState = pinia.state.value[id]
    // if (initialState) return initialState
    // return options && options.state ? options.state() : {}
    if (!getInitialState(pinia, id)) {
      pinia.state.value[id] = options && options.state ? options.state() : {} // 没有初始值的时候才从 state() 获取
    }
    const localState = toRefs(pinia.state.value[id])
    return Object.assign(localState, actions)
  }
  createSetupOptionsStore(id, setup, options, pinia, true)
}

function createSetupOptionsStore(
  id: string,
  setup: any,
  options: any,
  pinia: Pinia,
  isOptionsStore: boolean
) {
  let subscriptions: _fn[] = []
  let actionSubscriptions: _fn[] = []
  let isSyncListening: boolean
  let isListening: boolean
  let scope: EffectScope = effectScope()
  let store: any

  let activeListener: Symbol
  function $patch(stateMutation: (state: object) => void) {
    let subscriptionMutation = {}
    isSyncListening = isListening = false
    if (typeof stateMutation === 'function') {
      stateMutation(pinia.state.value[id]) // 把新的状态合并到 pinia.state 里面
    } else {
      Object.assign(pinia.state.value[id], stateMutation) // 直接赋值的写法，可能有问题
      subscriptionMutation = {
        payload: stateMutation,
        storeId: id,
        type: MutationType.patchObject,
      }
    }
    isSyncListening = true
    const listenerId = (activeListener = Symbol())
    nextTick().then(() => {
      if (listenerId === activeListener) {
        // 很牛逼的代码，一次事件循环中多次触发只会执行一次
        isListening = true
      }
    })
    triggerSubscription(
      subscriptions,
      subscriptionMutation,
      pinia.state.value[id]
    ) // 触发订阅
  }

  function $reset() {
    const { state } = options
    const newState = state ? state() : {}
    $patch((state: object) => {
      Object.assign(state, newState)
    })
  }

  function $dispose() {
    scope.stop()
    subscriptions = []
    actionSubscriptions = []
    pinia._s.delete(id)
  }

  function wrapAction(name: string, action: Function) {
    return function (this: any) {
      const args = Array.from(arguments)
      let afterCallbackList: any[] = []

      function after(cb: any) {
        afterCallbackList.push(cb)
      }

      triggerSubscription(actionSubscriptions, { args, name, store, after })

      const ret = action.apply(this && this.id === id ? this : store, args)

      // 把 action 里面的结果分成同步和异步两种情况
      if (ret instanceof Promise) {
        return ret.then(value => {
          triggerSubscription(afterCallbackList, value)
          return value
        })
      }
      triggerSubscription(afterCallbackList, ret)
      return ret
    }
  }

  const partialStore = {
    _p: pinia,
    $patch,
    $reset,
    $dispose,
    $onAction: addSubscription.bind(null, actionSubscriptions),
    $subscribe(cb: _fn, options: SubscriptionOptions = {}) {
      const removeSubscription = addSubscription(
        subscriptions,
        cb,
        options.detached,
        () => stopWatcher()
      )

      // 只有手动修改 state 的时候触发回调，内部修改状态用 isSyncListening 控制
      const stopWatcher = scope.run(() =>
        watch(
          () => pinia.state.value[id],
          state => {
            if (options.flush === 'sync' ? isSyncListening : isListening)
              cb({ storeId: id, type: 'direct' }, state)
          },
          { deep: true, flush: options.flush } // 函数的深层次变更也能监听到
        )
      )! // 后面跟上 ! 也可以解决 undefined 的情况

      return removeSubscription
    },
  }

  const runWithContext =
    (pinia._a && pinia._a.runWithContext) || ((fn: () => unknown) => fn()) // 使用当前应用作为注入上下文执行回调，这样 inject 方法可以正常使用

  const setupStore = runWithContext(() => setup())
  // setupStore 需要另外的逻辑，将 setupStore 中的 state 保存到 pinia.state
  if (!isOptionsStore && !getInitialState(pinia, id)) pinia.state.value[id] = {}
  for (const key in setupStore) {
    const prop = setupStore[key]
    if ((isRef(prop) && !isComputed(prop)) || isReactive(prop)) {
      // 处理 ref 对象和 proxy 对象
      if (!isOptionsStore) {
        pinia.state.value[id][key] = prop
      }
    } else if (typeof prop === 'function') {
      // 处理 action
      const actionValue = wrapAction(key, prop)
      setupStore[key] = actionValue
    }
  }

  store = reactive(Object.assign(partialStore, setupStore))
  console.log('🚀 ~ file: store.ts:105 ~ store:', store)

  Object.defineProperty(store, '$state', {
    get: () => {
      const obj = pinia.state.value[id]
      return obj || {} // 临时解决方案
    },
    set: state => {
      $patch($state => {
        Object.assign($state, state)
      })
    },
  })
  pinia._s.set(id, store)

  // 不清楚为什么后来需要变成 true
  isSyncListening = true
  isListening = true

  return store
}

export function defineStore(
  idOrOptions: string | (StoreOptions & { id: string }),
  options?: StoreOptions
) {
  let id: string

  const setupOptions = isFunction(options)
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
  } else {
    id = idOrOptions.id
    options = idOrOptions
  }

  // useStore 可以处理 pinia
  function useStore(pinia?: Pinia) {
    if (pinia) setActivePinia(pinia)
    pinia = activePinia

    if (!pinia?._s.get(id)) {
      if (setupOptions) {
        createSetupOptionsStore(id, options, options, pinia as Pinia, false)
      } else {
        createOptionsStore(id, options as StoreOptions, pinia as Pinia)
      }
    }

    const store = pinia?._s.get(id)

    return store
  }

  return useStore
}
