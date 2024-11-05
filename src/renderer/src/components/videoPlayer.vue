<template>
  <div class>
    <div id="mmid" ref="video"></div>
    <div class="barrage-box">
      <div class="b-text">弹幕</div>
      <div class="input-box">
        <el-input v-model="barrageValue" placeholder="请输入内容">
          <template #append>
            |
            <span @click="save()">发送</span>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script>
//import Player from 'xgplayer'
import FlvPlayer from 'xgplayer-flv' // flv格式
//import HlsJsPlayer from 'xgplayer-hls.js' // M3U8格式
export default {
  props: {
    cover: '', // 直播封面图
    videoSrc: ''
  },
  data() {
    return {
      videoPlayer: null,
      barrageValue: ''
    }
  },
  mounted() {
    this.getVideo()
  },
  methods: {
    getVideo() {
      this.$nextTick(() => {
        console.log(this.videoSrc)
        this.videoPlayer = new FlvPlayer({
          el: document.querySelector('#mmid'),
          url: this.videoSrc,
          width: '100%',
          height: '714px',
          volume: 0.6, // 初始音量
          autoplay: false, // 自动播放
          playsinline: true,
          isLive: true,
          cors: true,
          poster: this.cover, // 封面图
          playbackRate: [0.5, 0.75, 1, 1.5, 2], // 倍速展示
          defaultPlaybackRate: 1,
          danmu: {
            panel: true,
            comments: [
              //弹幕数组
              {
                duration: 15000, //弹幕持续显示时间,毫秒(最低为5000毫秒)
                id: '1', //弹幕id，需唯一
                start: 3000, //弹幕出现时间，毫秒
                prior: true, //该条弹幕优先显示，默认false
                color: true, //该条弹幕为彩色弹幕，默认false
                txt: '', //弹幕文字内容
                mode: 'top' //显示模式，top顶部居中，bottom底部居中，scroll滚动，默认为scroll
              }
            ],
            area: {
              //弹幕显示区域
              start: 0, //区域顶部到播放器顶部所占播放器高度的比例
              end: 1 //区域底部到播放器顶部所占播放器高度的比例
            },
            closeDefaultBtn: false, //开启此项后不使用默认提供的弹幕开关，默认使用西瓜播放器提供的开关
            defaultOff: true //开启此项后弹幕不会初始化，默认初始化弹幕
          }
        })
      })
    },
    // 发送弹幕
    save() {
      if (this.barrageValue) {
        let id = 0
        this.videoPlayer.danmu.sendComment({
          //发送弹幕
          duration: 15000,
          id: 'chat' + id++,
          txt: this.barrageValue,
          style: {
            color: '#ffffff',
            fontSize: '18px',
            // border: '1px solid #ff9500',
            borderRadius: '50px',
            padding: '5px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.barrage-box {
  display: flex;
  align-items: center;
  padding: 28px 44px;
  margin-bottom: 26px;
  background-color: #282828;
  .b-text {
    position: relative;
    width: 88px;
    height: 40px;
    padding-left: 32px;
    margin-right: 40px;
    font-size: 18px;
    color: #f1a475;
    line-height: 40px;
    border-radius: 23px;
    border: 1px solid #f1a475;
    &::before {
      position: absolute;
      top: 50%;
      left: 14px;
      transform: translateY(-50%);
      width: 9px;
      height: 9px;
      background: #f1a475;
      border-radius: 50%;
      content: '';
    }
  }
  .input-box {
    width: 48%;
    background: #171616;
    border-radius: 28px;
    span {
      padding-left: 14px;
      &:hover {
        color: #ffffff;
      }
    }
  }
}
::v-deep {
  .el-input__inner {
    border-color: transparent;
    background-color: transparent;
  }
  .el-input-group__append {
    padding-right: 30px;
    border-color: transparent;
    background-color: transparent;
    cursor: pointer;
  }
}
</style>
