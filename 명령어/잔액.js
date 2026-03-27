module.exports = {
  name:"잔액",

  async execute(m,args,{user,E,f}){

    return m.reply({
      embeds:[
        E("잔액").setDescription(
`##  현재 잔액

\`\`\`diff
+ ${f(user.money)}원
\`\`\``
        )
      ]
    });

  }
};
