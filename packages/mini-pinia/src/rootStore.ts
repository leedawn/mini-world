import { Pinia } from './createPinia'

export let activePinia: Pinia | undefined

export const setActivePinia = (pinia?: Pinia) => (activePinia = pinia)
