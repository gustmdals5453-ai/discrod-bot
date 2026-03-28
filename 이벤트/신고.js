const ADMINS = [
  "1459425844974850090",
  "882120068232777728"
];

const sessions = {};

module.exports = async (m) => {

  if (m.author.bot) return;
  if (m.channel.type !== 1) return;

  const id = m.author.id;
  const input = m.content.toLowerCase().trim();

  // =========================
  // 🔥 세션 없으면 생성 + 메뉴 바로 출력
  // =========================
  if (!sessions[id]) {
    sessions[id] = { step: "menu" };

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
  // 📘 메뉴
  // =========================
  if (session.step === "menu") {

    if (input === "도움말") {
      delete sessions[id]; // 🔥 완전 초기화

      return m.reply({
        embeds: [{
          title: "봇 사용 안내",
          description:
`## 안내

\`\`\`diff
- 명령어는 서버에서 사용
- 버튼은 본인만 사용 가능
- 오류 시 다시 시도
\`\`\``,
          color: 0x2B2D31
        }]
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

    // 🔥 다른 입력 → 다시 메뉴
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

    session.reason = m.content;
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
      session.image = input === "없음" ? "없음" : m.content;
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
  // 🔐 익명 선택
  // =========================
  if (session.step === "anon") {

    if (input !== "익명" && input !== "공개") {
      return m.reply({
        embeds: [{
          title: "관리자 신고",
          description:
`## 입력 오류

\`\`\`diff
- 익명 또는 공개만 입력하세요
\`\`\``,
          color: 0xED4245
        }]
      });
    }

    const isAnon = input === "익명";

    // 🔥 관리자 DM 전송
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

    delete sessions[id]; // 🔥 완전 초기화

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
