const { getUser, f, rand, err } = require("../유틸/함수");
const { E, G } = require("../유틸/임베드");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const prefix = "!";

const ADMINS = [
  "1459425844974850090",
  "882120068232777728"
];

// 🔥 상태 저장
const dmState = {};

module.exports = async (m) => {

  if (m.author.bot) return;

  // =========================
  // 🔥 DM 시스템 (여기서 전부 처리)
  // =========================
  if (m.channel.type === 1) {

    const id = m.author.id;
    const input = m.content.trim();

    if (!dmState[id]) {
      dmState[id] = { step: "menu" };

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

    const session = dmState[id];

    // =========================
    // 📘 메뉴
    // =========================
    if (session.step === "menu") {

      if (input === "도움말") {

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("help_경제").setLabel("경제").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("help_도박").setLabel("도박").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("help_관리").setLabel("관리").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("help_공지").setLabel("공지").setStyle(ButtonStyle.Secondary)
        );

        delete dmState[id]; // 🔥 도움말 끝나면 초기화

        return m.reply({
          embeds: [{
            title: "봇 사용 안내",
            description:
`## 카테고리 선택

\`\`\`diff
- 아래 버튼을 눌러 확인하세요
\`\`\``,
            color: 0x2B2D31
          }],
          components: [row]
        });
      }

      if (input === "신고") {
        session.step = "reason";

        return m.reply({
          embeds: [{
            title: "관리자 신고",
            description:
`## 사유 입력

\`\`\`diff
- 신고 사유를 입력해주세요
\`\`\``,
            color: 0x2B2D31
          }]
        });
      }

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
    // 📝 사유
    // =========================
    if (session.step === "reason") {

      session.reason = input;
      session.step = "image";

      return m.reply({
        embeds: [{
          title: "관리자 신고",
          description:
`## 증거 첨부

\`\`\`diff
- 사진 첨부 또는 없음 입력
\`\`\``,
          color: 0x2B2D31
        }]
      });
    }

    // =========================
    // 📷 이미지
    // =========================
    if (session.step === "image") {

      if (m.attachments.size > 0) {
        session.image = m.attachments.first().url;
      } else {
        session.image = input === "없음" ? "없음" : input;
      }

      session.step = "anon";

      return m.reply({
        embeds: [{
          title: "관리자 신고",
          description:
`## 익명 여부

\`\`\`diff
- 익명 입력 → 익명
- 공개 입력 → 공개
\`\`\``,
          color: 0x2B2D31
        }]
      });
    }

    // =========================
    // 🔐 익명
    // =========================
    if (session.step === "anon") {

      if (input !== "익명" && input !== "공개") return;

      const isAnon = input === "익명";

      for (const adminId of ADMINS) {
        try {
          const admin = await m.client.users.fetch(adminId);

          await admin.send({
            embeds: [{
              title: "관리자 비리 신고",
              description:
`## 신고 내용

\`\`\`diff
${session.reason}
\`\`\`

## 신고자
${isAnon ? "익명" : `<@${m.author.id}>`}

## 증거
${session.image || "없음"}`,
              color: 0xED4245
            }]
          });

        } catch (e) {
          console.error("관리자 DM 실패:", adminId);
        }
      }

      delete dmState[id];

      return m.reply({
        embeds: [{
          title: "신고 완료",
          description:
`## 완료

\`\`\`diff
+ 신고가 접수되었습니다
\`\`\``,
          color: 0x57F287
        }]
      });
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
