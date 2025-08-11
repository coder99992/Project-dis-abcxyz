const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sendfile")
    .setDescription("Gửi một tệp tin từ thư mục của bot.")
    .addStringOption(option =>
      option.setName("filename")
        .setDescription("Tên của tệp tin muốn gửi (ví dụ: README.md).")
        .setRequired(true)
    ),
  async execute(interaction) {
    const filename = interaction.options.getString("filename");
    const filePath = path.join(__dirname, "..", filename); // Đường dẫn tương đối từ commands/ đến thư mục gốc của bot

    try {
      if (fs.existsSync(filePath)) {
        const fileAttachment = new AttachmentBuilder(filePath);
        await interaction.reply({ content: `Đây là tệp tin ${filename}:`, files: [fileAttachment] });
      } else {
        await interaction.reply({ content: `Không tìm thấy tệp tin ${filename}. Vui lòng kiểm tra lại tên tệp.`, ephemeral: true });
      }
    } catch (error) {
      console.error("Lỗi khi gửi tệp tin:", error);
      await interaction.reply({ content: "Đã xảy ra lỗi khi cố gắng gửi tệp tin này.", ephemeral: true });
    }
  },
};

