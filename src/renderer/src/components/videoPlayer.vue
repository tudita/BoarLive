<template>
  <div ref="playerContainer" class="video-player">
    <video :src="url" controls autoplay style="width: 100%; height: 100%"></video>
  </div>
</template>
<script>
import FlvPlayer from 'xgplayer-flv'

export default {
  name: 'VideoPlayer',
  props: {
    url: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      player: null
    }
  },
  watch: {
    url(newUrl) {
      if (this.player) {
        this.player.src = newUrl
      }
    }
  },
  mounted() {
    console.log('Video URL:', this.url) // 调试输出 URL
    this.initializePlayer()
  },
  beforeUnmount() {
    if (this.player) {
      this.player.destroy(true)
    }
  },
  methods: {
    initializePlayer() {
      if (this.player) {
        this.player.destroy(true)
      }
      console.log('Initializing player with URL:', this.url) // 输出URL调试
      this.player = new FlvPlayer({
        id: this.$refs.playerContainer,
        url: this.url,
        isLive: true,
        playsinline: true,
        width: '100%',
        height: '100%'
      })

      if (this.player) {
        console.log('Player initialized successfully.')
      } else {
        console.log('Player failed to initialize.')
      }
    }
  }
}
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  min-height: 400px; /* 测试用固定高度 */
  background-color: black;
}
</style>
