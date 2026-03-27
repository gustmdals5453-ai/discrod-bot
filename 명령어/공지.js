module.exports = {
  name:"공지",

  async execute(m,args,{E}){

    if(!m.member.permissions.has("Administrator"))
      return m.reply({embeds:[E("오류",0xFF4D4D)]});

    const 채널ID=args[0];
    const 에브=args[1];
    const 내용=args.slice(2).join(" ");

    const ch=m.guild.channels.cache.get(채널ID);

    if(!ch||!내용)
      return m.reply({embeds:[E("오류",0xFF4D4D).setDescription("형식: !공지 채널ID on/off 내용")]});

    return ch.send({
      content: 에브==="on" ? "@everyone" : "",
      embeds:[E("공지",0xFF3CAC).setDescription(내용)]
    });
  }
};
