
import { Client } from "@gradio/client";

const client = await Client.connect("https://s5k.cn/api/v1/studio/Datawhale/Dw_spark_baseline/gradio/");
const result = await client.predict("/chat", { 		
    chat_query: "Hello!!", 		
    chat_history: [["Hello!",None]],
    prompt_type: "中译英", 
});
console.log(result.data);

