module.exports = {
  name: "돈줘",

  async execute(m, args, { user, E, err, f }) {

    const 지급금액 = 10000;

    const now = new Date();
    const last = new Date(user.lastDaily);

    // 🔥 날짜 비교 (자정 기준)
    const today = now.toLocaleDateString();
    const lastDay = last.toLocaleDateString();

    if (today === lastDay)
      return m.reply(err(E, "하루 1회만 가능합니다"));

    user.lastDaily = Date.now();
    user.money += 지급금액;

    await user.save();

    return m.reply({
      embeds: [
        E("지급 완료").setDescription(
`## 💰 일일 보상

\`\`\`diff
+ ${f(지급금액)}원 지급
\`\`\`

## 💳 현재 잔액
${f(user.money)}원`
        )
      ]
    });

  }
};
