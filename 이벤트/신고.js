const ADMINS = [
  "1459425844974850090",
  "882120068232777728"
];

module.exports = async (m) => {

  if (m.author.bot) return;
  if (m.channel.type !== 1) return; // DM만

  // 🔥 신고 시작 명령어
  if (m.content !== "신고") return;

  try {

    // =========================
    // 1️⃣ 사유 입력
    // =========================
    await m.reply({
      embeds: [{
        title: "관리자 신고 시스템",
        description:
`## 신고 진행

\`\`\`diff
- 신고 사유를 입력해주세요
\`\`\`

## 안내
\`\`\`diff
- 60초 안에 입력해야 합니다
\`\`\``,
        color: 0x2B2D31
      }]
    });

    const reasonMsg = await m.channel.awaitMessages({
      filter: msg => msg.author.id === m.author.id,
      max: 1,
      time: 60000,
      errors: ["time"]
    });

    const reason = reasonMsg.first().content;

    // =========================
    // 2️⃣ 사진 첨부
    // =========================
    await m.reply({
      embeds: [{
        title: "관리자 신고 시스템",
        description:
`## 증거 첨부

\`\`\`diff
- 증거 사진을 보내주세요
- 없으면 "없음" 입력
\`\`\``,
        color: 0x2B2D31
      }]
    });

    const imgMsg = await m.channel.awaitMessages({
      filter: msg => msg.author.id === m.author.id,
      max: 1,
      time: 60000,
      errors: ["time"]
    });

    let image = "없음";

    if (imgMsg.first().attachments.size > 0) {
      image = imgMsg.first().attachments.first().url;
    } else if (imgMsg.first().content !== "없음") {
      image = imgMsg.first().content;
    }

    // =========================
    // 3️⃣ 익명 여부
    // =========================
    await m.reply({
      embeds: [{
        title: "관리자 신고 시스템",
        description:
`## 익명 설정

\`\`\`diff
- anonymous 입력 → 익명
- public 입력 → 공개
\`\`\``,
        color: 0x2B2D31
      }]
    });

    const anonMsg = await m.channel.awaitMessages({
      filter: msg => msg.author.id === m.author.id,
      max: 1,
      time: 60000,
      errors: ["time"]
    });

    const choice = anonMsg.first().content.toLowerCase();

    let isAnon = false;

    if (choice === "anonymous") isAnon = true;
    else if (choice === "public") isAnon = false;
    else {
      return m.reply("anonymous 또는 public 입력");
    }

    // =========================
    // 📤 관리자에게 전송
    // =========================
    for (const id of ADMINS) {
      const user = await m.client.users.fetch(id);

      await user.send({
        embeds: [{
          title: "관리자 비리 신고",
          description:
`## 신고 내용

\`\`\`diff
${reason}
\`\`\`

## 신고자
${isAnon ? "익명" : `<@${m.author.id}>`}

## 증거
${image === "없음" ? "없음" : image}`,
          color: 0xED4245
        }]
      });
    }

    // =========================
    // 완료 메시지
    // =========================
    await m.reply({
      embeds: [{
        title: "신고 완료",
        description:
`## 접수 완료

\`\`\`diff
+ 신고가 정상적으로 접수되었습니다
\`\`\``,
        color: 0x57F287
      }]
    });

  } catch (e) {

    return m.reply({
      embeds: [{
        title: "오류",
        description:
`## 실패

\`\`\`diff
- 시간 초과 또는 오류 발생
\`\`\``,
        color: 0xED4245
      }]
    });

  }
};
