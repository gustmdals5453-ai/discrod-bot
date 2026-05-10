const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Stock = require("../모델/주식");

module.exports = {
  name: "주식판매",

  async execute(message, args) {

    const code = args[0];
    const amount = Number(args[1]);

    if (!code || !amount) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("📉 주식 판매")
            .setDescription(
`## 사용법

\`\`\`diff
- !주식판매 코드 수량
\`\`\``
            )
        ]
      });
    }

    const stock = await Stock.findOne({
      code: code.toUpperCase()
    });

    if (!stock) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("📉 주식 판매")
            .setDescription(
`## 오류

\`\`\`diff
- 존재하지 않는 주식입니다
\`\`\``
            )
        ]
      });
    }

    const user = await User.findOne({
      userId: message.author.id
    });

    if (
      !user ||
      !user.stocks ||
      !user.stocks[stock.code] ||
      user.stocks[stock.code] < amount
    ) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("📉 주식 판매")
            .setDescription(
`## 판매 실패

\`\`\`diff
- 보유 주식이 부족합니다
\`\`\``
            )
        ]
      });
    }

    const total = stock.price * amount;

    user.stocks[stock.code] -= amount;
    user.money += total;

    user.markModified("stocks");

    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("📉 주식 판매 완료")
      .setColor("Orange")
      .setDescription(
`## 판매 성공

\`\`\`diff
+ ${stock.name} ${amount}주 판매 완료
\`\`\`

## 판매 금액

💰 ${total.toLocaleString()}원`
      );

    message.reply({
      embeds: [embed]
    });
  }
};
