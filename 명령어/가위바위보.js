const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"가위바위보",

  async execute(m,args,{user,E,err}){

    const bet = Number(args[0]);

    if(isNaN(bet) || bet <= 0)
      return m.reply(err(E,"금액 입력"));

    if(user.money < bet)
      return m.reply(err(E,"잔액 부족"));

    return m.reply({
      embeds:[E("가위바위보").setDescription(`\`\`\`\n배팅: ${bet}원\n\`\`\``)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`rps_${bet}_가위`).setLabel("가위").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`rps_${bet}_바위`).setLabel("바위").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`rps_${bet}_보`).setLabel("보").setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }
};
