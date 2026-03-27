const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"바카라",

  async execute(m,args,{user,E,err}){

    const bet=Number(args[0]);

    if(isNaN(bet)||user.money<bet)
      return m.reply(err(E,"금액 오류 또는 잔액 부족"));

    return m.reply({
      embeds:[E("바카라").setDescription(`배팅 ${bet}원`)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`game_player_${bet}`).setLabel("플레이어").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`game_banker_${bet}`).setLabel("뱅커").setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }
};
