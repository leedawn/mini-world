import { Ref } from 'vue'

type Getter<T> = () => T
type MaybeRef<T> = Ref<T> | T

export type MaybeRefOrGetter<T> = Getter<T> | MaybeRef<T>

export interface Pausable {
  isActive: Readonly<Ref<boolean>>
  pause: () => void
  resume: () => void
}
