const { EmbedBuilder } = require("discord.js");

const Stock = require("../모델/주식");

const ADMINS = [
  "1459425844974850090",
  "882120068232777728",
  "1035560131380924487"
];

module.exports = {
  name: "주식삭제",

  async execute(message, args) {

    // =========================
    // 관리자 체크
    // =========================
    if (!ADMINS.includes(message.author.id)) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ 권한 없음")
            .setColor("Red")
            .setDescription(
`## 실행 실패

\`\`\`diff
- 관리자만 사용할 수 있습니다
\`\`\``
            )
        ]
      });
    }

    // =========================
    // 코드 입력
    // =========================
    const code = args[0];

    if (!code) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗑 주식 삭제")
            .setColor("Red")
            .setDescription(
`## 사용법

\`\`\`diff
- !주식삭제 코드
\`\`\`

## 예시

\`\`\`diff
+ !주식삭제 SPX
\`\`\``
            )
        ]
      });
    }

    const upperCode = code.toUpperCase();

    // =========================
    // 존재 확인
    // =========================
    const stock = await Stock.findOne({
      code: upperCode
    });

    if (!stock) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗑 주식 삭제")
            .setColor("Red")
            .setDescription(
`## 삭제 실패

\`\`\`diff
- 존재하지 않는 주식입니다
\`\`\``
            )
        ]
      });
    }

    // =========================
    // 삭제
    // =========================
    await Stock.deleteMany({
      code: upperCode
    });

    // =========================
    // 완료
    // =========================
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🗑 주식 삭제 완료")
          .setColor("Green")
          .setDescription(
`## 삭제 성공

\`\`\`diff
+ ${upperCode} 주식이 삭제되었습니다
\`\`\``
          )
      ]
    });
  }
};
