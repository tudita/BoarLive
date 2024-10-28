<template>
  <div id="app">
    <Sidebar @update-content="updateContent" />
    <div class="main-content">
      <component :is="currentComponent"></component>
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import view1 from './components/view1.vue'
import view2 from './components/view2.vue'

export default {
  components: {
    Sidebar,
    view1,
    view2
  },
  data() {
    return {
      currentComponent: null
    }
  },
  methods: {
    updateContent(componentName) {
      this.currentComponent = componentName
    }
  }
}
</script>

<style>
#app {
  display: flex;
  height: 100vh;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  background-color: #f5f5f5;
}
</style>
