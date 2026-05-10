const { EmbedBuilder } = require("discord.js");

const User = require("../모델/유저");
const Company = require("../모델/회사");
const Stock = require("../모델/주식");

module.exports = {
  name: "회사생성",

  async execute(message, args) {

    const name = args.join(" ");

    if (!name) {
      return message.reply({
        content: "```diff\n- 사용법: !회사생성 회사이름\n```"
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

    // 이미 회사 있음
    if (user.company) {
      return message.reply({
        content: "```diff\n- 이미 회사를 보유하고 있습니다.\n```"
      });
    }

    // 10조 필요
    const needMoney = 10000000000000;

    if (user.money < needMoney) {
      return message.reply({
        content:
"```diff\n- 회사를 생성하려면 10조원이 필요합니다.\n```"
      });
    }

    // 회사 이름 중복 확인
    const exists = await Company.findOne({
      name
    });

    if (exists) {
      return message.reply({
        content:
"```diff\n- 이미 존재하는 회사 이름입니다.\n```"
      });
    }

    // 돈 차감
    user.money -= needMoney;

    // 회사 생성
    const company = await Company.create({
      ownerId: message.author.id,
      name
    });

    // 회사 주식 생성
    await Stock.create({
      name: company.name,
      code: company.name.slice(0,3).toUpperCase(),
      price: 10000,
      change: 0
    });

    // 유저 회사 등록
    user.company = company.name;

    await user.save();

    const embed = new EmbedBuilder()
      .setTitle("🏢 회사 생성 완료")
      .setColor("Blue")
      .setDescription(
`회사명: ${company.name}

📈 상장 완료:
${company.name}

💸 사용 금액:
10,000,000,000,000원`
      );

    message.reply({
      embeds: [embed]
    });

  }
};
