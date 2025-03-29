<template>
  <robo-map
      :grid="grid"
      :robot-position="roboterPosition"
  ></robo-map>
</template>

<script setup lang="ts">
import type {GridCell, Instruction} from "~/types";

const props = defineProps({
  instructions: {
    type: Object as PropType<Instruction[]>,
  },
  gridWidth: {
    type: Number,
    default: 10,
  },
  gridHeight: {
    type: Number,
    default: 10,
  },
})

const generateGrid = (width, height) => {
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

const grid = ref<GridCell[][]>(generateGrid(props.gridWidth, props.gridHeight))

const generateRoboterPosition = (width, height) => {
  return {x: Math.floor(width / 2), y: Math.floor(height / 2)}
}

const roboterPosition = ref(generateRoboterPosition(grid.value[0].length, grid.value.length))
const roboterAngle = shallowRef(90)

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

const applyInstruction = (instruction: Instruction) => {
  switch (instruction.type) {
    case 'measure':
      markCellsInArc(roboterPosition.value, roboterAngle.value, instruction.payload.angle, meterToUnit(instruction.payload.distance / 100), 15)
      break
    case 'move':
      const units = meterToUnit(instruction.payload.distance / 100) / GRID_CELL_SIZE
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
      roboterAngle.value += instruction.payload.angle
      break
  }
}


watch(() => props.instructions.length, (newL, oldL) => {
  if (newL > oldL) {
    const diff = newL - oldL
    for (let i = 0; i < diff; i++) {
      applyInstruction(props.instructions[oldL + i])
    }
  }
})

</script>