const { EmbedBuilder } = require("discord.js");

exports.E = (title, color = 0x5865F2) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`🔹 ${title}`)
    .setFooter({ text: "한국협회" })
    .setTimestamp();
};

exports.G = (title, win = true) => {
  return new EmbedBuilder()
    .setColor(win ? 0x57F287 : 0xED4245)
    .setTitle(`🎰 ${title}`)
    .setFooter({ text: win ? "WIN" : "LOSE" })
    .setTimestamp();
};

exports.err = (E, msg) => {
  return {
    embeds: [
      E("오류", 0xED4245).setDescription(
`~~~diff
- ${msg}
~~~`
      )
    ]
  };
};
