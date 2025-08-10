const { Events, AttachmentBuilder } = require('discord.js');
const { createWelcomeImage } = require('../utils/canvasUtils');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      // Tìm channel welcome (có thể tùy chỉnh theo server)
      const welcomeChannel = member.guild.channels.cache.find(
        channel => channel.name === 'welcome' || channel.name === 'general'
      );
      
      if (!welcomeChannel) return;

      // Tạo welcome image với canvas utils
      const imageBuffer = await createWelcomeImage(member);

      // Tạo attachment từ canvas
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: 'welcome.png'
      });

      // Gửi message welcome
      await welcomeChannel.send({
        content: `🎉 Chào mừng ${member} đã tham gia server! 🎉`,
        files: [attachment]
      });

      console.log(`✅ Đã gửi welcome message cho ${member.user.tag}`);
    } catch (error) {
      console.error('❌ Lỗi trong welcome event:', error);
    }
  }
};

