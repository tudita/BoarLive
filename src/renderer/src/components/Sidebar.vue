<template>
  <div class="sidebar">
    <button @click="selectView('view1')">View 1</button>
    <button @click="selectView('view2')">View 2</button>
    <button @click="selectView('view3')">View 3</button>
    <button @click="selectView('view4')">View 4</button>
  </div>
</template>

<script setup>
const emit = defineEmits(['update:view'])

const selectView = (view) => {
  emit('update:view', view)
}
</script>

<style>
.sidebar {
  width: 200px;
  background-color: #333;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.sidebar button {
  background: none;
  border: none;
  color: white;
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
}

.sidebar button:hover {
  background-color: #444;
}
</style>
