<template>
  <main class="flex justify-center items-center flex-col gap-3">
    <nav class="flex">
      <color-mode-button></color-mode-button>
      <UButtonGroup>
        <UButton @click="start" :disabled="loadingAny">Start</UButton>
        <UButton color="error" @click="pause">Pause</UButton>
      </UButtonGroup>
    </nav>
    <UCard variant="subtle" class="flex">
      <robo-widget
          :instructions="instructions"
          :grid-width="inputWidth / GRID_CELL_SIZE"
          :grid-height="inputHeight / GRID_CELL_SIZE"
      ></robo-widget>
    </UCard>
    <UCard>
      <template #header>
        Debug Area
      </template>
      <h2>Canvas</h2>
      <UInputNumber v-model="inputWidthMeter"/>
      <UInputNumber v-model="inputHeightMeter"/>
      <USeparator />
      <h2>Data</h2>
      <UButtonGroup>
        <UButton @click="initializeTestData">Testdata (JSON)</UButton>
        <UButton :loading="loadingData" @click="fetchData">Testdata (API)</UButton>
      </UButtonGroup>
      <USeparator />
      <h2>Display Instructions</h2>
      Manual Mode<USwitch v-model="manualMode"></USwitch>
      <UButtonGroup>
        <UButton @click="sliceIndex++">Next</UButton>
        <UButton @click="sliceIndex+=10">Next 10</UButton>
        <UButton @click="sliceIndex+=50">Next 50</UButton>
      </UButtonGroup>
      <USeparator />
      <h2>Give Instructions</h2>
      <UButtonGroup>
        <UButton :disabled="loadingAny" color="info" :loading="loadingData" @click="fetchData">Data</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isMovingForward" @click="moveForward(50)">Forward</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isMovingBackward" @click="moveBackward(50)">Backward</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isTurningLeft" @click="turnLeft">Left</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isTurningRight" @click="turnRight">Right</UButton>
        <UButton :disabled="loadingAny" color="info" :loading="isMeasuring" @click="measure">Measuring</UButton>
      </UButtonGroup>
    </UCard>
  </main>
</template>

<script setup lang="ts">
import testData from '../test-data.json'

const backendURL = "http://192.168.4.1"

const $api = $fetch.create({
  baseURL: backendURL,
  headers: {
    'accept': 'application/json',
  }
})

const manualMode = ref(false)

const inputWidthMeter = shallowRef(10)
const inputHeightMeter = shallowRef(10)

const inputWidth = computed(() => meterToUnit(inputWidthMeter.value))
const inputHeight = computed(() => meterToUnit(inputHeightMeter.value))

const dataMap = ref(new Map())

const loadingData = shallowRef(false)
const isMovingForward = shallowRef(false)
const isMovingBackward = shallowRef(false)
const isTurningLeft = shallowRef(false)
const isTurningRight = shallowRef(false)
const isMeasuring = shallowRef(false)

const loadingAny = computed(()=>{
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
  }catch{}
  loadingData.value = false

  if(!data) return
  const mapLikeBuffer = data.ringBuffer.filter(b => b.idx !== -1).map(({idx, ...rest}) => [idx, rest])
  for(const [idx, instr] of mapLikeBuffer){
    if(dataMap.value.has(idx)) continue
    dataMap.value.set(idx, instr)
  }
}

const initializeTestData = () => {
  const rawBuffer = testData.ringBuffer
  const mapLikeBuffer = rawBuffer.filter(b => b.idx !== -1).map(({idx, ...rest}) => [idx, rest])
  for(const [idx, instr] of mapLikeBuffer){
    if(dataMap.value.has(idx)) continue
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
            angle: instr.type === 3 ? -instr.dir : instr.dir
          }
        }
    }
  })
})

const moveForward = async (distance: number)=>{
  isMovingForward.value = true
  await $api('/forward', {query: {cm: distance}})
  isMovingForward.value = false
}

const moveBackward =async  (distance: number)=>{
  isMovingBackward.value = true
  await $api('/backward', {query: {cm: distance}})
  isMovingBackward.value = false

}

const turnLeft = async ()=>{
  isTurningLeft.value = true
  await $api('/left')
  isTurningLeft.value = false
}

const turnRight = async ()=>{
  isTurningRight.value = true
  await $api('/right')
  isTurningRight.value = false
}

const measure = async ()=>{
  isMeasuring.value = true
  await $api('/scan100')
  isMeasuring.value = false
}

const start = async ()=>{
  if(loadingAny.value) return
  await measure()
  await turnRight()
  await turnRight()
  await measure()
  await fetchData()
}
</script>