const { EmbedBuilder } = require("discord.js");

exports.E = (t,c=0x00E5FF)=>
new EmbedBuilder()
.setColor(c)
.setAuthor({name:"한국협회"})
.setTitle(`┏━━━ ${t} ━━━┓`)
.setFooter({text:"한국협회 시스템"})
.setTimestamp();

exports.G = (t,win)=>
new EmbedBuilder()
.setColor(win?0x00FF88:0xFF4D4D)
.setAuthor({name:"한국협회 카지노"})
.setTitle(`┏━━━ ${t} ━━━┓`)
.setFooter({text:"카지노"})
.setTimestamp();
