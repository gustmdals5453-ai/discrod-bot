const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Stock = require("../모델/주식");

module.exports = {
  이름: "주식구매",

  async 실행(message, args) {

    const code = args[0];
    const amount = Number(args[1]);

    if (!code || !amount) {
      return message.reply({
        content: "```diff\n- 사용법: !주식구매 코드 수량\n```"
      });
    }

    const stock = await Stock.findOne({
      code: code.toUpperCase()
    });

    if (!stock) {
      return message.reply({
        content: "```diff\n- 존재하지 않는 주식입니다.\n```"
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
        content: "```diff\n- 돈이 부족합니다.\n```"
      });
    }

    user.money -= total;

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
`${stock.name} 주식 ${amount}주 구매 완료

💰 사용 금액:
${total.toLocaleString()}원`
      );

    message.reply({
      embeds: [embed]
    });
  }
};
