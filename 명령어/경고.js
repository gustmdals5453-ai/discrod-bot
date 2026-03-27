module.exports = {
  name:"경고",

  async execute(m,args,{getUser,E}){

    if(!m.member.permissions.has("Administrator"))
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    const 대상=m.mentions.users.first();
    const 사유=args.slice(1).join(" ");

    if(!대상||!사유)
      return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("형식: !경고 @유저 사유")]});

    const u=await getUser(대상.id);

    u.warns++;
    u.warnList.push(사유);

    await u.save();

    return m.reply({
      embeds:[E("경고").setDescription(`${대상}\n사유: ${사유}\n누적 ${u.warns}회`)]
    });
  }
};
