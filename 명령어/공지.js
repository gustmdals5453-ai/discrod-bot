module.exports = {
  name:"공지",

  async execute(m,args,{E,err}){

    if(!m.member.permissions.has("Administrator"))
      return m.reply(err(E,"관리자만 사용 가능합니다"));

    const 채널ID=args[0];
    const 에브=args[1];
    const 내용=args.slice(2).join(" ");

    if(!채널ID)
      return m.reply(err(E,"채널 ID를 입력해주세요"));

    if(에브!=="on"&&에브!=="off")
      return m.reply(err(E,"everyone 여부는 on / off 로 입력"));

    if(!내용)
      return m.reply(err(E,"공지 내용을 입력해주세요"));

    const ch=m.guild.channels.cache.get(채널ID);

    if(!ch)
      return m.reply(err(E,"채널을 찾을 수 없습니다"));

    return ch.send({
      content: 에브==="on" ? "@everyone" : "",
      embeds:[E("공지",0xFF3CAC).setDescription(내용)]
    });
  }
};
