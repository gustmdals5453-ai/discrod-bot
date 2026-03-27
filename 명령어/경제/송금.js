module.exports = {
  name: "송금",

  async execute(m, args, { user, 유저가져오기, 기본, 숫자 }) {

    const 대상 = m.mentions.users.first();

    // 🔥 숫자 자동 추출 (args 문제 해결)
    const 금액 = Number(args.find(a => !isNaN(a)));

    if (!대상 || isNaN(금액) || 금액 <= 0)
      return m.reply({
        embeds: [
          기본("오류", 0xFF4D4D)
          .setDescription("형식: !송금 @유저 금액")
        ]
      });

    // 🔥 자기 자신 송금 방지
    if (대상.id === m.author.id)
      return m.reply({
        embeds: [
          기본("오류", 0xFF4D4D)
          .setDescription("자기 자신에게는 송금할 수 없음")
        ]
      });

    if (user.money < 금액)
      return m.reply({
        embeds: [기본("잔액 부족", 0xFF4D4D)]
      });

    const 대상유저 = await 유저가져오기(대상.id);

    user.money -= 금액;
    대상유저.money += 금액;

    await user.save();
    await 대상유저.save();

    return m.reply({
      embeds: [
        기본("송금 완료")
        .setDescription(`${대상} ${숫자(금액)}원\n잔액 ${숫자(user.money)}원`)
      ]
    });
  }
};
