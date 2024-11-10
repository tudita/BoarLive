<template>
  <div>
    <button @click="processData">处理数据</button>
    <button @click="getpn">pn</button>
    <button @click="geturl">url</button>
    <button @click="showContent('Live')">checkout</button>
    <!-- <div v-if="result">
      <p>房间详情: {{ result }}</p>
      <p>播放质量: {{ qn }}</p>
    </div> -->
  </div>
</template>


<script>
import { defineEmits } from 'vue'
const emit = defineEmits(['update-content'])

export default {
  data() {
    return {
      result: null,
      qn: null,
      url: null,
    }
  },
  
  methods: {
    showContent(componentName) {
      console.log('showContent:', componentName)
      emit('update-content', componentName)
    },
    async processData() {
      const dataToProcess = '15916883'
      window.electronAPI.huya_getRoomDetail(dataToProcess)
      console.log('Data sent to main process for huya_getRoomDetail')

      this.result = await this.receiveRoomDetail()
    },
    async getpn() {
      const clonableResult = JSON.parse(JSON.stringify(this.result))
      window.electronAPI.huya_getPlayQuality(clonableResult)
      console.log('Data sent to main process for huya_getPlayQuality')

      this.qn = await this.receivePlayQuality()
      
      // console.log('qn.Data:', this.qn.Data)
      this.qn.forEach((quality, index) => {
        console.log(`Quality ${index}:`, quality.Quality)
        console.log(`Data ${index}:`, quality.Data)
      })
    },
    async geturl() {
      const clonableResult = JSON.parse(JSON.stringify(this.result))
      const clonebleFn = JSON.parse(JSON.stringify(this.qn))
      console.log('get qn:', this.qn)
      window.electronAPI.huya_getPlayUrl(clonableResult, clonebleFn)
      console.log('Data sent to main process for huya_getPlayUrl')
      window.electronAPI.huya_receivePlayUrl((response) => {
        console.log('get url:', response)
        this.url = response
      })
    },
    receiveRoomDetail() {
      return new Promise((resolve, reject) => {
        window.electronAPI.huya_receiveRoomDetail((result) => {
          console.log('room detail:', result)
          resolve(result)
        })
      })
    },
    receivePlayQuality() {
      return new Promise((resolve, reject) => {
        window.electronAPI.huya_receivePlayQuality((response) => {
          console.log('play quality:', response)
          resolve(response)
        })
      })
    }
  }
}
</script>

<!-- huya_getRecommendRooms page -->
<!-- huya_receiveRecommendRooms  -->
<!-- huya_getSearch  (keyword, page = 1)
huya_receiveSearch -->
