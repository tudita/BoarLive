<template>
  <div id="app">
    <div id="display">
      <div id="sidebar">
        <Sidebar @update-content="updateContent" />
      </div>
      <div class="main-content">
        <view1 @update-content="updateContent" v-if="currentComponent === 'Recommand'" />
        <view2 @update-content="updateContent" v-if="currentComponent === 'Search'" />
        <view3 @update-content="updateContent" v-if="currentComponent === 'Test'" />
        <view4 v-if="currentComponent === 'Live'" />
        <view5 v-if="currentComponent === 'FollowedRooms'" />
        <component :is=""></component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import Sidebar from './components/Sidebar.vue'
import view1 from './components/Recommand.vue'
import view2 from './components/Search.vue'
import view3 from './components/view_test.vue'
import view4 from './components/Live.vue'
import view5 from './components/FollowedRooms.vue'

const currentComponent = ref('Recommand')
const sharedVariable = ref(null)
const sharedPlatform = ref(null)

function updateContent(componentName) {
  currentComponent.value = componentName
  /*输出当前组件名称*/
  console.log(currentComponent.value)
}

provide('sharedVariable', sharedVariable)
provide('sharedPlatform', sharedPlatform)

const components = {
  Sidebar,
  view1,
  view2,
  view3,
  view4,
  view5
}
</script>

<style>
#app {
  height: 100%;
  width: 100vw;
}
#display {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
}
#sidebar {
  width: 105px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0px;
  box-sizing: border-box;
}
.main-content {
  flex-grow: 1;
  height: 100%;
  padding: 0px;
  background-color: #fafafa; /* 柔和且高级的背景色 */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
