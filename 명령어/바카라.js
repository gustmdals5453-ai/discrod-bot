const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"바카라",

  async execute(m,args,{user,E,err,f}){

    const bet = Number(args[0]);

    if(isNaN(bet) || bet <= 0)
      return m.reply(err(E,"금액을 입력해주세요"));

    if(user.money < bet)
      return m.reply(err(E,"잔액 부족"));

    return m.reply({
      embeds:[
        E("바카라").setDescription(
`## 🎲 바카라

\`\`\`diff
+ 배팅 금액: ${f(bet)}원
\`\`\`

##  선택하세요
- 플레이어 / 뱅커`
        )
      ],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`game_player_${bet}`)
            .setLabel("플레이어")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId(`game_banker_${bet}`)
            .setLabel("뱅커")
            .setStyle(ButtonStyle.Danger)
        )
      ]
    });
  }
};
