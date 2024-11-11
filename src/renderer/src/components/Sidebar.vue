<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- <button @click="toggleSidebar">{{ isCollapsed ? '展开' : '收起' }}</button> -->
    <div v-if="!isCollapsed">
      <button @click="showContent('Recommand')">推荐直播</button>
      <button @click="showContent('Search')">搜索直播</button>
      <button @click="showContent('Test')">test</button>
      <button @click="showContent('Live')">观看直播</button>
      <button @click="showContent('FollowedRooms')">关注列表</button>
      <button @click="showContent('livetest')">livetest</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'

const emit = defineEmits(['update-content'])

function showContent(componentName) {
  emit('update-content', componentName)
}

import { ref } from 'vue'

const isCollapsed = ref(false)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
}

.sidebar button {
  background-color: transparent;
  border: none;
  color: #ffffff;
  padding: 10px;
  margin: 5px 0;
  text-align: left;
  text-decoration: none;
  display: block;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sidebar button:hover {
  background-color: #3a3d41;
}

.sidebar.collapsed {
  width: 50px;
  overflow: hidden;
}
</style>
