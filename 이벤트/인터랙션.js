const { getUser, f, rand } = require("../유틸/함수");
const { G } = require("../유틸/임베드");

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
    const bet = parseInt(i.customId.split("_")[1]);
    const icons = ["🍒","🍋","🍊","⭐","💎"];

    for (let x = 0; x < 3; x++) {
      await new Promise(r => setTimeout(r, 500));
      await i.editReply({
        embeds: [G("슬롯", true).setDescription(
`~~~diff
# ${rand(icons)} ${rand(icons)} ${rand(icons)}
~~~`
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
`~~~diff
# 🎰 슬롯 결과
${win ? "+ 당첨" : "- 실패"}

# ${r1} ${r2} ${r3}

${change > 0 ? "+ 획득" : "- 손실"}: ${f(change)}원
# 잔액: ${f(user.money)}원
~~~`
        )
      ],
      components: []
    });
  }

  // ✌️ 가위바위보
  if (i.customId.startsWith("rps_")) {
    const [, bet, userC] = i.customId.split("_");

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
`~~~diff
# 결과
${emoji[userC]} vs ${emoji[bot]}

${change > 0 ? "+ 승리" : change < 0 ? "- 패배" : "# 무승부"}

${change > 0 ? "+ " : "- "}${f(change)}원
# 잔액: ${f(user.money)}원
~~~`
        )
      ],
      components: []
    });
  }

  // 🎲 바카라 / 블랙잭
  if (i.customId.startsWith("game_")) {
    const [_, type, bet] = i.customId.split("_");

    await new Promise(r => setTimeout(r, 1000));

    const win = Math.random() > 0.5;
    const change = win ? bet : -bet;

    user.money += change;
    await user.save();

    return i.editReply({
      embeds: [
        G("게임 결과", win).setDescription(
`~~~diff
# 결과
${win ? "+ 승리" : "- 패배"}

${change > 0 ? "+ " : "- "}${f(change)}원
# 잔액: ${f(user.money)}원
~~~`
        )
      ],
      components: []
    });
  }

  // 🎫 티켓 닫기
  if (i.customId === "close_ticket") {
    if (!i.member.permissions.has("Administrator")) {
      return i.followUp({ content: "관리자만 가능", ephemeral: true });
    }

    await i.followUp({ content: "삭제중...", ephemeral: true });
    setTimeout(() => i.channel.delete(), 1500);
  }
};
