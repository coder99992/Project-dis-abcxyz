require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// Load commands từ folder commands
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

    // Xử lý menu chọn
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'my_menu') {
            const choice = interaction.values[0];
            await interaction.reply(`✅ Bạn đã chọn: **${choice}**`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
