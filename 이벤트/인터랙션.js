const { getUser, f, rand } = require("../유틸/함수");
const { G } = require("../유틸/임베드");
const { PermissionsBitField } = require("discord.js");

module.exports = async (i) => {
  if (!i.isButton()) return;

  const user = await getUser(i.user.id);

  // 🔥 다른 유저 클릭 방지
  if (i.message.interaction && i.user.id !== i.message.interaction.user.id) {
    return i.reply({
      content: "이 버튼은 본인만 사용할 수 있습니다",
      ephemeral: true
    });
  }

  await i.deferUpdate();

  // 🎰 슬롯
  if (i.customId.startsWith("slot_")) {
    const bet = Number(i.customId.split("_")[1]);
    const icons = ["🍒","🍋","🍊","⭐","💎"];

    // 🔥 애니메이션
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
      ],
      components: []
    });
  }

  // ✌️ 가위바위보
  if (i.customId.startsWith("rps_")) {
    const [, betRaw, userC] = i.customId.split("_");
    const bet = Number(betRaw);

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
`## ✌️ 결과

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
      ],
      components: []
    });
  }

  // 🎲 바카라 / 블랙잭
  if (i.customId.startsWith("game_")) {
    const [_, type, betRaw] = i.customId.split("_");
    const bet = Number(betRaw);

    await new Promise(r => setTimeout(r, 1000));

    const win = Math.random() > 0.5;
    const change = win ? bet : -bet;

    user.money += change;
    await user.save();

    return i.editReply({
      embeds: [
        G("게임 결과", win).setDescription(
`## 🎲 ${type}

\`\`\`diff
${win ? "+ 승리!" : "- 패배"}
\`\`\`

\`\`\`diff
${change > 0 ? "+" : ""}${f(change)}원
\`\`\`

## 💰 잔액 ${f(user.money)}원`
        )
      ],
      components: []
    });
  }

  // 🎫 티켓 닫기
  if (i.customId === "close_ticket") {

    if (!i.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return i.followUp({
        content: "관리자만 가능합니다",
        ephemeral: true
      });
    }

    await i.followUp({
      content: "티켓 삭제중...",
      ephemeral: true
    });

    setTimeout(() => i.channel.delete(), 1500);
  }
};
