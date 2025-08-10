const { Events, AttachmentBuilder } = require('discord.js');
const { createGoodbyeImage } = require('../utils/canvasUtils');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    try {
      // Tìm channel goodbye (có thể tùy chỉnh theo server)
      const goodbyeChannel = member.guild.channels.cache.find(
        channel => channel.name === 'goodbye' || channel.name === 'general'
      );
      
      if (!goodbyeChannel) return;

      // Tạo goodbye image với canvas utils
      const imageBuffer = await createGoodbyeImage(member);

      // Tạo attachment từ canvas
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: 'goodbye.png'
      });

      // Gửi message goodbye
      await goodbyeChannel.send({
        content: `😢 ${member.user.username} đã rời khỏi server. Chúc bạn may mắn! 👋`,
        files: [attachment]
      });

      console.log(`✅ Đã gửi goodbye message cho ${member.user.tag}`);
    } catch (error) {
      console.error('❌ Lỗi trong goodbye event:', error);
    }
  }
};

