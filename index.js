const { Client, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

// ================== 주식 모델 ==================
const Stock = require("./모델/주식");

// ================== 주식 자동 변동 ==================
const stockUpdate = require("./이벤트/주식변동");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel]
});

// ================== 렌더 유지용 ==================
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot running");
}).listen(process.env.PORT || 3000);

// ================== DB 연결 ==================
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB 연결됨"))
.catch(err=>{
  console.error("DB 오류:", err);
  process.exit(1);
});

// ================== 명령어 로드 ==================
require("./핸들러/명령어로더")(client);

// ================== 이벤트 ==================
client.on("messageCreate", require("./이벤트/메시지"));
client.on("interactionCreate", require("./이벤트/인터랙션"));

// ================== 기본 주식 생성 ==================
async function createStocks() {

  const stocks = [

    {
      name:"스파이전자",
      code:"SPY",
      price:5000
    },

    {
      name:"다오코드",
      code:"DAEO",
      price:3000
    },

    {
      name:"메테오블록스",
      code:"METEOR",
      price:4000
    }

  ];

  for (const data of stocks) {

    const exists = await Stock.findOne({
      code:data.code
    });

    if (!exists) {

      await Stock.create({
        ...data,
        change:0
      });

    }
  }
}

// ================== 봇 준비 ==================
client.once("ready", async ()=>{

  console.log(`봇 로그인됨: ${client.user.tag}`);

  // 기본 주식 생성
  await createStocks();

  console.log("기본 주식 생성 완료");

  // ================== 주식 자동 변동 시작 ==================
  stockUpdate();

  console.log("주식 자동 변동 시작");

});

// ================== TTS 이벤트 ==================
require("./이벤트/tts")(client);

// ================== 에러 방지 ==================
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// ================== 로그인 ==================
client.login(process.env.TOKEN);
