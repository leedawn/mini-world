import { unref } from 'vue'
import { MaybeRefOrGetter } from './type'

/**
 * 两数之间的任意值，包括最大值和最小值
 * @param min
 * @param max
 * @returns
 */
export const random = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const toValue = (input: MaybeRefOrGetter<number>): number => {
  return typeof input === 'function' ? input() : unref(input)
}
