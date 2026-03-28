const User = require("../모델/유저");

module.exports = {
  name:"랭킹",

  async execute(m,args,{E,f}){

    const top = await User.find().sort({ money:-1 }).limit(10);

    if (!top.length)
      return m.reply({
        embeds:[
          E("랭킹").setDescription(
`## 랭킹

\`\`\`diff
- 데이터가 없습니다
\`\`\``
          )
        ]
      });

    const 리스트 = top
      .map((u,i)=> `# ${i+1}위 <@${u.userId}> - ${f(u.money)}원`)
      .join("\n");

    return m.reply({
      embeds:[
        E("랭킹").setDescription(
`## TOP 10 랭킹

${리스트}`
        )
      ]
    });

  }
};
