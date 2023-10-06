<script setup lang="ts">
import { useIntervalFn } from '../animate/useIntervalFn'
import { random } from '../utils'
import { Ref, ref } from 'vue'

const greetings = [
  'Hello',
  'Hi',
  'Yo!',
  'Hey',
  'Hola',
  'こんにちは',
  'Bonjour',
  'Salut!',
  '你好',
  'Привет',
]
const word = ref('Hello')
const interval = ref(500)

const { pause, resume, isActive } = useIntervalFn(() => {
  word.value = greetings[random(0, greetings.length - 1)]
}, interval)

const time: Ref<number> = ref(0)
const update = () => (time.value = Date.now())
useIntervalFn(update, 1000)
</script>

<template>
  <p style="height: 50px">{{ word }}</p>
  <p>
    interval:
    <input v-model="interval" type="number" placeholder="interval" />
  </p>
  <button v-if="isActive" class="orange" @click="pause">Pause</button>
  <button v-if="!isActive" @click="resume">Resume</button>
  <div>{{ time }}</div>
</template>
../animate