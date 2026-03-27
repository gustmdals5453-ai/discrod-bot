const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"가위바위보",

  async execute(m,args,{user,E,err,f}){

    const bet = Number(args[0]);

    if(isNaN(bet) || bet <= 0)
      return m.reply(err(E,"금액을 입력해주세요"));

    if(user.money < bet)
      return m.reply(err(E,"잔액 부족"));

    return m.reply({
      embeds:[
        E("가위바위보").setDescription(
`## ✌️ 가위바위보

\`\`\`diff
+ 배팅 금액: ${f(bet)}원
\`\`\`

## 선택하세요`
        )
      ],
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
