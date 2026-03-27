module.exports = {
  name: "송금",

  async execute(m, args, { user, getUser, E, err, f }) {

    const 대상 = m.mentions.users.first();
    const 금액 = Number(args.find(a => !isNaN(a)));

    if (!대상 || isNaN(금액) || 금액 <= 0)
      return m.reply(err(E, "형식: !송금 @유저 금액"));

    // 🔥 자기 자신 송금 방지
    if (대상.id === m.author.id)
      return m.reply(err(E, "자기 자신에게 송금할 수 없습니다"));

    // 🔥 봇 송금 방지
    if (대상.bot)
      return m.reply(err(E, "봇에게 송금할 수 없습니다"));

    if (user.money < 금액)
      return m.reply(err(E, "잔액 부족"));

    const 대상유저 = await getUser(대상.id);

    user.money -= 금액;
    대상유저.money += 금액;

    await user.save();
    await 대상유저.save();

    return m.reply({
      embeds: [
        E("송금 완료").setDescription(
`## 💸 송금 완료

\`\`\`diff
+ ${f(금액)}원 전송 완료
\`\`\`

## 👤 대상
<@${대상.id}>

## 💰 현재 잔액
${f(user.money)}원`
        )
      ]
    });

  }
};
