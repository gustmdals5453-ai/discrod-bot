const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const tickets = {};

module.exports = {
  name:"문의",

  async execute(m,args,{E,err}){

    const 내용 = args.join(" ");

    // 🔥 사유 필수
    if(!내용)
      return m.reply(err(E,"문의 내용을 입력해야 합니다"));

    // 🔥 중복 방지
    if(tickets[m.author.id])
      return m.reply(err(E,"이미 진행중인 문의가 있습니다"));

    const ch = await m.guild.channels.create({
      name:`문의-${m.author.username}`,
      type:ChannelType.GuildText,
      permissionOverwrites:[
        {id:m.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},
        {id:m.author.id,allow:[PermissionsBitField.Flags.ViewChannel,PermissionsBitField.Flags.SendMessages]},
        {id:m.guild.ownerId,allow:[PermissionsBitField.Flags.ViewChannel]}
      ]
    });

    tickets[m.author.id] = ch.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("문의 닫기")
      .setStyle(ButtonStyle.Danger)
    );

    await ch.send({
      embeds:[E("문의").setDescription(`\`\`\`\n${내용}\n\`\`\``)],
      components:[row]
    });

    return m.reply({
      embeds:[E("완료").setDescription("문의 채널이 생성되었습니다")]
    });
  }
};
