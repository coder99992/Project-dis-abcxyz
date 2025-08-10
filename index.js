require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const { deployCommands } = require('./utils/deployCommands');

(async () => {
  // deploy commands trước khi chạy bot
  await deployCommands();

  // Tạo client Discord
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });
  client.commands = new Collection();

  // Load command files
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command && command.data && command.data.name) {
      client.commands.set(command.data.name, command);
    }
  }

  // Tạo Express app để hiển thị HTML
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Route chính: hiển thị trạng thái bot + danh sách lệnh
  app.get('/', (req, res) => {
    const botTag = client.user ? client.user.tag : 'Chưa đăng nhập';
    const commandsList = [...client.commands.keys()]
      .map(name => `<li>${name}</li>`)
      .join('\n') || '<li>Chưa có lệnh</li>';

    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Bot Status</title>
  <style>
    body{font-family: Arial, sans-serif; padding:20px}
    .card{border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.08); padding:18px; max-width:800px}
    h1{margin-top:0}
    ul{line-height:1.6}
  </style>
</head>
<body>
  <div class="card">
    <h1>Discord Bot</h1>
    <p><strong>Trạng thái:</strong> ${botTag}</p>
    <h3>Danh sách lệnh</h3>
    <ul>${commandsList}</ul>
  </div>
</body>
</html>`;

    res.send(html);
  });

  // (Tùy chọn) route để bot gửi text đến trang HTML (ví dụ test)
  // Gọi /display?text=Hello để hiển thị text tạm thời (simple demo)
  let lastText = '';
  app.get('/display', (req, res) => {
    const text = req.query.text || lastText || 'Chưa có nội dung';
    lastText = text;
    res.send(`<p>Hiển thị: ${String(text).replace(/</g,'&lt;')}</p>`);
  });

  // Khi client sẵn sàng, in log và start web server
  client.once(Events.ClientReady, () => {
    console.log(`✅ Bot đã đăng nhập: ${client.user.tag}`);
    app.listen(PORT, () => {
      console.log(`🌐 Web server đang chạy tại http://localhost:${PORT}`);
    });
  });

  // Xử lý InteractionCreate (giữ nguyên logic bạn có)
  client.on(Events.InteractionCreate, async interaction => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
      } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'command_menu') {
          const selectedCommandName = interaction.values[0];
          const command = client.commands.get(selectedCommandName);
          if (!command) {
            await interaction.reply({ content: `❌ Lệnh **${selectedCommandName}** không tồn tại!`, ephemeral: true });
            return;
          }
          await command.execute(interaction);
        }
      }
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        // already replied
      } else {
        await interaction.reply({ content: '❌ Lỗi khi thực thi lệnh!', ephemeral: true });
      }
    }
  });

  // Đăng nhập bot
  client.login(process.env.DISCORD_TOKEN);
})();
