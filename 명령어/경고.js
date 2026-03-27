const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "경고",

  async execute(m, args, { getUser, E, err }) {

    if (!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply(err(E, "관리자만 사용 가능"));

    const 대상 = m.mentions.users.first();
    const 사유 = args.slice(1).join(" ");

    if (!대상 || !사유)
      return m.reply(err(E, "형식: !경고 @유저 사유"));

    // 🔥 자기 자신 경고 방지
    if (대상.id === m.author.id)
      return m.reply(err(E, "자기 자신에게 경고 불가"));

    const u = await getUser(대상.id);

    u.warns++;
    u.warnList.push(사유);

    if (u.warnList.length > 20) u.warnList.shift();

    await u.save();

    return m.reply({
      embeds: [
        E("경고 부여", 0xFEE75C).setDescription(
`## ⚠️ 경고 부여

\`\`\`diff
! 경고가 추가되었습니다
\`\`\`

## 👤 대상
<@${대상.id}>

## 📄 사유
> ${사유}

## ⚠️ 누적 경고
${u.warns}회`
        )
      ]
    });

  }
};
