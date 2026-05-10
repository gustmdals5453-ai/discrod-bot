const UserStock = require("../모델/유저주식");
const Stock = require("../모델/주식");

module.exports = {

  이름: "내주식",

  실행: async (message) => {

    const stocks = await UserStock.find({
      userId: message.author.id
    });

    if (!stocks.length) {

      return message.reply("보유한 주식이 없습니다.");

    }

    let text = "📈 보유 주식 목록\n\n";

    let total = 0;

    for (const data of stocks) {

      const stockInfo = await Stock.findOne({
        code: data.stockCode
      });

      if (!stockInfo) continue;

      const value = stockInfo.price * data.amount;

      total += value;

      text += `${stockInfo.name} (${stockInfo.code})\n`;
      text += `보유 수량: ${data.amount}주\n`;
      text += `현재 가치: ${value.toLocaleString()}원\n\n`;

    }

    text += `💰 총 자산: ${total.toLocaleString()}원`;

    message.reply(text);

  }
};
