const { 유저가져오기, 숫자 } = require("../유틸/함수");
const { 기본, 카지노 } = require("../유틸/임베드");

const prefix = "!";

module.exports = async (client, m) => {
  if (m.author.bot || !m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0];

  const 명령어 = client.commands.get(cmd);
  if (!명령어) return;

  const user = await 유저가져오기(m.author.id);

  명령어.execute(m, args, {
    user,
    유저가져오기,
    기본,
    카지노,
    숫자
  });
};