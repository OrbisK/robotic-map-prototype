<template>
  <div ref="p5Container"></div>
  <input type="range" v-model="y" min="0" max="400" />
</template>

<script setup lang="ts">
import { p5i } from 'p5i'
const p5Container = useTemplateRef('p5Container');

const y = ref(100)

function setup({ createCanvas, stroke, frameRate }) {
  createCanvas(720, 400)
  stroke(255)
  frameRate(30)
}

function draw({ background, line, height, width }) {
  background(0)
  y.value--
  if (y.value < 0)
    y.value = height

  line(0, y.value, width, y.value)
}
onMounted(()=>{
  p5i({ setup, draw }, p5Container.value)
})
</script>