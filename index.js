const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

// 웹 서버
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running!");
}).listen(PORT);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const prefix = "!";

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결됨"))
  .catch(err => console.log(err));

// Embed
const E = (title, desc, color = 0x5865F2) =>
  new EmbedBuilder()
    .setColor(color)
    .setTitle(`┏ ${title} ┓`)
    .setDescription(desc)
    .setFooter({ text: "Economy System" })
    .setTimestamp();

// DB
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

// 변수
let game = {};
let tickets = {};

const symbols = ["🍒","🍋","🍊","🍇","💎","7️⃣"];
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

const choices = ["가위","바위","보"];
const emojis = { 가위:"✌️", 바위:"✊", 보:"✋" };

const f = n => n.toLocaleString();

client.once("ready", () => console.log(`로그인됨: ${client.user.tag}`));

// ================= 메시지 =================
client.on("messageCreate", async m => {
  if (m.author.bot || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0];
  const id = m.author.id;

  const user = await getUser(id);

  // 도움말
  if(cmd==="도움말"){
    return m.reply({
      embeds:[
        new EmbedBuilder()
          .setColor(0x00FF88)
          .setTitle("┏ 도움말 ┓")
          .addFields(
            { name:"경제", value:"`!잔액`\n`!돈줘`\n`!송금`" },
            { name:"게임", value:"`!슬롯`\n`!가위바위보`\n`!블랙잭`\n`!바카라`" },
            { name:"기타", value:"`!랭킹`\n`!문의`\n`!공지`" }
          )
      ]
    });
  }

  // 공지
  if(cmd==="공지"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
    const text = args.slice(1).join(" ");
    if(!text) return;

    return m.channel.send({
      content:"@everyone",
      embeds:[
        new EmbedBuilder()
          .setColor(0x111827)
          .setTitle("━━━━━━━━ 공지 ━━━━━━━━")
          .setDescription(text)
      ]
    });
  }

  // 잔액
  if(cmd==="잔액"){
    return m.reply({ embeds:[E("잔액", `${f(user.money)}원`)] });
  }

  // 돈줘
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("제한","하루 1번")] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({ embeds:[E("지급","+10000원")] });
  }

  // 송금
  if(cmd==="송금"){
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);
    if(!target || !amount) return;

    const r = await getUser(target.id);

    user.money -= amount;
    r.money += amount;

    await user.save();
    await r.save();

    return m.reply({ embeds:[E("송금 완료",`${amount}원`)] });
  }

  // 슬롯 (애니메이션 유지)
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;

    game[id]=true;

    let msg = await m.reply({ embeds:[E("슬롯","돌리는 중...")] });

    for(let i=0;i<5;i++){
      await msg.edit({
        embeds:[E("슬롯",`${rand(symbols)} | ${rand(symbols)} | ${rand(symbols)}`)]
      });
      await new Promise(r=>setTimeout(r,300));
    }

    const win = Math.random()>0.5;
    const change = win?bet:-bet;

    user.money += change;
    await user.save();
    delete game[id];

    return msg.edit({
      embeds:[E("결과",`${change}원\n${f(user.money)}원`)]
    });
  }

  // 가위바위보
  if(cmd==="가위바위보"){
    const bet = parseInt(args[1]);
    if(isNaN(bet)) return;

    game[id]=bet;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rps_가위").setEmoji("✌️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_바위").setEmoji("✊").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_보").setEmoji("✋").setStyle(ButtonStyle.Primary)
    );

    return m.reply({ embeds:[E("가위바위보",`배팅 ${bet}`)], components:[row] });
  }

  // 🃏 블랙잭
  if(cmd==="블랙잭"){
    const bet = parseInt(args[1]);
    if(isNaN(bet)) return;

    return m.reply({
      embeds:[E("블랙잭",`배팅 ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`blackjack_${bet}`).setLabel("시작").setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }

  // 🏦 바카라
  if(cmd==="바카라"){
    const bet = parseInt(args[1]);
    if(isNaN(bet)) return;

    return m.reply({
      embeds:[E("바카라",`배팅 ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`baccarat_p_${bet}`).setLabel("플레이어").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`baccarat_b_${bet}`).setLabel("뱅커").setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }

});

// ================= 버튼 =================
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  const user = await getUser(i.user.id);

  // 블랙잭 애니메이션
  if(i.customId.startsWith("blackjack_")){
    const bet = parseInt(i.customId.split("_")[1]);

    await i.update({ embeds:[E("블랙잭","카드 뽑는 중...")] });

    await new Promise(r=>setTimeout(r,1200));

    const win = Math.random()>0.5;
    const change = win?bet:-bet;

    user.money += change;
    await user.save();

    return i.editReply({ embeds:[E("블랙잭 결과",`${change}원`)] });
  }

  // 바카라 애니메이션
  if(i.customId.startsWith("baccarat_")){
    const bet = parseInt(i.customId.split("_")[2]);

    await i.update({ embeds:[E("바카라","결과 계산 중...")] });

    await new Promise(r=>setTimeout(r,1200));

    const win = Math.random()>0.5;
    const change = win?bet:-bet;

    user.money += change;
    await user.save();

    return i.editReply({ embeds:[E("바카라 결과",`${change}원`)] });
  }

  // 가위바위보
  if(i.customId.startsWith("rps_")){
    const id = i.user.id;
    const bet = game[id];

    const userC = i.customId.split("_")[1];
    const bot = rand(choices);

    let change = 0;
    if((userC==="가위"&&bot==="보")||(userC==="바위"&&bot==="가위")||(userC==="보"&&bot==="바위")) change=bet;
    else if(userC!==bot) change=-bet;

    user.money += change;
    await user.save();
    delete game[id];

    return i.update({ embeds:[E("결과",`${change}원`)], components:[] });
  }

});

client.login(process.env.TOKEN);
