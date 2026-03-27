module.exports = {
  name:"경고초기화",

  async execute(m,args,{getUser,E,err}){

    if(!m.member.permissions.has("Administrator"))
      return m.reply(err(E,"관리자만 사용 가능합니다"));

    const 대상=m.mentions.users.first();
    if(!대상)
      return m.reply(err(E,"유저를 지정해주세요"));

    const u=await getUser(대상.id);

    u.warns=0;
    u.warnList=[];

    await u.save();

    return m.reply({embeds:[E("초기화 완료")]});
  }
};
