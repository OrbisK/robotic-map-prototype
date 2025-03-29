<template>
  <main class="flex justify-center items-center flex-col gap-3">
    <nav class="flex">
      <color-mode-button></color-mode-button>
      <UButtonGroup>
        <UButton @click="start" :disabled="loadingAny">Start</UButton>
<!--        <UButton color="error" @click="pause">Pause</UButton>-->
      </UButtonGroup>
    </nav>
    <UCard variant="subtle" class="flex">
      <robo-widget
          :instructions="instructions"
          :grid="grid"
          v-model:roboter-angle="roboterAngle"
          v-model:roboter-position="roboterPosition"
      ></robo-widget>
    </UCard>
    <UCard>
      <template #header>
        Debug Area
      </template>
      <h2>Canvas</h2>
      <UInputNumber v-model="inputWidthMeter"/>
      <UInputNumber v-model="inputHeightMeter"/>
      <USeparator/>
      <h2>Data</h2>
      <UButtonGroup>
        <UButton @click="initializeTestData">Testdata (JSON)</UButton>
        <UButton @click="initializeTestData2">Testdata2 (JSON)</UButton>
        <UButton :loading="loadingData" @click="fetchData">Testdata (API)</UButton>
      </UButtonGroup>
      <USeparator/>
      <h2>Display Instructions</h2>
      Manual Mode
      <USwitch v-model="manualMode"></USwitch>
      <UButtonGroup>
        <UButton @click="sliceIndex++">Next</UButton>
        <UButton @click="sliceIndex+=10">Next 10</UButton>
        <UButton @click="sliceIndex+=50">Next 50</UButton>
      </UButtonGroup>
      <USeparator/>
      <h2>Give Instructions</h2>
      <UButtonGroup>
        <UButton :disabled="loadingAny" color="info" :loading="loadingData" @click="fetchData">Data</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isMovingForward" @click="moveForward(50)">Forward
        </UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isMovingBackward" @click="moveBackward(50)">Backward
        </UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isTurningLeft" @click="turnLeft">Left</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isTurningRight" @click="turnRight">Right</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isMeasuring" @click="measure">Measuring</UButton>
        <UButton @click="decideNextMove">Next Move?</UButton>
      </UButtonGroup>
      <USeparator></USeparator>
      Pos: {{roboterPosition.x}} / {{roboterPosition.y}}<br>
      Angle: {{roboterAngle}}<br>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import testData from '../test-data.json'
import testData2 from '../test-data2.json'
import type {GridCell} from "~/types";
import {unitToMeter} from "~/utils/units";

const backendURL = "http://192.168.4.1"

const $api = $fetch.create({
  baseURL: backendURL,
  headers: {
    'accept': 'application/json',
  }
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


const inputWidthMeter = shallowRef(10)
const inputHeightMeter = shallowRef(10)

const inputWidth = computed(() => meterToUnit(inputWidthMeter.value))
const inputHeight = computed(() => meterToUnit(inputHeightMeter.value))

const grid = ref<GridCell[][]>(generateGrid(inputWidth.value / GRID_CELL_SIZE, inputHeight.value / GRID_CELL_SIZE))

const manualMode = ref(false)

const dataMap = ref(new Map())

const loadingData = shallowRef(false)
const isMovingForward = shallowRef(false)
const isMovingBackward = shallowRef(false)
const isTurningLeft = shallowRef(false)
const isTurningRight = shallowRef(false)
const isMeasuring = shallowRef(false)

const loadingAny = computed(() => {
  return loadingData.value || isMovingForward.value || isMovingBackward.value || isTurningLeft.value || isTurningRight.value || isMeasuring.value
})

const fetchData = async () => {
  loadingData.value = true
  let data = undefined
  try {
    const response = await $api('/data', {method: "GET", responseType: 'stream',})
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
    data = JSON.parse(result)
  } catch {
  }
  loadingData.value = false

  if (!data) return
  const mapLikeBuffer = data.ringBuffer.filter(b => b.idx !== 0).map(({idx, ...rest}) => [idx, rest])
  for (const [idx, instr] of mapLikeBuffer) {
    if (dataMap.value.has(idx)) continue
    dataMap.value.set(idx, instr)
  }
}

const initializeTestData = () => {
  const rawBuffer = testData.ringBuffer
  const mapLikeBuffer = rawBuffer.filter(b => b.idx !== 0).map(({idx, ...rest}) => [idx, rest])
  for (const [idx, instr] of mapLikeBuffer) {
    if (dataMap.value.has(idx)) continue
    dataMap.value.set(idx, instr)
  }
}

const initializeTestData2 = () => {
  const rawBuffer = testData2.ringBuffer
  const mapLikeBuffer = rawBuffer.filter(b => b.idx !== 0).map(({idx, ...rest}) => [idx, rest])
  for (const [idx, instr] of mapLikeBuffer) {
    if (dataMap.value.has(idx)) continue
    dataMap.value.set(idx, instr)
  }
}

const _sliceIndex = shallowRef(0)

const sliceIndex = computed({
  get: () => manualMode.value ? _sliceIndex.value : dataMap.value.size,
  set: (val) => _sliceIndex.value = val
})

const instructions = computed(() => {
  return Array.from(dataMap.value).slice(0, sliceIndex.value).map(([idx, instr]) => {
    switch (instr?.type) {
      case 2:
        return {
          type: 'measure',
          payload: {
            angle: (instr.dir % 360) - 90,
            distance: instr.dist
          }
        }
      case 1:
      case 0:
        return {
          type: 'move',
          payload: {
            distance: instr.type === 1 ? -instr.dist : instr.dist
          }
        }
      case 3:
      case 4:
        return {
          type: 'turn',
          payload: {
            angle: instr.type === 4 ? -instr.dir : instr.dir
          }
        }
    }
  })
})

const moveInstr = computed(()=>{
  return instructions.value.filter(i=>i.type === 'move')
})

const turnInstr = computed(()=>{
  return instructions.value.filter(i=>i.type === 'turn')
})

const moveForward = async (cm: number) => {
  isMovingForward.value = true
  await $api('/forward', {query: {cm}})
  isMovingForward.value = false
}

const moveBackward = async (cm: number) => {
  isMovingBackward.value = true
  await $api('/backward', {query: {cm}})
  isMovingBackward.value = false

}

const turnLeft = async () => {
  isTurningLeft.value = true
  await $api('/left')
  isTurningLeft.value = false
}

const turnRight = async () => {
  isTurningRight.value = true
  await $api('/right')
  isTurningRight.value = false
}

const measure = async () => {
  isMeasuring.value = true
  await $api('/scan100')
  isMeasuring.value = false
}

const generateRoboterPosition = (width, height) => {
  return {x: Math.floor(width / 2), y: Math.floor(height / 2)}
}

const roboterAngle = shallowRef(90)
const roboterPosition = ref(generateRoboterPosition(inputWidth.value / GRID_CELL_SIZE, inputHeight.value / GRID_CELL_SIZE))

const getCellTop = (x, y) => {
  if (y <= 0) return undefined
  return grid.value?.[y - 1]?.[x]
}

const getCellRight = (x, y) => {
  if (x >= grid.value[0].length - 1) return undefined
  return grid.value?.[y]?.[x + 1]
}

const getCellBottom = (x, y) => {
  if (y >= grid.value.length - 1) return undefined
  return grid.value?.[y + 1]?.[x]
}

const getCellLeft = (x, y) => {
  if (x <= 0) return undefined
  return grid.value?.[y]?.[x - 1]
}

const checkClusterTop = (x, y) => {
  return [getCellTop(x, y), getCellTop(x + 1, y), getCellTop(x - 1, y)]
}

const checkClusterRight = (x, y) => {
  return [getCellRight(x, y), getCellRight(x, y + 1), getCellRight(x, y - 1)]
}

const checkClusterBottom = (x, y) => {
  return [getCellBottom(x, y), getCellBottom(x + 1, y), getCellBottom(x - 1, y)]
}

const checkClusterLeft = (x, y) => {
  return [getCellLeft(x, y), getCellLeft(x, y + 1), getCellLeft(x, y - 1)]
}

const checkStraightWallDistance = () => {
  const {x, y} = roboterPosition.value
  const angle = roboterAngle.value
  const direction = angleToDirection(angle)

  let xClone = Math.floor(x)
  let yClone = Math.floor(y)

  let distance = -1

  // check how far the next wall reachable wall is
  // checked from the robots current position.
  // the robot can only reach the wall if the path is 3 cells wide
  switch (direction) {
    case "top":
      while (true) {
        const cluster = checkClusterTop(xClone, yClone)
        console.log(cluster)
        const wall = cluster.some((cell) => {
          return !cell?.empty
        })
        if (wall) break
        distance++
        yClone--
        if (yClone < 0) break
      }
      break
    case "right":
      while (true) {
        const wall = checkClusterRight(xClone, yClone).some((cell) => {
          return !cell?.empty
        })
        if (wall) break
        distance++
        xClone++
        if (xClone >= grid.value[0].length) break
      }
      break
    case "bottom":
      while (true) {
        const wall = checkClusterBottom(xClone, yClone).some((cell) => {
          return !cell?.empty
        })
        if (wall) break
        yClone++
        distance++
        if (yClone >= grid.value.length) break
      }
      break
    case "left":
      while (true) {
        const wall = checkClusterLeft(xClone, yClone).some((cell) => {
          return !cell?.empty
        })
        if (wall) break
        xClone--
        distance++
        if (xClone < 0) break
      }
      break
  }
  console.log(distance, direction)
  return {
    distance: unitToMeter(distance * GRID_CELL_SIZE),
    direction,
  }
}

let prevTurn

const randomTurn = ()=>{
  const turn = Math.random() > 0.5 ? 90 : -90
  if(prevTurn === turn){
    randomTurn()
    return
  }
  prevTurn = turn
  if(turn === 90){
    turnRight()
  }else{
    turnLeft()
  }
}

const decideNextMove = async () => {
  const {distance} = checkStraightWallDistance()
  if (distance >= 0.5) {
    await moveForward(Math.floor((distance - 0.6)*100))
    await measure()
    await fetchData()
    await decideNextMove()
    return
  }
  //randomTurn()
  console.log("ENDE")
}

const start = async () => {
  if (loadingAny.value) return
  await measure()
  await turnRight()
  await turnRight()
  await measure()
  await fetchData()

  //await decideNextMove()
}
</script>