<template>
  <div class="content" align="center">
    <span v-if="msgList.length == 0">快试试与AI进行对话吧</span>
    <div
      style="width: 80%; height: 60%; overflow: auto; max-height: 500px"
      id="message-box"
    >
      <div class="message">
        <div
          v-for="(msg, index) in msgList"
          :key="index"
          :class="{
            user: msg.role === 'user',
            assistant: msg.role === 'assistant',
          }"
        >
          <div>
            <div>
              <!-- <img class='role-img' v-if="msg.role === 'user'"/> -->
            </div>
            <div class="imgbox" v-if="msg.role === 'assistant'">
              <!-- <img class='role-img' /> -->
              <div class="name">闽南师范大学创新创业AI</div>
            </div>
          </div>
          <div v-highlight v-html="marked(msg.content)"></div>
        </div>
      </div>
    </div>
    <!-- <el-input type="textarea" :rows="20" resize="none" readonly="true" placeholder="与ai对话获得消息" id='message-box'> -->

    <!-- </el-input> -->
    <br /><br /><br />
    <el-input
      type="textarea"
      v-model="msgValue"
      :rows="5"
      resize="none"
      placeholder="输入内容与ai进行对话"
      style="width: 75%"
    ></el-input>

    <!-- <textarea rows="5" placeholder="请输入问题" class="text" v-model="msgValue"></textarea> -->
    <!-- <button class="btn" @click="submitMsg">发送</button>
        -->
    <el-button
      type="primary"
      @click="submitMsg"
      :disabled="this.$store.state.msgStore.isChated"
      >提交</el-button
    >
  </div>
</template>
<script>
import userImg from "@/assets/user.png";
import aiImg from "@/assets/ai.png";
import TTSRecorder from "@/common/TTSRecorder";
import { marked } from "marked";
import Vue from "vue";
export default {
  data() {
    return {
      msgDom: null,
      msgValue: "",
      msgList: [],
      ttsRecorder: new TTSRecorder(),
    };
  },

  mounted() {
    this.msgDom = document.getElementById("message-box");
    // console.log(this.msgDom)
    // console.log(this.msgDom.scrollTop + " " + this.msgDom.scrollHeight)
    this.msgList = this.$store.state.msgStore.list; // Assuming you are using Vuex for state management
    this.scroll();
  },
  methods: {
    marked(content) {
      return marked(content); // 使用本地导入的 marked
    },
    scroll() {
      this.$nextTick(() => {
        this.msgDom.scrollTop = this.msgDom.scrollHeight;
      });
    },
    async submitMsg() {
      if (this.msgValue.match(/^\s*$/)) {
        this.open3();
        return;
      }
      this.$store.dispatch("userAddMsg", this.msgValue);

      this.$store.state.msgStore.isChated = true;
      this.ttsRecorder.start(this.$store.state.msgStore, this.msgDom); // Pass msgList and msgDom to start
      this.msgValue = "";
      this.scroll();
    },
    open3() {
      this.$message({
        showClose: true,
        message: "请输入内容",
        type: "warning",
      });
    },
  },
};
</script>
<!-- <script setup>
import userImg from "@/assets/user.png"
import aiImg from "@/assets/ai.png"
import { nextTick, onMounted, ref } from 'vue'
import TTSRecorder from "@/common/TTSRecorder"
// import { userMsgStore } from '@/stores/msgStore'
// const msgStore = userMsgStore()
const msgValue = ref("")
let ttsRecorder = new TTSRecorder()
const msgList = ref([])
let msgDom = ref(null)
import { marked } from 'marked'


onMounted(()=>{
  msgDom.value = document.getElementById("message-box")
  // msgList.value = msgStore.list
  msgList.value = this.$store.state.msgStore.list
  scroll()
})

// 滚动到最底部
const scroll = () => {
  nextTick(()=>{
    msgDom.value.scrollTop = msgDom.value.scrollHeight
  })
}

// 发送消息
const submitMsg = async () => {
  this.$store.dispatch("userAddMsg",msgValue.value)
  msgValue.value = ""
  // 开始提问
  ttsRecorder.start(msgStore,msgDom)
  scroll()
}

</script> -->

<style scoped lang="less">
.content {
  height: 100%;
  position: relative;

  .message {
    top: 0;
    left: 20%;
    right: 20%;
    bottom: 150px;
    display: flex;
    overflow: hidden; /* 由于不需要滚动条，设置为 hidden */
    flex-direction: column;
    gap: 10px; /* 消息之间的间距 */
  }

  .user {
    background-color: #e6f7ff; /* Element UI 的主要色调 */
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    border-radius: 4px; /* 边角圆润 */
    border: 1px solid #d9d9d9; /* Element UI 边框颜色 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 加一些阴影来提升层次感 */
  }

  .assistant {
    background-color: #f5f5f5; /* 较轻的背景色 */
    padding: 15px;
    box-sizing: border-box;
    border-radius: 4px; /* 边角圆润 */
    border: 1px solid #d9d9d9; /* Element UI 边框颜色 */
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    text-align: left;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 同样加阴影 */
  }

  .user p,
  .assistant p {
    margin: 0; /* 消息文本的 margin 调整为 0，避免多余间距 */
  }

  .footer {
    position: absolute;
    bottom: 50px;
    left: 20%;
    right: 20%;
    display: flex;
    align-items: flex-end;
    gap: 15px;
    .text {
      width: 100%;
    }
    .btn {
      width: 100px;
      height: 40px;
      background-color: #1a60ea;
      color: white;
      border: none;
    }
  }

  @media screen and (max-width: 768px) {
    .message,
    .footer {
      left: 0;
      right: 0;
    }
    .message {
      bottom: 100px;
    }
    .footer {
      bottom: 10px;
    }
  }
}

.imgbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  .name {
    font-size: 13px;
    color: #fd919e;
    font-weight: 400;
  }
}

.role-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}
</style>
<style lang="scss" scoped></style>
