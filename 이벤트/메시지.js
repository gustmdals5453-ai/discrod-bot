const { getUser, f } = require("../유틸/함수");
const { E, G } = require("../유틸/임베드");

const prefix="!";

module.exports = async(client,m)=>{
  if(m.author.bot||!m.content.startsWith(prefix)) return;

  const args=m.content.slice(prefix.length).trim().split(/ +/);
  const cmd=args[0];

  const command=client.commands.get(cmd);
  if(!command) return;

  const user=await getUser(m.author.id);

  command.execute(m,args,{user,getUser,E,G,f});
};
