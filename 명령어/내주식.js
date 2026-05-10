const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Stock = require("../모델/주식");

module.exports = {
  name: "내주식",

  async execute(message) {

    const user = await User.findOne({
      userId: message.author.id
    });

    if (
      !user ||
      !user.stocks ||
      Object.keys(user.stocks).length === 0
    ) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📈 내주식")
            .setColor("Red")
            .setDescription(
`## 보유 주식 없음

\`\`\`diff
- 현재 보유중인 주식이 없습니다
\`\`\``
            )
        ]
      });
    }

    let text = "";
    let total = 0;

    for (const code in user.stocks) {

      const amount = user.stocks[code];

      if (amount <= 0) continue;

      const stockInfo = await Stock.findOne({
        code
      });

      if (!stockInfo) continue;

      const value = stockInfo.price * amount;

      total += value;

      text +=
`## ${stockInfo.name}

\`\`\`diff
+ 보유 수량 : ${amount}주
+ 현재 가치 : ${value.toLocaleString()}원
\`\`\`

`;
    }

    if (!text) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📈 내주식")
            .setColor("Red")
            .setDescription(
`## 보유 주식 없음

\`\`\`diff
- 현재 보유중인 유효한 주식이 없습니다
\`\`\``
            )
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📈 ${message.author.username}님의 주식`)
      .setColor("Blue")
      .setDescription(
`${text}

## 총 자산

\`\`\`diff
+ ${total.toLocaleString()}원
\`\`\``
      );

    message.reply({
      embeds: [embed]
    });
  }
};
