<template>
  <div class="live-search">
    <div class="search-bar">
      <input v-model="keyword" placeholder="搜索直播..." @keyup.enter="search" />
      <button @click="search">搜索</button>
    </div>
    <div v-if="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div class="rooms-container">
      <div v-for="room in rooms" :key="room.RoomID" class="room-item">
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
    <div v-if="rooms.length > 0" class="pagination">
      <button @click="prevPage" :disabled="page === 1">上一页</button>
      <span>当前页: {{ page }}</span>
      <button @click="nextPage" :disabled="!hasMore">下一页</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      keyword: '',
      rooms: [],
      loading: false,
      error: null,
      hasMore: true,
      page: 1
    };
  },
  methods: {
    async search() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/api2/?m=Search&do=getSearchContent&q=${encodeURIComponent(this.keyword)}&uid=0&v=4&typ=-5&livestate=0&rows=40&start=${(this.page - 1) * 20}`);
        const data = response.data;
        if (data.responseHeader.status === 0 && data.response['3']) {
          const newRooms = data.response['3'].docs.map(item => ({
            Cover: item.game_screenshot ? (item.game_screenshot.includes('?') ? item.game_screenshot : `${item.game_screenshot}?x-oss-process=style/w338_h190&`) : '',
            Online: parseInt(item.game_total_count, 10),
            RoomID: item.room_id,
            Title: item.game_roomName,
            UserName: item.game_nick
          }));
          this.rooms = newRooms;
          this.hasMore = newRooms.length === 40; // 如果返回的房间数少于40，则表示没有更多数据
        }
      } catch (error) {
        this.error = '搜索失败，请稍后再试';
      } finally {
        this.loading = false;
      }
    },
    nextPage() {
      this.page += 1;
      this.search();
    },
    prevPage() {
      if (this.page > 1) {
        this.page -= 1;
        this.search();
      }
    }
  }
};
</script>

<style scoped>
.live-search {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.search-bar input {
  margin-right: 8px;
}

.rooms-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 1200px;
  height: 500px; /* 设置固定高度 */
  overflow-y: auto; /* 添加垂直滚动条 */
}

.room-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  padding: 4px; /* 减少内边距 */
  border-radius: 4px;
  background-color: #fff;
}

.room-cover {
  position: relative;
  width: 100%;
  margin-bottom: 4px; /* 减少底边距 */
}

.room-item img {
  max-width: 100%;
  border-radius: 4px;
}

.room-online {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
}

.room-info {
  text-align: center;
  margin-top: 4px; /* 减少顶部边距 */
}

.room-title {
  color: #666;
  font-weight: bold;
  font-size: 12px; /* 调整字体大小 */
}

.room-user {
  color: #666;
  font-size: 10px; /* 调整字体大小 */
}

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
}

.pagination button {
  margin: 0 8px;
}

.pagination span {
  margin: 0 8px;
}

.error {
  color: red;
}
</style>