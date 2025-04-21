<template>
  <div>
    <!-- 控制选项 -->
    <div>
      <label>
        <input type="checkbox" v-model="isDirected" @change="renderGraph" />
        有向图
      </label>
      <label>
        <input type="checkbox" v-model="isOneBased" @change="renderGraph" />
        1-based 索引
      </label>
    </div>

    <!-- 输入框 -->
    <textarea v-model="inputData" rows="6" cols="40"></textarea>
    <button @click="renderGraph">生成图</button>

    <!-- Cytoscape 渲染区域 -->
    <div
      ref="cyContainer"
      style="width: 500px; height: 500px; border: 1px solid black"
    ></div>
  </div>
</template>

<script>
import cytoscape from "cytoscape";

export default {
  data() {
    return {
      inputData: `5 4
1 2 10
1 3 5
3 4 2
3 5 8`,
      cy: null,
      isDirected: false, // 是否是有向图
      isOneBased: true, // 是否使用 1-based 编号
      updateTimeout: null,
    };
  },
  mounted() {
    this.initGraph();
  },
  methods: {
    parseGraphData(text) {
      const lines = text.trim().split("\n");
      const [n, m] = lines[0].split(" ").map(Number);
      const edges = lines.slice(1).map((line) => line.split(" ").map(Number));

      const elements = [];
      for (let i = 0; i < n; i++) {
        const nodeId = this.isOneBased ? String(i + 1) : String(i);
        elements.push({ data: { id: nodeId, label: nodeId } });
      }

      edges.forEach(([u, v, w]) => {
        const nodeU = this.isOneBased ? String(u) : String(u - 1);
        const nodeV = this.isOneBased ? String(v) : String(v - 1);
        const edgeData = {
          source: nodeU,
          target: nodeV,
          label: w !== undefined ? String(w) : "",
        };

        elements.push({ data: edgeData });

        if (!this.isDirected) {
          elements.push({
            data: {
              source: nodeV,
              target: nodeU,
              label: w !== undefined ? String(w) : "",
            },
          });
        }
      });

      return elements;
    },
    initGraph() {
      this.cy = cytoscape({
        container: this.$refs.cyContainer,
        elements: this.parseGraphData(this.inputData),
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "background-color": "#007bff",
              color: "#fff",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#ccc",
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
              "arrow-scale": 1.5,
              label: "data(label)",
            },
          },
        ],
        layout: { name: "grid" },
      });
    },
    renderGraph() {
      if (!this.cy) return;
      if (this.updateTimeout) clearTimeout(this.updateTimeout);

      this.updateTimeout = setTimeout(() => {
        this.cy.json({ elements: this.parseGraphData(this.inputData) });

        // 如果是无向图，隐藏箭头
        this.cy
          .style()
          .selector("edge")
          .style({
            "target-arrow-shape": this.isDirected ? "triangle" : "none",
          })
          .update();

        this.cy.layout({ name: "grid" }).run();
      }, 100);
    },
  },
};
</script>

<style>
#cy {
  margin-top: 10px;
}
</style>
