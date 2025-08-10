const { Events } = require("discord.js");
const { downloadTikTokVideo, uploadToCatbox } = require("../utils/tiktok_catbox_downloader.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Bỏ qua tin nhắn của bot để tránh lặp vô hạn
    if (message.author.bot) return;

    const tiktokRegex = /(https?:\/\/(?:www\.)?tiktok\.com\/[^\s]+)/g;
    const matches = message.content.match(tiktokRegex);

    if (matches) {
      for (const tiktokUrl of matches) {
        try {
          await message.channel.send(`Đang tải video TikTok từ: ${tiktokUrl}...`);
          const videoPath = await downloadTikTokVideo(tiktokUrl);
          const catboxLink = await uploadToCatbox(videoPath);
          await message.channel.send(`Video TikTok đã được tải lên Catbox: ${catboxLink}`);
        } catch (error) {
          console.error(`Lỗi khi xử lý video TikTok ${tiktokUrl}:`, error);
          await message.channel.send(`Đã xảy ra lỗi khi xử lý video TikTok từ ${tiktokUrl}: ${error.message}`);
        }
      }
    }
  },
};


