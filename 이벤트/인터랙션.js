const { getUser, f, rand } = require("../유틸/함수");
const { G } = require("../유틸/임베드");
const { PermissionsBitField } = require("discord.js");

module.exports = async (i) => {
  if (!i.isButton()) return;

  // =========================
  // 📘 도움말 버튼
  // =========================
  if (i.customId.startsWith("help_")) {

    const type = i.customId.split("_")[1];

    const data = {
      경제:
`## 경제

\`\`\`diff
!잔액
- 현재 돈 확인

!돈줘
- 하루 1회 10,000원 지급

!송금 @유저 금액
- 유저에게 돈 전송
\`\`\``,

      도박:
`## 도박

\`\`\`diff
!슬롯 금액
- 슬롯 머신

!블랙잭 금액
- 블랙잭 게임

!바카라 금액
- 플레이어 / 뱅커 선택

!가위바위보 금액
- 봇과 승부
\`\`\``,

      관리:
`## 관리

\`\`\`diff
!경고 @유저 사유
- 경고 부여

!경고확인
- 경고 확인

!경고초기화 @유저
- 경고 초기화
\`\`\``,

      공지:
`## 공지

\`\`\`diff
!공지 채널ID 내용
- 공지 전송

- on → @everyone 포함
- off → 일반 공지
\`\`\``
    };

    return i.update({
      embeds: [
        {
          title: "봇 사용 안내",
          description: data[type],
          color: 0x2B2D31
        }
      ],
      components: i.message.components
    });
  }

  // =========================
  // 🔥 customId 파싱
  // =========================
  const parts = i.customId.split("_");

  // =========================
  // 🎰 슬롯
  // =========================
  if (parts[0] === "slot") {

    const bet = Number(parts[1]);
    const userId = parts[2];

    if (i.user.id !== userId) {
      return i.reply({
        content: "본인만 사용할 수 있습니다",
        ephemeral: true
      });
    }

    const user = await getUser(i.user.id);

    if (isNaN(bet) || bet <= 0) return;

    if (user.money < bet) {
      return i.reply({
        embeds:[G("오류", false).setDescription("잔액 부족")],
        ephemeral: true
      });
    }

    await i.deferUpdate();

    const icons = ["🍒","🍋","🍊","⭐","💎"];

    for (let x = 0; x < 3; x++) {
      await new Promise(r => setTimeout(r, 500));
      await i.editReply({
        embeds: [G("슬롯", true).setDescription(
`## 🎰 슬롯 머신

\`\`\`diff
# ${rand(icons)} ${rand(icons)} ${rand(icons)}
\`\`\``
        )],
        components: []
      });
    }

    const r1 = rand(icons), r2 = rand(icons), r3 = rand(icons);

    let change = 0;
    let win = false;

    if (r1 === r2 && r2 === r3) {
      change = bet * 5;
      win = true;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      change = bet * 2;
      win = true;
    } else {
      change = -bet;
    }

    user.money += change;
    await user.save();

    return i.editReply({
      embeds: [
        G("슬롯 결과", win).setDescription(
`## 🎰 슬롯 결과

\`\`\`diff
${win ? "+ 당첨!" : "- 실패"}
\`\`\`

## ${r1} ${r2} ${r3}

\`\`\`diff
${change > 0 ? "+ 획득" : "- 손실"}: ${f(change)}원
\`\`\`

## 💰 잔액 ${f(user.money)}원`
        )
      ]
    });
  }

  // =========================
  // ✌️ 가위바위보
  // =========================
  if (parts[0] === "rps") {

    const bet = Number(parts[1]);
    const userId = parts[2];
    const userC = parts[3];

    if (i.user.id !== userId) {
      return i.reply({
        content: "본인만 사용할 수 있습니다",
        ephemeral: true
      });
    }

    const user = await getUser(i.user.id);

    if (isNaN(bet) || bet <= 0) return;

    if (user.money < bet) {
      return i.reply({
        embeds:[G("오류", false).setDescription("잔액 부족")],
        ephemeral: true
      });
    }

    await i.deferUpdate();

    const choices = ["가위","바위","보"];
    const emoji = {가위:"✌️",바위:"✊",보:"✋"};

    await new Promise(r => setTimeout(r, 700));

    const bot = rand(choices);

    let change = 0;
    let win = false;

    if ((userC==="가위"&&bot==="보")||(userC==="바위"&&bot==="가위")||(userC==="보"&&bot==="바위")) {
      change = bet;
      win = true;
    } else if (userC !== bot) {
      change = -bet;
    }

    user.money += change;
    await user.save();

    return i.editReply({
      embeds: [
        G("가위바위보 결과", win).setDescription(
`## 결과

\`\`\`diff
${emoji[userC]} vs ${emoji[bot]}
\`\`\`

\`\`\`diff
${change > 0 ? "+ 승리" : change < 0 ? "- 패배" : "# 무승부"}
\`\`\`

\`\`\`diff
${change > 0 ? "+" : ""}${f(change)}원
\`\`\`

## 💰 잔액 ${f(user.money)}원`
        )
      ]
    });
  }

  // =========================
  // 🎲 바카라 / 블랙잭
  // =========================
  if (parts[0] === "game") {

    const type = parts[1];
    const bet = Number(parts[2]);
    const userId = parts[3];

    if (i.user.id !== userId) {
      return i.reply({
        content: "본인만 사용할 수 있습니다",
        ephemeral: true
      });
    }

    const user = await getUser(i.user.id);

    if (isNaN(bet) || bet <= 0) return;

    if (user.money < bet) {
      return i.reply({
        embeds:[G("오류", false).setDescription("잔액 부족")],
        ephemeral: true
      });
    }

    await i.deferUpdate();

    await new Promise(r => setTimeout(r, 1000));

    const win = Math.random() > 0.5;
    const change = win ? bet : -bet;

    user.money += change;
    await user.save();

    return i.editReply({
      embeds: [
        G("게임 결과", win).setDescription(
`## ${type}

\`\`\`diff
${win ? "+ 승리!" : "- 패배"}
\`\`\`

\`\`\`diff
${change > 0 ? "+" : ""}${f(change)}원
\`\`\`

## 💰 잔액 ${f(user.money)}원`
        )
      ]
    });
  }

  // =========================
  // 🎫 티켓 닫기
  // =========================
  if (i.customId === "close_ticket") {

    if (!i.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return i.reply({
        content: "관리자만 가능합니다",
        ephemeral: true
      });
    }

    await i.reply({
      content: "티켓 삭제중...",
      ephemeral: true
    });

    setTimeout(() => i.channel.delete(), 1500);
  }
};
