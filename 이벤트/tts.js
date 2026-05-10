const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
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

    console.log("메시지 감지:", m.content);

    try {
      const url = googleTTS.getAudioUrl(m.content, {
        lang: "ko",
        slow: false
      });

      const file = path.join(__dirname, "tts.mp3");
      const stream = fs.createWriteStream(file);

      https.get(url, (res) => {
        res.pipe(stream);

        stream.on("finish", () => {
          console.log("mp3 생성 완료");

          const resource = createAudioResource(file);

          player.play(resource);

          console.log("재생 시작");
        });
      });

    } catch (err) {
      console.log("TTS 오류:", err);
    }
  });

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("현재 음성 출력중");
  });
};
