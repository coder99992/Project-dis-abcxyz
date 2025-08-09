// commands/uptime.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Hiển thị thời gian bot đã hoạt động'),
    async execute(interaction) {
        const totalMs = interaction.client.uptime;
        const totalSeconds = Math.floor(totalMs / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const uptimeStr = `${days} ngày, ${hours} giờ, ${minutes} phút, ${seconds} giây`;

        await interaction.reply(`⏳ Bot đã hoạt động: **${uptimeStr}**`);
    }
};
