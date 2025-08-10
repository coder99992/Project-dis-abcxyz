const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");



module.exports = {
  data: new SlashCommandBuilder()
    .setName("tiktok")
    .setDescription("Tải video TikTok và tải lên Catbox.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Link video TikTok")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const tiktokUrl = interaction.options.getString("url");

    try {
      const response = await axios.get(`https://www.tikwm.com/api/?url=${tiktokUrl}`);
      const videoUrl = response.data.play;

      if (!videoUrl) {
        throw new Error("Không thể lấy URL video từ API TikTok.");
      }

      await interaction.editReply(`Video TikTok của bạn: [nhấn vào đây](${videoUrl})`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`Đã xảy ra lỗi khi xử lý video của bạn: ${error.message}`);
    }
  },
};


