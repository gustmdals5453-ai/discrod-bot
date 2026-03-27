module.exports = {
  name:"바카라",

  async execute(m,args,{user,E,G,f}){

    const bet=Number(args[0]);
    if(isNaN(bet)||user.money<bet)
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    let msg=await m.reply({embeds:[G("바카라",true).setDescription("🎲 결과 계산 중...")]});

    await new Promise(r=>setTimeout(r,1000));

    const player=Math.floor(Math.random()*10);
    const banker=Math.floor(Math.random()*10);

    let win=player>banker;
    let change=win?bet:-bet;

    user.money+=change;
    await user.save();

    return msg.edit({
      embeds:[
        G("결과",win)
        .setDescription(`플레이어: ${player}\n뱅커: ${banker}\n${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)
      ]
    });
  }
};
