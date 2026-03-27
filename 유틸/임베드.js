const { EmbedBuilder } = require("discord.js");

// 🔷 기본 (깔끔형)
exports.E = (title, color = 0x5865F2) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setFooter({ text: "한국협회" })
    .setTimestamp();
};

// 🎰 도박 전용 (승패 색상)
exports.G = (title, win = true) => {
  return new EmbedBuilder()
    .setColor(win ? 0x57F287 : 0xED4245)
    .setTitle(title)
    .setFooter({ text: win ? "WIN" : "LOSE" })
    .setTimestamp();
};
