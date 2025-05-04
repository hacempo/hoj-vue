<template>
  <div>
    <!-- 浮动球按钮 -->
    <div
      class="floating-ball"
      ref="ball"
      :style="ballStyle"
      @mousedown="startDrag"
      @touchstart.stop.prevent="startDragMobile"
    >
      <el-button
        :style="ballButtonStyle"
        type="primary"
        icon="el-icon-menu"
        circle
        @click="handleBallClick"
      ></el-button>
    </div>

    <!-- 侧边栏 -->
    <transition name="el-fade-in">
      <div v-if="sidebarVisible" class="floating-sidebar">
        <el-card shadow="hover" class="sidebar-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>快捷功能</span>
            <el-button icon="el-icon-close" @click="sidebarVisible = false" circle plain size="small" />
          </div>
          <el-divider></el-divider>
          <el-button type="text" icon="el-icon-message" @click="openWindow('AI聊天', '/chat')">AI聊天</el-button>
          <el-button type="text" icon="el-icon-s-promotion" @click="openWindow('终端', '/webssh')">终端</el-button>
          <el-button type="text" icon="el-icon-edit-outline" @click="openWindow('图论编辑器', '/grapheditor')">图论编辑器</el-button>
        </el-card>
      </div>
    </transition>

    <!-- 弹出的窗口 -->
    <transition name="el-fade-in">
      <div
        v-if="cardVisible"
        class="floating-card"
        :style="cardStyle"
      >
        <el-card class="card-content" shadow="hover">
          <div
            class="card-header"
            @mousedown.stop.prevent="startCardDrag"
            style="display: flex; justify-content: space-between; align-items: center; cursor: move;"
          >
            <span>{{ cardTitle }}</span>
            <el-button icon="el-icon-close" @click="closeCard" circle plain size="small" />
          </div>
          <el-divider></el-divider>
          <iframe v-if="iframeUrl" :src="iframeUrl" frameborder="0" class="iframe-content"></iframe>
        </el-card>
        <div class="resize-handle" @mousedown.stop.prevent="startResize"></div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarVisible: false,
      cardVisible: false,
      cardTitle: '',
      iframeUrl: '',
      position: { top: 200, left: 20 },
      isDragging: false,
      offset: { x: 0, y: 0 },
      isMobile: false,
      suppressClick: false,
      cardStyleTop: 100,
      cardStyleLeft: window.innerWidth / 2 - 200,
      cardSize: { width: 400, height: 300 },
      isCardDragging: false,
      cardDragOffset: { x: 0, y: 0 },
      isResizing: false,
      resizeStart: { x: 0, y: 0 },
    }
  },
  computed: {
    ballStyle() {
      return {
        position: 'fixed',
        top: this.position.top + 'px',
        left: this.position.left + 'px',
        width: this.isMobile ? '32px' : '40px',
        height: this.isMobile ? '32px' : '40px',
        zIndex: 9999,
        cursor: 'move',
      }
    },
    ballButtonStyle() {
      return {
        width: this.isMobile ? '32px' : '40px',
        height: this.isMobile ? '32px' : '40px',
        fontSize: this.isMobile ? '14px' : '16px',
      }
    },
    cardStyle() {
      return {
        position: 'fixed',
        top: this.cardStyleTop + 'px',
        left: this.cardStyleLeft + 'px',
        width: this.cardSize.width + 'px',
        height: this.cardSize.height + 'px',
        zIndex: 9999,
      }
    },
  },
  mounted() {
    this.isMobile = window.innerWidth < 768
    const saved = localStorage.getItem('floatingBallPosition')
    if (saved) {
      const pos = JSON.parse(saved)
      this.position.top = pos.top
      this.position.left = pos.left
    }
    window.addEventListener('mousemove', this.onDrag)
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('touchmove', this.onDragMobile)
    window.addEventListener('touchend', this.stopDrag)
    window.addEventListener('mousemove', this.onCardMove)
    window.addEventListener('mouseup', this.stopCardDrag)
    window.addEventListener('mousemove', this.onResizing)
    window.addEventListener('mouseup', this.stopResize)
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('touchmove', this.onDragMobile)
    window.removeEventListener('touchend', this.stopDrag)
    window.removeEventListener('mousemove', this.onCardMove)
    window.removeEventListener('mouseup', this.stopCardDrag)
    window.removeEventListener('mousemove', this.onResizing)
    window.removeEventListener('mouseup', this.stopResize)
  },
  methods: {
    handleBallClick() {
      if (!this.suppressClick) {
        this.sidebarVisible = !this.sidebarVisible
      }
      this.suppressClick = false
    },
    startDrag(e) {
      this.isDragging = true
      this.offset.x = e.clientX - this.position.left
      this.offset.y = e.clientY - this.position.top
      this.suppressClick = false
    },
    onDrag(e) {
      if (this.isDragging) {
        this.position.left = e.clientX - this.offset.x
        this.position.top = e.clientY - this.offset.y
        this.suppressClick = true
      }
    },
    startDragMobile(e) {
      this.isDragging = true
      const touch = e.touches[0]
      this.offset.x = touch.clientX - this.position.left
      this.offset.y = touch.clientY - this.position.top
      this.suppressClick = false
    },
    onDragMobile(e) {
      if (this.isDragging) {
        const touch = e.touches[0]
        this.position.left = touch.clientX - this.offset.x
        this.position.top = touch.clientY - this.offset.y
        this.suppressClick = true
      }
    },
    stopDrag() {
      if (!this.isDragging) return
      this.isDragging = false
      this.$nextTick(() => {
        const ball = this.$refs.ball
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        const ballWidth = ball.offsetWidth
        const ballHeight = ball.offsetHeight
        const padding = 10
        this.position.left = this.position.left + ballWidth / 2 < screenWidth / 2 ? padding : screenWidth - ballWidth - padding
        this.position.top = Math.min(Math.max(this.position.top, padding), screenHeight - ballHeight - padding)
        localStorage.setItem('floatingBallPosition', JSON.stringify(this.position))
      })
    },
    openWindow(title, url) {
      this.cardTitle = title
      this.iframeUrl = url
      this.cardVisible = true
      this.sidebarVisible = false
    },
    closeCard() {
      this.cardVisible = false
      this.iframeUrl = ''
    },
    startCardDrag(e) {
      this.isCardDragging = true
      this.cardDragOffset.x = e.clientX - this.cardStyleLeft
      this.cardDragOffset.y = e.clientY - this.cardStyleTop
    },
    onCardMove(e) {
      if (this.isCardDragging) {
        this.cardStyleLeft = e.clientX - this.cardDragOffset.x
        this.cardStyleTop = e.clientY - this.cardDragOffset.y
      }
    },
    stopCardDrag() {
      this.isCardDragging = false
    },
    startResize(e) {
      this.isResizing = true
      this.resizeStart.x = e.clientX
      this.resizeStart.y = e.clientY
    },
    onResizing(e) {
      if (this.isResizing) {
        const deltaX = e.clientX - this.resizeStart.x
        const deltaY = e.clientY - this.resizeStart.y
        this.cardSize.width = Math.max(300, this.cardSize.width + deltaX)
        this.cardSize.height = Math.max(200, this.cardSize.height + deltaY)
        this.resizeStart.x = e.clientX
        this.resizeStart.y = e.clientY
      }
    },
    stopResize() {
      this.isResizing = false
    },
  }
}
</script>

<style scoped>
.floating-sidebar {
  position: fixed;
  top: 60px;
  left: 20px;
  width: 300px;
  z-index: 9998;
}

.sidebar-card {
  padding: 16px;
  box-sizing: border-box;
}

.floating-card {
  z-index: 9999;
}

.card-content {
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: black 1px solid;
}

.iframe-content {
  width: 100%;
  height: calc(100% - 40px);
  border: none;
  border-radius: 8px;
  margin-top: 8px;
}

.resize-handle {
  width: 14px;
  height: 14px;
  background-color: transparent;
  position: absolute;
  bottom: 2px;
  right: 2px;
  cursor: se-resize;
  z-index: 10;
}
</style>
