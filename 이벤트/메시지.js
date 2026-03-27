const { getUser, f, rand, err } = require("../유틸/함수");
const { E, G } = require("../유틸/임베드");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const prefix = "!";

module.exports = async (m) => {

  if (m.author.bot) return;

  // =========================
  // 🔥 DM 도움말 (버튼 UI)
  // =========================
  if (m.channel.type === 1) {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_경제").setLabel("경제").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_도박").setLabel("도박").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_관리").setLabel("관리").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_공지").setLabel("공지").setStyle(ButtonStyle.Secondary)
    );

    return m.reply({
      embeds: [
        {
          title: "봇 사용 안내",
          description:
`## 카테고리 선택

\`\`\`diff
- 아래 버튼을 눌러 확인하세요
\`\`\``,
          color: 0x2B2D31
        }
      ],
      components: [row]
    });
  }

  // =========================
  // 🔥 서버 명령어 처리
  // =========================
  if (!m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift();

  const command = m.client.commands.get(cmd);
  if (!command) return;

  const user = await getUser(m.author.id);

  try {
    command.execute(m, args, { user, getUser, E, G, f, rand, err });
  } catch (e) {
    console.error(e);
  }
};
