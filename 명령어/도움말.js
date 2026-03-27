module.exports = {
  name:"도움말",

  async execute(m,args,{E}){

    return m.reply({
      embeds:[
        E("도움말").setDescription(
`경제
!잔액 / !돈줘 / !송금

카지노
!슬롯 / !가위바위보 / !블랙잭 / !바카라

기타
!랭킹 / !경고 / !경고확인 / !경고초기화
!문의 / !공지`
        )
      ]
    });
  }
};
