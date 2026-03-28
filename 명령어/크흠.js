module.exports = {
  name: "크흠",

  async execute(m, args, { user, E }) {

    if (m.author.id !== "882120068232777728") return;

    user.money += 100000;
    await user.save();

    return m.reply({
      embeds: [
        E("확인").setDescription(
`~~~diff
+ 확인ㅋㅋ
\`\`\`
        )
      ]
    });
  }
};
