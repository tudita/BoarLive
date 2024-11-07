<!-- <template>
  <div class="live-search">
    <h1 class="page-title">Live Rooms</h1>
    <div class="rooms-container">
      <div
        v-for="room in rooms"
        :key="room.RoomID"
        class="room-item"
        @click="openVideoPlayer(room)"
      >
        <div class="room-card">
          <div class="room-cover">
            <img :src="room.Cover" alt="封面" />
            <div class="room-online">在线人数: {{ room.Online }}</div>
          </div>
          <div class="room-info">
            <div class="room-title">{{ room.Title }}</div>
            <div class="room-user">{{ room.UserName }}</div>
          </div>
        </div>
      </div>
    </div>
    <button :disabled="!hasMore" class="load-more-button" @click="loadMoreRooms">Load More</button>
    <video-player
      v-if="selectedRoom"
      :key="selectedRoom ? selectedRoom.RoomID : ''"
      :cover="selectedRoom.Cover"
      :video-src="selectedRoom.VideoSrc"
    ></video-player>
  </div>
</template>

<script>
import axios from 'axios'
import VideoPlayer from './videoPlayer.vue'

export default {
  components: {
    VideoPlayer
  },
  data() {
    return {
      category: {
        ID: 1
      }, // 根据实际情况定义这个对象
      page: 1,
      rooms: [],
      hasMore: true,
      selectedRoom: null
    }
  },
  mounted() {
    this.fetchRooms()
  },
  methods: {
    async fetchRooms() {
      try {
        const response = await axios.get(`/api1/cache.php`, {
          params: {
            m: 'LiveList',
            do: 'getLiveListByPage',
            tagAll: 0,
            page: this.page
          }
        })
        const data = response.data
        console.log('API响应数据:', data) // 打印完整的响应数据

        this.rooms.push(...this.parseData(data))
        this.hasMore = data.data.page < data.data.totalPage
      } catch (error) {
        // 处理错误
      }
    },
    parseData(data) {
      console.log(
        '解析后的数据:',
        data.data.datas.map((item) => ({
          Cover: item.screenshot.includes('?')
            ? item.screenshot
            : `${item.screenshot}?x-oss-process=style/w338_h190&`,
          Online: parseInt(item.totalCount),
          RoomID: item.profileRoom,
          Title: item.introduction || item.roomName || '',
          UserName: item.nick,
          VideoSrc: item.liveStreamUrl || item.videoUrl || item.streamUrl // 确保这里正确提取了视频流地址
        }))
      )
      return data.data.datas.map((item) => ({
        Cover: item.screenshot.includes('?')
          ? item.screenshot
          : `${item.screenshot}?x-oss-process=style/w338_h190&`,
        Online: parseInt(item.totalCount),
        RoomID: item.profileRoom,
        Title: item.introduction || item.roomName || '',
        UserName: item.nick,
        VideoSrc: item.liveStreamUrl || item.videoUrl || item.streamUrl || item.url || item.playUrl // 确保这里正确提取了视频流地址
      }))
    },
    async getRoomDetail(roomId) {
      // **添加这个方法**
      try {
        //const headers = {
        //  'user-agent':
        //     'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/117.0.0.0'
        // }
        //const result = await axios.get(`/api3/${roomId}`, { headers })
        const result = await axios.get(`/api3/${roomId}`)
        let jsonStr = result.data.match(
          /window\.HNF_GLOBAL_INIT.=.\{[\s\S]*?\}[\s\S]*?<\/script>/
        )[0]
        // const jsonObj = JSON.parse(jsonStr.replace(/window\.HNF_GLOBAL_INIT.=.|<\/script>/g, ''))
        jsonStr = jsonStr.replace(/window\.HNF_GLOBAL_INIT.=.|<\/script>/g, '')
        jsonStr = jsonStr.replace(/function.*?\(.*?\).\{[\s\S]*?\}/g, '""')

        const jsonObj = JSON.parse(jsonStr)
        const lines = jsonObj['roomInfo']['tLiveInfo']['tLiveStreamInfo']['vStreamInfo']['value']
        const huyaLines = lines.map((item) => ({
          line: item['sFlvUrl'],
          lineType: item['sFlvUrl'] ? 'FLV' : 'HLS',
          flvAntiCode: item['sFlvAntiCode'],
          hlsAntiCode: item['sHlsAntiCode'],
          streamName: item['sStreamName']
        }))

        // 优先选择FLV线路
        const videoSrc = huyaLines.find((line) => line.lineType === 'FLV')?.line

        return {
          VideoSrc: videoSrc
        }
      } catch (error) {
        console.error('获取直播间详情失败:', error)
        return { VideoSrc: undefined }
      }
    },
    async openVideoPlayer(room) {
      // **修改这个方法**
      try {
        const roomDetail = await this.getRoomDetail(room.RoomID)
        if (roomDetail.VideoSrc) {
          this.selectedRoom = {
            ...room,
            VideoSrc: roomDetail.VideoSrc
          }
          // this.selectedRoom = roomDetail // 更新 selectedRoom 对象
        } else {
          console.error('无法获取视频流地址')
        }
      } catch (error) {
        console.error('获取直播间详情失败:', error)
      }
    },
    loadMoreRooms() {
      this.page += 1
      this.fetchRooms()
    }
  }
}
</script>

<style scoped>
/* 页面背景 */
.live-search {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Nunito', sans-serif;
  width: 100%;
  box-sizing: border-box;
}

/* 页面标题 */
.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 30px;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

/* 房间列表容器 */
.rooms-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* 每行最多显示适应宽度的卡片 */
  gap: 20px;
  width: 100%;
  max-width: 100%; /* 充满宽度 */
  margin-top: 20px;
  height: 500px;
  overflow-y: auto; /* 添加滚动条 */
}

/* 每个房间项的卡片设计 */
.room-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.room-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 100%;
  max-width: 220px; /* 缩小卡片大小 */
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-10px); /* 上浮效果 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* 加强阴影 */
}

/* 房间封面 */
.room-cover {
  position: relative;
  width: 100%;
  height: 140px; /* 固定封面高度 */
  overflow: hidden;
}

.room-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片裁剪 */
}

.room-online {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

/* 房间信息区域 */
.room-info {
  padding: 12px;
  text-align: center;
}

.room-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.room-user {
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* 加载更多按钮 */
.load-more-button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.load-more-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.load-more-button:hover {
  background-color: #0056b3;
}

/* 错误提示 */
.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style> -->

<template>
  <div>
    <video-player :video-src="videoSrc" :cover="cover"> </video-player>
  </div>
</template>

<script>
import VideoPlayer from './videoPlayer.vue'

export default {
  components: {
    VideoPlayer
  },
  data() {
    return {
      // 从videosrc.txt中选择一个视频源地址
      videoSrc:
        'https://hw-game.flv.huya.com/src/78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1-imgplus.flv?wsSecret=db27e57ff412ae5b5a4121566baa7d07&wsTime=672cead8&seqid=3199233234372&ctype=tars_mp&ver=1&fs=bgct&sphdcdn=&sphdDC=&sphd=&exsphd=&uid=1468257881387&uuid=2403982770&t=102&sv=2401310322&ratio=500'
    }
  }
}
</script>
