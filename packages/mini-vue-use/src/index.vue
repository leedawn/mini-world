<script setup lang="ts">
import {
  computed,
  effectScope,
  getCurrentScope,
  onScopeDispose,
  ref,
  watch,
  watchEffect,
} from 'vue'
import useIntervalFn from './views/useIntervalFn.vue'
import useTransition from './views/useTransition.vue'

// effect, computed, watch, watchEffect created inside the scope will be collected

const scope = effectScope()
const counter = ref(1)

scope.run(() => {
  const doubled = computed(() => counter.value * 2)

  watch(doubled, () => console.log(doubled.value))

  watchEffect(() => console.log('Count: ', doubled.value))
  onScopeDispose(() => {
    console.log('dispose')
  })
})

// to dispose all effects in the scope
scope.stop()

function change() {
  counter.value += 4
  console.log(getCurrentScope())
}
</script>

<template>
  <useIntervalFn />
  <useTransition />
  <button @click="change">button{{ counter }}</button>
</template>
