// 很难理解的东西
import { ComputedRef, Ref, computed, ref, watch } from 'vue'
import { MaybeRefOrGetter } from '../utils/type'
import { toValue } from '../utils'

type CubicBezierPoints = [number, number, number, number]

interface TransitionOptions {
  duration: number
  transition: CubicBezierPoints
}

type EasingFunction = (n: number) => number

function createEasingFunction([
  p0,
  p1,
  p2,
  p3,
]: CubicBezierPoints): EasingFunction {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1
  const c = (a1: number) => 3 * a1

  const calcBezier = (t: number, a1: number, a2: number) =>
    ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t

  const getSlope = (t: number, a1: number, a2: number) =>
    3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1)

  const getTforX = (x: number) => {
    let aGuessT = x

    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, p0, p2)
      if (currentSlope === 0) return aGuessT
      const currentX = calcBezier(aGuessT, p0, p2) - x
      aGuessT -= currentX / currentSlope
    }

    return aGuessT
  }

  return (x: number) =>
    p0 === p1 && p2 === p3 ? x : calcBezier(getTforX(x), p1, p3)
}

function executeTransition<T extends number>(
  source: Ref<T>,
  from: T,
  to: T,
  options: TransitionOptions
) {
  const { duration, transition } = options

  const start = Date.now()
  const end = Date.now() + duration
  const ease = createEasingFunction(transition)

  return new Promise<void>(resolve => {
    source.value = from

    const tick = () => {
      const now = Date.now()
      const alpha = ease((now - start) / duration)

      source.value = (from + alpha * (to - from)) as T

      if (now < end) {
        // @ts-ignore
        requestAnimationFrame(tick)
      } else {
        source.value = to
        resolve()
      }
    }

    tick()
  })
}

export function useTransition(
  source: MaybeRefOrGetter<number>,
  options: TransitionOptions
): ComputedRef<number> {
  const sourceVal = (): number => toValue(source)
  let currentId = 0

  const outputRef: Ref<number> = ref(sourceVal())

  watch(sourceVal, async to => {
    const id = ++currentId
    const toVal = toValue(to)
    await executeTransition(outputRef, outputRef.value, toVal, {
      ...options,
      //   abort: () => id !== currentId,
    })
  })

  return computed(() => outputRef.value)
}
