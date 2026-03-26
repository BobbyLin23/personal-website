<script setup lang="ts">
import type { MotionProps } from 'motion-v'
import { Motion, useReducedMotion } from 'motion-v'

const props = defineProps<{
  initial?: MotionProps['initial']
  animate?: MotionProps['animate']
  transition?: MotionProps['transition']
}>()

defineOptions({ inheritAttrs: false })

const reducedMotion = useReducedMotion()

const initialResolved = computed(() => {
  if (!reducedMotion.value)
    return props.initial
  return props.animate !== undefined ? props.animate : props.initial
})

const transitionResolved = computed(() =>
  reducedMotion.value ? { duration: 0 } : props.transition,
)
</script>

<template>
  <Motion
    v-bind="$attrs"
    :initial="initialResolved"
    :animate="props.animate"
    :transition="transitionResolved"
  >
    <slot />
  </Motion>
</template>
