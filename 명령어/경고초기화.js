module.exports = {
  name:"경고초기화",

  async execute(m,args,{getUser,E}){

    if(!m.member.permissions.has("Administrator"))
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    const 대상=m.mentions.users.first();
    if(!대상)
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    const u=await getUser(대상.id);
    u.warns=0;
    u.warnList=[];

    await u.save();

    return m.reply({embeds:[E("초기화 완료")]});
  }
};
