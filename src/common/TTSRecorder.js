import CryptoJS from "crypto-js"
import store from "../store"
// 可以通过 https://console.xfyun.cn/app/create 创建应用后获取APPID、API_SECRET、API_KEY
const APPID = 'a667bb67'
const API_SECRET = 'MzFjODM2NWE0M2I3ZDNmZDM0ODQxNjQz'
const API_KEY = 'ff3e85533547550c7bc6916b8324ae79'
let total_res = "";

function getWebsocketUrl() {
    return new Promise((resolve, reject) => {
        var apiKey = API_KEY
        var apiSecret = API_SECRET
        var url = 'wss://spark-api.xf-yun.com/v3.5/chat'
        var host = location.host
        var date = new Date().toGMTString()
        var algorithm = 'hmac-sha256'
        var headers = 'host date request-line'
        var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`
        var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
        var signature = CryptoJS.enc.Base64.stringify(signatureSha)
        var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        var authorization = btoa(authorizationOrigin)
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
        resolve(url)
    })
}


export default class TTSRecorder {
    constructor({appId = APPID} = {}) {
        this.appId = appId
        this.msgStore = null
        this.msgDom = null
    }

    // 连接websocket
    connectWebSocket() {
        return getWebsocketUrl().then(url => {
            let ttsWS
            if ('WebSocket' in window) {
                ttsWS = new WebSocket(url)
            } else if ('MozWebSocket' in window) {
                ttsWS = new MozWebSocket(url)
            } else {
                alert('浏览器不支持WebSocket')
                return
            }
            this.ttsWS = ttsWS
            ttsWS.onopen = e => {
                this.webSocketSend()
            }
            ttsWS.onmessage = e => {
                this.result(e.data)
            }
            ttsWS.onerror = e => {
                alert('WebSocket报错，请f12查看详情')
                console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
            }
            ttsWS.onclose = e => {
                // console.log(e)
            }
        })
    }


    // websocket发送数据
    webSocketSend() {
        var params = {
            "header": {
                "app_id": this.appId,
            },
            "parameter": {
                "chat": {
                    // 指定访问的领域,general指向V1.5版本,generalv2指向V2版本,generalv3指向V3版本 。
                    // 注意：不同的取值对应的url也不一样！
                    "domain": "generalv3.5",
                    // 核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
                    "temperature": 0.5,
                    // 模型回答的tokens的最大长度
                    "max_tokens": 500
                }
            },
            "payload": {
                "message": {
                    "text": this.msgStore.list
                    // "text": this.$store.state.msgStore.list
                }
            }
        }
        // console.log(params, '请求的参数')
        this.ttsWS.send(JSON.stringify(params))
    }

    start(msgStore, msgDom) {
        this.msgStore = msgStore
        this.msgDom = msgDom
        total_res = ""; // 请空回答历史
        this.connectWebSocket().then(r => {
        })
    }

    // websocket接收数据的处理
    result(resultData) {
        // console.log(resultData)
        let jsonData = JSON.parse(resultData)
        // console.log(jsonData)
        jsonData.payload.choices.text.forEach(res => {
            // this.msgStore.aiAddMsg(res.content, jsonData.header.status)
            store.dispatch("aiAddMsg",{'content':res.content, 'status':jsonData.header.status});
            if(this.msgDom)this.msgDom.scrollTop = this.msgDom.scrollHeight + 500
        })
        // 提问失败
        if (jsonData.header.code !== 0) {
            alert(`提问失败: ${jsonData.header.code}:${jsonData.header.message}`)
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            this.msgStore.isChated = false;
            return
        }
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            // 关闭WebSocket
            this.msgStore.isChated = false;
            this.ttsWS.close()
        }
    }
}
