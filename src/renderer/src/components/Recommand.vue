<template>
  <div class="live-search">
    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="{ active: category.id === selectedCategory }"
        @click="changeCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 房间列表 -->
    <div class="rooms-container">
      <div v-for="room in rooms" :key="room.RoomID" class="room-item">
        <div class="room-card" >
          <div class="room-cover" @click="showContent('Live', room.RoomID)">
            <img :src="room.Cover" alt="room.cover" />
            <div class="room-online">在线人数: {{ room.Online }}</div>
          </div>
          <div class="room-info">
            <div class="room-title">{{ room.Title }}</div>
            <div class="room-user">{{ room.UserName }}</div>
            <!-- 关注按钮 -->
            <button class="follow-button" @click="toggleFollow(room)">
              {{ isFollowed(room) ? '已关注' : '关注' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多按钮 -->
    <button :disabled="!hasMore" class="load-more-button" @click="loadMoreRooms">加载更多</button>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'
import { defineEmits } from 'vue'

const categories = ref([
  { id: 'huya', name: '虎牙' },
  { id: 'douyu', name: '斗鱼' },
  { id: 'bilibili', name: 'bilibili' },
  { id: 'douyin', name: '抖音' }
])

const emit = defineEmits(['update-content'])
const sharedVariable = inject('sharedVariable') 

const selectedCategory = ref('huya') // 默认选中虎牙
const page = ref(1)
const rooms = ref([])
const hasMore = ref(true)
const ans = ref(null)
const followedRooms = ref(JSON.parse(localStorage.getItem('followedRooms')) || []) // 已关注房间列表


// 初始化时获取房间数据
onMounted(() => {
  fetchRooms()
})

// 更新分类并加载新数据
function changeCategory(categoryId) {
  selectedCategory.value = categoryId
  page.value = 1 // 重置页面为第一页
  rooms.value = [] // 清空当前房间列表
  fetchRooms()
}

function showContent(componentName, roomid) {
  sharedVariable.value = roomid
  emit('update-content', componentName)
}

// 获取房间数据
async function fetchRooms() {
  try {
    console.log(selectedCategory.value)
    if (selectedCategory.value === 'huya') {
      window.electronAPI.huya_getRecommendRooms(page.value)
      console.log('Data sent to main process for processing')
      window.electronAPI.huya_receiveRecommendRooms(async (response) => {
        console.log('get recommand', response)
        ans.value = response
        console.log('ansrooms:', ans.value)
        rooms.value = ans.value.Rooms.map(item => ({
          Cover: item.Cover,
          Online: item.Online,
          RoomID: item.RoomID,
          Title: item.Title,
          UserName: item.UserName,
          Platform: '虎牙直播'
        }))
      })
    } else if (selectedCategory.value === 'douyu') {
      const result = await axios.get(`/douyu/japi/weblist/apinc/allpage/6/${page.value}`)
      const data = result.data
      console.log(data)
      rooms.value = data.data.rl.map((item) => ({
        Cover: item.rs16,
        Online: parseInt(item.ol, 10),
        RoomID: item.rid,
        Title: item.rn,
        UserName: item.nn
      }))
    } else if (selectedCategory.value === 'bilibili') {
      const response = await axios.get(`/bilibili1/room/v1/Area/getListByAreaID`, {
        params: {
          areaId: 0,
          sort: 'online',
          pageSize: 30,
          page: page.value
        },
        headers: {
          /* 这里添加你的请求头 */
        }
      })
      const data = response.data
      console.log('API 调用成功:', data)
      hasMore.value = data.data.length > 0
      rooms.value = data.data.map((item) => ({
        Cover: item.cover,
        Online: parseInt(item.online, 10),
        RoomID: item.roomid,
        Title: item.title,
        UserName: item.uname
      }))
      console.log('封面', rooms.value)
    } else if (selectedCategory.value === 'douyin') {
      const response = await axios.get('/douyin1/webcast/web/partition/detail/room/', {
        params: {
          aid: 6383,
          app_name: 'douyin_web',
          live_id: 1,
          device_platform: 'web',
          count: 15,
          offset: (page.value - 1) * 15,
          partition: 720,
          partition_type: 1
        }
      })
      const data = response.data
      console.log('API 调用成功:', data)
      hasMore.value = data.data.length > 0
      rooms.value = data.data.map((item) => ({
        Cover: item.room.cover.url_list[0],
        Online: item.room.room_view_stats?.display_value || 0,
        RoomID: item.web_rid,
        Title: item.room.title,
        UserName: item.room.owner.nickname
      }))
    }
  } catch (error) {
    console.error('获取房间数据失败', error)
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
// 加载更多房间
function loadMoreRooms() {
  page.value += 1
  fetchRooms()
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

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.category-tabs button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.category-tabs button.active {
  background-color: #007bff;
  color: white;
}

.category-tabs button:hover {
  background-color: #ddd;
}

/* 房间列表容器 */
.rooms-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* 每行最多显示适应宽度的卡片 */
  gap: 20px;
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

/* 关注按钮 */
.follow-button {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

.follow-button:hover {
  background-color: #0056b3;
}

.follow-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
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
