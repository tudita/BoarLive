<template>
  <div class="live-search">
    <h1 class="page-title">Live Rooms</h1>
    <div class="rooms-container">
      <div v-for="room in rooms" :key="room.RoomID" class="room-item">
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
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      category: {
        ID: 1
      }, // 根据实际情况定义这个对象
      page: 1,
      rooms: [],
      hasMore: true
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

        this.rooms.push(...this.parseData(data))
        this.hasMore = data.data.page < data.data.totalPage
      } catch (error) {
        // 处理错误
      }
    },
    parseData(data) {
      return data.data.datas.map((item) => ({
        Cover: item.screenshot.includes('?')
          ? item.screenshot
          : `${item.screenshot}?x-oss-process=style/w338_h190&`,
        Online: parseInt(item.totalCount),
        RoomID: item.profileRoom,
        Title: item.introduction || item.roomName || '',
        UserName: item.nick
      }))
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
</style>
