module.exports = {
  name: "도움말",

  async execute(m, args, { E }) {

    return m.reply({
      embeds: [
        E("명령어 안내").setDescription(
`## 📖 명령어 안내

### 🎰 카지노
\`\`\`diff
!슬롯 금액
!블랙잭 금액
!바카라 금액
!가위바위보 금액
\`\`\`

### 💰 경제
\`\`\`diff
!잔액
!송금 @유저 금액
!돈줘
\`\`\`

### ⚠️ 관리
\`\`\`diff
!경고 @유저 사유
!경고확인
!경고초기화 @유저
\`\`\`

### 🎫 기타
\`\`\`diff
!문의 내용
!랭킹
\`\`\``
        )
      ]
    });

  }
};
