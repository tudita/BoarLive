<template>
  <div id="app">
    <div id="display">
      <div id="sidebar">
        <Sidebar @update-content="updateContent" />
      </div>
      <div class="main-content">
        <view1 v-if="currentComponent === 'view1'" />
        <view2 v-if="currentComponent === 'view2'" />
        <component :is=""></component>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import view1 from './components/view1.vue'
import view2 from './components/view2.vue'

const currentComponent = ref('view1')

function updateContent(componentName) {
  currentComponent.value = componentName
  /*输出当前组件名称*/
  console.log(currentComponent.value)
}
const components = {
  Sidebar,
  view1,
  view2
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
  background-color: #e0e3da; /* 柔和且高级的背景色 */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
