<template>
  <div class="followed-rooms">
    <h1>已关注的直播间</h1>

    <!-- 关注房间列表 -->
    <div v-if="followedRooms.length > 0" class="rooms-container">
      <div v-for="room in followedRooms" :key="room.RoomID" class="room-item">
        <div class="room-card">
          <div class="room-cover" @click="showContent('Live', room.RoomID, room.Platform)">
            <img :src="room.Cover" alt="room.cover" />
            <div class="room-online">在线人数: {{ room.Online }}</div>
            <div class="room-platform">{{ room.Platform }}</div> <!-- 添加平台信息 -->
          </div>
          <div class="room-info">
            <div class="room-title">{{ room.Title }}</div>
            <div class="room-user">
              <button class="unfollow-button" @click="unfollowRoom(room)">取消关注</button>
              {{ room.UserName }}
            </div>
            <!-- 取消关注按钮 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 无关注的提示 -->
    <div v-else class="no-followed">
      <p>您还没有关注任何直播间。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { defineEmits } from 'vue'

const followedRooms = ref([])
const emit = defineEmits(['update-content'])
const sharedVariable = inject('sharedVariable') 
const sharedPlatform = inject('sharedPlatform') 

// 初始化时加载已关注的房间
onMounted(() => {
  const storedRooms = localStorage.getItem('followedRooms')
  if (storedRooms) {
    followedRooms.value = JSON.parse(storedRooms)
  }
})

function showContent(componentName, roomid, selectedCategory) {
  sharedVariable.value = roomid
  // 将selectedCategory替换成其他值
  if(selectedCategory == '虎牙直播'){
    selectedCategory = 'huya'
  }else if(selectedCategory == '斗鱼直播'){
    selectedCategory = 'douyu'
  }else if(selectedCategory == 'Bilibili'){
    selectedCategory = 'bilibili'
  }else if(selectedCategory == '抖音直播'){
    selectedCategory = 'douyin'
  }
  sharedPlatform.value = selectedCategory
  console.log('showContent:', sharedPlatform.value)
  console.log('showContent:', sharedVariable.value)
  emit('update-content', componentName)
}

// 取消关注房间
function unfollowRoom(room) {
  followedRooms.value = followedRooms.value.filter((r) => r.RoomID !== room.RoomID)
  // 更新 localStorage
  localStorage.setItem('followedRooms', JSON.stringify(followedRooms.value))
}
</script>

<style scoped>
/* 页面背景 */
.followed-rooms {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-family: 'Nunito', sans-serif;
  width: 100%;
  box-sizing: border-box;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

/* 房间列表容器 */
.rooms-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15;
  width: 100%;
  margin-top: 15px;
  max-height: 90vh; /* 设置最大高度 */
  overflow-y: auto; /* 启用垂直滚动条 */
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
  margin-bottom: 30px;
  max-width: 220px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.room-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

/* 房间封面 */
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
  color: #fff;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

.room-platform {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
}

/* 房间信息区域 */
.room-info {
  padding: 6px;
  text-align: center;
}

.room-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
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
  align-items: center;
  justify-content: center;
}

/* 取消关注按钮 */
.unfollow-button {
  padding: 4px 8px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
}

.unfollow-button:hover {
  background-color: #d32f2f;
}

.unfollow-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

/* 无关注的提示 */
.no-followed {
  text-align: center;
  font-size: 18px;
  color: #888;
}
</style>