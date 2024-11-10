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
        // "https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4"
        // "https://qvodlive-va.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=dded2a77e15a5bf4317ac3a5c6a76e62&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=3799499145&t=102&sv=2401310322&ratio=14000"
        // "https://hw-game.flv.huya.com/src/78941969-2601386338-11172869245971202048-3120471182-10057-A-0-1-imgplus.flv?wsSecret=ab84be3e7c6cb1fe6539bb981403c61c&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=3356500749&t=102&sv=2401310322&ratio=14000"
        // "https://tx.flv.huya.com/src/78941969-2601386338-11172869245971202048-3120471182-10057-A-0-1-imgplus.flv?wsSecret=ab84be3e7c6cb1fe6539bb981403c61c&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=1810547001&t=102&sv=2401310322&ratio=14000"
        // "https://hs.flv.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=dded2a77e15a5bf4317ac3a5c6a76e62&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=3052543859&t=102&sv=2401310322&ratio=14000"
        // "https://al-game.flv.huya.com/src/78941969-2601386338-11172869245971202048-3120471182-10057-A-0-1-imgplus.flv?wsSecret=ab84be3e7c6cb1fe6539bb981403c61c&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=1235812289&t=102&sv=2401310322&ratio=14000"
        // "https://hw-game.flv.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=dded2a77e15a5bf4317ac3a5c6a76e62&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=3768586732&t=102&sv=2401310322&ratio=14000"
        // "https://tx.flv.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=dded2a77e15a5bf4317ac3a5c6a76e62&wsTime=672f7b75&seqid=3199451820572&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468308374772&uuid=843006786&t=102&sv=2401310322&ratio=14000"
        "https://al-game.flv.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv"
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
