"use strict";

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
}).listen(PORT);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const prefix = "!";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch(console.log);

// 💎 고급 Embed
const E = (title) =>
  new EmbedBuilder()
    .setColor(0x111827)
    .setAuthor({ name: "📊 KOREA ASSOCIATION DATA CENTER" })
    .setTitle(`┏━━━ ${title} ━━━┓`)
    .setFooter({ text: "CONFIDENTIAL • INTERNAL REPORT SYSTEM" })
    .setTimestamp();

// ================== DB ==================
const userSchema = new mongoose.Schema({
  userId: String,
  money: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  warns: { type: Number, default: 0 },
  messages: { type: Number, default: 0 }
});

const statsSchema = new mongoose.Schema({
  guildId: String,
  totalMessages: { type: Number, default: 0 },
  joins: { type: Number, default: 0 },
  leaves: { type: Number, default: 0 },
  hourly: { type: Object, default: {} },
  daily: { type: Object, default: {} }
});

const User = mongoose.model("User", userSchema);
const Stats = mongoose.model("Stats", statsSchema);

async function getUser(id){
  let u = await User.findOne({ userId:id });
  if(!u) u = await User.create({ userId:id });
  return u;
}
async function getStats(id){
  let s = await Stats.findOne({ guildId:id });
  if(!s) s = await Stats.create({ guildId:id });
  return s;
}

let game = {};
const symbols = ["🍒","🍋","🍊","🍇","💎","7️⃣"];
const rand = a => a[Math.floor(Math.random()*a.length)];
const f = n => n.toLocaleString();

client.once("ready", ()=>console.log("✅ 로그인 완료"));

client.on("guildMemberAdd", async m=>{
  const s = await getStats(m.guild.id);
  s.joins++; await s.save();
});
client.on("guildMemberRemove", async m=>{
  const s = await getStats(m.guild.id);
  s.leaves++; await s.save();
});

client.on("messageCreate", async m=>{
  if(m.author.bot || !m.guild || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).split(/ +/);
  const cmd = args[0];
  const id = m.author.id;

  const user = await getUser(id);
  const stats = await getStats(m.guild.id);

  user.messages++; await user.save();

  stats.totalMessages++;
  const hour = new Date().getHours();
  const day = new Date().getDay();
  stats.hourly[hour] = (stats.hourly[hour]||0)+1;
  stats.daily[day] = (stats.daily[day]||0)+1;
  await stats.save();

  // 💰 잔액
  if(cmd==="잔액"){
    return m.reply({
      embeds:[E("ACCOUNT STATUS")
        .addFields(
          { name:"💰 현재 잔액", value:`**${f(user.money)}원**`, inline:true },
          { name:"📨 활동량", value:`${user.messages} msgs`, inline:true }
        )
      ]
    });
  }

  // 🎁 돈
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("ACCESS DENIED").setDescription("⛔ DAILY LIMIT EXCEEDED")] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({
      embeds:[E("TRANSACTION SUCCESS")
        .addFields(
          { name:"지급 금액", value:"💰 10,000원", inline:true },
          { name:"현재 잔액", value:`${f(user.money)}원`, inline:true }
        )
      ]
    });
  }

  // 💸 송금
  if(cmd==="송금"){
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);
    if(!target || !amount) return;

    const r = await getUser(target.id);
    if(user.money < amount) return;

    user.money -= amount;
    r.money += amount;
    await user.save(); await r.save();

    return m.reply({
      embeds:[E("FINANCIAL TRANSFER LOG")
        .addFields(
          { name:"송신자", value:`${m.author}`, inline:true },
          { name:"수신자", value:`${target}`, inline:true },
          { name:"금액", value:`💰 ${f(amount)}원`, inline:false }
        )
      ]
    });
  }

  // 🎰 슬롯 (애니메이션 유지)
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);
    if(!bet || user.money < bet) return;

    if(game[id]) return;
    game[id] = true;

    let msg = await m.reply({ embeds:[E("SLOT MACHINE").setDescription("⏳ INITIALIZING...")] });

    for(let i=0;i<5;i++){
      const r1=rand(symbols),r2=rand(symbols),r3=rand(symbols);
      await msg.edit({
        embeds:[E("SLOT MACHINE")
          .setDescription(`\`${r1} | ${r2} | ${r3}\`\n\n⏳ PROCESSING...`)
        ]
      });
      await new Promise(r=>setTimeout(r,300));
    }

    const r1=rand(symbols),r2=rand(symbols),r3=rand(symbols);
    let win=(r1===r2&&r2===r3)?bet*5:(r1===r2||r2===r3||r1===r3)?bet*2:-bet;

    user.money+=win; await user.save(); delete game[id];

    return msg.edit({
      embeds:[E("SLOT RESULT")
        .setDescription(`\`${r1} | ${r2} | ${r3}\``)
        .addFields(
          { name:"결과", value:`${win}원`, inline:true },
          { name:"잔액", value:`${f(user.money)}원`, inline:true }
        )
      ]
    });
  }

  // 🏆 랭킹
  if(cmd==="랭킹"){
    const top = await User.find().sort({money:-1}).limit(10);

    return m.reply({
      embeds:[E("FINANCIAL RANKING")
        .setDescription("TOP 10 WEALTH HOLDERS")
        .addFields(top.map((u,i)=>({
          name:`#${i+1} RANK`,
          value:`<@${u.userId}> • 💰 ${f(u.money)}원`
        })))
      ]
    });
  }

  // 🔥 활동 랭킹
  if(cmd==="활동랭킹"){
    const top = await User.find().sort({messages:-1}).limit(10);

    return m.reply({
      embeds:[E("ACTIVITY REPORT")
        .setDescription("TOP ACTIVE USERS")
        .addFields(top.map((u,i)=>({
          name:`#${i+1}`,
          value:`<@${u.userId}> • ${u.messages} msgs`
        })))
      ]
    });
  }

  // 📊 통계
  if(cmd==="통계"){
    const peakHour = Object.entries(stats.hourly).sort((a,b)=>b[1]-a[1])[0];
    const peakDay = Object.entries(stats.daily).sort((a,b)=>b[1]-a[1])[0];
    const days=["일","월","화","수","목","금","토"];

    return m.reply({
      embeds:[E("SERVER ANALYTICS REPORT")
        .addFields(
          { name:"💬 총 메시지", value:`**${stats.totalMessages}**`, inline:true },
          { name:"👥 유저 변화", value:`${stats.joins} / ${stats.leaves}`, inline:true },
          { name:"🔥 피크 시간", value: peakHour ? peakHour[0]+"시":"없음", inline:true },
          { name:"📅 피크 요일", value: peakDay ? days[peakDay[0]]+"요일":"없음", inline:true },
          { name:"📈 활성도", value:`${Math.floor(stats.totalMessages/(stats.joins+1))}`, inline:true }
        )
      ]
    });
  }

});

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

client.login(process.env.TOKEN);
