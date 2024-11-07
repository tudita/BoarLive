<template>
  <div>
    // 播放器
    <div id="mse"></div>

    // 截图图片展示
    <img :src="imgurl" alt="" />
  </div>
</template>

<script>
import 'xgplayer'
import FlvPlayer from 'xgplayer-flv'

export default {
  name: 'Xgplayer',
  data() {
    return {
      imgurl: ''
    }
  },
  mounted() {
    this.initVideo()
  },
  methods: {
    initVideo() {
      let player = new FlvPlayer({
        id: 'mse',
        url: 'http://qvodlive-va.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=db27e57ff412ae5b5a4121566baa7d07&wsTime=672cead8&seqid=3199233234372&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468257881387&uuid=2560841052&t=102&sv=2401310322&ratio=500',
        videoInit: true, // 显示首帧
        lang: 'zh-cn',
        // fluid: true,
        autoplay: false,
        screenShot: true,
        isLive: true,
        preloadTime: 30,
        minCachedTime: 5,
        cors: true
      })

      // 监听播放器截图事件
      player.on('screenShot', (screenShotImg) => {
        // 替换type类型
        let base64Data = screenShotImg.replace(
          'data:application/octet-stream;base64',
          'data:image/png;base64'
        )

        // 转文件
        // this.imgurl = this.getBaseImage(base64Data, '1.png')

        // base64直接赋值img标签展示
        this.imgurl = base64Data
        console.log(screenShotImg, this.imgurl)
      })
    },

    // base64转文件
    getBaseImage(dataUrl, fileName) {
      let arr = dataUrl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], fileName, { type: mime })
    }
  }
}
</script>

<style scoped></style>
