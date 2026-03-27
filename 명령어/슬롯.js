const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"슬롯",

  async execute(m,args,{user,E,err}){

    const bet=Number(args[0]);

    if(isNaN(bet)||bet<=0)
      return m.reply(err(E,"금액을 입력해주세요"));

    if(user.money<bet)
      return m.reply(err(E,"잔액이 부족합니다"));

    return m.reply({
      embeds:[E("슬롯").setDescription(`배팅 ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
          .setCustomId(`slot_${bet}`)
          .setLabel("🎰 시작")
          .setStyle(ButtonStyle.Success)
        )
      ]
    });
  }
};
