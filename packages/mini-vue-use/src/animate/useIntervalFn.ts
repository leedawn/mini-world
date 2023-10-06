import { isRef, onUnmounted, readonly, ref, watch } from 'vue'
import { MaybeRefOrGetter, Pausable } from '../utils/type'
import { toValue } from '../utils'

interface IntervalOptions {
  immediate?: boolean
  immediateCallback?: boolean
}

export function useIntervalFn(
  cb: () => void,
  interval: MaybeRefOrGetter<number>,
  options: IntervalOptions = {}
): Pausable {
  const { immediate = true, immediateCallback = false } = options

  const isActive = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  function clean() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function pause() {
    isActive.value = false
    clean()
  }

  function resume() {
    isActive.value = true
    const intervalNum = toValue(interval)
    if (immediateCallback) cb()
    clean()
    timer = setInterval(cb, intervalNum)
  }

  if (isRef(interval) || typeof interval === 'function') {
    const stopWatch = watch(interval, () => {
      isActive.value && resume()
    })
    onUnmounted(stopWatch)
  }

  if (immediate) resume()

  onUnmounted(pause)

  return {
    isActive: readonly(isActive),
    pause,
    resume,
  }
}
