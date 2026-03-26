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
const f = n => n.toLocaleString();

// ================== READY ==================
client.once("ready", () => console.log(`✅ 로그인됨: ${client.user.tag}`));

// ================== 가입/퇴장 ==================
client.on("guildMemberAdd", async member => {
  const stats = await getStats(member.guild.id);
  stats.joins++;
  await stats.save();
});

client.on("guildMemberRemove", async member => {
  const stats = await getStats(member.guild.id);
  stats.leaves++;
  await stats.save();
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
          { name:"💰 잔액", value:`${f(user.money)}원`, inline:true },
          { name:"📨 활동량", value:`${user.messages}회`, inline:true }
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

    if(!target)
      return m.reply({ embeds:[E("오류").setDescription("유저 멘션 필요")] });

    if(!amount || amount <= 0)
      return m.reply({ embeds:[E("오류").setDescription("금액 입력 필요")] });

    if(user.money < amount)
      return m.reply({ embeds:[E("실패").setDescription("잔액 부족")] });

    const receiver = await getUser(target.id);

    user.money -= amount;
    receiver.money += amount;

    await user.save();
    await receiver.save();

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

  // 🎰 슬롯 (애니메이션)
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);

    if(isNaN(bet)) return m.reply({ embeds:[E("오류").setDescription("금액 입력")] });
    if(user.money < bet) return m.reply({ embeds:[E("실패").setDescription("잔액 부족")] });
    if(game[id]) return m.reply({ embeds:[E("오류").setDescription("이미 진행 중")] });

    game[id] = true;

    let msg = await m.reply({ embeds:[E("슬롯 머신").setDescription("회전 중...")] });

    for(let i=0;i<5;i++){
      const r1 = rand(symbols);
      const r2 = rand(symbols);
      const r3 = rand(symbols);

      await msg.edit({
        embeds:[E("슬롯 머신").setDescription(`\`${r1} | ${r2} | ${r3}\`\n\n회전 중...`)]
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

  // 📩 문의
  if(cmd==="문의"){
    const text = args.slice(1).join(" ");
    if(!text) return m.reply({ embeds:[E("오류").setDescription("내용 입력")] });
    if(tickets[id]) return m.reply({ embeds:[E("오류").setDescription("이미 문의 있음")] });

    const channel = await m.guild.channels.create({
      name:`문의-${m.author.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites:[
        { id:m.guild.id, deny:[PermissionsBitField.Flags.ViewChannel] },
        { id:m.author.id, allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    tickets[id] = channel.id;

    return m.reply({ embeds:[E("문의 생성").setDescription(`${channel} 생성됨`)] });
  }

  // ================== ⚠️ 경고 시스템 ==================

  if(cmd==="경고"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply({ embeds:[E("권한 없음").setDescription("관리자만 가능")] });

    const target = m.mentions.users.first();
    const reason = args.slice(2).join(" ");

    if(!target) return m.reply({ embeds:[E("오류").setDescription("유저 멘션")] });
    if(!reason) return m.reply({ embeds:[E("오류").setDescription("사유 입력 필수")] });

    const t = await getUser(target.id);
    t.warns++;
    await t.save();

    return m.reply({
      embeds:[E("경고 부여")
        .addFields(
          { name:"대상", value:`${target}`, inline:true },
          { name:"사유", value:reason },
          { name:"누적 경고", value:`${t.warns}회`, inline:true }
        )
      ]
    });
  }

  if(cmd==="경고확인"){
    const target = m.mentions.users.first() || m.author;
    const t = await getUser(target.id);

    return m.reply({
      embeds:[E("경고 조회")
        .addFields(
          { name:"대상", value:`${target}`, inline:true },
          { name:"경고 수", value:`${t.warns}회`, inline:true }
        )
      ]
    });
  }

  if(cmd==="경고해제"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply({ embeds:[E("권한 없음").setDescription("관리자만 가능")] });

    const target = m.mentions.users.first();
    if(!target) return m.reply({ embeds:[E("오류").setDescription("유저 멘션")] });

    const t = await getUser(target.id);
    t.warns = 0;
    await t.save();

    return m.reply({
      embeds:[E("경고 초기화")
        .setDescription(`${target} 경고가 초기화됨`)
      ]
    });
  }

});

// ================== 버튼 ==================
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  if(i.customId==="close_ticket"){
    await i.reply({ content:"삭제 중...", ephemeral:true });
    setTimeout(()=>i.channel.delete(),2000);
  }
});

client.login(process.env.TOKEN);
