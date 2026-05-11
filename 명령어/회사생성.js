const { EmbedBuilder } = require("discord.js");

const Company = require("../모델/회사");
const Stock = require("../모델/주식");
const User = require("../모델/유저");

module.exports = {
  name: "회사생성",

  async execute(message, args) {

    const name = args[0];
    const code = args[1];
    const price = Number(args[2]);

    // =========================
    // 사용법
    // =========================
    if (!name || !code || !price) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏢 회사 생성")
            .setColor("Red")
            .setDescription(
`## 사용법

\`\`\`diff
- !회사생성 회사명 코드 가격
\`\`\`

## 예시

\`\`\`diff
+ !회사생성 스페이스X SPX 5000
\`\`\``
            )
        ]
      });
    }

    // =========================
    // 유저 확인
    // =========================
    let user = await User.findOne({
      userId: message.author.id
    });

    if (!user) {

      user = await User.create({
        userId: message.author.id
      });
    }

    // =========================
    // 회사 생성 비용
    // =========================
    const COMPANY_COST = 10000000000000;

    if (user.money < COMPANY_COST) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏢 회사 생성")
            .setColor("Red")
            .setDescription(
`## 생성 실패

\`\`\`diff
- 회사 생성에는 10조원이 필요합니다
\`\`\``)
        ]
      });
    }

    // =========================
    // 코드 대문자
    // =========================
    const upperCode = code.toUpperCase();

    // =========================
    // 회사 중복 확인
    // =========================
    const existsCompany = await Company.findOne({
      name
    });

    if (existsCompany) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏢 회사 생성")
            .setColor("Red")
            .setDescription(
`## 생성 실패

\`\`\`diff
- 이미 존재하는 회사입니다
\`\`\``)
        ]
      });
    }

    // =========================
    // 주식 코드 중복 확인
    // =========================
    const existsStock = await Stock.findOne({
      code: upperCode
    });

    if (existsStock) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🏢 회사 생성")
            .setColor("Red")
            .setDescription(
`## 생성 실패

\`\`\`diff
- 이미 존재하는 주식 코드입니다
\`\`\``)
        ]
      });
    }

    // =========================
    // 돈 차감
    // =========================
    user.money -= COMPANY_COST;

    await user.save();

    // =========================
    // 회사 생성
    // =========================
    await Company.create({
      name
    });

    // =========================
    // 주식 자동 생성
    // =========================
    await Stock.create({
      name,
      code: upperCode,
      price,
      change: 0
    });

    // =========================
    // 완료
    // =========================
    const embed = new EmbedBuilder()
      .setTitle("🏢 회사 생성 완료")
      .setColor("Green")
      .setDescription(
`## 생성 성공

\`\`\`diff
+ 회사와 주식이 생성되었습니다
\`\`\`

## 회사 정보

🏢 회사명 : ${name}
📌 주식 코드 : ${upperCode}
💰 시작 가격 : ${price.toLocaleString()}원

## 사용 금액

💸 ${COMPANY_COST.toLocaleString()}원`
      );

    message.reply({
      embeds: [embed]
    });
  }
};
