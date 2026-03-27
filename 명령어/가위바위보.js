module.exports = {
  name:"가위바위보",

  async execute(m,args,{user,E,G,f,rand}){

    const bet=Number(args[0]);
    if(isNaN(bet)||bet<=0)
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    if(user.money<bet)
      return m.reply({embeds:[E("잔액 부족",0xFF4D4D)]});

    const choices=["가위","바위","보"];
    const emoji={가위:"✌️",바위:"✊",보:"✋"};

    let msg=await m.reply({embeds:[G("가위바위보",true).setDescription("🤔 선택 중...")]});

    await new Promise(r=>setTimeout(r,800));

    const userPick=rand(choices);
    const botPick=rand(choices);

    let change=0;
    let win=false;

    if((userPick==="가위"&&botPick==="보")||
       (userPick==="바위"&&botPick==="가위")||
       (userPick==="보"&&botPick==="바위")){
      change=bet;
      win=true;
    }
    else if(userPick!==botPick){
      change=-bet;
    }

    user.money+=change;
    await user.save();

    return msg.edit({
      embeds:[
        G("결과",win)
        .setDescription(`${emoji[userPick]} vs ${emoji[botPick]}\n${change>0?"+":""}${f(change)}원\n잔액 ${f(user.money)}원`)
      ]
    });
  }
};
