<template>
  <div>
    <button @click="getroomdetail">处理数据</button>
    <button @click="getpn">pn</button>
    <button @click="geturl">url</button>
    <button @click="showContent('Live')">checkout</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['update-content'])

const result = ref(null)
const qn = ref(null)
const url = ref(null)

function showContent(componentName) {
  console.log('showContent:', componentName)
  emit('update-content', componentName)
}

async function getroomdetail() {
  try {
    const dataToProcess = '2448877'
    window.electronAPI.huya_getRoomDetail(dataToProcess)
    console.log('Data sent to main process for huya_getRoomDetail')

    result.value = await receiveRoomDetail()
  } catch (error) {
    console.error('Error processing data:', error)
  }
}

async function getpn() {
  try {
    const clonableResult = JSON.parse(JSON.stringify(result.value))
    window.electronAPI.huya_getPlayQuality(clonableResult)
    console.log('Data sent to main process for huya_getPlayQuality')

    qn.value = await receivePlayQuality()
    // qn.value.forEach((quality, index) => {
    //   console.log(`Quality ${index}:`, quality.Quality)
    //   console.log(`Data ${index}:`, quality.Data)
    // })
  } catch (error) {
    console.error('Error getting play quality:', error)
  }
}

async function geturl() {
  try {
    const clonableResult = JSON.parse(JSON.stringify(result.value))
    const clonebleFn = JSON.parse(JSON.stringify(qn.value))
    console.log('get roomdetail:', clonableResult)
    console.log('get qn:', clonebleFn)
    for (const quality of clonebleFn) {   // 应该传入特定的清晰度，获得对应的url
      // console.log(`Quality ${index}:`, quality.Quality)
      // console.log(`Data ${index}:`, quality.Data)
      window.electronAPI.huya_getPlayUrl(clonableResult, quality)
      console.log('Data sent to main process for huya_getPlayUrl')
      url.value = await receivePlayUrl()
    }
    console.log('final url:', url.value)

  } catch (error) {
    console.error('Error getting URL:', error)
  }
}

function receiveRoomDetail() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receiveRoomDetail((result) => {
      console.log('room detail:', result)
      resolve(result)
    })
  }).catch(error => {
    console.error('Error receiving room detail:', error)
  })
}

function receivePlayQuality() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receivePlayQuality((response) => {
      console.log('play quality:', response)
      resolve(response)
    })
  }).catch(error => {
    console.error('Error receiving play quality:', error)
  })
}

function receivePlayUrl() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receivePlayUrl((response) => {
      console.log('play url:', response)
      resolve(response)
    })
  }).catch(error => {
    console.error('Error receiving play url:', error)
  })
}
</script>

<style scoped>
/* 添加你的样式 */
</style>
