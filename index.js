const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 렌더 유지용
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot running");
}).listen(process.env.PORT || 3000);

// DB 연결
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB 연결됨"))
.catch(console.error);

// 명령어 로드
require("./핸들러/명령어로더")(client);

// 이벤트
client.on("messageCreate", require("./이벤트/메시지"));
client.on("interactionCreate", require("./이벤트/인터랙션")); // 🔥 이거 추가

client.once("ready", ()=>console.log("봇 준비됨"));

client.login(process.env.TOKEN);
