<template>
    <div class="welcome-container">
      <h1>这个地方放一个网站1</h1>
      <p>现在什么都没做。</p>
    </div>
  </template>

<script>
export default {
  name: 'view1'
}
</script>


<style>
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 使容器高度占满视口高度 */
  width: 100vw; /* 使容器宽度占满视口宽度 */
  background-color: #f0f8ff; /* 柔和的背景色 */
  color: #333; /* 高级的文本颜色 */
  text-align: center;
}

.welcome-container h1 {
  font-size: 2.5em;
  margin-bottom: 0.5em;
}

.welcome-container p {
  font-size: 1.2em;
}
</style>