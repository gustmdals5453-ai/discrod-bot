const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const tickets = {};

module.exports = {
  name: "문의",

  async execute(m, args, { E, err }) {

    const 내용 = args.join(" ");

    if (!내용)
      return m.reply(err(E, "문의 내용을 입력해야 합니다"));

    if (tickets[m.author.id])
      return m.reply(err(E, "이미 진행중인 문의가 있습니다"));

    try {
      // 🔥 채널 이름 안전 처리
      const safeName = m.author.username.replace(/[^a-zA-Z0-9가-힣]/g, "").slice(0, 10);

      const ch = await m.guild.channels.create({
        name: `문의-${safeName}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          { id: m.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: m.author.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
          { id: m.guild.ownerId, allow: [PermissionsBitField.Flags.ViewChannel] }
        ]
      });

      tickets[m.author.id] = ch.id;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("문의 닫기")
          .setStyle(ButtonStyle.Danger)
      );

      await ch.send({
        embeds: [
          E("문의 접수").setDescription(
`## 📩 문의 내용

\`\`\`diff
! ${내용}
\`\`\`

## 📌 안내
\`\`\`diff
# 관리자가 확인 후 답변합니다
\`\`\``
          )
        ],
        components: [row]
      });

      return m.reply({
        embeds: [
          E("완료").setDescription(
`## ✅ 문의 생성됨

\`\`\`diff
+ 문의 채널이 생성되었습니다
\`\`\``
          )
        ]
      });

    } catch (e) {
      console.error(e);
      return m.reply(err(E, "문의 생성 중 오류 발생"));
    }

  }
};
