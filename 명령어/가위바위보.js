const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"가위바위보",

  async execute(m,args,{user,E,err}){

    const bet = Number(args[0]);

    if(isNaN(bet))
      return m.reply(err(E,"금액 입력"));

    if(user.money < bet)
      return m.reply(err(E,"잔액 부족"));

    return m.reply({
      embeds:[E("가위바위보").setDescription(
`~~~diff
# 가위바위보
+ 배팅: ${bet}원
~~~`
      )],
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
