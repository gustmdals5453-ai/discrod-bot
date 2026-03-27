const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "공지",

  async execute(m, args, { E, err }) {

    if (!m.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return m.reply(err(E, "관리자만 사용 가능"));

    const 채널ID = args[0];
    const 내용 = args.slice(1).join(" ");

    if (!채널ID || !내용)
      return m.reply(err(E, "형식: !공지 채널ID 내용"));

    const ch = m.guild.channels.cache.get(채널ID);

    if (!ch || ch.type !== ChannelType.GuildText)
      return m.reply(err(E, "텍스트 채널만 가능"));

    // 🔥 설정 안내
    await m.reply({
      embeds: [
        E("공지 설정").setDescription(
`## 📢 에브리원 설정

\`\`\`diff
# on  = @everyone 포함
# off = 일반 공지
\`\`\`

## 👉 on / off 입력 (15초)`
        )
      ]
    });

    try {
      const filter = msg => msg.author.id === m.author.id;

      const collected = await m.channel.awaitMessages({
        filter,
        max: 1,
        time: 15000,
        errors: ["time"]
      });

      const 답 = collected.first().content.trim().toLowerCase();

      let mention = "";

      if (답 === "on") mention = "@everyone";
      else if (답 === "off") mention = "";
      else return m.reply(err(E, "on 또는 off만 입력"));

      // 🔥 공지 전송
      await ch.send({
        content: mention,
        embeds: [
          E("공지").setDescription(
`## 📢 공지

\`\`\`diff
${내용}
\`\`\``
          )
        ]
      });

      return m.reply({
        embeds: [
          E("공지 완료").setDescription(
`## ✅ 완료

\`\`\`diff
+ 공지가 전송되었습니다
\`\`\``
          )
        ]
      });

    } catch {
      return m.reply(err(E, "시간 초과 (15초)"));
    }

  }
};
