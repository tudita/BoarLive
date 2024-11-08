<template>
  <div class="view-container">
    <video-player v-if="showPlayer" :url="videoUrl" @close="showPlayer = false" />
    <button v-if="!showPlayer" @click="startLiveStream">开始直播</button>
  </div>
</template>

<script>
import VideoPlayer from './videoPlayer.vue'

export default {
  name: 'LiveView',
  components: {
    VideoPlayer
  },
  data() {
    return {
      showPlayer: false,
      videoUrl:
        'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4'
    }
  },
  methods: {
    startLiveStream() {
      console.log('Starting live stream...') // 确认点击事件
      this.showPlayer = true
    }
  }
}
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
