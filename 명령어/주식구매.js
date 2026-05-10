const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Stock = require("../모델/주식");

module.exports = {
  name: "주식구매",

  async execute(message, args) {

    const code = args[0];
    const amount = Number(args[1]);

    if (!code || !amount) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("📈 주식 구매")
            .setDescription(
`## 사용법

\`\`\`diff
- !주식구매 코드 수량
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
            .setTitle("📈 주식 구매")
            .setDescription(
`## 오류

\`\`\`diff
- 존재하지 않는 주식입니다
\`\`\``
            )
        ]
      });
    }

    let user = await User.findOne({
      userId: message.author.id
    });

    if (!user) {

      user = await User.create({
        userId: message.author.id
      });
    }

    const total = stock.price * amount;

    if (user.money < total) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("📈 주식 구매")
            .setDescription(
`## 구매 실패

\`\`\`diff
- 돈이 부족합니다
\`\`\``
            )
        ]
      });
    }

    user.money -= total;

    if (!user.stocks) {
      user.stocks = {};
    }

    if (!user.stocks[stock.code]) {
      user.stocks[stock.code] = 0;
    }

    user.stocks[stock.code] += amount;

    user.markModified("stocks");

    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("📈 주식 구매 완료")
      .setColor("Green")
      .setDescription(
`## 구매 성공

\`\`\`diff
+ ${stock.name} ${amount}주 구매 완료
\`\`\`

## 결제 금액

💰 ${total.toLocaleString()}원`
      );

    message.reply({
      embeds: [embed]
    });
  }
};
