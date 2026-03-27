module.exports = {
  name:"잔액",

  async execute(m,args,{user,E,f}){
    return m.reply({
      embeds:[E("잔액").setDescription(`${f(user.money)}원`)]
    });
  }
};
