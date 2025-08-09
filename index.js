require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { deployCommands } = require('./utils/deployCommands');

// Auto deploy commands trước khi chạy bot
(async () => {
    await deployCommands();

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    client.commands = new Collection();

    // Load commands
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

    client.once(Events.ClientReady, () => {
        console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Lỗi khi thực thi lệnh!', ephemeral: true });
            }
        }

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'my_menu') {
                await interaction.reply(`✅ Bạn đã chọn: **${interaction.values[0]}**`);
            }
        }
    });

    client.login(process.env.DISCORD_TOKEN);
})();
