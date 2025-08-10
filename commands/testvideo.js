const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testvideo")
    .setDescription("Gửi một tin nhắn kèm theo link video."),
  async execute(interaction) {
    await interaction.reply("Đây là video bạn yêu cầu: https://files.catbox.moe/cujf0m.mp4");
  },
};

