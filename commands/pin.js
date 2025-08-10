const { SlashCommandBuilder, PermissionFlagsBits } = require(\'discord.js\');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(\'pin\')
        .setDescription(\'Ghim một tin nhắn trong kênh.\')
        .addStringOption(option =>
            option.setName(\'message_id\')
                .setDescription(\'ID của tin nhắn cần ghim\')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const messageId = interaction.options.getString(\'message_id\');

        try {
            const message = await interaction.channel.messages.fetch(messageId);
            if (message) {
                await message.pin();
                await interaction.reply({ content: `Đã ghim tin nhắn có ID: ${messageId}`, ephemeral: true });
            } else {
                await interaction.reply({ content: `Không tìm thấy tin nhắn với ID: ${messageId} trong kênh này.`, ephemeral: true });
            }
        } catch (error) {
            console.error(`Lỗi khi ghim tin nhắn: ${error}`);
            await interaction.reply({ content: \'Đã xảy ra lỗi khi cố gắng ghim tin nhắn. Vui lòng kiểm tra lại ID tin nhắn và quyền của bot.\', ephemeral: true });
        }
    },
};
