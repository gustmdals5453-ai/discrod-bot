const { getUser, f, rand, err } = require("../유틸/함수");
const { E, G } = require("../유틸/임베드");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const prefix = "!";

// 🔥 DM 상태 저장
const dmState = {};

module.exports = async (m) => {

  if (m.author.bot) return;

  // =========================
  // 🔥 DM 시스템
  // =========================
  if (m.channel.type === 1) {

    const id = m.author.id;

    // 🔥 처음 진입
    if (!dmState[id]) {
      dmState[id] = "메뉴";

      return m.reply({
        embeds: [{
          title: "문의 시스템",
          description:
`## 선택

\`\`\`diff
- 신고 입력 → 관리자 신고
- 도움말 입력 → 사용 방법
\`\`\``,
          color: 0x2B2D31
        }]
      });
    }

    // =========================
    // 🔥 메뉴 상태
    // =========================
    if (dmState[id] === "메뉴") {

      const input = m.content.trim();

      // 👉 도움말 선택
      if (input === "도움말") {

        dmState[id] = "도움말";

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

      // 👉 신고 선택
      if (input === "신고") {
        delete dmState[id]; // 🔥 상태 넘김
        return; // 👉 신고.js가 처리
      }

      return;
    }

    return;
  }

  // =========================
  // 🔥 서버 명령어
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
