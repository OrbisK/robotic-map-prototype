<template>
  <main>
    <robo-widget
      :instructions="instructions"
      :grid-width="inputWidth / GRID_CELL_SIZE"
      :grid-height="inputHeight / GRID_CELL_SIZE"
    ></robo-widget>
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
import testData from '../test-data.json'

const inputWidthMeter = shallowRef(10)
const inputHeightMeter = shallowRef(10)

const inputWidth = computed(() => meterToUnit(inputWidthMeter.value))
const inputHeight = computed(() => meterToUnit(inputHeightMeter.value))

const dataMap = ref(new Map())

const loadingData = shallowRef(false)

const fetchData = async () => {
  loadingData.value = true
  let data = undefined
  try {
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

const sliceIndex = shallowRef(0)

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
</script>