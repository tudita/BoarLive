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
            <div class="room-status">{{ room.onlive ? '已开播' : '未开播' }}</div> <!-- 添加开播状态信息 -->
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
onMounted(async () => {
  const storedRooms = localStorage.getItem('followedRooms')
  if (storedRooms) {
    followedRooms.value = JSON.parse(storedRooms)
    console.log('storedRooms:', storedRooms)
    await checkRoomDetails()
    console.log('followedRooms:', followedRooms.value)
  }
})

// 遍历followedRooms，检查对应的roomID是否有开播
async function checkRoomDetails() {
  // console.log('Checking room details...') // 调试日志
  await Promise.all(followedRooms.value.map(async (room) => {
    try {
      console.log(`Checking room detail for RoomID: ${room.RoomID}`) // 调试日志
      const roomDetail = await getroomdetail(room.RoomID, room.Platform)
      console.log('final roomDetail:', roomDetail)
      if (roomDetail === false) {
        console.log(`Room detail not found for RoomID: ${room.RoomID}`)
        room.onlive = false
      } else {
        console.log(`Room detail found for RoomID: ${room.RoomID}`)
        room.onlive = true
      }
    } catch (error) {
      console.error(`Error fetching room detail for RoomID: ${room.RoomID}`, error)
      room.onlive = false
    }
  }))
  localStorage.setItem('followedRooms', JSON.stringify(followedRooms.value))
}

function showContent(componentName, roomid, selectedCategory) {
  sharedVariable.value = roomid
  // 将selectedCategory替换成其他值
  if (selectedCategory == '虎牙直播') {
    selectedCategory = 'huya'
  } else if (selectedCategory == '斗鱼直播') {
    selectedCategory = 'douyu'
  } else if (selectedCategory == 'Bilibili') {
    selectedCategory = 'bilibili'
  } else if (selectedCategory == '抖音直播') {
    selectedCategory = 'douyin'
  }
  sharedPlatform.value = selectedCategory
  emit('update-content', componentName)
}

// 取消关注房间
function unfollowRoom(room) {
  followedRooms.value = followedRooms.value.filter((r) => r.RoomID !== room.RoomID)
  // 更新 localStorage
  localStorage.setItem('followedRooms', JSON.stringify(followedRooms.value))
}

async function getroomdetail(roomid, platform) {
  try {
    const dataToProcess = roomid
    let Platform = ref(null)
    const result = ref(null)
    // console.log('input platform:', platform)
    if (platform == '虎牙直播') {
      Platform = 'huya'
    } else if (platform == '斗鱼直播') {
      Platform = 'douyu'
    } else if (platform == 'Bilibili') {
      Platform = 'bilibili'
    } else if (platform == '抖音直播') {
      Platform = 'douyin'
    }
    // console.log('Platform:', Platform)
    if (Platform == 'huya') {
      window.electronAPI.huya_getLiveStatus(dataToProcess)
      console.log('Data sent to main process for huya_getRoomDetail')
    } else if (Platform == 'douyu') {
      // 添加斗鱼的处理逻辑
    } else if (Platform == 'bilibili') {
      window.electronAPI.bili_getLiveStatus(dataToProcess)
      console.log('Data sent to main process for bili_getRoomDetail')
    } else if (Platform == 'douyin') {
      window.electronAPI.douyin_getLiveStatus(dataToProcess)
      console.log('Data sent to main process for douyin_getRoomDetail')
    }
    result.value = await receiveRoomDetail(Platform)
    console.log('result:', result.value)
    return result.value
  } catch (error) {
    console.error('Error processing data:', error)
    return false
  }
}

function receiveRoomDetail(Platform) {
  return new Promise((resolve, reject) => {
    console.log('receive_platform', Platform)
    if (Platform == 'huya') {
      window.electronAPI.huya_receiveLiveStatus((result) => {
        console.log('huya live status:', result)
        resolve(result)
      })
    } else if (Platform == 'douyu') {
      // 添加斗鱼的处理逻辑
    } else if (Platform == 'bilibili') {
      window.electronAPI.bili_receiveLiveStatus((result) => {
        console.log('bilibili live status:', result)
        resolve(result)
      })
    } else if (Platform == 'douyin') {
      window.electronAPI.douyin_receiveLiveStatus((result) => {
        console.log('douyin live status:', result)
        resolve(result)
      })
    }
  }).catch((error) => {
    console.error('Error receiving live status:', error)
  })
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
  gap: 15px;
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

.room-status {
  position: absolute;
  top: 8px;
  right: 8px;
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