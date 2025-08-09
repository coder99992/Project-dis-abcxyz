// file: index.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// Khởi tạo bot với quyền đọc tin nhắn & gửi tin nhắn
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,            // Quản lý server
        GatewayIntentBits.GuildMessages,     // Đọc tin nhắn
        GatewayIntentBits.MessageContent     // Lấy nội dung tin nhắn
    ]
});

// Sự kiện khi bot sẵn sàng
client.once('ready', () => {
    console.log(`✅ Bot đã đăng nhập với tên: ${client.user.tag}`);
});

// Sự kiện khi có tin nhắn mới
client.on('messageCreate', (message) => {
    // Bỏ qua tin nhắn của bot
    if (message.author.bot) return;

    // Trả lời khi có từ khoá "ping"
    if (message.content.toLowerCase() === 'ping') {
        message.reply('🏓 Pong!');
    }
});

// Đăng nhập bot bằng token
client.login(process.env.DISCORD_TOKEN);
