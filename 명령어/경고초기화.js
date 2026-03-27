const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "경고초기화",

  async execute(m, args, { getUser, E, err }) {

    if (!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply(err(E, "관리자만 사용 가능"));

    const 대상 = m.mentions.users.first();

    if (!대상)
      return m.reply(err(E, "유저를 지정해주세요"));

    // 🔥 자기 자신 초기화 방지 (선택)
    if (대상.id === m.author.id)
      return m.reply(err(E, "자기 자신은 초기화할 수 없습니다"));

    const u = await getUser(대상.id);

    // 🔥 경고 없을 때
    if (u.warns === 0)
      return m.reply(err(E, "이미 경고가 없습니다"));

    u.warns = 0;
    u.warnList = [];

    await u.save();

    return m.reply({
      embeds: [
        E("초기화 완료", 0x57F287).setDescription(
`## ✅ 경고 초기화

\`\`\`diff
+ 모든 경고가 제거되었습니다
\`\`\`

##  대상
<@${대상.id}>`
        )
      ]
    });

  }
};
