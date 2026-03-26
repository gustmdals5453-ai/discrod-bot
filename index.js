// ================== discord.js ==================
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const prefix = "!";

// ================== MongoDB ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결됨"))
  .catch(err => console.log(err));

// 유저 스키마
const userSchema = new mongoose.Schema({
  userId: String,
  money: { type: Number, default: 0 },
  lastDaily: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

// 유저 불러오기 함수
async function getUser(id) {
  let user = await User.findOne({ userId: id });
  if (!user) user = await User.create({ userId: id });
  return user;
}

// ================== 변수 ==================
let game = {};
let tickets = {};
let warns = {};

const symbols = ["🍒","🍋","🍊","🍇","💎","7️⃣"];
const getRandomSymbol = () => symbols[Math.floor(Math.random() * symbols.length)];

const choices = ["가위","바위","보"];
const emojis = { 가위:"✌️", 바위:"✊", 보:"✋" };

const format = n => n.toLocaleString();

// ================== READY ==================
client.once("ready", () => console.log(`✅ 로그인됨: ${client.user.tag}`));

// ================== 메시지 ==================
client.on("messageCreate", async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0];
  const id = message.author.id;

  const user = await getUser(id);

  // 중복 게임 방지
  if (["슬롯","가위바위보"].includes(cmd) && game[id]) {
    return message.reply("❌ 이미 게임 중입니다");
  }

  // 💳 잔액
  if(cmd==="잔액"){
    return message.reply({
      embeds:[new EmbedBuilder()
        .setColor(0x00E5FF)
        .setTitle("💳 내 잔액")
        .setDescription(`💰 ${format(user.money)}원`)]
    });
  }

  // 💰 돈줘
  if(cmd==="돈줘"){
    const now = Date.now();
    if(now - user.lastDaily < 86400000){
      return message.reply("❌ 하루 1번만 가능");
    }

    user.lastDaily = now;
    user.money += 10000;
    await user.save();

    return message.reply(`💰 +10,000원\n💳 ${format(user.money)}원`);
  }

  // 💸 송금
  if(cmd==="송금"){
    const target = message.mentions.users.first();
    const amount = parseInt(args.find(a=>!isNaN(a)));

    if(!target) return message.reply("❌ 유저 멘션 필요");
    if(!amount || amount<=0) return message.reply("❌ 금액 입력");
    if(target.id===id) return message.reply("❌ 자기 자신 불가");

    const receiver = await getUser(target.id);

    if(user.money < amount) return message.reply("💸 돈 부족");

    user.money -= amount;
    receiver.money += amount;

    await user.save();
    await receiver.save();

    return message.reply(`💸 송금 완료\n💰 ${format(amount)}원`);
  }

  // 🎰 슬롯
  if(cmd==="슬롯"){
    const bet = parseInt(args[1]);

    if(isNaN(bet)) return message.reply("❌ 금액 입력");
    if(user.money < bet) return message.reply("💸 돈 부족");

    game[id] = true;

    let msg = await message.reply("🎰 스핀 중...");

    for(let i=0;i<5;i++){
      await new Promise(r=>setTimeout(r,200));
    }

    const [f1,f2,f3] = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    let win=0;

    if(f1===f2 && f2===f3) win=bet*5;
    else if(f1===f2||f2===f3||f1===f3) win=bet*2;
    else win=-bet;

    user.money += win;
    await user.save();

    delete game[id];

    return msg.edit(`🎰 ${f1} | ${f2} | ${f3}\n💰 ${win}원\n💳 ${format(user.money)}원`);
  }

  // 🎮 가위바위보
  if(cmd==="가위바위보"){
    const bet=parseInt(args[1]);

    if(isNaN(bet)) return message.reply("❌ 금액 입력");
    if(user.money < bet) return message.reply("💸 돈 부족");

    game[id] = bet;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("rps_가위").setEmoji("✌️").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_바위").setEmoji("✊").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("rps_보").setEmoji("✋").setStyle(ButtonStyle.Primary)
    );

    return message.reply({ content:`💸 ${bet}원 배팅`, components:[row] });
  }

  // 🏆 랭킹
  if(cmd==="랭킹"){
    const top = await User.find().sort({ money:-1 }).limit(10);

    let desc = top.map((u,i)=>`${i+1}. <@${u.userId}> - ${format(u.money)}원`).join("\n");

    return message.reply(`🏆 랭킹\n${desc}`);
  }
});

// ================== 버튼 ==================
client.on("interactionCreate", async i=>{
  if(!i.isButton()) return;

  const id = i.user.id;
  const userDB = await getUser(id);

  if(i.customId.startsWith("rps_")){
    if(!game[id]) return i.reply({ content:"❌ 게임 없음", ephemeral:true });

    const userChoice = i.customId.split("_")[1];
    const bot = choices[Math.floor(Math.random()*3)];
    const bet = game[id];

    let change=0;

    if((userChoice==="가위"&&bot==="보")||(userChoice==="바위"&&bot==="가위")||(userChoice==="보"&&bot==="바위")) change=bet;
    else if(userChoice!==bot) change=-bet;

    userDB.money += change;
    await userDB.save();

    delete game[id];

    return i.update({
      content:`${emojis[userChoice]} vs ${emojis[bot]}\n💰 ${change}원\n💳 ${format(userDB.money)}원`,
      components:[]
    });
  }
});

client.login(process.env.TOKEN);
