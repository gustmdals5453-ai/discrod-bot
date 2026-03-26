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

// ================== ✨ 이쁜 Embed ==================
const E = (title, desc, color = 0x5865F2) =>
  new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: "💎 한국협회" })
    .setTitle(`✨ ${title}`)
    .setDescription(desc)
    .setThumbnail("https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
    .setFooter({ text: "🚀 한국협회" })
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

async function getStats(gid) {
  let s = await Stats.findOne({ guildId: gid });
  if (!s) s = await Stats.create({ guildId: gid });
  return s;
}

// ================== 변수 ==================
let game = {};

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
  if (m.author.bot || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0];
  const id = m.author.id;

  const user = await getUser(id);
  const stats = await getStats(m.guild.id);

  // 🔥 활동 기록
  user.messages++;
  await user.save();

  stats.totalMessages++;
  const hour = new Date().getHours();
  const day = new Date().getDay();

  stats.hourly[hour] = (stats.hourly[hour] || 0) + 1;
  stats.daily[day] = (stats.daily[day] || 0) + 1;

  await stats.save();

  // ================== 💰 잔액 ==================
  if(cmd==="잔액"){
    return m.reply({ embeds:[E("잔액 확인", `💰 **${f(user.money)}원**`, 0x00E5FF)] });
  }

  // ================== 🎁 돈 ==================
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("제한", "⛔ 하루 1번만 가능",0xFF4D4D)] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({ embeds:[E("지급 완료", `🎉 +10,000원\n현재: **${f(user.money)}원**`,0x00FF88)] });
  }

  // ================== 💸 송금 ==================
  if(cmd==="송금"){
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);

    if(!target) return m.reply({ embeds:[E("오류","유저 멘션 필요",0xFF4D4D)] });
    if(!amount || amount<=0) return m.reply({ embeds:[E("오류","금액 입력",0xFF4D4D)] });

    const receiver = await getUser(target.id);

    if(user.money < amount)
      return m.reply({ embeds:[E("실패","잔액 부족",0xFF4D4D)] });

    user.money -= amount;
    receiver.money += amount;

    await user.save();
    await receiver.save();

    return m.reply({ embeds:[E("송금 완료",
      `${m.author} ➜ ${target}\n💰 ${f(amount)}원`,
      0x00FFAA)] });
  }

  // ================== 🎰 슬롯 ==================
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);
    if(!bet || user.money < bet) return;

    const r1 = rand(symbols);
    const r2 = rand(symbols);
    const r3 = rand(symbols);

    let win = (r1===r2&&r2===r3)?bet*5:(r1===r2||r2===r3||r1===r3)?bet*2:-bet;

    user.money += win;
    await user.save();

    return m.reply({ embeds:[E("슬롯 결과",
      `🎰 ${r1} | ${r2} | ${r3}\n\n💰 ${win}원\n💳 ${f(user.money)}원`,
      win>=0?0x00FF88:0xFF4D4D)] });
  }

  // ================== 🏆 돈 랭킹 ==================
  if(cmd==="랭킹"){
    const top = await User.find().sort({ money:-1 }).limit(10);

    const desc = top.map((u,i)=>
      `🥇 ${i+1}위 <@${u.userId}> — 💰 ${f(u.money)}원`
    ).join("\n");

    return m.reply({ embeds:[E("부자 랭킹 TOP 10", desc, 0xFFD700)] });
  }

  // ================== 🏆 활동 랭킹 ==================
  if(cmd==="활동랭킹"){
    const top = await User.find().sort({ messages:-1 }).limit(10);

    const desc = top.map((u,i)=>
      `🔥 ${i+1}위 <@${u.userId}> — ${u.messages}개`
    ).join("\n");

    return m.reply({ embeds:[E("활동 랭킹", desc, 0xFFA500)] });
  }

  // ================== 📊 통계 ==================
  if(cmd==="통계"){
    const peakHour = Object.entries(stats.hourly).sort((a,b)=>b[1]-a[1])[0];
    const peakDay = Object.entries(stats.daily).sort((a,b)=>b[1]-a[1])[0];

    const days = ["일","월","화","수","목","금","토"];

    return m.reply({
      embeds:[E("서버 분석 대시보드",
        `💬 총 메시지: **${stats.totalMessages}**
👥 가입: **${stats.joins}** | 나감: **${stats.leaves}**

🔥 최고 활동 시간: **${peakHour?peakHour[0]:"없음"}시**
📅 최고 활동 요일: **${peakDay?days[peakDay[0]]:"없음}요일**

📈 활성도 점수: **${Math.floor(stats.totalMessages/(stats.joins+1))}**`
      )]
    });
  }
});

// ================== 로그인 ==================
client.login(process.env.TOKEN);
