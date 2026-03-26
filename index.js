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
      embeds:[E("명령어 안내")
        .setDescription(`
## 경제
**!잔액 / !돈줘 / !송금 @유저 금액**

## 카지노
**!슬롯 금액
!블랙잭 금액
!바카라 금액
!가위바위보 금액**

## 랭킹
!랭킹

## 경고
**!경고 @유저 사유
!경고확인
!경고초기화 @유저**

## 문의
**!문의 내용**
`)]
    });
  }

  // 💰 잔액
  if(cmd==="잔액"){
    return m.reply({ embeds:[E("잔액").setDescription(`${f(user.money)}원`)] });
  }

  // 🎁 돈
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000)
      return m.reply({ embeds:[E("제한",0xFF4D4D).setDescription("하루 1회")] });

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return m.reply({ embeds:[E("지급 완료",0x00FF88)
      .setDescription(`+10,000원\n잔액: ${f(user.money)}원`)] });
  }

  // 💸 송금
  if(cmd==="송금"){
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);

    if(!target || !amount)
      return m.reply({ embeds:[E("오류",0xFF4D4D)] });

    if(user.money < amount)
      return m.reply({ embeds:[E("잔액 부족",0xFF4D4D)] });

    const r = await getUser(target.id);

    user.money -= amount;
    r.money += amount;

    await user.save();
    await r.save();

    return m.reply({ embeds:[E("송금 완료",0x00FF88)
      .setDescription(`${target}에게 ${f(amount)}원`)] });
  }

  // 🏆 랭킹
  if(cmd==="랭킹"){
    const top = await User.find().sort({money:-1}).limit(10);

    return m.reply({
      embeds:[E("자산 랭킹")
        .addFields(top.map((u,i)=>({
          name:`${i+1}위`,
          value:`<@${u.userId}> • ${f(u.money)}원`
        })))]
    });
  }

  // 🎰 슬롯 버튼
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;

    return m.reply({
      embeds:[C("슬롯").setDescription(`배팅: ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`slot_${bet}`).setLabel("🎰 돌리기").setStyle(ButtonStyle.Success)
        )
      ]
    });
  }

  // 🎮 가위바위보
  if(cmd==="가위바위보"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;

    game[id] = bet;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rps_가위").setEmoji("✌️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_바위").setEmoji("✊").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_보").setEmoji("✋").setStyle(ButtonStyle.Primary)
    );

    return m.reply({
      embeds:[C("가위바위보").setDescription(`배팅: ${bet}원`)],
      components:[row]
    });
  }

  // 🃏 블랙잭
  if(cmd==="블랙잭"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;

    return m.reply({
      embeds:[C("블랙잭").setDescription(`배팅: ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`blackjack_${bet}`).setLabel("🃏 시작").setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }

  // 🏦 바카라
  if(cmd==="바카라"){
    const bet = parseInt(args[1]);
    if(isNaN(bet) || user.money < bet) return;

    return m.reply({
      embeds:[C("바카라").setDescription(`배팅: ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`baccarat_player_${bet}`).setLabel("플레이어").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`baccarat_banker_${bet}`).setLabel("뱅커").setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }

  // 📩 문의
  if(cmd==="문의"){
    const text = args.slice(1).join(" ");
    if(!text)
      return m.reply({ embeds:[E("오류",0xFF4D4D).setDescription("문의 내용을 입력해주세요")] });

    if(tickets[id]) return;

    const ch = await m.guild.channels.create({
      name:`문의-${m.author.username}`,
      type: ChannelType.GuildText
    });

    tickets[id]=ch.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close").setLabel("닫기").setStyle(ButtonStyle.Danger)
    );

    await ch.send({ embeds:[E("문의 접수").setDescription(text)], components:[row] });

    return m.reply({ embeds:[E("문의 생성",0x00FF88)] });
  }

  // ⚠️ 경고
  if(cmd==="경고"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const t = m.mentions.users.first();
    const reason = args.slice(2).join(" ");
    if(!t || !reason) return;

    const u = await getUser(t.id);
    u.warns++;
    await u.save();

    return m.reply({ embeds:[E("경고",0xFF4D4D)
      .setDescription(`${t}\n사유: ${reason}\n${u.warns}회`)] });
  }

  if(cmd==="경고확인"){
    const t = m.mentions.users.first() || m.author;
    const u = await getUser(t.id);

    return m.reply({ embeds:[E("경고 확인")
      .setDescription(`${t} → ${u.warns}회`)] });
  }

  if(cmd==="경고초기화"){
    if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const t = m.mentions.users.first();
    if(!t) return;

    const u = await getUser(t.id);
    u.warns=0;
    await u.save();

    return m.reply({ embeds:[E("초기화 완료",0x00FF88)] });
  }

});

// ================== 버튼 ==================
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  const user = await getUser(i.user.id);

  // 🎰 슬롯 애니메이션
  if(i.customId.startsWith("slot_")){
    const bet = parseInt(i.customId.split("_")[1]);

    await i.update({ embeds:[C("슬롯").setDescription("🎰 회전 중...")], components:[] });

    await new Promise(r=>setTimeout(r,1000));

    const win = Math.random()>0.5;
    const change = win?bet:-bet;

    user.money += change;
    await user.save();

    return i.editReply({
      embeds:[C("슬롯 결과", win?0x00FF88:0xFF4D4D)
        .setDescription(`${change}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 🃏 블랙잭 애니메이션
  if(i.customId.startsWith("blackjack_")){
    const bet = parseInt(i.customId.split("_")[1]);

    await i.update({ embeds:[C("블랙잭").setDescription("카드 توزيع 중...")], components:[] });

    await new Promise(r=>setTimeout(r,1200));

    const win = Math.random()>0.5;
    const change = win?bet:-bet;

    user.money += change;
    await user.save();

    return i.editReply({
      embeds:[C("블랙잭 결과", win?0x00FF88:0xFF4D4D)
        .setDescription(`${change}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 🏦 바카라 애니메이션
  if(i.customId.startsWith("baccarat_")){
    const bet = parseInt(i.customId.split("_")[2]);

    await i.update({ embeds:[C("바카라").setDescription("카드 공개 중...")], components:[] });

    await new Promise(r=>setTimeout(r,1200));

    const win = Math.random()>0.5;
    const change = win?bet:-bet;

    user.money += change;
    await user.save();

    return i.editReply({
      embeds:[C("바카라 결과", win?0x00FF88:0xFF4D4D)
        .setDescription(`${change}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 🎮 가위바위보
  if(i.customId.startsWith("rps_")){
    const id = i.user.id;
    if(!game[id]) return;

    await i.update({ embeds:[C("가위바위보").setDescription("🤖 선택 중...")], components:[] });

    await new Promise(r=>setTimeout(r,800));

    const userC = i.customId.split("_")[1];
    const bot = rand(choices);
    const bet = game[id];

    let change = 0;
    if((userC==="가위"&&bot==="보")||(userC==="바위"&&bot==="가위")||(userC==="보"&&bot==="바위")) change=bet;
    else if(userC!==bot) change=-bet;

    user.money += change;
    await user.save();
    delete game[id];

    return i.editReply({
      embeds:[C("가위바위보 결과", change>=0?0x00FF88:0xFF4D4D)
        .setDescription(`${emojis[userC]} vs ${emojis[bot]}\n${change}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 문의 닫기
  if(i.customId==="close"){
    if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return i.reply({ content:"관리자만 가능", ephemeral:true });

    await i.reply({ content:"삭제 중...", ephemeral:true });
    setTimeout(()=>i.channel.delete(),2000);
  }
});

client.login(process.env.TOKEN);
