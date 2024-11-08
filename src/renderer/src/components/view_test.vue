<template>
  <div>
    <button @click="processData">Process Data</button>
    <div style="color: red">Processed Result: {{ result }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      result: null
    }
  },
  methods: {
    processData() {
      const dataToProcess = '660000'
      window.electronAPI.huya_getRoomDetail(dataToProcess)
      console.log('Data sent to main process for processing')
      window.electronAPI.huya_receiveRoomDetail((result) => {
        console.log(result)
        this.result = result
      })
      
      window.electronAPI.huya_getRecommendRooms()
      console.log('Data sent to main process for processing')
      window.electronAPI.huya_receiveRecommendRooms((result) => {
        console.log('recommand', result)
        this.result = result
      })

      window.electronAPI.huya_getSearch('lol',1)
      console.log('Data sent to main process for processing')
      window.electronAPI.huya_receiveSearch((result) => {
        console.log('search', result)
        this.result = result
      })
    }
  }
}
</script>

<!-- huya_getRecommendRooms page -->
<!-- huya_receiveRecommendRooms  -->
<!-- huya_getSearch  (keyword, page = 1)
huya_receiveSearch -->