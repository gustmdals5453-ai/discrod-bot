const { getUser, f, rand, err } = require("../유틸/함수");
const { E, G } = require("../유틸/임베드");

const prefix = "!";

module.exports = async (m) => {

  if (m.author.bot) return;

  // =========================
  // 🔥 DM 도움말 시스템
  // =========================
  if (m.channel.type === 1) {
    return m.reply({
      embeds: [
        {
          title: "봇 사용 안내",
          description:
`## 경제

\`\`\`diff
!잔액
- 현재 자신의 보유 금액을 확인합니다

!돈줘
- 하루 1회 10,000원을 지급받습니다 (00시 초기화)

!송금 @유저 금액
- 다른 유저에게 돈을 보냅니다
\`\`\`

## 도박

\`\`\`diff
!슬롯 금액
- 슬롯 머신을 돌려 랜덤 결과로 돈을 얻거나 잃습니다

!블랙잭 금액
- 블랙잭 게임을 시작합니다 (승패에 따라 금액 변동)

!바카라 금액
- 플레이어 또는 뱅커를 선택하여 승부합니다

!가위바위보 금액
- 봇과 가위바위보를 진행합니다
\`\`\`

## 관리

\`\`\`diff
!경고 @유저 사유
- 해당 유저에게 경고를 부여합니다

!경고확인
- 자신의 경고 횟수 및 사유를 확인합니다

!경고초기화 @유저
- 해당 유저의 경고를 모두 초기화합니다
\`\`\`

## 공지

\`\`\`diff
!공지 채널ID 내용
- 지정한 채널에 공지를 보냅니다
- 입력 후 on / off 를 선택해야 합니다
- on 입력 시 @everyone 포함
- off 입력 시 일반 공지 전송
\`\`\`

## 기타

\`\`\`diff
!랭킹
- 서버 내 돈 순위를 확인합니다

!문의 내용
- 관리자에게 문의 티켓을 생성합니다
\`\`\`

## 안내

\`\`\`diff
- 모든 명령어는 서버에서 사용해야 합니다
- 버튼 기능은 본인만 사용할 수 있습니다
- 오류 발생 시 다시 시도하거나 관리자에게 문의하세요
\`\`\``,
          color: 0x2B2D31
        }
      ]
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
