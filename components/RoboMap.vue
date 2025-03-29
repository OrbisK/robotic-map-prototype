<template>
  <div ref="p5Container"></div>
</template>

<script setup lang="ts">
import {type P5I, p5i} from 'p5i'
import type {PropType} from "vue";
import type {GridCell} from "~/types";

const props = defineProps({
  grid: {
    type: Array as PropType<GridCell[][]>
  },
  robotPosition: {
    type: Object as PropType<{ x: number, y: number }>,
  },
})

const p5Container = useTemplateRef('p5Container');

function setup({createCanvas, stroke, frameRate, background}: P5I) {
  createCanvas(props.grid[0].length * GRID_CELL_SIZE, props.grid.length * GRID_CELL_SIZE)
  stroke(255)
  frameRate(1)
}

function draw({background, rect, fill, stroke, push, pop, circle}: P5I) {
  const renderCell = ({x, y, empty}) => {
    if (!empty) {
      return
    }
    push()
    fill(EMPTY_COLOR);
    stroke(EMPTY_COLOR)
    rect(x * GRID_CELL_SIZE, y * GRID_CELL_SIZE, GRID_CELL_SIZE, GRID_CELL_SIZE)
    pop()
  }
  const renderRobot = () => {
    push()
    fill(255)
    stroke(255)
    circle(props.robotPosition.x * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, props.robotPosition.y * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, GRID_CELL_SIZE * 3, GRID_CELL_SIZE * 3)
    pop()
  }
  background(0)

  for (let i = 0; i < props.grid.length; i++) {
    for (let j = 0; j < props.grid[i].length; j++) {
      renderCell(props.grid[i][j])
    }
  }
  renderRobot()
}

let p5inst = null

onMounted(() => {
  watch(()=>props.grid?.length, ()=>{
    if(p5inst){
      p5inst.remove()
    }
    p5inst = p5i({setup, draw}, p5Container.value)
  }, {immediate: true})
})
</script>