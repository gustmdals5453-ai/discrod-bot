module.exports = {
  name:"송금",

  async execute(m,args,{user,getUser,E,f}){

    const 대상=m.mentions.users.first();
    const 금액=Number(args.find(a=>!isNaN(a)));

    if(!대상||isNaN(금액)||금액<=0)
      return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("형식: !송금 @유저 금액")]});

    if(대상.id===m.author.id)
      return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("자기 자신 송금 불가")]});

    if(user.money<금액)
      return m.reply({embeds:[E("잔액 부족",0xFF4D4D)]});

    const u=await getUser(대상.id);

    user.money-=금액;
    u.money+=금액;

    await user.save();
    await u.save();

    return m.reply({
      embeds:[
        E("송금 완료")
        .setDescription(`${대상} ${f(금액)}원\n잔액 ${f(user.money)}원`)
      ]
    });
  }
};
