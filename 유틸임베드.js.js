const { EmbedBuilder } = require("discord.js");

exports.기본 = (t,c=0x00E5FF)=>
  new EmbedBuilder()
  .setColor(c)
  .setAuthor({name:"한국협회"})
  .setTitle(`┏━━━ ${t} ━━━┓`)
  .setFooter({text:"한국협회 시스템"})
  .setTimestamp();

exports.카지노 = (t,c=0xFFD700)=>
  new EmbedBuilder()
  .setColor(c)
  .setAuthor({name:"한국협회 카지노"})
  .setTitle(`┏━━━ ${t} ━━━┓`)
  .setFooter({text:"한국협회 카지노"})
  .setTimestamp();