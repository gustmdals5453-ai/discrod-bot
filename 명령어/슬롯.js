module.exports = {
  name:"슬롯",

  async execute(m,args,{user,E,G,f,rand}){

    const bet=Number(args[0]);
    if(isNaN(bet)||bet<=0)
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    if(user.money<bet)
      return m.reply({embeds:[E("잔액 부족",0xFF4D4D)]});

    const icons=["🍒","🍋","🍊","⭐","💎"];

    let msg=await m.reply({embeds:[G("슬롯",true).setDescription("🎰 돌리는 중...")]});

    for(let i=0;i<3;i++){
      await new Promise(r=>setTimeout(r,600));
      await msg.edit({
        embeds:[G("슬롯",true)
        .setDescription(`${rand(icons)} | ${rand(icons)} | ${rand(icons)}`)]
      });
    }

    const r1=rand(icons),r2=rand(icons),r3=rand(icons);

    let change=0;
    let win=false;

    if(r1===r2&&r2===r3){
      change=bet*5;
      win=true;
    }
    else if(r1===r2||r2===r3||r1===r3){
      change=bet*2;
      win=true;
    }
    else{
      change=-bet;
    }

    user.money+=change;
    await user.save();

    return msg.edit({
      embeds:[
        G("결과",win)
        .setDescription(`${r1} | ${r2} | ${r3}\n${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)
      ]
    });
  }
};
