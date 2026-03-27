const User = require("../모델/유저");

module.exports = {
  name:"랭킹",

  async execute(m,args,{E,f}){

    const top=await User.find().sort({money:-1}).limit(10);

    return m.reply({
      embeds:[
        E("랭킹")
        .setDescription(top.map((u,i)=>`${i+1}위 <@${u.userId}> ${f(u.money)}원`).join("\n"))
      ]
    });
  }
};
