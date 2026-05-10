const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Stock = require("../모델/주식");

module.exports = {
  이름: "주식판매",

  async 실행(message, args) {

    const code = args[0];
    const amount = Number(args[1]);

    if (!code || !amount) {
      return message.reply({
        content: "```diff\n- 사용법: !주식판매 코드 수량\n```"
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

    const user = await User.findOne({
      userId: message.author.id
    });

    if (!user) {
      return message.reply({
        content: "```diff\n- 유저 데이터가 없습니다.\n```"
      });
    }

    if (!user.stocks[stock.code]) {
      return message.reply({
        content: "```diff\n- 해당 주식을 보유하고 있지 않습니다.\n```"
      });
    }

    if (user.stocks[stock.code] < amount) {
      return message.reply({
        content: "```diff\n- 보유 수량이 부족합니다.\n```"
      });
    }

    const total = stock.price * amount;

    user.stocks[stock.code] -= amount;
    user.money += total;

    user.markModified("stocks");

    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("📉 주식 판매 완료")
      .setColor("Red")
      .setDescription(
`${stock.name} 주식 ${amount}주 판매 완료

💰 획득 금액:
${total.toLocaleString()}원`
      );

    message.reply({
      embeds: [embed]
    });
  }
};
