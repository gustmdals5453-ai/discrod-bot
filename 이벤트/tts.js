require("libsodium-wrappers");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus,
  NoSubscriberBehavior
} = require("@discordjs/voice");

const googleTTS = require("google-tts-api");
const fetch = require("node-fetch");
const fs = require("fs");
const prism = require("prism-media");

console.log("tts.js 시작됨");

const VOICE_CHANNEL_ID = "1469200371833376832";
const TEXT_CHANNEL_ID = "1502932634378965083";

module.exports = (client) => {

  console.log("tts 함수 실행됨");

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play
    }
  });

  client.once("ready", async () => {

    console.log("ready 이벤트 실행");

    try {

      const channel = await client.channels.fetch(VOICE_CHANNEL_ID);

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      connection.subscribe(player);

      console.log("음성채널 연결 성공");

    } catch (err) {

      console.error("음성 연결 오류:", err);

    }
  });

  client.on("messageCreate", async (m) => {

    console.log("메시지 감지:", m.content);

    try {

      if (m.author.bot) return;
      if (m.channel.id !== TEXT_CHANNEL_ID) return;

      const member = m.guild.members.cache.get(m.author.id);

      if (!member.voice.channelId) {
        console.log("음성방 없음");
        return;
      }

      if (member.voice.channelId !== VOICE_CHANNEL_ID) {
        console.log("다른 음성방");
        return;
      }

      console.log("TTS 시작");

      const url = googleTTS.getAudioUrl(m.content, {
        lang: "ko",
        slow: false
      });

      const response = await fetch(url);

      const buffer = await response.buffer();

      fs.writeFileSync("./tts.mp3", buffer);

      console.log("mp3 저장 완료");

      const transcoder = new prism.FFmpeg({
        args: [
          "-analyzeduration", "0",
          "-loglevel", "0",
          "-i", "./tts.mp3",
          "-f", "s16le",
          "-ar", "48000",
          "-ac", "2"
        ]
      });

      const resource = createAudioResource(transcoder, {
        inputType: StreamType.Raw,
        inlineVolume: true
      });

      resource.volume.setVolume(1);

      player.play(resource);

      console.log("재생 요청 완료");

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
