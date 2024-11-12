<template>
  <div  id="mse" ref="mse"></div>
</template>


<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import Player from 'xgplayer'
import FlvPlugin from 'xgplayer-flv'
import 'xgplayer/dist/index.min.css'
const sharedVariable = inject('sharedVariable')   //全局roomid
const sharedPlatform = inject('sharedPlatform') 

const result = ref(null)
const qn = ref(null)
const all_qn = ref(null)
const url = ref(null)
const mse = ref(null)
let resizeObserver = null

onMounted(async () => {
  resizeObserver = new ResizeObserver(() => {
    if (mse.value) {
      Player.resize({
        height: window.innerHeight,
        width: window.innerWidth * 0.883
      })
    }
  })
  resizeObserver.observe(document.body)
  await getroomdetail()
  await getpn()
  await geturl() // 依次获取房间详情、清晰度、URL
  console.log('final url:', url.value[0])
  new Player({
    id: 'mse',
    isLive: true,
    playsinline: true,
    url: url.value[0],
    autoplay: true,
    fluid: true,
    plugins: [FlvPlugin]
  })
})


async function getroomdetail() {
  try {
    const dataToProcess = sharedVariable.value
    // console.log('roomid:', dataToProcess)
    if(sharedPlatform.value == 'huya'){
      window.electronAPI.huya_getRoomDetail(dataToProcess)
      console.log('Data sent to main process for huya_getRoomDetail')
    }else if(sharedPlatform.value == 'douyu'){
      window.electronAPI.douyu_getRoomDetail(dataToProcess)
      console.log('Data sent to main process for douyu_getRoomDetail')
    }else if(sharedPlatform.value == 'bilibili'){
      window.electronAPI.bili_getRoomDetail(dataToProcess)
      console.log('Data sent to main process for bili_getRoomDetail')
    }else if(sharedPlatform.value == 'douyin'){
      window.electronAPI.douyin_getRoomDetail(dataToProcess)
      console.log('Data sent to main process for douyin_getRoomDetail')
    }
    result.value = await receiveRoomDetail()
  } catch (error) {
    console.error('Error processing data:', error)
  }
}

async function getpn() {
  try {
    const clonableResult = JSON.parse(JSON.stringify(result.value))

    if(sharedPlatform.value == 'huya'){
      window.electronAPI.huya_getPlayQuality(clonableResult)
      console.log('Data sent to main process for huya_getPlayQuality')
    }else if(sharedPlatform.value == 'douyu'){
      window.electronAPI.douyu_getPlayQuality(clonableResult)
      console.log('Data sent to main process for douyu_getPlayQuality')
    }else if(sharedPlatform.value == 'bilibili'){
      window.electronAPI.bili_getPlayQuality(clonableResult)
      console.log('Data sent to main process for bili_getPlayQuality')
    }else if(sharedPlatform.value == 'douyin'){
      window.electronAPI.douyin_getPlayQuality(clonableResult)
      console.log('Data sent to main process for douyin_getPlayQuality')
    }

    all_qn.value = await receivePlayQuality()
    if (all_qn.value && all_qn.value.length >= 2) {
      qn.value = all_qn.value[all_qn.value.length - 2]
    } else {
      qn.value = all_qn.value[all_qn.value.length - 1]
    }
    console.log('all play quality:', all_qn.value)
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
    // console.log('get roomdetail:', clonableResult)
    // console.log('get qn:', clonebleFn)

    if(sharedPlatform.value == 'huya'){
        window.electronAPI.huya_getPlayUrl(clonableResult, clonebleFn)
        console.log('Data sent to main process for huya_getPlayUrl')
      }else if(sharedPlatform.value == 'douyu'){
        window.electronAPI.douyu_getPlayUrl(clonableResult, clonebleFn)
        console.log('Data sent to main process for douyu_getPlayUrl')
      }else if(sharedPlatform.value == 'bilibili'){
        window.electronAPI.bili_getPlayUrl(clonableResult, clonebleFn)
        console.log('Data sent to main process for bili_getPlayUrl')
      }else if(sharedPlatform.value == 'douyin'){
        window.electronAPI.douyin_getPlayUrl(clonableResult, clonebleFn)
        console.log('Data sent to main process for douyin_getPlayUrl')
      }
      
      url.value = await receivePlayUrl()

    // for (const quality of clonebleFn) {
    //   if(sharedPlatform.value == 'huya'){
    //     window.electronAPI.huya_getPlayUrl(clonableResult, quality)
    //     console.log('Data sent to main process for huya_getPlayUrl')
    //   }else if(sharedPlatform.value == 'douyu'){
    //     window.electronAPI.douyu_getPlayUrl(clonableResult, quality)
    //     console.log('Data sent to main process for douyu_getPlayUrl')
    //   }else if(sharedPlatform.value == 'bilibili'){
    //     window.electronAPI.bili_getPlayUrl(clonableResult, quality)
    //     console.log('Data sent to main process for bili_getPlayUrl')
    //   }else if(sharedPlatform.value == 'douyin'){
    //     window.electronAPI.douyin_getPlayUrl(clonableResult, quality)
    //     console.log('Data sent to main process for douyin_getPlayUrl')
    //   }
      
    //   url.value = await receivePlayUrl()
    // }
    console.log('final url:', url.value)
  } catch (error) {
    console.error('Error getting URL:', error)
  }
}

function receiveRoomDetail() {
  return new Promise((resolve, reject) => {
    if(sharedPlatform.value == 'huya'){
      window.electronAPI.huya_receiveRoomDetail((result) => {
        // console.log('room detail:', result)
        resolve(result)
      })
    }else if(sharedPlatform.value == 'douyu'){
    
    }else if(sharedPlatform.value == 'bilibili'){
      window.electronAPI.bili_receiveRoomDetail((result) => {
        // console.log('douyin room detail:', result)
        resolve(result)
      })
    }else if(sharedPlatform.value == 'douyin'){
      window.electronAPI.douyin_receiveRoomDetail((result) => {
        // console.log('douyin room detail:', result)
        resolve(result)
      })
    }  
  }).catch((error) => {
    console.error('Error receiving room detail:', error)
  })
}

function receivePlayQuality() {
  return new Promise((resolve, reject) => {
    if(sharedPlatform.value == 'huya'){
      window.electronAPI.huya_receivePlayQuality((response) => {
        // console.log('play quality:', response)
        resolve(response)
      })
    }else if(sharedPlatform.value == 'douyu'){
    
    }else if(sharedPlatform.value == 'bilibili'){
      window.electronAPI.bili_receivePlayQuality((response) => {
        // console.log('douyin play quality:', response)
        resolve(response)
      })
    }else if(sharedPlatform.value == 'douyin'){
      window.electronAPI.douyin_receivePlayQuality((response) => {
        // console.log('douyin play quality:', response)
        resolve(response)
      })
    }  
  }).catch((error) => {
    console.error('Error receiving play quality:', error)
  })
}

function receivePlayUrl() {
  return new Promise((resolve, reject) => {
    
    if(sharedPlatform.value == 'huya'){
      window.electronAPI.huya_receivePlayUrl((response) => {
        // console.log('play url:', response)
        resolve(response)
      })
    }else if(sharedPlatform.value == 'douyu'){
    
    }else if(sharedPlatform.value == 'bilibili'){
      window.electronAPI.bili_receivePlayUrl((response) => {
        // console.log('play url:', response)
        resolve(response)
      })
    }else if(sharedPlatform.value == 'douyin'){
      window.electronAPI.douyin_receivePlayUrl((response) => {
        // console.log('play url:', response)
        resolve(response)
      })
    }
  }).catch((error) => {
    console.error('Error receiving play url:', error)
  })
}

console.log('共享roomid的值:', sharedVariable.value)
console.log('共享platform的值:', sharedPlatform.value)

</script>

<style scoped>
.view-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #000000;
  padding: 20px;
  font-family: 'Nunito', sans-serif;
  width: 100%;
  box-sizing: border-box;
}
button {
  padding: 10px 20px;
  font-size: 16px;
}
</style>
