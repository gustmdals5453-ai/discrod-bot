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

// 🔥 에러 로그 강제 출력 (디버그용)
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// 웹서버 (렌더용)
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot running");
}).listen(process.env.PORT || 3000);

// DB
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB 연결됨"))
.catch(err=>{
  console.error("DB 오류:", err);
  process.exit(1);
});

// 명령어 로드
require("./핸들러/명령어로더")(client);

// 이벤트
client.on("messageCreate", require("./이벤트/메시지"));

// ❌ 인터랙션 파일 없어서 터지던 부분 제거
// client.on("interactionCreate", require("./이벤트/인터랙션"));

client.once("ready", ()=>console.log("봇 준비됨"));

client.login(process.env.TOKEN);
