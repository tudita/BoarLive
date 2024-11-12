<template>
  <div class="live-search">
    <!-- 搜索范围选择框和搜索框 -->
    <div class="search-bar">
      <!-- 搜索范围选择框 -->
      <div class="search-range">
        <label for="platform" class="search-range-label">搜索平台：</label>
        <select id="platform" v-model="selectedPlatform" class="search-range-select">
          <option value="huya">虎牙</option>
          <!-- <option value="douyu">斗鱼</option> -->
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
    <div ref="roomsContainer" class="rooms-container">
      <div v-for="room in rooms" :key="room.RoomID" class="room-item">
        <div class="room-card">
          <div class="room-cover" @click="showContent('Live', room.RoomID)">
            <img :src="room.Cover" alt="封面" />
            <div class="room-online">在线人数: {{ room.Online }}</div>
          </div>
          <div class="room-info">
            <div class="room-title" v-if="room.Title">{{ room.Title }}</div>
            <div class="room-user">
              <button
                class="follow-button"
                
                @click="toggleFollow(room)"
              >
                {{ isFollowed(room) ? '已关注' : '关注' }}
              </button>
              {{ room.UserName }}
            </div>
          </div>          
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="rooms.length > 0" class="pagination">
      <button class="paginationButton" :disabled="page.value === 1" @click="prevPage">上一页</button>
      <span>当前页: {{ page }}</span>
      <button class="paginationButton" :disabled="!hasMore" @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
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
const sharedPlatform = inject('sharedPlatform') 

function showContent(componentName, roomid) {
  sharedVariable.value = roomid
  sharedPlatform.value = selectedPlatform.value
  emit('update-content', componentName)
}

async function search() {
  // console.log('page', page.value)
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
      window.electronAPI.bili_getSearch(keyword.value, page.value)
      console.log('Data sent to main process for processing')
      window.electronAPI.bili_receiveSearch((response) => {
        console.log('get search:', response)
        ans.value = response
        rooms.value = ans.value.Rooms.map(item => ({
          Cover: "//images.weserv.nl/?url=" + item.Cover,
          Online: item.Online,
          RoomID: item.RoomID,
          Title: item.Title,
          UserName: item.UserName,
          Platform: 'Bilibili'
        }))
        hasMore.value = ans.value.HasMore
      })
    } else if(selectedPlatform.value === 'douyin'){
      // 使用抖音的搜索API
      window.electronAPI.douyin_getSearch(keyword.value, page.value)
      console.log('Data sent to main process for processing')
      window.electronAPI.douyin_receiveSearch((response) => {
        console.log('get search:', response)
        ans.value = response
        rooms.value = ans.value.Rooms.map(item => ({
          Cover: item.Cover,
          Online: item.Online,
          RoomID: item.RoomID,
          Title: item.Title,
          UserName: item.UserName,
          Platform: '抖音直播'
        }))
        hasMore.value = ans.value.HasMore
      })
    }
  }
  catch (err) {
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

// 关注/取消关注
function toggleFollow(room) {
  const index = followedRooms.value.findIndex((r) => r.RoomID === room.RoomID)
  if (index === -1) {
    followedRooms.value.push(room) // 添加到已关注列表
  } else {
    followedRooms.value.splice(index, 1) // 从已关注列表中移除
  }
  localStorage.setItem('followedRooms', JSON.stringify(followedRooms.value)) // 更新 localStorage
}

// 检查是否已关注
function isFollowed(room) {
  return followedRooms.value.some((r) => r.RoomID === room.RoomID)
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: 'Nunito', sans-serif;
  width: 100%;
  box-sizing: border-box;
}

.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 10px;
  padding: 0 10px;
  z-index: 10;
  position: relative;
}

.search-range {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.search-range-label {
  font-size: 16px;
  color: #333;
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
  padding: 10px 18px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #0056b3;
}

.loading,
.error {
  text-align: center;
  font-size: 16px;
  color: #777;
}

.rooms-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  width: 100%;
  margin-top: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

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
  max-width: 220;
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.room-cover {
  position: relative;
  width: 100%;
  height: 140px; 
  overflow: hidden;
}

.room-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-online {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.room-info {
  padding: 6px;
  text-align: center;
}

.room-title {
  font-size: 14px;
  font-weight: bold;
  color: #b22727;
  margin-bottom: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.room-user {
  font-size: 16px;
  color: #888;
  margin-bottom: 3px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.follow-button {
  padding: 4px 8px; /* 缩小关注按钮 */
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
}

.follow-button:hover {
  background-color: #0056b3;
}

.follow-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination {
  color: rgb(21, 20, 20);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.paginationButton {
  padding: 4 8px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
}

.pagination button {
  padding: 4px 8px;
  margin: 0 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.pagination button:hover {
  background-color: #0056b3; /* 鼠标悬停时的背景色 */
}

.pagination button:active {
  background-color: #0056b3; /* 鼠标点击时的背景色 */
  transform: scale(0.98); /* 点击时的缩放效果，使按钮看起来被按下 */
}

.pagination button:disabled {
  cursor: not-allowed;
  background-color: #ccc;
}
</style>