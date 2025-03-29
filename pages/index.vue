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
  const rawBuffer = [
    {"idx": 1, "type": 2, "dir": 0, "dist": 101}, {"idx": 2, "type": 2, "dir": 7, "dist": 46}, {
      "idx": 3,
      "type": 2,
      "dir": 15,
      "dist": 74
    }, {"idx": 4, "type": 2, "dir": 22, "dist": 71}, {"idx": 5, "type": 2, "dir": 30, "dist": 68}, {
      "idx": 6,
      "type": 2,
      "dir": 37,
      "dist": 70
    }, {"idx": 7, "type": 2, "dir": 45, "dist": 48}, {"idx": 8, "type": 2, "dir": 52, "dist": 47}, {
      "idx": 9,
      "type": 2,
      "dir": 60,
      "dist": 47
    }, {"idx": 10, "type": 2, "dir": 67, "dist": 47}, {"idx": 11, "type": 2, "dir": 75, "dist": 48}, {
      "idx": 12,
      "type": 2,
      "dir": 82,
      "dist": 49
    }, {"idx": 13, "type": 2, "dir": 90, "dist": 98}, {"idx": 14, "type": 2, "dir": 97, "dist": 99}, {
      "idx": 15,
      "type": 2,
      "dir": 105,
      "dist": 121
    }, {"idx": 16, "type": 2, "dir": 112, "dist": 141}, {"idx": 17, "type": 2, "dir": 120, "dist": 141}, {
      "idx": 18,
      "type": 2,
      "dir": 127,
      "dist": 99
    }, {"idx": 19, "type": 2, "dir": 135, "dist": 101}, {"idx": 20, "type": 2, "dir": 142, "dist": 101}, {
      "idx": 21,
      "type": 2,
      "dir": 150,
      "dist": 72
    }, {"idx": 22, "type": 2, "dir": 157, "dist": 64}, {"idx": 23, "type": 2, "dir": 165, "dist": 53}, {
      "idx": 24,
      "type": 2,
      "dir": 172,
      "dist": 51
    }, {"idx": 25, "type": 0, "dir": 0, "dist": 97}, {"idx": 26, "type": 2, "dir": 0, "dist": 76}, {
      "idx": 27,
      "type": 2,
      "dir": 7,
      "dist": 43
    }, {"idx": 28, "type": 2, "dir": 15, "dist": 31}, {"idx": 29, "type": 2, "dir": 22, "dist": 31}, {
      "idx": 30,
      "type": 2,
      "dir": 30,
      "dist": 32
    }, {"idx": 31, "type": 2, "dir": 37, "dist": 42}, {"idx": 32, "type": 2, "dir": 45, "dist": 42}, {
      "idx": 33,
      "type": 2,
      "dir": 52,
      "dist": 42
    }, {"idx": 34, "type": 2, "dir": 60, "dist": 43}, {"idx": 35, "type": 2, "dir": 67, "dist": 45}, {
      "idx": 36,
      "type": 2,
      "dir": 75,
      "dist": 99
    }, {"idx": 37, "type": 2, "dir": 82, "dist": 106}, {"idx": 38, "type": 2, "dir": 90, "dist": 125}, {
      "idx": 39,
      "type": 2,
      "dir": 97,
      "dist": 123
    }, {"idx": 40, "type": 2, "dir": 105, "dist": 123}, {"idx": 41, "type": 2, "dir": 112, "dist": 122}, {
      "idx": 42,
      "type": 2,
      "dir": 120,
      "dist": 119
    }, {"idx": 43, "type": 2, "dir": 127, "dist": 76}, {"idx": 44, "type": 2, "dir": 135, "dist": 73}, {
      "idx": 45,
      "type": 2,
      "dir": 142,
      "dist": 72
    }, {"idx": 46, "type": 2, "dir": 150, "dist": 69}, {"idx": 47, "type": 2, "dir": 157, "dist": 64}, {
      "idx": 48,
      "type": 2,
      "dir": 165,
      "dist": 61
    }, {"idx": 49, "type": 2, "dir": 172, "dist": 61}, {"idx": 50, "type": 0, "dir": 0, "dist": 97}, {
      "idx": 51,
      "type": 2,
      "dir": 0,
      "dist": 190
    }, {"idx": 52, "type": 2, "dir": 7, "dist": 127}, {"idx": 53, "type": 2, "dir": 15, "dist": 26}, {
      "idx": 54,
      "type": 2,
      "dir": 22,
      "dist": 28
    }, {"idx": 55, "type": 2, "dir": 30, "dist": 73}, {"idx": 56, "type": 2, "dir": 37, "dist": 67}, {
      "idx": 57,
      "type": 2,
      "dir": 45,
      "dist": 129
    }, {"idx": 58, "type": 2, "dir": 52, "dist": 127}, {"idx": 59, "type": 2, "dir": 60, "dist": 127}, {
      "idx": 60,
      "type": 2,
      "dir": 67,
      "dist": 127
    }, {"idx": 61, "type": 2, "dir": 75, "dist": 127}, {"idx": 62, "type": 2, "dir": 82, "dist": 127}, {
      "idx": 63,
      "type": 2,
      "dir": 90,
      "dist": 131
    }, {"idx": 64, "type": 2, "dir": 97, "dist": 138}, {"idx": 65, "type": 2, "dir": 105, "dist": 141}, {
      "idx": 66,
      "type": 2,
      "dir": 112,
      "dist": 145
    }, {"idx": 67, "type": 2, "dir": 120, "dist": 196}, {"idx": 68, "type": 2, "dir": 127, "dist": 187}, {
      "idx": 69,
      "type": 2,
      "dir": 135,
      "dist": 54
    }, {"idx": 70, "type": 2, "dir": 142, "dist": 52}, {"idx": 71, "type": 2, "dir": 150, "dist": 53}, {
      "idx": 72,
      "type": 2,
      "dir": 157,
      "dist": 53
    }, {"idx": 73, "type": 2, "dir": 165, "dist": 54}, {"idx": 74, "type": 2, "dir": 172, "dist": 59}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {"idx": 0, "type": 0, "dir": 0, "dist": 0}, {
      "idx": 0,
      "type": 0,
      "dir": 0,
      "dist": 0
    }, {"idx": 0, "type": 0, "dir": 0, "dist": 0}
  ]

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