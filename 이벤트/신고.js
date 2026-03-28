const ADMINS = [
  "1459425844974850090",
  "882120068232777728"
];

const sessions = {};

module.exports = async (m) => {

  if (m.author.bot) return;
  if (m.channel.type !== 1) return;

  const id = m.author.id;

  // =========================
  // 🔥 처음 진입
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
  // 📘 메뉴 선택
  // =========================
  if (session.step === "메뉴") {

    const input = m.content.trim();

    // 🔥 도움말 → 여기서 처리 안함
    if (input === "도움말") {
      delete sessions[id];
      return; // 👉 메세지.js로 넘김
    }

    if (input === "신고") {
      session.step = "사유";

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

    return;
  }

  // =========================
  // 📝 사유
  // =========================
  if (session.step === "사유") {

    session.reason = m.content;
    session.step = "증거";

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
  // 📷 증거
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
  // 🔐 익명 선택
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

    // 🔥 관리자 전송 (오류 방지)
    for (const adminId of ADMINS) {
      try {
        const admin = await m.client.users.fetch(adminId);
        await admin.send({ embeds: [embed] });
      } catch (e) {
        console.log(`DM 실패: ${adminId}`);
      }
    }

    delete sessions[id];

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
};
