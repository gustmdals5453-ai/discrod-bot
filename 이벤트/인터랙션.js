const { getUser, f, rand } = require("../유틸/함수");
const { G } = require("../유틸/임베드");

module.exports = async (i) => {
  if (!i.isButton()) return;

  const user = await getUser(i.user.id);

  // 🔥 무조건 먼저 실행 (이게 핵심)
  await i.deferUpdate();

  // 슬롯
  if (i.customId.startsWith("slot_")) {
    const bet = parseInt(i.customId.split("_")[1]);
    const icons = ["🍒","🍋","🍊","⭐","💎"];

    for(let x=0;x<3;x++){
      await new Promise(r=>setTimeout(r,600));
      await i.editReply({
        embeds:[G("슬롯",true)
        .setDescription(`${rand(icons)} | ${rand(icons)} | ${rand(icons)}`)]
      });
    }

    const r1=rand(icons),r2=rand(icons),r3=rand(icons);

    let change=0;
    let win=false;

    if(r1===r2&&r2===r3){ change=bet*5; win=true; }
    else if(r1===r2||r2===r3||r1===r3){ change=bet*2; win=true; }
    else change=-bet;

    user.money+=change;
    await user.save();

    return i.editReply({
      embeds:[G("결과",win)
      .setDescription(`${r1} | ${r2} | ${r3}\n${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 가위바위보
  if(i.customId.startsWith("rps_")){
    const bet=parseInt(i.customId.split("_")[1]);
    const userC=i.customId.split("_")[2];

    const choices=["가위","바위","보"];
    const emoji={가위:"✌️",바위:"✊",보:"✋"};

    await new Promise(r=>setTimeout(r,800));

    const bot=rand(choices);

    let change=0;
    let win=false;

    if((userC==="가위"&&bot==="보")||(userC==="바위"&&bot==="가위")||(userC==="보"&&bot==="바위")){
      change=bet; win=true;
    } else if(userC!==bot){
      change=-bet;
    }

    user.money+=change;
    await user.save();

    return i.editReply({
      embeds:[G("결과",win)
      .setDescription(`${emoji[userC]} vs ${emoji[bot]}\n${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 블랙잭 / 바카라
  if(i.customId.startsWith("game_")){
    const [_, type, bet] = i.customId.split("_");

    await new Promise(r=>setTimeout(r,1000));

    const win=Math.random()>0.5;
    const change=win?bet:-bet;

    user.money+=change;
    await user.save();

    return i.editReply({
      embeds:[G("결과",win)
      .setDescription(`${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)]
    });
  }

  // 🔥 티켓 닫기 버튼 추가
  if(i.customId === "close_ticket"){
    if(!i.member.permissions.has("Administrator"))
      return i.followUp({content:"관리자만 가능",ephemeral:true});

    await i.followUp({content:"채널 삭제중...",ephemeral:true});
    setTimeout(()=>i.channel.delete(),1500);
  }
};
