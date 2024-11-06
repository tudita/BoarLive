<template>
  <div>
    <h1>Huya Live</h1>
    <div v-if="roomDetail">
      <h2>{{ roomDetail.Title }}</h2>
      <p>{{ roomDetail.Introduction }}</p>
      <img :src="roomDetail.Cover" alt="Cover Image" />
    </div>
    <div v-if="error">
      <p>Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Huya from '../lib/huya.js'

const roomDetail = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    const huya = new Huya()
    const roomId = '863214' // 替换为有效的房间 ID
    roomDetail.value = await huya.getRoomDetail(roomId)
  } catch (err) {
    error.value = err.message
    console.error('Error fetching room detail:', err)
  }
})
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
