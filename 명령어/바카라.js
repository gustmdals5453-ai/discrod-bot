const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"바카라",

  async execute(m,args,{user,E,err}){

    const bet = Number(args[0]);

    if(isNaN(bet) || bet <= 0)
      return m.reply(err(E,"금액 입력"));

    if(user.money < bet)
      return m.reply(err(E,"잔액 부족"));

    return m.reply({
      embeds:[E("바카라").setDescription(`\`\`\`\n배팅: ${bet}원\n\`\`\``)],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`game_player_${bet}`).setLabel("플레이어").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`game_banker_${bet}`).setLabel("뱅커").setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }
};
