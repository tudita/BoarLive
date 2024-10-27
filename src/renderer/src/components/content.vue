<template>
  <div class="content">
    <component :is="currentView" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  view: {
    type: String,
    required: true
  }
})

const currentView = ref(props.view)

watch(
  () => props.view,
  (newView) => {
    currentView.value = newView
  }
)
</script>

<style>
.content {
  flex: 1;
  padding: 20px;
}
</style>
