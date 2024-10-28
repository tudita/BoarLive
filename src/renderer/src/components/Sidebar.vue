<template>
  <div class="sidebar">
    <button @click="showContent('view1')">显示内容1</button>
    <button @click="showContent('view2')">显示内容2</button>
  </div>
</template>

<script>
export default {
  methods: {
    showContent(componentName) {
      this.$emit('update-content', componentName)
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
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
</style>
