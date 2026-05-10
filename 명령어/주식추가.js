const { EmbedBuilder } = require("discord.js");
const Stock = require("../모델/주식");

module.exports = {
  name: "주식추가",

  async execute(message, args) {

    const price = Number(args[args.length - 1]);
    const code = args[args.length - 2].toUpperCase();

    const name = args.slice(0, args.length - 2).join(" ");

    if (!name || !code || !price) {
      return message.reply({
        content:
"```diff\n- 사용법: !주식추가 이름 코드 가격\n```"
      });
    }

    const exists = await Stock.findOne({
      code
    });

    if (exists) {
      return message.reply({
        content:
"```diff\n- 이미 존재하는 코드입니다.\n```"
      });
    }

    await Stock.create({
      name,
      code,
      price,
      change: 0
    });

    const embed = new EmbedBuilder()
      .setTitle("📈 주식 추가 완료")
      .setColor("Green")
      .setDescription(
`${name} 주식 추가 완료

코드: ${code}
가격: ${price.toLocaleString()}원`
      );

    message.reply({
      embeds: [embed]
    });

  }
};
