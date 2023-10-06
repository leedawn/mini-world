import { App, Ref, effectScope, ref } from 'vue'
import { setActivePinia } from './rootStore'

// pinia 是一个包含 state 的对象
export interface Pinia {
  state: Ref<any>
  _s: Map<any, any>
  install: (app: App) => void
  _a: App
}

export function createPinia(): Pinia {
  const scope = effectScope(true)
  const state = scope.run(() => ref({}))!  // 非空断言

  const pinia: Pinia = {
    install(app: App) {
      //@ts-ignore
      setActivePinia(pinia)
      pinia._a = app
    },
    state,
    _s: new Map(),
    //@ts-expect-error 不知道为什么这样就可以让 _a 是 null 而不会报错
    _a: null,
  }
  return pinia
}
