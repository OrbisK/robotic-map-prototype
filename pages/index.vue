<template>
  <main>
    <div ref="p5Container"></div>
    <input type="number" v-model="inputWidthMeter"/>
    <input type="number" v-model="inputHeightMeter"/>
    <button @click="markCells">Mark</button>
    <button @click="initializeTestData">Testdata</button>
    <button @click="sliceIndex++">Next</button>
    <button @click="sliceIndex+=10">Next 10</button>
    <button @click="sliceIndex+=50">Next 50</button>
  </main>
</template>

<script setup lang="ts">
import {type P5I, p5i} from 'p5i'
import testData from '../test-data.json'

const p5Container = useTemplateRef('p5Container');

const grid = ref([])
const roboterPosition = ref({x: 0, y: 0})
const roboterAngle = shallowRef(90)

const inputWidthMeter = shallowRef(10)
const inputHeightMeter = shallowRef(10)

const inputWidth = computed(() => meterToUnit(inputWidthMeter.value))
const inputHeight = computed(() => meterToUnit(inputHeightMeter.value))

const UNIT_TO_METER_FACTOR = 0.02
const EMPTY_COLOR = 125

const unitToMeter = (units) => {
  return units * UNIT_TO_METER_FACTOR
}

const meterToUnit = (meters) => {
  return meters / UNIT_TO_METER_FACTOR
}

const GRID_CELL_SIZE = meterToUnit(0.1)

function setup({createCanvas, stroke, frameRate, background}: P5I) {
  createCanvas(inputWidth.value, inputHeight.value)
  stroke(255)
  frameRate(1)
}

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

const isUpToDate = shallowRef(false)

const latestAppliedDataIdx = -1

const dataMap = ref(new Map())

// idx:
// type: 2 ist messung | 1 vorwärts | 0 rückwärts | 3 links | 4 rechts

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

function draw({background, rect, fill, stroke, push, pop, circle}: P5I) {
  if (isUpToDate.value) {
    return
  }
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
    circle(roboterPosition.value.x * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, roboterPosition.value.y * GRID_CELL_SIZE + GRID_CELL_SIZE * 0.5, GRID_CELL_SIZE * 3, GRID_CELL_SIZE * 3)
    pop()
  }
  background(0)

  for (let i = 0; i < grid.value.length; i++) {
    for (let j = 0; j < grid.value[i].length; j++) {
      renderCell(grid.value[i][j])
    }
  }
  renderRobot()
}

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
    p5Container.value.innerHTML = ''
    grid.value = generateGrid(gridCellsWidth, gridCellsHeight)
    roboterPosition.value = generateRoboterPosition(gridCellsWidth, gridCellsHeight)
    p5i({setup, draw}, p5Container.value)
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