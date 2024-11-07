<template>
  <div class="live-search">
    <!-- 搜索范围选择框和搜索框 -->
    <div class="search-bar">
      <!-- 搜索范围选择框 -->
      <div class="search-range">
        <label for="platform" class="search-range-label">搜索平台：</label>
        <select id="platform" v-model="selectedPlatform" class="search-range-select">
          <option value="huya">虎牙</option>
          <option value="douyu">斗鱼</option>
          <option value="bilibili">Bilibili</option>
          <option value="douyin">抖音</option>
        </select>
      </div>

      <!-- 输入框 -->
      <input
        v-model="keyword"
        placeholder="请输入搜索内容..."
        class="search-input"
        @keyup.enter="search"
      />
      <button class="search-button" @click="search">搜索</button>
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 房间列表 -->
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

    <!-- 分页 -->
    <div v-if="rooms.length > 0" class="pagination">
      <button :disabled="page === 1" @click="prevPage">上一页</button>
      <span>当前页: {{ page }}</span>
      <button :disabled="!hasMore" @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      selectedPlatform: 'huya', // 默认选择虎牙
      keyword: '',
      rooms: [],
      loading: false,
      error: null,
      hasMore: true,
      page: 1
    }
  },
  methods: {
    async search() {
      this.loading = true
      this.error = null
      try {
        // 根据选择的平台来进行不同的API请求
        //    let apiUrl = ''
        let response
        console.log(this.selectedPlatform)
        if (this.selectedPlatform === 'huya') {
          // 使用虎牙的搜索API
          // apiUrl = `/api2/?m=Search&do=getSearchContent&q=${encodeURIComponent(this.keyword)}&uid=0&v=4&typ=-5&livestate=0&rows=40&start=${(this.page - 1) * 20}`
          response = await axios.get(
            `/api2/?m=Search&do=getSearchContent&q=${encodeURIComponent(this.keyword)}&uid=0&v=4&typ=-5&livestate=0&rows=40&start=${(this.page - 1) * 20}`
          )
          const data = response.data
          console.log(data)
          if (data.responseHeader.status === 0 && data.response['3']) {
            const newRooms = data.response['3'].docs.map((item) => ({
              Cover: item.game_screenshot
                ? item.game_screenshot.includes('?')
                  ? item.game_screenshot
                  : `${item.game_screenshot}?x-oss-process=style/w338_h190&`
                : '',
              Online: parseInt(item.game_total_count, 10),
              RoomID: item.room_id,
              Title: item.game_roomName,
              UserName: item.game_nick,
              Platform: '虎牙直播'
            }))
            this.rooms = newRooms
            this.hasMore = newRooms.length === 40 // 如果返回的房间数少于40，则表示没有更多数据
          }
        } else if (this.selectedPlatform === 'douyu') {
          // 斗鱼的搜索API逻辑
          const result = await axios.get(`/douyu/japi/search/api/searchShow`, {
            params: {
              kw: encodeURIComponent(this.keyword),
              page: this.page,
              pageSize: 20
            }
          })
          const data = result.data
          this.rooms = data.data.relateShow.map((item) => ({
            Cover: item.roomSrc,
            Online: this.parseHotNum(item.hot),
            RoomID: item.rid,
            Title: item.roomName,
            UserName: item.nickName,
            Platform: '斗鱼直播'
          }))
          this.hasMore = data.data.relateShow.length > 0
        } else if (this.selectedPlatform === 'bilibili') {
          // Bilibili的搜索API逻辑
          const result = await axios.get(`/bilibili2/x/web-interface/search/type`, {
            params: {
              context: '',
              search_type: 'live',
              cover_type: 'user_cover',
              page: this.page,
              order: '',
              keyword: encodeURIComponent(this.keyword),
              category_id: '',
              __refresh__: 'true',
              _extra: '',
              highlight: 0,
              single_column: 0
            }
          })
          const data = result.data
          console.log('API 调用成功:', data)
          this.rooms = data.data.result.live_room.map((item) => ({
            // Cover: `https:${item.cover}@300w.jpg`,
            Cover: this.getImageUrl(item.cover),
            Online: parseInt(item.online, 10),
            RoomID: item.roomid,
            Title: item.title.replace(/<em.*?\/em>/g, ''),
            UserName: item.uname,
            Platform: '哔哩哔哩'
          }))
          this.hasMore = this.rooms.length > 0
        } else if (this.selectedPlatform === 'douyin') {
          // 抖音的搜索API逻辑（待编写）
          response = { data: { responseHeader: { status: 0 }, response: { 3: { docs: [] } } } }
        }
        console.log('封面', this.rooms)
      } catch (error) {
        this.error = '搜索失败，请稍后再试'
      } finally {
        this.loading = false
      }
    },
    nextPage() {
      this.page += 1
      this.search()
    },
    prevPage() {
      if (this.page > 1) {
        this.page -= 1
        this.search()
      }
    },
    parseHotNum(hn) {
      try {
        var num = parseFloat(hn.replace('万', ''))
        if (hn.includes('万')) {
          num = num * 10000
        }
        return parseInt(num, 10)
      } catch (error) {
        return -999
      }
    },
    getImageUrl(cover) {
      // 检查URL是否已经包含协议，如果没有，则添加https协议
      if (cover.startsWith('//')) {
        return 'https:' + cover
      }
      return cover
    }
  }
}
</script>
<style scoped>
.live-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
  padding: 0 10px; /* 防止超出边界 */
}

.search-range {
  display: flex;
  align-items: center;
  margin-right: 10px; /* 为了让选择框和搜索框有间隔 */
}

.search-range-label {
  font-size: 16px; /* 与输入框一致的字体大小 */
  color: #333; /* 和输入框一致的颜色 */
  margin-right: 8px;
}

.search-range-select {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  transition: border-color 0.3s ease;
}

.search-range-select:focus {
  border-color: #007bff;
  outline: none;
}

.search-input {
  padding: 12px 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 25px;
  margin-right: 10px;
  width: 100%;
  max-width: 400px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
  outline: none;
}

.search-button {
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #0056b3;
}

.loading {
  font-size: 16px;
  color: #007bff;
  margin-top: 10px;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

.rooms-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
  height: 500px;
  overflow-y: auto;
}

.room-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #ddd;
  padding: 4px;
  border-radius: 4px;
  background-color: #fff;
}

.room-cover {
  position: relative;
  width: 100%;
  margin-bottom: 4px;
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
  margin-top: 4px;
}

.room-title {
  color: #666;
  font-weight: bold;
  font-size: 12px;
}

.room-user {
  color: #666;
  font-size: 10px;
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

/* 媒体查询：小屏幕优化 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column; /* 在小屏幕上垂直排列 */
    align-items: stretch; /* 使其占满整个宽度 */
  }

  .search-range {
    margin-right: 0;
    margin-bottom: 10px; /* 增加底部间隔 */
  }

  .search-input {
    width: 100%; /* 输入框宽度适应屏幕 */
    max-width: none;
    margin-right: 0;
    margin-bottom: 10px; /* 增加底部间隔 */
  }

  .search-button {
    width: 100%; /* 按钮宽度适应屏幕 */
  }
}

/* 媒体查询：超小屏幕（如手机）优化 */
@media (max-width: 480px) {
  .rooms-container {
    height: auto; /* 当屏幕宽度更小的时候，房间列表高度自动调整 */
  }
}
</style>
