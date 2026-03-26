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

// ================== 💎 한국협회 Embed ==================
const E = (title) =>
  new EmbedBuilder()
    .setColor(0x111827)
    .setAuthor({ name: "한국협회 데이터 센터" })
    .setTitle(`┏━━━ ${title} ━━━┓`)
    .setFooter({ text: "한국협회 • 내부 보고 시스템" })
    .setTimestamp();

// ================== 스키마 ==================
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

async function getUser(id) {
  let u = await User.findOne({ userId: id });
  if (!u) u = await User.create({ userId: id });
  return u;
}

async function getStats(id) {
  let s = await Stats.findOne({ guildId: id });
  if (!s) s = await Stats.create({ guildId: id });
  return s;
}

// ================== 변수 ==================
let game = {};
let tickets = {};

const symbols = ["🍒","🍋","🍊","🍇","💎","7️⃣"];
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const choices = ["가위","바위","보"];
const emojis = { 가위:"✌️", 바위:"✊", 보:"✋" };
const f = n => n.toLocaleString();

// ================== READY ==================
client.once("ready", () => console.log(`✅ 로그인됨: ${client.user.tag}`));

// ================== 가입/퇴장 ==================
client.on("guildMemberAdd", async m=>{
  const s = await getStats(m.guild.id);
  s.joins++; await s.save();
});
client.on("guildMemberRemove", async m=>{
  const s = await getStats(m.guild.id);
  s.leaves++; await s.save();
});

// ================== 메시지 ==================
client.on("messageCreate", async m => {
  if (m.author.bot || !m.guild || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0];
  const id = m.author.id;

  const user = await getUser(id);
  const stats = await getStats(m.guild.id);

  // 활동 기록
  user.messages++;
  await user.save();

  stats.totalMessages++;
  const hour = new Date().getHours();
  const day = new Date().getDay();
  stats.hourly[hour] = (stats.hourly[hour] || 0) + 1;
  stats.daily[day] = (stats.daily[day] || 0) + 1;
  await stats.save();

  // 💰 잔액
  if(cmd==="잔액"){
    return m.reply({
      embeds:[E("계정 정보")
        .addFields(
          { name:"잔액", value:`${f(user.money)}원`, inline:true },
          { name:"활동량", value:`${user.messages}회`, inline:true }
        )
      ]
    });
  }

  // 🎁 돈
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("제한").setDescription("하루 1회만 가능")] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({
      embeds:[E("지급 완료")
        .addFields(
          { name:"지급", value:"10,000원", inline:true },
          { name:"잔액", value:`${f(user.money)}원`, inline:true }
        )
      ]
    });
  }

  // 💸 송금
  if(cmd==="송금"){
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);

    if(!target || !amount) return;
    if(user.money < amount) return;

    const r = await getUser(target.id);

    user.money -= amount;
    r.money += amount;

    await user.save();
    await r.save();

    return m.reply({
      embeds:[E("송금 기록")
        .addFields(
          { name:"보낸 사람", value:`${m.author}`, inline:true },
          { name:"받는 사람", value:`${target}`, inline:true },
          { name:"금액", value:`${f(amount)}원` }
        )
      ]
    });
  }

  // 🎰 슬롯 (애니메이션 유지)
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;
    if(game[id]) return;

    game[id] = true;

    let msg = await m.reply({ embeds:[E("슬롯 머신").setDescription("회전 중...")] });

    for(let i=0;i<5;i++){
      const r1 = rand(symbols);
      const r2 = rand(symbols);
      const r3 = rand(symbols);

      await msg.edit({
        embeds:[E("슬롯 머신")
          .setDescription(`\`${r1} | ${r2} | ${r3}\`\n\n회전 중...`)
        ]
      });

      await new Promise(r => setTimeout(r, 300));
    }

    const r1 = rand(symbols);
    const r2 = rand(symbols);
    const r3 = rand(symbols);

    let win = (r1===r2&&r2===r3)?bet*5:(r1===r2||r2===r3||r1===r3)?bet*2:-bet;

    user.money += win;
    await user.save();
    delete game[id];

    return msg.edit({
      embeds:[E("슬롯 결과")
        .setDescription(`\`${r1} | ${r2} | ${r3}\``)
        .addFields(
          { name:"결과", value:`${win}원`, inline:true },
          { name:"잔액", value:`${f(user.money)}원`, inline:true }
        )
      ]
    });
  }

  // 🎮 가위바위보
  if(cmd==="가위바위보"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;
    if(game[id]) return;

    game[id] = bet;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rps_가위").setEmoji("✌️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_바위").setEmoji("✊").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_보").setEmoji("✋").setStyle(ButtonStyle.Primary)
    );

    return m.reply({ embeds:[E("가위바위보").setDescription(`배팅: ${bet}원`)], components:[row] });
  }

  // 🏆 돈 랭킹
  if(cmd==="랭킹"){
    const top = await User.find().sort({ money:-1 }).limit(10);

    return m.reply({
      embeds:[E("자산 랭킹")
        .addFields(top.map((u,i)=>({
          name:`${i+1}위`,
          value:`<@${u.userId}> • ${f(u.money)}원`
        })))
      ]
    });
  }

  // ⚠️ 경고
  if(cmd==="경고"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const target = m.mentions.users.first();
    const reason = args.slice(2).join(" ");
    if(!target || !reason) return;

    const t = await getUser(target.id);
    t.warns++;
    await t.save();

    return m.reply({
      embeds:[E("경고 부여")
        .setDescription(`${target}\n사유: ${reason}\n누적: ${t.warns}회`)
      ]
    });
  }

  if(cmd==="경고확인"){
    const target = m.mentions.users.first() || m.author;
    const t = await getUser(target.id);

    return m.reply({
      embeds:[E("경고 조회").setDescription(`${target} → ${t.warns}회`)]
    });
  }

  if(cmd==="경고초기화"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const target = m.mentions.users.first();
    if(!target) return;

    const t = await getUser(target.id);
    t.warns = 0;
    await t.save();

    return m.reply({ embeds:[E("초기화 완료").setDescription(`${target}`)] });
  }

  // 📊 통계
  if(cmd==="통계"){
    const peakHour = Object.entries(stats.hourly).sort((a,b)=>b[1]-a[1])[0];
    const peakDay = Object.entries(stats.daily).sort((a,b)=>b[1]-a[1])[0];
    const days=["일","월","화","수","목","금","토"];

    return m.reply({
      embeds:[E("서버 분석")
        .addFields(
          { name:"메시지", value:`${stats.totalMessages}`, inline:true },
          { name:"가입/퇴장", value:`${stats.joins}/${stats.leaves}`, inline:true },
          { name:"시간", value:peakHour?peakHour[0]+"시":"없음", inline:true },
          { name:"요일", value:peakDay?days[peakDay[0]]:"없음", inline:true }
        )
      ]
    });
  }

  // 📩 문의 (관리자만 삭제)
  if(cmd==="문의"){
    const text = args.slice(1).join(" ");
    if(!text || tickets[id]) return;

    const channel = await m.guild.channels.create({
      name:`문의-${m.author.username}`,
      type: ChannelType.GuildText
    });

    tickets[id] = channel.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("문의 닫기")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content:`<@${id}>`,
      embeds:[E("문의 접수").setDescription(text)],
      components:[row]
    });

    return m.reply({ embeds:[E("문의 생성 완료")] });
  }

});

// ================== 버튼 ==================
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  // 관리자만 티켓 삭제
  if(i.customId==="close_ticket"){
    if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return i.reply({ content:"관리자만 가능", ephemeral:true });

    await i.reply({ content:"삭제 중...", ephemeral:true });
    setTimeout(()=>i.channel.delete(),2000);
  }

  // 가위바위보
  if(i.customId.startsWith("rps_")){
    const id = i.user.id;
    if(!game[id]) return;

    const user = await getUser(id);
    const userC = i.customId.split("_")[1];
    const bot = rand(choices);
    const bet = game[id];

    let change = 0;

    if((userC==="가위"&&bot==="보")||(userC==="바위"&&bot==="가위")||(userC==="보"&&bot==="바위")) change=bet;
    else if(userC!==bot) change=-bet;

    user.money += change;
    await user.save();
    delete game[id];

    return i.update({
      embeds:[E("결과")
        .setDescription(`${emojis[userC]} vs ${emojis[bot]}\n${change}원\n${f(user.money)}원`)
      ],
      components:[]
    });
  }
});

client.login(process.env.TOKEN);
