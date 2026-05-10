const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType
} = require("@discordjs/voice");

const googleTTS = require("google-tts-api");
const https = require("https");

module.exports = async (client) => {

  const player = createAudioPlayer();

  client.on("ready", async () => {

    const channel = await client.channels.fetch(VOICE_CHANNEL_ID);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false
    });

    connection.subscribe(player);

    console.log("TTS 연결 완료");
  });

  client.on("messageCreate", async (m) => {

    if (m.author.bot) return;
    if (m.channel.id !== TEXT_CHANNEL_ID) return;

    const member = m.guild.members.cache.get(m.author.id);

    if (!member.voice.channelId || member.voice.channelId !== VOICE_CHANNEL_ID) {
      return;
    }

    try {

      const url = googleTTS.getAudioUrl(m.content, {
        lang: "ko",
        slow: false
      });

      https.get(url, (res) => {

        const resource = createAudioResource(res, {
          inputType: StreamType.Arbitrary,
          inlineVolume: true
        });

        resource.volume.setVolume(1);

        player.play(resource);

        console.log("재생 시작");

      });

    } catch (err) {
      console.error("TTS 오류:", err);
    }
  });

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("현재 음성 출력중");
  });

  player.on("error", (err) => {
    console.error("플레이어 오류:", err);
  });
};
