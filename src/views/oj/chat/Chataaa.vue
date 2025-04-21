<!-- <template>
    <div>
      <el-row :gutter="20">
        <el-col>
          <el-card class="container">
            <div slot="header"  align="center">
              <el-button type="primary" @click="getChat">主要按钮</el-button>
            </div>

          </el-card>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script>
  import utils from '@/common/utils';
  import { JUDGE_STATUS } from '@/common/constants';
  import { addCodeBtn } from '@/common/codeblock';
  import { Client } from "@gradio/client";


  const Highlight = () => import('@/components/oj/common/Highlight');
  export default {
    components: {
      Highlight,
    },
    data() {
      return {
        languages: [],
        JUDGE_STATUS: JUDGE_STATUS,
      };
    },
    mounted() {
      
      setTimeout(() => {
        this.$nextTick((_) => {
          addCodeBtn();
        });
      }, 200);
    },
    methods: {
      getStatusColor(status) {
        return 'el-tag el-tag--medium status-' + JUDGE_STATUS[status].color;
      },
      async getChat() {
        console.log("clicked");
        const client = await Client.connect("https://s5k.cn/api/v1/studio/Datawhale/Dw_spark_baseline/gradio/");
        const result = await client.predict("/chat", { 		
          chat_query: "Hello!!", 		
          chat_history: [["Hello!",None]],
          prompt_type: "中译英", 
        });
        console.log(result.data);
      }
    },
    beforeRouteEnter(to, from, next) {
      utils.getLanguages(true).then((languages) => {
        next((vm) => {
          vm.languages = languages.filter(function(element, index, array) {
            return element.oj == 'ME';
          });
        });
      });
    },
    watch: {
      languages(newVal, oldVal) {
        if (newVal.length > 0) {
          this.$nextTick((_) => {
            addCodeBtn();
          });
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    margin-bottom: 20px;
  }
  .container .content {
    font-size: 16px;
    margin: 0 50px 20px 50px;
  }
  .container .content pre {
    padding: 5px 10px;
    white-space: pre-wrap;
    margin-top: 15px;
    margin-bottom: 15px;
    background: #f8f8f9;
    border: 1px dashed #e9eaec;
  }
  @media screen and (max-width: 768px) {
    .container .content {
      font-size: 1rem;
      margin: 0 5px;
    }
  }
  ul {
    list-style: disc;
    padding-inline-start: 0px;
  }
  li {
    line-height: 2;
  }
  li .title {
    font-weight: 600;
    font-size: 1rem;
  }
  .result li {
    list-style-type: none;
    margin-top: 8px;
  }
  </style>
   -->