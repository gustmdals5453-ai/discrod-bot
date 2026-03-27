module.exports = {
  name:"경고확인",

  async execute(m,args,{getUser,E}){

    const 대상=m.mentions.users.first()||m.author;
    const u=await getUser(대상.id);

    return m.reply({
      embeds:[
        E("경고 확인")
        .setDescription(`${대상}\n경고: ${u.warns}회\n${u.warnList.join("\n")||"없음"}`)
      ]
    });
  }
};
