module.exports = {
  name:"돈줘",

  async execute(m,args,{user,E,f,err}){

    const now=new Date();
    const last=new Date(user.lastDaily);

    if(now.toDateString()===last.toDateString())
      return m.reply(err(E,"하루 1회만 가능합니다"));

    user.lastDaily=Date.now();
    user.money+=10000;

    await user.save();

    return m.reply({
      embeds:[
        E("지급")
        .setDescription(`+10,000원\n잔액 ${f(user.money)}원`)
      ]
    });
  }
};
