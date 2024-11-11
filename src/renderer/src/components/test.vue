<template>
  <div id="mse" ref="mse"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Player from 'xgplayer'
import FlvPlugin from 'xgplayer-flv'
import 'xgplayer/dist/index.min.css'

const mse = ref(null)

onMounted(() => {
  const resizeObserver = new ResizeObserver(() => {
    if (mse.value) {
      mse.value.style.height = document.body.clientHeight + 'px'
    }
  })
  resizeObserver.observe(document.body)

  new Player({
    id: 'mse',
    isLive: true,
    playsinline: true,
    url: 'https://al-game.flv.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=c02f6bbb5b8a81f618379ef773458380&wsTime=67320061&seqid=3199574539107&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468265993407&uuid=3093316557&t=102&sv=2401310322&ratio=500',
    autoplay: true,
    height: window.innerHeight,
    width: window.innerWidth,
    plugins: [FlvPlugin]
  })
})
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#mse {
  width: 100%;
  height: 100%;
}
</style>
