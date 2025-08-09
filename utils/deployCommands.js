const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

async function deployCommands() {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🚀 Đang đăng ký slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Slash commands đã đăng ký thành công.');
    } catch (error) {
        console.error('❌ Lỗi khi đăng ký commands:', error);
    }
}

module.exports = { deployCommands };
