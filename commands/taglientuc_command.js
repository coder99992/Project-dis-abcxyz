const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("taglientuc")
    .setDescription("Tag người dùng với nhiều chế độ khác nhau")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Chế độ tag")
        .setRequired(true)
        .addChoices(
          { name: "Tất cả thành viên", value: "all" },
          { name: "Theo vai trò", value: "role" },
          { name: "Ngẫu nhiên", value: "random" },
          { name: "Người cụ thể", value: "specific" }
        )
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Vai trò cần tag (chỉ dùng cho chế độ 'role')")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Số lượng người cần tag (chỉ dùng cho chế độ 'random')")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Người dùng cần tag (chỉ dùng cho chế độ 'specific')")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("times")
        .setDescription("Số lần tag người dùng (chỉ dùng cho chế độ 'specific')")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Tin nhắn đi kèm (tùy chọn)")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const mode = interaction.options.getString("mode");
    const role = interaction.options.getRole("role");
    const count = interaction.options.getInteger("count");
    const user = interaction.options.getUser("user");
    const times = interaction.options.getInteger("times") || 1;
    const customMessage = interaction.options.getString("message") || "";

    try {
      let taggedUsers = [];
      let resultMessage = "";

      switch (mode) {
        case "all":
          // Tag tất cả thành viên trong guild
          const allMembers = await interaction.guild.members.fetch();
          const onlineMembers = allMembers.filter(member => 
            !member.user.bot && 
            member.presence?.status !== 'offline'
          );
          
          if (onlineMembers.size === 0) {
            return await interaction.editReply("Không có thành viên nào online để tag!");
          }

          taggedUsers = onlineMembers.map(member => `<@${member.user.id}>`);
          resultMessage = `**Tag tất cả thành viên online:**\n${taggedUsers.join(" ")}`;
          break;

        case "role":
          if (!role) {
            return await interaction.editReply("Vui lòng chọn vai trò để tag!");
          }

          const roleMembers = role.members.filter(member => 
            !member.user.bot &&
            member.presence?.status !== 'offline'
          );

          if (roleMembers.size === 0) {
            return await interaction.editReply(`Không có thành viên nào online với vai trò ${role.name}!`);
          }

          taggedUsers = roleMembers.map(member => `<@${member.user.id}>`);
          resultMessage = `**Tag thành viên có vai trò ${role.name}:**\n${taggedUsers.join(" ")}`;
          break;

        case "random":
          if (!count) {
            return await interaction.editReply("Vui lòng nhập số lượng người cần tag!");
          }

          const randomMembers = await interaction.guild.members.fetch();
          const availableMembers = randomMembers.filter(member => 
            !member.user.bot && 
            member.presence?.status !== 'offline'
          );

          if (availableMembers.size === 0) {
            return await interaction.editReply("Không có thành viên nào online để tag!");
          }

          const shuffled = Array.from(availableMembers.values()).sort(() => 0.5 - Math.random());
          const selectedMembers = shuffled.slice(0, Math.min(count, shuffled.length));

          taggedUsers = selectedMembers.map(member => `<@${member.user.id}>`);
          resultMessage = `**Tag ${selectedMembers.length} thành viên ngẫu nhiên:**\n${taggedUsers.join(" ")}`;
          break;

        case "specific":
          if (!user) {
            return await interaction.editReply("Vui lòng chọn người dùng cần tag!");
          }

          const member = await interaction.guild.members.fetch(user.id).catch(() => null);
          if (!member) {
            return await interaction.editReply("Không tìm thấy người dùng này trong server!");
          }

          taggedUsers = Array(times).fill(`<@${user.id}>`);
          resultMessage = `**Tag ${user.username} ${times} lần:**\n${taggedUsers.join(" ")}`;
          break;

        default:
          return await interaction.editReply("Chế độ không hợp lệ!");
      }

      // Thêm tin nhắn tùy chỉnh nếu có
      if (customMessage) {
        resultMessage = `${customMessage}\n\n${resultMessage}`;
      }

      // Kiểm tra độ dài tin nhắn (Discord giới hạn 2000 ký tự)
      if (resultMessage.length > 2000) {
        const truncatedTags = taggedUsers.slice(0, Math.floor(1800 / taggedUsers[0].length));
        resultMessage = `${customMessage ? customMessage + "\n\n" : ""}**Tag (đã cắt bớt do quá dài):**\n${truncatedTags.join(" ")}`;
      }

      await interaction.editReply(resultMessage);

    } catch (error) {
      console.error("Lỗi khi thực hiện lệnh taglientuc:", error);
      await interaction.editReply(`Đã xảy ra lỗi: ${error.message}`);
    }
  },
};

