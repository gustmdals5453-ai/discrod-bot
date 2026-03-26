const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");

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

  // ================== 잔액 ==================
  if(cmd==="잔액"){
    return m.reply({ embeds:[E("💳 잔액", `💰 **${f(user.money)}원**`, 0x00E5FF)] });
  }

  // ================== 돈줘 ==================
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("❌ 제한", "하루 1번만 가능", 0xFF4D4D)] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({ embeds:[E("💰 지급 완료", `+10,000원\n현재: **${f(user.money)}원**`, 0x00FF88)] });
  }

  // ================== 송금 ==================
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

  // ================== 슬롯 (애니메이션 적용됨) ==================
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);

    if(isNaN(bet)) return m.reply({ embeds:[E("❌ 오류","금액 입력",0xFF4D4D)] });
    if(user.money < bet) return m.reply({ embeds:[E("💸 실패","돈 부족",0xFF4D4D)] });
    if(game[id]) return m.reply({ embeds:[E("❌","이미 게임 중",0xFF4D4D)] });

    game[id] = true;

    let msg = await m.reply({ embeds:[E("🎰 슬롯", "돌리는 중...")] });

    // 애니메이션
    for(let i=0; i<5; i++){
      const r1 = rand(symbols);
      const r2 = rand(symbols);
      const r3 = rand(symbols);

      await msg.edit({
        embeds:[E("🎰 슬롯",
          `\`${r1} | ${r2} | ${r3}\`\n\n🎰 돌리는 중...`)]
      });

      await new Promise(r => setTimeout(r, 300));
    }

    // 결과
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

  // ================== 가위바위보 ==================
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

  // ================== 이하 동일 (변경 없음) ==================
