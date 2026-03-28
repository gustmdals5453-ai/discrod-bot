const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name:"블랙잭",

  async execute(m,args,{user,E,err,f}){

    const bet = Number(args[0]);

    if(isNaN(bet) || bet <= 0)
      return m.reply(err(E,"금액을 입력해주세요"));

    if(user.money < bet)
      return m.reply(err(E,"잔액 부족"));

    return m.reply({
      embeds:[
        E("블랙잭").setDescription(
`## 블랙잭

\`\`\`diff
+ 배팅 금액: ${f(bet)}원
\`\`\`

## 시작하려면 버튼을 누르세요`
        )
      ],
      components:[
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`game_블랙잭_${bet}_${m.author.id}`)
            .setLabel("시작")
            .setStyle(ButtonStyle.Primary)
        )
      ]
    });
  }
};
