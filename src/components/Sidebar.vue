<template>
    <transition name="slide">
        <div v-if="visible" class="sidebar">
            <h3>功能選單</h3>
            <ul>
                <li><router-link to="/"><i class="fa-solid fa-house"></i>首頁</router-link></li>
                <li><router-link to="/Portfolio">作品集</router-link></li>
                <li><router-link to="/about">關於我</router-link></li>
                <li><router-link to="/final-exam">期末考功能模擬</router-link></li>
            </ul>
        </div>
    </transition>
</template>

<script>
    export default{
        props: ['visible']
    }
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  height: 100vh; /* 永遠撐滿畫面 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 10px 0;
}

a {
  color: white;
  text-decoration: none;
}

/* 進出動畫 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 1s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>