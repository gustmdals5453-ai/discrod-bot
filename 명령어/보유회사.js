const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Stock = require("../모델/주식");

module.exports = {
  name: "보유회사",

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
            .setTitle("🏢 보유회사")
            .setColor("Red")
            .setDescription(
`## 보유 회사 없음

\`\`\`diff
- 현재 보유중인 회사가 없습니다
\`\`\``
            )
        ]
      });
    }

    let text = "";

    for (const code in user.stocks) {

      const amount = user.stocks[code];

      if (amount <= 0) continue;

      const stockInfo = await Stock.findOne({
        code
      });

      if (!stockInfo) continue;

      text +=
`## ${stockInfo.name}

\`\`\`diff
+ 주식 코드 : ${stockInfo.code}
+ 보유 수량 : ${amount}주
\`\`\`

`;
    }

    if (!text) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏢 보유회사")
            .setColor("Red")
            .setDescription(
`## 보유 회사 없음

\`\`\`diff
- 현재 보유중인 유효한 회사가 없습니다
\`\`\``
            )
        ]
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏢 ${message.author.username}님의 보유회사`)
      .setColor("Gold")
      .setDescription(text);

    message.reply({
      embeds: [embed]
    });
  }
};
