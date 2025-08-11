const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Tạo một cuộc thăm dò ý kiến.")
    .addStringOption(option =>
      option.setName("question")
        .setDescription("Câu hỏi cho cuộc thăm dò.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("options")
        .setDescription("Các lựa chọn, cách nhau bởi dấu phẩy (,). Tối đa 10 lựa chọn.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const question = interaction.options.getString("question");
    const options = interaction.options.getString("options").split(",").map(opt => opt.trim());

    if (options.length > 10) {
      return interaction.reply({ content: "Bạn chỉ có thể cung cấp tối đa 10 lựa chọn.", ephemeral: true });
    }

    const emojis = [
      "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣",
      "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"
    ];

    let description = `**${question}**\n\n`;
    for (let i = 0; i < options.length; i++) {
      description += `${emojis[i]} ${options[i]}\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("📊 Thăm dò ý kiến")
      .setDescription(description)
      .setColor("Blue")
      .setTimestamp()
      .setFooter({ text: `Tạo bởi: ${interaction.user.username}` });

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await reply.react(emojis[i]);
    }
  },
};

