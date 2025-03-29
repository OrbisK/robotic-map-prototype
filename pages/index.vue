<template>
  <main>
    <robo-map
        v-if="grid.length"
        :grid="grid"
        :robot-position="roboterPosition"
    ></robo-map>
    <input type="number" v-model="inputWidthMeter"/>
    <input type="number" v-model="inputHeightMeter"/>
    <button @click="markCells">Mark</button>
    <button @click="initializeTestData">Testdata (JSON)</button>
    <button @click="initializeTestDataApi">Testdata (API) {{ loading ? 'lädt' : '' }}</button>
    <button @click="sliceIndex++">Next</button>
    <button @click="sliceIndex+=10">Next 10</button>
    <button @click="sliceIndex+=50">Next 50</button>
  </main>
</template>

<script setup lang="ts">
import {type P5I, p5i} from 'p5i'
import testData from '../test-data.json'
import type {GridCell} from "~/types";

const grid = ref<GridCell[][]>([[]])
const roboterPosition = ref({x: 0, y: 0})
const roboterAngle = shallowRef(90)

const inputWidthMeter = shallowRef(10)
const inputHeightMeter = shallowRef(10)

const inputWidth = computed(() => meterToUnit(inputWidthMeter.value))
const inputHeight = computed(() => meterToUnit(inputHeightMeter.value))

function markCellsInArc(robotPosition, robotAngle, direction, arcLength, arcAngle = 15) {
  const targetAngle = (robotAngle + direction) % 360; // Kombiniere RobotAngle und Direction
  for (let y = 0; y < grid.value.length; y++) {
    for (let x = 0; x < grid.value[y].length; x++) {
      const cellCenterX = (x + 0.5) * GRID_CELL_SIZE;
      const cellCenterY = (y + 0.5) * GRID_CELL_SIZE;

      const robotCenterX = (robotPosition.x + 0.5) * GRID_CELL_SIZE;
      const robotCenterY = (robotPosition.y + 0.5) * GRID_CELL_SIZE;

      const dx = cellCenterX - robotCenterX;
      const dy = cellCenterY - robotCenterY;

      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > arcLength) continue; // Zelle liegt außerhalb der Reichweite

      const angleToCell = (Math.atan2(-dy, dx) * (180 / Math.PI) + 360) % 360; // Invertiere dy für 0° oben
      const relativeAngle = (angleToCell - targetAngle + 360) % 360;

      if (relativeAngle <= arcAngle || relativeAngle >= 360 - arcAngle) {
        grid.value[y][x].empty = true;
      }
    }
  }
}

const dataMap = ref(new Map())

const loading = shallowRef(false)

const initializeTestDataApi = async () => {
  loading.value = true
  const response = await $fetch('http://192.168.4.1/data', {method: "GET", responseType: 'stream',})
  // Create a new ReadableStream from the response with TextDecoderStream to get the data as text
  const reader = response.pipeThrough(new TextDecoderStream()).getReader()

  let result = ''
  // Read the chunk of data as we get it
  while (true) {
    const {value, done} = await reader.read()

    if (done)
      break

    result += value
  }
  const data = JSON.parse(result)
  loading.value = false
  const mapLikeBuffer = data.ringBuffer.filter(b => b.idx !== -1).map(({idx, ...rest}) => [idx, rest])
  dataMap.value = new Map(mapLikeBuffer)
}

const initializeTestData = () => {
  const rawBuffer = testData.ringBuffer
  const mapLikeBuffer = rawBuffer.filter(b => b.idx !== -1).map(({idx, ...rest}) => [idx, rest])
  dataMap.value = new Map(mapLikeBuffer)
}

const sliceIndex = shallowRef(0)

const instructions = computed(() => {
  return Array.from(dataMap.value).slice(0, sliceIndex.value).map(([idx, instr]) => {
    switch (instr?.type) {
      case 2:
        return {
          idx,
          type: 'measure',
          angle: (instr.dir % 360) - 90,
          distance: instr.dist
        }
      case 1:
      case 0:
        return {
          idx,
          type: 'move',
          distance: instr.type === 1 ? -instr.dist : instr.dist
        }
      case 3:
      case 4:
        return {
          idx,
          type: 'turn',
          angle: instr.type === 3 ? -instr.dir : instr.dir
        }
    }
  })
})

// generate grid as 2d array
const generateGrid = (width, height) => {
  const gridBefore = grid.value ?? []
  // translate old grid in to new dimensions


  let newGrid = []

  for (let y = 0; y < height; y++) {
    if (!newGrid[y]) {
      newGrid[y] = []
    }
    for (let x = 0; x < width; x++) {
      const empty = false
      newGrid[y][x] = {x, y, empty}
    }
  }
  return newGrid

}

const generateRoboterPosition = (width, height) => {
  // todo: translate old position to new dimensions


  return {x: Math.floor(width / 2), y: Math.floor(height / 2)}
}


onMounted(() => {
  watch(() => [inputWidth.value, inputHeight.value], () => {
    const gridCellsHeight = inputHeight.value / GRID_CELL_SIZE
    const gridCellsWidth = inputWidth.value / GRID_CELL_SIZE
    grid.value = generateGrid(gridCellsWidth, gridCellsHeight)
    roboterPosition.value = generateRoboterPosition(gridCellsWidth, gridCellsHeight)
  }, {immediate: true})
})

const markCells = () => {
  markCellsInArc(roboterPosition.value, roboterAngle.value, 0, meterToUnit(1), 30)
}

const applyInstruction = (instruction) => {
  switch (instruction.type) {
    case 'measure':
      markCellsInArc(roboterPosition.value, roboterAngle.value, instruction.angle, meterToUnit(instruction.distance / 100), 15)
      break
    case 'move':
      const units = meterToUnit(instruction.distance / 100) / GRID_CELL_SIZE
      switch (roboterAngle.value % 360) {
        case 90:
          roboterPosition.value.y -= units
          break
        case 0:
          roboterPosition.value.x += units
          break
        case 270:
          roboterPosition.value.y += units
          break
        case 180:
          roboterPosition.value.x -= units
          break
      }
      break
    case 'turn':
      roboterAngle.value += instruction.angle
      break
  }
}

watch(() => instructions.value.length, (newL, oldL) => {
  if (newL > oldL) {
    const diff = newL - oldL
    for (let i = 0; i < diff; i++) {
      applyInstruction(instructions.value[oldL + i])
    }
  }
})
</script>