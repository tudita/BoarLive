<!-- <template>
  <div>
    <button @click="getroomdetail">处理数据</button>
    <button @click="getpn">pn</button>
    <button @click="geturl">url</button>
    <button @click="showContent('Live')">checkout</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['update-content'])

const result = ref(null)
const qn = ref(null)
const url = ref(null)

function showContent(componentName) {
  console.log('showContent:', componentName)
  emit('update-content', componentName)
}

async function getroomdetail() {
  try {
    const dataToProcess = '2448877'
    window.electronAPI.huya_getRoomDetail(dataToProcess)
    console.log('Data sent to main process for huya_getRoomDetail')

    result.value = await receiveRoomDetail()
  } catch (error) {
    console.error('Error processing data:', error)
  }
}

async function getpn() {
  try {
    const clonableResult = JSON.parse(JSON.stringify(result.value))
    window.electronAPI.huya_getPlayQuality(clonableResult)
    console.log('Data sent to main process for huya_getPlayQuality')

    qn.value = await receivePlayQuality()
    // qn.value.forEach((quality, index) => {
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
    console.log('get roomdetail:', clonableResult)
    console.log('get qn:', clonebleFn)
    for (const quality of clonebleFn) {   // 应该传入特定的清晰度，获得对应的url
      // console.log(`Quality ${index}:`, quality.Quality)
      // console.log(`Data ${index}:`, quality.Data)
      window.electronAPI.huya_getPlayUrl(clonableResult, quality)
      console.log('Data sent to main process for huya_getPlayUrl')
      url.value = await receivePlayUrl()
    }
    console.log('final url:', url.value)

  } catch (error) {
    console.error('Error getting URL:', error)
  }
}

function receiveRoomDetail() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receiveRoomDetail((result) => {
      console.log('room detail:', result)
      resolve(result)
    })
  }).catch(error => {
    console.error('Error receiving room detail:', error)
  })
}

function receivePlayQuality() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receivePlayQuality((response) => {
      console.log('play quality:', response)
      resolve(response)
    })
  }).catch(error => {
    console.error('Error receiving play quality:', error)
  })
}

function receivePlayUrl() {
  return new Promise((resolve, reject) => {
    window.electronAPI.huya_receivePlayUrl((response) => {
      console.log('play url:', response)
      resolve(response)
    })
  }).catch(error => {
    console.error('Error receiving play url:', error)
  })
}
</script>

<style scoped>
/* 添加你的样式 */
</style> -->
<template>
  <div class="videoBox">
    <video
      id="videoElement"
      controls
      autoplay
      muted
      style="width: 100%; height: 100%; object-fit: fill"
    ></video>
  </div>
</template>
<script setup name="videoFlv">
  import flvjs from 'flv.js';
  import { useMessage } from 'naive-ui';
  const message = useMessage();
  const props = defineProps({
    taskInfo: {
      type: Object,
      default: () => {},
    },
  });
// 首先定义flvPlayer为null
  const flvPlayer = ref(null);
  const taskInfo = computed(() => props.taskInfo);
  const createVideo = () => {
    if (flvjs.isSupported()) {
      var videoElement = document.getElementById('videoElement');
      flvPlayer.value = flvjs.createPlayer(
        {
          type: 'flv',
          url: "https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4", //你的url地址
          isLive: true,
          hasAudio: false,
        }
      );
      flvPlayer.value.attachMediaElement(videoElement);
      flvPlayer.value.load();
 
      setTimeout(function () {
        flvPlayer.value.play();
      }, 300);
      //处理视频播放错误的语法
      flvPlayer.value.on('error', () => {
        message.error(`视频加载失败，请稍候重试！`);
        return false;
      });
    }
  };
 
// 我的视频是弹窗显示的，所以创建了destroy方法，在子组件中暴露出去后，在父组件调用即可，这样关闭弹窗后，视频流会停止请求。
  const destroy = () => {
    flvPlayer.value.pause(); //暂停播放数据流
    flvPlayer.value.unload(); //取消数据流加载
    flvPlayer.value.detachMediaElement(); //将播放实例从节点中取出
    flvPlayer.value.destroy(); //销毁播放实例
    flvPlayer.value = null;
  };
  defineExpose({ destroy });
 
  onMounted(() => {
    createVideo();
  });
</script>
<style scoped>
  .videoBox {
    width: 800px;
    height: 450px;
    border: solid 1px #ccc;
  }
</style>