const { EmbedBuilder } = require("discord.js");
const Stock = require("../모델/주식");

module.exports = {
  name: "주식목록",

  async execute(message) {

    const stocks = await Stock.find();

    const embed = new EmbedBuilder()
      .setTitle("📈 주식 목록")
      .setColor("Blue");

    stocks.forEach(stock => {

      const emoji =
        stock.change > 0 ? "📈" :
        stock.change < 0 ? "📉" :
        "➖";

      embed.addFields({
        name: `${emoji} ${stock.name} (${stock.code})`,
        value:
`현재가: ${stock.price.toLocaleString()}원
변동률: ${stock.change}%`,
        inline: false
      });

    });

    message.reply({
      embeds: [embed]
    });

  }
};
