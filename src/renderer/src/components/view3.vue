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
    }
  }
}
</script>
