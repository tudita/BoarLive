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
        <div class="room-cover" @click="showContent('Live', room.RoomID)">
          <img :src="room.Cover" alt="封面" />
          <div class="room-online">在线人数: {{ room.Online }}</div>
        </div>
        <div class="room-info">
          <div class="room-title">{{ room.Title }}</div>
          <div class="room-user">{{ room.UserName }}</div>
        </div>
        <!-- 关注按钮 -->
        <button
          class="follow-button"
          :class="{ followed: isFollowed(room.RoomID) }"
          @click="toggleFollow(room.RoomID)"
        >
          {{ isFollowed(room.RoomID) ? '已关注' : '关注' }}
        </button>
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

<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'
import { defineEmits } from 'vue'

const selectedPlatform = ref('huya') // 默认选择虎牙
const keyword = ref('')
const rooms = ref([])
const loading = ref(false)
const error = ref(null)
const ans = ref(null)
const hasMore = ref(true)
const page = ref(1)
const followedRooms = ref([]) // 存储已关注的房间ID
const emit = defineEmits(['update-content'])
const sharedVariable = inject('sharedVariable')

function showContent(componentName, roomid) {
  sharedVariable.value = roomid
  console.log('showContent:', componentName)
  emit('update-content', componentName)
}

async function search() {
  loading.value = true
  error.value = null
  try {
    let response
    console.log(selectedPlatform.value)
    if (selectedPlatform.value === 'huya') {
      // 使用虎牙的搜索API
      window.electronAPI.huya_getSearch(keyword.value, page.value)
      console.log('Data sent to main process for processing')
      window.electronAPI.huya_receiveSearch((response) => {
        console.log('get research:', response)
        ans.value = response
        rooms.value = ans.value.Rooms.map(item => ({
          Cover: item.Cover,
          Online: item.Online,
          RoomID: item.RoomID,
          Title: item.Title,
          UserName: item.UserName,
          Platform: '虎牙直播'
        }))
        hasMore.value = ans.value.HasMore
      })
    } else if (selectedPlatform.value === 'douyu') {
      // 使用斗鱼的搜索API
      response = await axios.get(`/douyu/api/search`, {
        params: {
          keyword: keyword.value,
          page: page.value
        }
      })
      console.log('douyu:', response)
      rooms.value = response.data.rooms.map(item => ({
        Cover: item.Cover,
        Online: item.Online,
        RoomID: item.RoomID,
        Title: item.Title,
        UserName: item.UserName,
        Platform: '斗鱼直播'
      }))
      hasMore.value = rooms.value.length > 0
    } else if (selectedPlatform.value === 'bilibili') {
      // 使用Bilibili的搜索API
      response = await axios.get(`/bilibili/api/search`, {
        params: {
          keyword: keyword.value,
          page: page.value
        }
      })
      rooms.value = response.data.rooms.map(item => ({
        Cover: item.Cover,
        Online: item.Online,
        RoomID: item.RoomID,
        Title: item.Title,
        UserName: item.UserName,
        Platform: '哔哩哔哩'
      }))
      hasMore.value = rooms.value.length > 0
    }
  } catch (err) {
    error.value = '搜索失败，请稍后重试'
    console.error('Error searching:', err)
  } finally {
    loading.value = false
  }
}

function nextPage() {
  page.value += 1
  search()
}

function prevPage() {
  if (page.value > 1) {
    page.value -= 1
    search()
  }
}

function toggleFollow(roomId) {
  if (isFollowed(roomId)) {
    followedRooms.value = followedRooms.value.filter((id) => id !== roomId)
  } else {
    followedRooms.value.push(roomId)
  }
}

function isFollowed(roomId) {
  return followedRooms.value.includes(roomId)
}

function parseHotNum(hn) {
  try {
    var num = parseFloat(hn.replace('万', ''))
    if (hn.includes('万')) {
      num = num * 10000
    }
    return parseInt(num, 10)
  } catch (error) {
    return -999
  }
}

function getImageUrl(cover) {
  // 检查URL是否已经包含协议，如果没有，则添加https协议
  if (cover.startsWith('//')) {
    return 'https:' + cover
  }
  return cover
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

.follow-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #007bff;
  background-color: #fff;
  border: 1px solid #007bff;
  border-radius: 25px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  margin-top: 10px;
}

.follow-button.followed {
  background-color: #007bff;
  color: white;
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