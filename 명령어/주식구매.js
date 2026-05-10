// =========================
// 📈 내주식
// =========================
if (cmd === "내주식") {

  const user = await User.findOne({
    userId: m.author.id
  });

  if (
    !user ||
    !user.stocks ||
    Object.keys(user.stocks).length === 0
  ) {

    return m.reply({
      embeds: [{
        title: "내 주식",
        description:
`## 보유 주식 없음

\`\`\`diff
- 현재 보유중인 주식이 없습니다
\`\`\``,
        color: 0xED4245
      }]
    });
  }

  let text = "";
  let total = 0;

  for (const code in user.stocks) {

    const amount = user.stocks[code];

    // 0주 이하 스킵
    if (amount <= 0) continue;

    const stockInfo = await Stock.findOne({
      code
    });

    // 존재하지 않는 주식 스킵
    if (!stockInfo) continue;

    const value = stockInfo.price * amount;

    total += value;

    text +=
`📌 ${stockInfo.name} (${stockInfo.code})
보유 수량: ${amount}주
현재 가치: ${value.toLocaleString()}원

`;
  }

  // 출력할 주식이 하나도 없을 경우
  if (!text) {

    return m.reply({
      embeds: [{
        title: "내 주식",
        description:
`## 보유 주식 없음

\`\`\`diff
- 현재 보유중인 유효한 주식이 없습니다
\`\`\``,
        color: 0xED4245
      }]
    });
  }

  return m.reply({
    embeds: [{
      title: `${m.author.username}님의 주식`,
      description:
`${text}
💰 총 자산: ${total.toLocaleString()}원`,
      color: 0x5865F2
    }]
  });
}
