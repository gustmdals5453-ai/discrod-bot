const { getUser, f, rand, err } = require("../유틸/함수");
const { E, G } = require("../유틸/임베드");

const prefix = "!";

module.exports = async (m) => {

  if (m.author.bot) return;
  if (!m.content.startsWith(prefix)) return;

  const args = m.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift(); // 🔥 핵심

  const command = m.client.commands.get(cmd);
  if (!command) return;

  const user = await getUser(m.author.id);

  try {
    command.execute(m, args, { user, getUser, E, G, f, rand, err });
  } catch (e) {
    console.error(e);
  }
};
