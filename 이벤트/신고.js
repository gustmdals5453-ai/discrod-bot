const ADMINS = [
  "1459425844974850090",
  "882120068232777728"
];

// 🔥 DM 안될 때 보낼 채널 ID 넣어라
const LOG_CHANNEL_ID = "1487463833437081700";

const sessions = {};

module.exports = async (m) => {

  if (m.author.bot) return;
  if (m.channel.type !== 1) return;

  const id = m.author.id;

  // =========================
  // 메뉴
  // =========================
  if (!sessions[id]) {

    sessions[id] = { step: "메뉴" };

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

  const session = sessions[id];

  // =========================
  // 메뉴 선택
  // =========================
  if (session.step === "메뉴") {

    const input = m.content.trim();

    if (input === "도움말") {
      delete sessions[id];

      return m.reply({
        embeds: [{
          title: "사용 안내",
          description:
`## 안내

\`\`\`diff
- 명령어는 서버에서 사용
- 신고는 DM에서 진행
\`\`\``,
          color: 0x2B2D31
        }]
      });
    }

    if (input === "신고") {
      session.step = "사유";

      return m.reply({
        embeds: [{
          title: "관리자 신고",
          description:
`## 사유 입력

\`\`\`diff
- 신고 사유 입력
\`\`\``,
          color: 0x2B2D31
        }]
      });
    }

    return;
  }

  // =========================
  // 사유
  // =========================
  if (session.step === "사유") {

    session.reason = m.content;
    session.step = "증거";

    return m.reply({
      embeds: [{
        title: "관리자 신고",
        description:
`## 증거

\`\`\`diff
- 사진 첨부 또는 없음 입력
\`\`\``,
        color: 0x2B2D31
      }]
    });
  }

  // =========================
  // 증거
  // =========================
  if (session.step === "증거") {

    if (m.attachments.size > 0) {
      session.image = m.attachments.first().url;
    } else {
      session.image = m.content === "없음" ? "없음" : m.content;
    }

    session.step = "익명";

    return m.reply({
      embeds: [{
        title: "관리자 신고",
        description:
`## 익명 설정

\`\`\`diff
- 익명 입력 → 익명
- 공개 입력 → 공개
\`\`\``,
        color: 0x2B2D31
      }]
    });
  }

  // =========================
  // 익명 선택
  // =========================
  if (session.step === "익명") {

    const input = m.content.trim();

    if (input !== "익명" && input !== "공개") return;

    const isAnon = input === "익명";

    const embed = {
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
    };

    // =========================
    // 🔥 관리자 DM 전송 + 실패 대응
    // =========================
    for (const adminId of ADMINS) {

      try {
        const admin = await m.client.users.fetch(adminId);

        await admin.send({ embeds: [embed] });

        console.log(`DM 성공: ${adminId}`);

      } catch (e) {

        console.log(`DM 실패: ${adminId}`, e.message);

        // 🔥 fallback: 서버 채널로 전송
        try {
          const ch = await m.client.channels.fetch(LOG_CHANNEL_ID);
          if (ch) await ch.send({ embeds: [embed] });
        } catch (err) {
          console.log("채널 전송도 실패");
        }
      }
    }

    delete sessions[id];

    return m.reply({
      embeds: [{
        title: "완료",
        description:
`## 신고 접수

\`\`\`diff
+ 정상적으로 접수되었습니다
\`\`\``,
        color: 0x57F287
      }]
    });
  }
};
