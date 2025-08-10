const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("douyin")
    .setDescription("Tải video Douyin và lấy link tải xuống.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Link video Douyin")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const douyinUrl = interaction.options.getString("url");

    try {
      const response = await axios.get(`https://douyin.wtf/api/hybrid/video_data`, {
        params: { url: douyinUrl },
        timeout: 10000
      });

      if (response.data && response.data.code === 200) {
        const videoData = response.data.data;
        const downloadUrl = videoData.video.play_addr.url_list[0];
        const downloadUrlNoWatermark = videoData.video.download_addr?.url_list?.[0] || downloadUrl;

        if (!downloadUrl) {
          throw new Error("Không thể lấy URL video từ API Douyin.");
        }

        await interaction.editReply(`Video Douyin của bạn:\n- Có watermark: [nhấn vào đây](${downloadUrl})\n- Không watermark (nếu có): [nhấn vào đây](${downloadUrlNoWatermark})`);
      } else {
        throw new Error(response.data.message || "Không thể lấy link download hoặc URL không hợp lệ.");
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply(`Đã xảy ra lỗi khi xử lý video của bạn: ${error.message}`);
    }
  },
};

