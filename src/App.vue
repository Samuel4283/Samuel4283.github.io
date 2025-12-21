<template>
  <div class="layout">
    <!-- 側邊欄 -->
    <Sidebar :visible="showSidebar" />

    <!-- 主要內容 -->
    <div class="main-content">

      <!-- 切換側邊按鈕 -->
       <button class="toggle-btn" @click="toggleSidebar">
        <i :class="showSidebar ? 'fas fa-angle-left' : 'fas fa-solid fa-list'" style="color: blue;"></i>
       </button>

      <router-view />
    </div>
  </div>
</template>


<script>
import Sidebar from './components/Sidebar.vue'

export default {
  components:{
    Sidebar
  },
  data(){
    return{
      showSidebar: false
    };
  },
  methods:{
    toggleSidebar(){
      this.showSidebar = !this.showSidebar;
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh; 
  position: relative;
  background-color: rgb(0, 0, 0);
}

.main-content {
  flex: 1;
  position: relative;
}

/* 側邊按鈕切換 */
.toggle-btn {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 10001;
  background-color: #fff;
  border :1px solid #ccc;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  font-size: 18px;
}
</style>
