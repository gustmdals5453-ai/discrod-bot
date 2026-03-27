module.exports = {
  name:"블랙잭",

  async execute(m,args,{user,E,G,f}){

    const bet=Number(args[0]);
    if(isNaN(bet)||user.money<bet)
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    let msg=await m.reply({embeds:[G("블랙잭",true).setDescription("🃏 카드 배분 중...")]});

    await new Promise(r=>setTimeout(r,1000));

    const userScore=Math.floor(Math.random()*11)+11;
    const botScore=Math.floor(Math.random()*11)+11;

    let win=userScore>botScore;
    let change=win?bet:-bet;

    user.money+=change;
    await user.save();

    return msg.edit({
      embeds:[
        G("결과",win)
        .setDescription(`플레이어: ${userScore}\n딜러: ${botScore}\n${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)
      ]
    });
  }
};
