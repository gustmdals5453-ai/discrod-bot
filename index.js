"use strict";

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, ChannelType } = require("discord.js");
const mongoose = require("mongoose");
const http = require("http");

// 웹서버
const PORT = process.env.PORT || 3000;
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot running");
}).listen(PORT);

// 디코
const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers // ✅ 추가 (중요)
  ]
});

const prefix="!";

// DB
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB 연결됨"))
.catch(err=>{
  console.error(err);
  process.exit(1);
});

const userSchema=new mongoose.Schema({
  userId:String,
  money:{type:Number,default:0},
  lastDaily:{type:Number,default:0},
  warns:{type:Number,default:0}
});
const User=mongoose.model("User",userSchema);

async function getUser(id){
  let u=await User.findOne({userId:id});
  if(!u) u=await User.create({userId:id});
  return u;
}

// EMBED
const E=(t,c=0x00E5FF)=>new EmbedBuilder()
.setColor(c).setAuthor({name:"한국협회"})
.setTitle(`┏━━━ ${t} ━━━┓`)
.setFooter({text:"한국협회 시스템"}).setTimestamp();

const C=(t,c=0xFFD700)=>new EmbedBuilder()
.setColor(c).setAuthor({name:"한국협회 카지노"})
.setTitle(`┏━━━ ${t} ━━━┓`)
.setFooter({text:"한국협회 카지노"}).setTimestamp();

let game={},tickets={};
const f=n=>n.toLocaleString();
const rand=a=>a[Math.floor(Math.random()*a.length)];
const choices=["가위","바위","보"];
const emojis={가위:"✌️",바위:"✊",보:"✋"};

client.once("ready",()=>console.log("봇 준비됨"));

// 메시지
client.on("messageCreate",async m=>{
if(m.author.bot||!m.content.startsWith(prefix))return;

const args=m.content.slice(prefix.length).trim().split(/ +/);
const cmd=args[0];

if(!m.member) return;

const user=await getUser(m.author.id);

// 도움말
if(cmd==="도움말"){
return m.reply({embeds:[E("시스템 안내").setDescription(
`경제
\`\`\`
!잔액 / !돈줘 / !송금 @유저 금액
\`\`\`

카지노
\`\`\`
!슬롯 금액
!블랙잭 금액
!바카라 금액
!가위바위보 금액
\`\`\`

랭킹
\`\`\`
!랭킹
\`\`\`

경고
\`\`\`
!경고 @유저 사유
!경고확인
!경고초기화 @유저
\`\`\`

문의
\`\`\`
!문의 내용
\`\`\``)]});
}

// 공지
if(cmd==="공지"){
if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("관리자만 가능")]});

const text=args.slice(1).join(" ");
if(!text)
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("공지 내용 입력")]});

return m.channel.send({
content:"@everyone",
embeds:[E("공지",0xFF3CAC).setDescription(text)]
});
}

// 잔액
if(cmd==="잔액")
return m.reply({embeds:[E("잔액").setDescription(`${f(user.money)}원`)]});

// 돈줘
if(cmd==="돈줘"){
if(Date.now()-user.lastDaily<86400000)
return m.reply({embeds:[E("제한",0xFF4D4D).setDescription("하루 1회")]});

user.lastDaily=Date.now();
user.money+=10000;
await user.save();

return m.reply({embeds:[E("지급").setDescription(`+10000원\n잔액 ${f(user.money)}원`)]});
}

// 송금
if(cmd==="송금"){
const t=m.mentions.users.first();
const amt=Number(args[1]);

if(!t||isNaN(amt))
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("형식: !송금 @유저 금액")]});

if(user.money<amt)
return m.reply({embeds:[E("잔액 부족",0xFF4D4D)]});

const u=await getUser(t.id);
user.money-=amt; u.money+=amt;
await user.save(); await u.save();

return m.reply({embeds:[E("송금 완료").setDescription(`${t} ${amt}원\n잔액 ${f(user.money)}원`)]});
}

// 경고
if(cmd==="경고"){
if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("관리자만 가능")]});

const t=m.mentions.users.first();
const r=args.slice(2).join(" ");

if(!t||!r)
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("형식: !경고 @유저 사유")]});

const u=await getUser(t.id);
u.warns++; await u.save();

return m.reply({embeds:[E("경고",0xFFA500).setDescription(`${t}\n${r}\n${u.warns}회`)]});
}

if(cmd==="경고확인"){
const t=m.mentions.users.first()||m.author;
const u=await getUser(t.id);
return m.reply({embeds:[E("경고 확인").setDescription(`${t} ${u.warns}회`)]});
}

if(cmd==="경고초기화"){
if(!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("관리자만 가능")]});

const t=m.mentions.users.first();
if(!t)
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("유저 멘션 필요")]});

const u=await getUser(t.id);
u.warns=0; await u.save();

return m.reply({embeds:[E("초기화 완료")]});
}

// 문의
if(cmd==="문의"){
const text=args.slice(1).join(" ");
if(!text)
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("내용 입력")]});

if(tickets[m.author.id])
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("이미 문의 있음")]});

const ch=await m.guild.channels.create({
name:`문의-${m.author.username}`,
type:ChannelType.GuildText,
permissionOverwrites:[
{ id:m.guild.id, deny:[PermissionsBitField.Flags.ViewChannel] },
{ id:m.author.id, allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages] }
]
});

tickets[m.author.id]=ch.id;

const row=new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("close_ticket").setLabel("닫기").setStyle(ButtonStyle.Danger)
);

await ch.send({embeds:[E("문의").setDescription(text)],components:[row]});
return m.reply({embeds:[E("생성 완료")]});
}

// 랭킹
if(cmd==="랭킹"){
const top=await User.find().sort({money:-1}).limit(10);
return m.reply({embeds:[E("랭킹").setDescription(top.map((u,i)=>`${i+1}위 <@${u.userId}> ${f(u.money)}원`).join("\n"))]});
}

// 슬롯
if(cmd==="슬롯"){
const bet=Number(args[1]);
if(isNaN(bet)||user.money<bet)
return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("금액 입력") ]});

return m.reply({
embeds:[C("슬롯").setDescription(`배팅 ${bet}`)],
components:[new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId(`slot_${bet}`).setLabel("시작").setStyle(ButtonStyle.Success)
)]
});
}

// 가위바위보
if(cmd==="가위바위보"){
const bet=Number(args[1]);
if(isNaN(bet)||user.money<bet)
return m.reply({embeds:[E("오류",0xFF4D4D)]});

game[m.author.id]=bet;

return m.reply({
embeds:[C("가위바위보").setDescription(`배팅 ${bet}`)],
components:[new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId("rps_가위").setLabel("가위").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("rps_바위").setLabel("바위").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId("rps_보").setLabel("보").setStyle(ButtonStyle.Primary)
)]
});
}

// 블랙잭
if(cmd==="블랙잭"){
const bet=Number(args[1]);
if(isNaN(bet)||user.money<bet)
return m.reply({embeds:[E("오류",0xFF4D4D)]});

return m.reply({
embeds:[C("블랙잭").setDescription(`배팅 ${bet}`)],
components:[new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId(`blackjack_${bet}`).setLabel("시작").setStyle(ButtonStyle.Primary)
)]
});
}

// 바카라
if(cmd==="바카라"){
const bet=Number(args[1]);
if(isNaN(bet)||user.money<bet)
return m.reply({embeds:[E("오류",0xFF4D4D)]});

return m.reply({
embeds:[C("바카라").setDescription(`배팅 ${bet}`)],
components:[new ActionRowBuilder().addComponents(
new ButtonBuilder().setCustomId(`baccarat_player_${bet}`).setLabel("플레이어").setStyle(ButtonStyle.Primary),
new ButtonBuilder().setCustomId(`baccarat_banker_${bet}`).setLabel("뱅커").setStyle(ButtonStyle.Danger)
)]
});
}

});

// 버튼
client.on("interactionCreate",async i=>{
if(!i.isButton())return;
const user=await getUser(i.user.id);

// 티켓 닫기
if(i.customId==="close_ticket"){
if(!i.member.permissions.has(PermissionsBitField.Flags.Administrator))
return i.reply({content:"관리자만",ephemeral:true});
await i.reply({content:"삭제중",ephemeral:true});
setTimeout(()=>i.channel.delete(),2000);
}

// 슬롯 애니메이션
if(i.customId.startsWith("slot_")){
const bet=parseInt(i.customId.split("_")[1]);

await i.update({embeds:[C("슬롯").setDescription("🎰 돌리는 중...")],components:[]});

const icons=["🍒","🍋","🍊","⭐","💎"];

for(let x=0;x<3;x++){
await new Promise(r=>setTimeout(r,500));
await i.editReply({
embeds:[C("슬롯").setDescription(`${rand(icons)} | ${rand(icons)} | ${rand(icons)}\n\n돌리는 중...`)]
});
}

const r1=rand(icons),r2=rand(icons),r3=rand(icons);
const win=r1===r2&&r2===r3;
const change=win?bet*2:-bet;

user.money+=change; await user.save();

return i.editReply({
embeds:[C("결과",win?0x00FF88:0xFF4D4D)
.setDescription(`${r1} | ${r2} | ${r3}\n${change}원\n잔액 ${f(user.money)}원`)]
});
}

// 공통 게임
const run=async(d,t)=>{
await i.update({embeds:[C(t).setDescription("진행 중...")],components:[]});
await new Promise(r=>setTimeout(r,d));

const bet=parseInt(i.customId.split("_").pop());
const win=Math.random()>0.5;
const change=win?bet:-bet;

user.money+=change; await user.save();

return i.editReply({
embeds:[C("결과",win?0x00FF88:0xFF4D4D)
.setDescription(`${change}원\n잔액 ${f(user.money)}원`)]
});
};

if(i.customId.startsWith("blackjack_"))return run(1200,"블랙잭");
if(i.customId.startsWith("baccarat_"))return run(1200,"바카라");

// 가위바위보
if(i.customId.startsWith("rps_")){
const bet=game[i.user.id];
if(!bet)return;

await i.update({embeds:[C("가위바위보").setDescription("선택 중...")],components:[]});
await new Promise(r=>setTimeout(r,800));

const userC=i.customId.split("_")[1];
const bot=rand(choices);

let change=0;
if((userC==="가위"&&bot==="보")||(userC==="바위"&&bot==="가위")||(userC==="보"&&bot==="바위"))change=bet;
else if(userC!==bot)change=-bet;

user.money+=change; await user.save();
delete game[i.user.id];

return i.editReply({
embeds:[C("결과").setDescription(`${emojis[userC]} vs ${emojis[bot]}\n${change}원\n잔액 ${f(user.money)}원`)]
});
}

});

client.login(process.env.TOKEN);
