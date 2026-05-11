const { EmbedBuilder } = require("discord.js");

const Company = require("../모델/회사");
const Stock = require("../모델/주식");

const ADMIN_ID = "882120068232777728";

module.exports = {
  name: "회사삭제",

  async execute(message, args) {

    // =========================
    // 관리자 체크
    // =========================
    if (message.author.id !== ADMIN_ID) {

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
            .setTitle("🗑 회사 삭제")
            .setColor("Red")
            .setDescription(
`## 사용법

\`\`\`diff
- !회사삭제 코드
\`\`\`

## 예시

\`\`\`diff
+ !회사삭제 SPX
\`\`\``
            )
        ]
      });
    }

    const upperCode = code.toUpperCase();

    // =========================
    // 주식 찾기
    // =========================
    const stock = await Stock.findOne({
      code: upperCode
    });

    if (!stock) {

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🗑 회사 삭제")
            .setColor("Red")
            .setDescription(
`## 삭제 실패

\`\`\`diff
- 존재하지 않는 회사/주식 코드입니다
\`\`\``
            )
        ]
      });
    }

    // 회사명 저장
    const companyName = stock.name;

    // =========================
    // 주식 삭제
    // =========================
    await Stock.deleteMany({
      code: upperCode
    });

    // =========================
    // 회사 삭제
    // =========================
    await Company.deleteMany({
      name: companyName
    });

    // =========================
    // 완료
    // =========================
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🗑 회사 삭제 완료")
          .setColor("Green")
          .setDescription(
`## 삭제 성공

\`\`\`diff
+ 회사와 주식이 삭제되었습니다
\`\`\`

🏢 회사명 : ${companyName}
📌 코드 : ${upperCode}`
          )
      ]
    });
  }
};
