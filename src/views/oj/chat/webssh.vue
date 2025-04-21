<template>
  <div class="terminal-container">
    <div ref="terminal"></div>
  </div>
</template>

<script>
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import WSSHClient from "./webssh";

export default {
  mounted() {
    this.openTerminal({
      operate: "connect",
      host: "172.27.143.95", //IP
      port: "22", //端口号
      username: "test", //用户名
      password: "test", //密码*/
    });
  },
  methods: {
    openTerminal(options) {
      this.terminal = new Terminal({
        cols: 97,
        rows: 37,
        cursorBlink: true, // 光标闪烁
        cursorStyle: "block", // 光标样式  null | 'block' | 'underline' | 'bar'
        scrollback: 800, //回滚
        tabStopWidth: 8, //制表宽度
        screenKeys: true,
      });

      this.client = new WSSHClient();

      this.terminal.onData((data) => {
        //键盘输入时的回调函数
        this.client.sendClientData(data);
      });

      this.terminal.open(this.$refs.terminal);
      //在页面上显示连接中...
      this.terminal.write("Connecting...");

      // 执行连接操作;
      this.client.connect({
        onError: (error) => {
          //连接失败回调
          this.terminal.write("Error: " + error + "\r\n");
        },
        onConnect: () => {
          //连接成功回调
          this.client.sendInitData(options);
        },
        onClose: () => {
          //连接关闭回调
          this.terminal.write("\rconnection closed");
        },
        onData: (data) => {
          //收到数据时回调
          this.terminal.write(data);
        },
      });
    },
  },
};
</script>

<style>
.terminal-container {
  background: black;
}
</style>
