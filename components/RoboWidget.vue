<template>
  <robo-map
      :grid="grid"
      :robot-position="roboterPosition"
  ></robo-map>
</template>

<script setup lang="ts">
import type {GridCell, Instruction} from "~/types";
import {angleToDirection} from "~/utils/units";

const props = defineProps({
  instructions: {
    type: Object as PropType<Instruction[]>,
  },
  grid: {
    type: Array as PropType<GridCell[][]>,
  }
})

const emit = defineEmits<{
  changeAngle: [number]
}>()

const roboterAngle = shallowRef(90)

watch(() => roboterAngle.value, (newAngle) => {
  emit('changeAngle', newAngle)
})

const roboterPosition = defineModel('roboterPosition', {
  type: Object as PropType<{x: number, y: number}>,
  default: {x: 0, y: 0},
})

function markCellsInArc(robotPosition, robotAngle, direction, arcLength, arcAngle = 15) {
  const targetAngle = (robotAngle + direction) % 360; // Kombiniere RobotAngle und Direction
  for (let y = 0; y < props.grid.length; y++) {
    for (let x = 0; x < props.grid[y].length; x++) {
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
        props.grid[y][x].empty = true;
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
      switch (angleToDirection(roboterAngle.value % 360)) {
        case "top":
          roboterPosition.value.y -= units
          break
        case "right":
          roboterPosition.value.x += units
          break
        case "bottom":
          roboterPosition.value.y += units
          break
        case "left":
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