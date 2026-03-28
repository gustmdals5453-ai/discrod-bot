module.exports = {
  name: "크흠",

  async execute(m, args, { user, E }) {

    // 🔥 관리자만 사용 가능
    if (m.author.id !== "882120068232777728") return;

    // 🔥 돈 지급
    user.money += 100000;
    await user.save();

    return m.reply({
      embeds: [
        E("확인").setDescription(
`확인ㅋㅋ`
        )
      ]
    });
  }
};
