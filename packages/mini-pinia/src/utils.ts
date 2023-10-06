import { isRef } from 'vue'

export const isFunction = (input: unknown) => typeof input === 'function'
export const isComputed = (input: unknown) =>
  isRef(input) && (input as any).effect
