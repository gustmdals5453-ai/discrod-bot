const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http"); // ✅ 추가

// ✅ Render 포트 바인딩 (핵심)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
}).listen(PORT, () => {
  console.log(`🌐 웹 서버 실행됨 (PORT: ${PORT})`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const prefix = "!";

// ================== MongoDB ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch(err => console.log(err));

// ================== Embed ==================
const E = (title, desc, color = 0x5865F2) =>
  new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(desc)
    .setFooter({ text: "💎 Economy System" })
    .setTimestamp();

// ================== 스키마 ==================
const userSchema = new mongoose.Schema({
  userId: String,
  money: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 },
  warns: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

async function getUser(id) {
  let u = await User.findOne({ userId: id });
  if (!u) u = await User.create({ userId: id });
  return u;
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

// ================== 메시지 ==================
client.on("messageCreate", async m => {
  if (m.author.bot || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0];
  const id = m.author.id;

  const user = await getUser(id);

  if(cmd==="잔액"){
    return m.reply({ embeds:[E("💳 잔액", `💰 **${f(user.money)}원**`, 0x00E5FF)] });
  }

  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("❌ 제한", "하루 1번만 가능", 0xFF4D4D)] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({ embeds:[E("💰 지급 완료", `+10,000원\n현재: **${f(user.money)}원**`, 0x00FF88)] });
  }

  if(cmd==="송금"){
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);

    if(!target) return m.reply({ embeds:[E("❌ 오류","유저 멘션 필요",0xFF4D4D)] });
    if(!amount || amount<=0) return m.reply({ embeds:[E("❌ 오류","금액 입력",0xFF4D4D)] });

    const receiver = await getUser(target.id);
    if(user.money < amount)
      return m.reply({ embeds:[E("💸 실패","잔액 부족",0xFF4D4D)] });

    user.money -= amount;
    receiver.money += amount;

    await user.save();
    await receiver.save();

    return m.reply({ embeds:[E("💸 송금 완료", `${target} → **${f(amount)}원**`, 0x00FFAA)] });
  }

  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);

    if(isNaN(bet)) return m.reply({ embeds:[E("❌ 오류","금액 입력",0xFF4D4D)] });
    if(user.money < bet) return m.reply({ embeds:[E("💸 실패","돈 부족",0xFF4D4D)] });
    if(game[id]) return m.reply({ embeds:[E("❌","이미 게임 중",0xFF4D4D)] });

    game[id] = true;

    let msg = await m.reply({ embeds:[E("🎰 슬롯", "돌리는 중...")] });

    for(let i=0; i<5; i++){
      const r1 = rand(symbols);
      const r2 = rand(symbols);
      const r3 = rand(symbols);

      await msg.edit({
        embeds:[E("🎰 슬롯", `\`${r1} | ${r2} | ${r3}\`\n\n🎰 돌리는 중...`)]
      });

      await new Promise(r => setTimeout(r, 300));
    }

    const r1 = rand(symbols);
    const r2 = rand(symbols);
    const r3 = rand(symbols);

    let win = (r1===r2&&r2===r3) ? bet*5 :
              (r1===r2||r2===r3||r1===r3) ? bet*2 : -bet;

    user.money += win;
    await user.save();
    delete game[id];

    return msg.edit({
      embeds:[E("🎰 슬롯 결과",
        `\`${r1} | ${r2} | ${r3}\`\n\n💰 결과: **${win}원**\n💳 잔액: **${f(user.money)}원**`,
        win>=0?0x00FF88:0xFF4D4D)]
    });
  }

  if(cmd==="가위바위보"){
    const bet=parseInt(args[1]);

    if(isNaN(bet)) return m.reply({ embeds:[E("❌ 오류","금액 입력",0xFF4D4D)] });
    if(user.money < bet) return m.reply({ embeds:[E("💸 실패","돈 부족",0xFF4D4D)] });
    if(game[id]) return m.reply({ embeds:[E("❌","이미 게임 중",0xFF4D4D)] });

    game[id] = bet;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rps_가위").setEmoji("✌️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_바위").setEmoji("✊").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_보").setEmoji("✋").setStyle(ButtonStyle.Primary)
    );

    return m.reply({ embeds:[E("🎮 가위바위보", `배팅: **${bet}원**`)], components:[row] });
  }

  if(cmd==="랭킹"){
    const top = await User.find().sort({ money:-1 }).limit(10);

    const desc = top.map((u,i)=>
      `**${i+1}위** <@${u.userId}> — 💰 ${f(u.money)}원`
    ).join("\n");

    return m.reply({ embeds:[E("🏆 TOP 10", desc, 0xFFD700)] });
  }

  if(cmd==="문의"){
    const text = args.slice(1).join(" ");
    if(!text) return m.reply({ embeds:[E("❌ 오류","내용 입력",0xFF4D4D)] });

    if(tickets[id])
      return m.reply({ embeds:[E("❌ 이미 있음","이미 열린 문의 있음",0xFF4D4D)] });

    const channel = await m.guild.channels.create({
      name: `문의-${m.author.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: m.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: m.author.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    tickets[id] = channel.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 문의 닫기")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `<@${id}>`,
      embeds:[E("📩 문의 접수", `내용:\n${text}`)],
      components:[row]
    });

    return m.reply({ embeds:[E("✅ 문의 생성", `${channel} 생성됨`,0x00FF88)] });
  }

  if(cmd==="경고"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply({ embeds:[E("❌","관리자만 가능",0xFF4D4D)] });

    const target = m.mentions.users.first();
    const reason = args.slice(2).join(" ") || "없음";

    if(!target) return m.reply({ embeds:[E("❌","유저 멘션",0xFF4D4D)] });

    const t = await getUser(target.id);
    t.warns++;
    await t.save();

    return m.reply({ embeds:[E("⚠️ 경고", `${target}\n사유: ${reason}\n누적: **${t.warns}회**`,0xFFA500)] });
  }

  if(cmd==="경고확인"){
    const target = m.mentions.users.first() || m.author;
    const t = await getUser(target.id);

    return m.reply({ embeds:[E("📊 경고 현황", `${target} → **${t.warns}회**`,0x00E5FF)] });
  }

  if(cmd==="경고해제"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply({ embeds:[E("❌","관리자만 가능",0xFF4D4D)] });

    const target = m.mentions.users.first();
    if(!target) return m.reply({ embeds:[E("❌","유저 멘션",0xFF4D4D)] });

    const t = await getUser(target.id);
    t.warns = 0;
    await t.save();

    return m.reply({ embeds:[E("✅ 초기화", `${target} 경고 초기화`,0x00FF88)] });
  }
});

// ================== 버튼 ==================
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  if(i.customId === "close_ticket"){
    if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return i.reply({ content:"❌ 관리자만 가능", ephemeral:true });

    await i.reply({ content:"⏳ 삭제 중...", ephemeral:true });

    setTimeout(()=>{
      i.channel.delete().catch(()=>{});
    }, 2000);

    return;
  }

  const id = i.user.id;
  const user = await getUser(id);

  if(!game[id]) return i.reply({ content:"❌ 게임 없음", ephemeral:true });

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
    embeds:[E("🎮 결과",
      `${emojis[userC]} vs ${emojis[bot]}\n💰 ${change}원\n💳 ${f(user.money)}원`,
      change>=0?0x00FF88:0xFF4D4D)],
    components:[]
  });
});

client.login(process.env.TOKEN);
