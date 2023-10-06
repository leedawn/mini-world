<script setup lang="ts">
import { ref } from 'vue'
import { useTransition } from '../animate/useTransition'

const baseNumber = ref(0)
const duration = 1500

function toggle() {
  baseNumber.value = baseNumber.value === 100 ? 0 : 100
}

const cubicBezierNumber = useTransition(baseNumber, {
  duration,
  transition: [0.75, 0, 0.25, 1],
})
</script>

<template>
  <div>
    <button @click="toggle">Transition</button>
    <p>{{ cubicBezierNumber.toFixed(2) }}</p>
    <div class="track number">
      <div class="sled" :style="{ left: `${cubicBezierNumber}%` }"></div>
    </div>
  </div>
</template>

<style scoped>
.track {
  background: rgba(125, 125, 125, 0.3);
  border-radius: 0.5rem;
  max-width: 20rem;
  width: 100%;
  position: relative;
}

.sled {
  background: green;
  border-radius: 50%;
  height: 1rem;
  position: absolute;
  width: 1rem;
}

.number.track {
  height: 1rem;
  margin: 0.5rem 0;
  padding: 0 0.5rem;
}

.number.track .sled {
  transform: translateX(-50%);
}
</style>
