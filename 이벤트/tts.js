const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} = require("@discordjs/voice");

const edgeTTS = require("edge-tts");
const path = require("path");

const VOICE_CHANNEL_ID = "1469200371833376832";
const TEXT_CHANNEL_ID = "1502932634378965083";

const voices = [
  "ko-KR-SunHiNeural",
  "ko-KR-InJoonNeural"
];

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
    if (!m.content) return;

    const voice = voices[Math.floor(Math.random() * voices.length)];

    const file = path.join(__dirname, "tts.mp3");

    await edgeTTS.save({
      text: m.content,
      voice: voice,
      file: file
    });

    const resource = createAudioResource(file);

    player.play(resource);
  });
};
