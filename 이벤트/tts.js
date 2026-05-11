client.on("messageCreate", async (m) => {

  console.log("메시지:", m.content);

  if (m.author.bot) return;

  // 🔥 명령어는 무시
  if (m.content.startsWith("!")) return;

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
