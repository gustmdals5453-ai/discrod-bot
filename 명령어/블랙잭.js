const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"블랙잭",

  async execute(m,args,{user,E,err}){

    const bet=Number(args[0]);

    if(isNaN(bet)||user.money<bet)
      return m.reply(err(E,"금액 오류 또는 잔액 부족"));

    return m.reply({
      embeds:[E("블랙잭").setDescription(`배팅 ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
          .setCustomId(`game_블랙잭_${bet}`)
          .setLabel("🃏 시작")
          .setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }
};
