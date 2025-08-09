// file: index.js
const { Client, GatewayIntentBits } = require('discord.js');

// Khởi tạo bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Sự kiện bot sẵn sàng
client.once('ready', () => {
    console.log(`✅ Bot đã đăng nhập với tên: ${client.user.tag}`);
});

// Sự kiện nhận tin nhắn
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === 'ping') {
        message.reply('🏓 Pong!');
    }
});

// Đăng nhập bot với token trực tiếp
client.login('1237ab3adc96c05d6b72e29d71b159291675eaebb90991fe69f2cd552ea562a0');
