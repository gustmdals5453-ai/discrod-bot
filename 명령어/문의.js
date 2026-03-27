const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"문의",

  async execute(m,args,{E,err}){

    const 내용=args.join(" ");
    if(!내용)
      return m.reply(err(E,"문의 내용을 입력해주세요"));

    const ch=await m.guild.channels.create({
      name:`문의-${m.author.username}`,
      type:ChannelType.GuildText,
      permissionOverwrites:[
        {id:m.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},
        {id:m.author.id,allow:[PermissionsBitField.Flags.ViewChannel]},
        {id:m.guild.ownerId,allow:[PermissionsBitField.Flags.ViewChannel]}
      ]
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("문의 닫기")
      .setStyle(ButtonStyle.Danger)
    );

    return ch.send({
      embeds:[E("문의").setDescription(내용)],
      components:[row]
    });
  }
};
