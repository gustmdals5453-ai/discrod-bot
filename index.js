"use strict";

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

// ================== 웹 서버 ==================
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
}).listen(PORT);

// ================== 디스코드 ==================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = "!";

// ================== MongoDB ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch(console.log);

// ================== Embed ==================
const E = (title, color = 0x111827) =>
  new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: "한국협회" })
    .setTitle(`┏━━━ ${title} ━━━┓`)
    .setFooter({ text: "한국협회 • 시스템" })
    .setTimestamp();

// 🎰 카지노 전용
const C = (title, color = 0x111827) =>
  new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: "한국협회 카지노 시스템" })
    .setTitle(`┏━━━ ${title} ━━━┓`)
    .setFooter({ text: "한국협회 • 프리미엄 카지노" })
    .setTimestamp();

// ================== DB ==================
const userSchema = new mongoose.Schema({
  userId: String,
  money: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  warns: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

async function getUser(id){
  let u = await User.findOne({ userId:id });
  if(!u) u = await User.create({ userId:id });
  return u;
}

// ================== 변수 ==================
let game = {};
let tickets = {};

const f = n => n.toLocaleString();
const rand = arr => arr[Math.floor(Math.random()*arr.length)];

const choices = ["가위","바위","보"];
const emojis = { 가위:"✌️", 바위:"✊", 보:"✋" };

// ================== READY ==================
client.once("ready", ()=>console.log(`✅ 로그인됨: ${client.user.tag}`));

// ================== 메시지 ==================
client.on("messageCreate", async m=>{
  if(m.author.bot || !m.guild || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).split(/ +/);
  const cmd = args[0];
  const id = m.author.id;

  const user = await getUser(id);

  // 📖 도움말
  if(cmd==="도움말"){
    return m.reply({
      embeds:[
        new EmbedBuilder()
          .setColor(0x00FF88)
          .setAuthor({ name: "한국협회" })
          .setTitle("┏━━━ 시스템 안내 ━━━┓")
          .addFields(
            { name: "경제", value: "```!잔액 / !돈줘 / !송금 @유저 금액```" },
            { name: "카지노", value: "```!슬롯 금액\n!블랙잭 금액\n!바카라 금액\n!가위바위보 금액```" },
            { name: "랭킹", value: "```!랭킹```" },
            { name: "경고", value: "```!경고 @유저 사유\n!경고확인\n!경고초기화 @유저```" },
            { name: "문의", value: "```!문의 내용```" },
            { name: "공지", value: "```!공지 내용\n!공지채널 #채널 내용```" }
          )
          .setFooter({ text: "한국협회 • 시스템" })
          .setTimestamp()
      ]
    });
  }

  // 📢 공지
  if(cmd==="공지"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply({ embeds:[E("오류",0xFF4D4D).setDescription("관리자만 사용 가능")] });

    const text = args.slice(1).join(" ");
    if(!text)
      return m.reply({ embeds:[E("오류",0xFF4D4D).setDescription("공지 내용을 입력해주세요")] });

    const embed = new EmbedBuilder()
      .setColor(0x00FF88)
      .setAuthor({ name: "한국협회" })
      .setTitle("┏━━━ 공지 ━━━┓")
      .setDescription(`>>> ${text}`)
      .setFooter({ text:`한국협회 • ${m.author.tag}` })
      .setTimestamp();

    await m.channel.send({
      content: "@everyone",
      embeds:[embed]
    });

    return m.reply({ embeds:[E("완료",0x00FF88).setDescription("공지 전송 완료")] });
  }

  // 📢 공지채널
  if(cmd==="공지채널"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply({ embeds:[E("오류",0xFF4D4D).setDescription("관리자만 사용 가능")] });

    const channel = m.mentions.channels.first();
    const text = args.slice(2).join(" ");

    if(!channel)
      return m.reply({ embeds:[E("오류",0xFF4D4D).setDescription("채널 멘션 필요")] });

    if(!text)
      return m.reply({ embeds:[E("오류",0xFF4D4D).setDescription("공지 내용을 입력해주세요")] });

    const embed = new EmbedBuilder()
      .setColor(0x00FF88)
      .setAuthor({ name: "한국협회" })
      .setTitle("┏━━━ 공지 ━━━┓")
      .setDescription(`>>> ${text}`)
      .setFooter({ text:`한국협회 • ${m.author.tag}` })
      .setTimestamp();

    await channel.send({
      content: "@everyone",
      embeds:[embed]
    });

    return m.reply({ embeds:[E("완료",0x00FF88).setDescription("공지 전송 완료")] });
  }

  // 💰 잔액
  if(cmd==="잔액"){
    return m.reply({ embeds:[E("잔액").setDescription(`${f(user.money)}원`)] });
  }

  // 이하 전부 기존 그대로 (절대 수정 없음)
