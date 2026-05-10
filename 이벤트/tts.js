const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const googleTTS = require("google-tts-api");
const fs = require("fs");
const fetch = require("node-fetch");

console.log("tts.js 로드됨");

const VOICE_CHANNEL_ID = "1469200371833376832";
const TEXT_CHANNEL_ID = "1502932634378965083";

module.exports = async (client) => {

  const player = createAudioPlayer();

  client.on("ready", async () => {

    console.log("봇 ready 감지");

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

    console.log("메시지 들어옴:", m.channel.id, m.content);

    if (m.author.bot) return;
    if (m.channel.id !== TEXT_CHANNEL_ID) return;

    const member = m.guild.members.cache.get(m.author.id);

    if (!member.voice.channelId || member.voice.channelId !== VOICE_CHANNEL_ID) {
      console.log("음성방 미참가 유저 차단");
      return;
    }

    console.log("TTS 채널 감지 성공");

    try {

      const url = googleTTS.getAudioUrl(m.content, {
        lang: "ko",
        slow: false
      });

      const response = await fetch(url);

      const buffer = await response.buffer();

      fs.writeFileSync("./tts.mp3", buffer);

      console.log("mp3 저장 완료");

      const resource = createAudioResource("./tts.mp3");

      player.play(resource);

      console.log("재생 시작");

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
