const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} = require("@discordjs/voice");

const googleTTS = require("google-tts-api");
const fs = require("fs");
const path = require("path");
const https = require("https");

const VOICE_CHANNEL_ID = "1469200371833376832";
const TEXT_CHANNEL_ID = "1502932634378965083";

module.exports = async (client) => {

  const player = createAudioPlayer();

  client.on("ready", async () => {
    const channel = await client.channels.fetch(VOICE_CHANNEL_ID);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    connection.subscribe(player);

    console.log("TTS 연결 완료");
  });

  client.on("messageCreate", async (m) => {
    if (m.author.bot) return;
    if (m.channel.id !== TEXT_CHANNEL_ID) return;

    const url = googleTTS.getAudioUrl(m.content, {
      lang: "ko",
      slow: false
    });

    const file = path.join(__dirname, "tts.mp3");
    const stream = fs.createWriteStream(file);

    https.get(url, (res) => {
      res.pipe(stream);

      stream.on("finish", () => {
        const resource = createAudioResource(file);
        player.play(resource);
      });
    });
  });
};
