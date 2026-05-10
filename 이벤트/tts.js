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

console.log("discord-tts 로드됨");

const VOICE_CHANNEL_ID = "1469200371833376832";
const TEXT_CHANNEL_ID = "1502932634378965083";

module.exports = (client) => {

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play
    }
  });

  client.once("ready", async () => {

    console.log("봇 ready");

    const channel = await client.channels.fetch(VOICE_CHANNEL_ID);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    connection.subscribe(player);

    console.log("음성방 연결 완료");
  });

  client.on("messageCreate", async (m) => {

    console.log("메시지:", m.content);

    if (m.author.bot) return;
    if (m.channel.id !== TEXT_CHANNEL_ID) return;

    const member = m.guild.members.cache.get(m.author.id);

    if (!member.voice.channelId) return;
    if (member.voice.channelId !== VOICE_CHANNEL_ID) return;

    try {

      const stream = discordTTS.getVoiceStream(m.content);

      const resource = createAudioResource(stream, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
      });

      resource.volume.setVolume(1);

      player.play(resource);

      console.log("TTS 재생 시작");

    } catch (err) {

      console.error("TTS 오류:", err);

    }
  });

  player.on(AudioPlayerStatus.Playing, () => {
    console.log("실제 음성 출력중");
  });

  player.on("error", (err) => {
    console.error("플레이어 오류:", err);
  });
};
