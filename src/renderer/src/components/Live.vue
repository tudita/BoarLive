<template>
  <div class="view-container">
    <video-player v-if="showPlayer" :url="videoUrl" @close="showPlayer = false" />
    <button v-if="!showPlayer" @click="startLiveStream">开始直播</button>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import VideoPlayer from './videoPlayer.vue'

const sharedVariable = inject('sharedVariable')   //全局roomid
const sharedPlatform = inject('sharedPlatform') 

const showPlayer = ref(false)
const videoUrl = ref(
  'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4'
)
const result = ref(null)
const qn = ref(null)
const url = ref(null)

async function startLiveStream() {
  console.log('Starting live stream...') // 确认点击事件
  await getroomdetail()
  await getpn()
  await geturl() // 依次获取房间详情、清晰度、URL
  // url应该传入videoUrl 待实现

  showPlayer.value = true
}

async function getroomdetail() {
  try {
    const dataToProcess = sharedVariable.value
    console.log('roomid:', dataToProcess)
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
    // qn.value.forEach((quality, index) => {   // 查看各个清晰度的url
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
    for (const quality of clonebleFn) {
      // 应该传入特定的清晰度，获得对应的url
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
  }).catch((error) => {
    console.error('Error receiving room detail:', error)
  })
}

function receivePlayQuality() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receivePlayQuality((response) => {
      console.log('play quality:', response)
      resolve(response)
    })
  }).catch((error) => {
    console.error('Error receiving play quality:', error)
  })
}

function receivePlayUrl() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receivePlayUrl((response) => {
      console.log('play url:', response)
      resolve(response)
    })
  }).catch((error) => {
    console.error('Error receiving play url:', error)
  })
}

console.log('共享变量的值:', sharedVariable.value)
console.log('共享platform的值:', sharedPlatform.value)

</script>

<style scoped>
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
