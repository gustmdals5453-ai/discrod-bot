// ================== discord.js ==================
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";
const ownerId = "882120068232777728";

let data = {};
let game = {};
let tickets = {};

const symbols = ["🍒","🍋","🍊","🍇","💎","7️⃣"];
const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const choices = ["가위","바위","보"];
const emojis = { 가위:"✌️", 바위:"✊", 보:"✋" };

const format = (n) => n.toLocaleString();

client.on("ready", () => console.log(`✅ 로그인됨: ${client.user.tag}`));

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0].toLowerCase();
  const id = message.author.id;
  if (!data[id]) data[id] = { money: 0 };

  // 슬롯/가위바위보 중복 방지
  if (["슬롯","가위바위보"].includes(cmd) && game[id]) {
    return message.reply({ content:"❌ 이미 게임 중입니다", ephemeral:true });
  }

  // 💳 잔액
  if (cmd === "잔액") return message.reply({
    embeds:[new EmbedBuilder().setColor(0x00E5FF).setTitle("💳 내 잔액").setDescription(`💰 ${format(data[id].money)}원`)]
  });

  // 💰 돈줘
  if (cmd === "돈줘") {
    const now = Date.now();
    const last = data[id].lastDaily || 0;
    if (now - last < 86400000) return message.reply({
      embeds:[new EmbedBuilder().setColor(0xFF5252).setTitle("⏳ 아직 지급 불가").setDescription("하루 1회만 가능")]
    });
    data[id].lastDaily = now;
    data[id].money += 10000;
    return message.reply({
      embeds:[new EmbedBuilder().setColor(0x00E676).setTitle("💰 일일 보상").setDescription(`+10,000원\n💳 ${format(data[id].money)}원`)]
    });
  }

  // 💸 송금
  if (cmd === "송금") {
    const target = message.mentions.users.first();
    const amount = parseInt(args.find(a=>!isNaN(a)));
    if (!target) return message.reply("❌ 유저 멘션 필요");
    if (!amount || amount<=0) return message.reply("❌ 금액 입력");
    if (target.id===id) return message.reply("❌ 자기 자신 불가");
    if (data[id].money<amount) return message.reply("💸 돈 부족");
    if (!data[target.id]) data[target.id]={money:0};
    data[id].money-=amount;
    data[target.id].money+=amount;
    return message.reply({ embeds:[new EmbedBuilder().setColor(0x00B0FF).setTitle("💸 송금 완료").setDescription(`<@${id}> ➜ <@${target.id}>\n💰 ${format(amount)}원\n💳 ${format(data[id].money)}원`)] });
  }

  // 🎰 슬롯
  if (cmd === "슬롯") {
    const bet = parseInt(args[1]);
    if (isNaN(bet)) return message.reply("❌ 금액 입력");
    if (data[id].money < bet) return message.reply("💸 돈 부족");
    game[id] = "slot";

    let msg = await message.reply({ embeds:[new EmbedBuilder().setColor(0x6C5CE7).setTitle("🎰 슬롯").setDescription("🎲 스핀 중...")] });

    // 자연스러운 애니메이션
    for(let i=0;i<8;i++){
      const s1=getRandomSymbol(), s2=getRandomSymbol(), s3=getRandomSymbol();
      await msg.edit({ embeds:[new EmbedBuilder().setColor(0x6C5CE7).setTitle("🎰 슬롯").setDescription(`${s1} │ ${s2} │ ${s3}\n🎲 스핀 중...`)] });
      await new Promise(r=>setTimeout(r, i<5?150:300));
    }

    const [f1,f2,f3] = [getRandomSymbol(),getRandomSymbol(),getRandomSymbol()];
    let win=0,text="";
    if(f1==="💎"&&f2==="💎"&&f3==="💎"){ win=bet*10;text="💎 JACKPOT 💎"; }
    else if(f1===f2&&f2===f3){ win=bet*5;text="🎉 대박!"; }
    else if(f1===f2||f2===f3||f1===f3){ win=bet*2;text="✨ 당첨!"; }
    else { win=-bet; text="💀 실패"; }

    data[id].money+=win;
    await msg.edit({ embeds:[new EmbedBuilder().setColor(win>0?0x00E676:0xFF1744).setTitle("🎰 슬롯 결과").setDescription(`${f1} │ ${f2} │ ${f3}\n\n${text}\n\n💰 ${win>0?"+":""}${format(win)}원\n💳 ${format(data[id].money)}원`)] });

    delete game[id];
  }

  // 🎮 가위바위보
  if(cmd==="가위바위보"){
    const bet = parseInt(args[1]);
    if(isNaN(bet)) return message.reply("❌ 금액 입력");
    if(data[id].money<bet) return message.reply("💸 돈 부족");

    game[id]=bet;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rps_가위").setEmoji("✌️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_바위").setEmoji("✊").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_보").setEmoji("✋").setStyle(ButtonStyle.Primary)
    );

    return message.reply({ embeds:[new EmbedBuilder().setColor(0x7C4DFF).setTitle("🎮 가위바위보").setDescription(`💸 ${format(bet)}원 배팅\n👇 버튼 선택`)], components:[row] });
  }

  // 📩 고객센터
  if(cmd==="문의"){
    if(tickets[id]) return message.reply({ embeds:[new EmbedBuilder().setColor(0xFF5252).setTitle("❌ 이미 문의 있음").setDescription("이미 문의 채널이 존재합니다")] });

    const embed = new EmbedBuilder().setColor(0x00B0FF).setTitle("📩 고객센터").setDescription("📌 1인 1문의 제한\n📌 관리자만 종료 가능\n버튼을 눌러 문의 생성").setFooter({ text:"빠르게 도와드립니다 🚀" });
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_create").setLabel("문의하기").setEmoji("📩").setStyle(ButtonStyle.Success));
    return message.reply({ embeds:[embed], components:[row] });
  }
});

// ================== 버튼 ==================
client.on("interactionCreate", async (i)=>{
  if(!i.isButton()) return;
  const id = i.user.id;

  // 🎮 가위바위보
  if(i.customId.startsWith("rps_")){
    if(!game[id]) return i.reply({ content:"❌ 게임 없음", ephemeral:true });
    const user = i.customId.split("_")[1];
    const bot = choices[Math.floor(Math.random()*3)];
    const bet = game[id];

    let change=0,result="무승부";
    if((user==="가위"&&bot==="보")||(user==="바위"&&bot==="가위")||(user==="보"&&bot==="바위")) change=bet,result="승리 🎉";
    else if(user!==bot) change=-bet,result="패배 💀";

    data[id].money+=change;
    delete game[id];

    return i.update({ embeds:[new EmbedBuilder().setColor(change>0?0x00E676:0xFF1744).setTitle("🎮 결과").setDescription(`${emojis[user]} vs ${emojis[bot]}\n\n${result}\n\n💰 ${change>0?"+":""}${format(change)}원\n💳 ${format(data[id].money)}원`)], components:[] });
  }

  // 📩 문의 생성
  if(i.customId==="ticket_create"){
    if(tickets[id]) return i.reply({ content:"❌ 이미 있음", ephemeral:true });

    const channel = await i.guild.channels.create({ name:`문의-${i.user.username}`, type:0, permissionOverwrites:[ { id:i.guild.id, deny:["ViewChannel"] }, { id:i.user.id, allow:["ViewChannel","SendMessages"] } ] });
    tickets[id]=channel.id;

    const embed = new EmbedBuilder().setColor(0x00E5FF).setTitle("📩 문의 접수됨").setDescription("문의 내용을 작성해주세요\n🔔 관리자가 확인합니다");
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_close").setLabel("문의 종료").setEmoji("🔒").setStyle(ButtonStyle.Danger));
    await channel.send({ content:`<@${id}>`, embeds:[embed], components:[row] });

    return i.reply({ content:"✅ 생성 완료", ephemeral:true });
  }

  // 🔒 문의 종료
  if(i.customId==="ticket_close"){
    if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator)) return i.reply({ content:"❌ 관리자만 가능", ephemeral:true });
    await i.reply("🔒 종료됨");
    const userId = Object.keys(tickets).find(k=>tickets[k]===i.channel.id);
    if(userId) delete tickets[userId];
    setTimeout(()=>i.channel.delete(),3000);
  }
});

client.login(process.env.TOKEN);