const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require("@discordjs/voice");
const googleTTS = require("google-tts-api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Chuyển văn bản thành giọng nói (Text-to-Speech).")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("Văn bản muốn chuyển thành giọng nói.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("lang")
        .setDescription("Ngôn ngữ (ví dụ: vi, en, fr). Mặc định là vi.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const text = interaction.options.getString("text");
    const lang = interaction.options.getString("lang") || "vi";

    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: "Bạn phải ở trong một kênh thoại để sử dụng lệnh này!", ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const audioURL = await googleTTS.getAudioUrl(text, { lang: lang, slow: false, host: "https://translate.google.com" });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
      });

      const resource = createAudioResource(audioURL);

      player.play(resource);
      connection.subscribe(player);

      player.on("error", error => {
        console.error(`Lỗi trình phát âm thanh: ${error.message}`);
        interaction.editReply({ content: "Đã xảy ra lỗi khi phát âm thanh.", ephemeral: true });
      });

      player.on("idle", () => {
        // Tự động ngắt kết nối sau khi phát xong
        if (connection) {
          connection.destroy();
        }
      });

      await interaction.editReply({ content: `Đang phát: "${text}" (${lang})` });

    } catch (error) {
      console.error("Lỗi khi chuyển văn bản thành giọng nói:", error);
      await interaction.editReply({ content: "Đã xảy ra lỗi khi chuyển văn bản thành giọng nói. Vui lòng thử lại sau.", ephemeral: true });
    }
  },
};

