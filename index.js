const { Client, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel] // DM 대응
});

// 렌더 유지용
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot running");
}).listen(process.env.PORT || 3000);

// DB 연결
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB 연결됨"))
.catch(err=>{
  console.error("DB 오류:", err);
  process.exit(1);
});

// 명령어 로드
require("./핸들러/명령어로더")(client);

// 이벤트 등록
client.on("messageCreate", require("./이벤트/메시지"));
client.on("messageCreate", require("./이벤트/신고")); // 🔥 추가됨
client.on("interactionCreate", require("./이벤트/인터랙션"));

// 준비 완료
client.once("ready", ()=>{
  console.log(`봇 로그인됨: ${client.user.tag}`);
});

// 에러 방지
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// 로그인
client.login(process.env.TOKEN);
