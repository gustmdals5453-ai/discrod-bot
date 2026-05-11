require("libsodium-wrappers");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType
} = require("@discordjs/voice");

const discordTTS = require("discord-tts");

const VOICE_CHANNEL_ID = "1469200371833376832";
const TEXT_CHANNEL_ID = "1502932634378965083";

module.exports = (client) => {

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play
    }
  });

  client.on("messageCreate", async (m) => {

    if (m.author.bot) return;

    if (!m.guild) return;

    // 명령어 무시
    if (m.content.startsWith("!")) return;

    if (m.channel.id !== TEXT_CHANNEL_ID) return;

    const member = m.guild.members.cache.get(m.author.id);

    if (!member?.voice?.channelId) return;
    if (member.voice.channelId !== VOICE_CHANNEL_ID) return;

    try {

      const stream = discordTTS.getVoiceStream(m.content);

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });

      resource.volume.setVolume(1);

      player.play(resource);

    } catch (err) {

      console.error("TTS 오류:", err);

    }
  });

  client.once("ready", async () => {

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

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("TTS 재생중");
  });

  player.on("error", console.error);

};
