const { SlashCommandBuilder } = require("discord.js");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ytbmp3")
    .setDescription("Chuyển đổi video YouTube sang MP3 và gửi file.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Link video YouTube")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const youtubeUrl = interaction.options.getString("url");

    try {
      if (!ytdl.validateURL(youtubeUrl)) {
        return interaction.editReply("URL YouTube không hợp lệ.");
      }

      const info = await ytdl.getInfo(youtubeUrl);
      const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_"); // Clean title for filename
      const outputPath = path.resolve(__dirname, `${title}.mp3`);

      const audioStream = ytdl(youtubeUrl, { filter: "audioonly", quality: "highestaudio" });
      const writeStream = fs.createWriteStream(outputPath);

      audioStream.pipe(writeStream);

      writeStream.on("finish", async () => {
        try {
          await interaction.editReply({
            content: `Đây là file MP3 của bạn từ video: **${info.videoDetails.title}**`, 
            files: [outputPath],
          });
          fs.unlinkSync(outputPath); // Xóa file sau khi gửi
        } catch (error) {
          console.error("Lỗi khi gửi file hoặc xóa file:", error);
          await interaction.editReply(`Đã xảy ra lỗi khi gửi file: ${error.message}`);
        }
      });

      writeStream.on("error", (error) => {
        console.error("Lỗi khi ghi file:", error);
        interaction.editReply(`Đã xảy ra lỗi khi chuyển đổi video: ${error.message}`);
        fs.unlinkSync(outputPath); // Xóa file lỗi
      });

    } catch (error) {
      console.error(error);
      await interaction.editReply(`Đã xảy ra lỗi khi xử lý video của bạn: ${error.message}`);
    }
  },
};

