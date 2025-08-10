const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Lưu trữ trạng thái trò chơi cho từng kênh
const gameStates = new Map();

// Danh sách từ điển tiếng Việt cơ bản (có thể mở rộng)
const dictionary = [
  "áo", "ăn", "anh", "em", "ông", "bà", "ba", "mẹ", "con", "cháu",
  "nhà", "xe", "đường", "trường", "lớp", "bạn", "thầy", "cô", "học", "chơi",
  "ăn", "uống", "ngủ", "dậy", "đi", "về", "làm", "việc", "nghỉ", "chạy",
  "đọc", "viết", "nói", "nghe", "nhìn", "thấy", "biết", "hiểu", "yêu", "thương",
  "vui", "buồn", "giận", "sợ", "lo", "mừng", "hạnh", "phúc", "khỏe", "mạnh",
  "đẹp", "xấu", "cao", "thấp", "to", "nhỏ", "dài", "ngắn", "rộng", "hẹp",
  "nóng", "lạnh", "ấm", "mát", "sáng", "tối", "đỏ", "xanh", "vàng", "trắng",
  "đen", "xám", "hồng", "tím", "cam", "nâu", "một", "hai", "ba", "bốn",
  "năm", "sáu", "bảy", "tám", "chín", "mười", "trăm", "nghìn", "triệu", "tỷ",
  "ngày", "đêm", "sáng", "chiều", "tối", "khuya", "hôm", "mai", "qua", "nay",
  "tuần", "tháng", "năm", "thế", "kỷ", "xuân", "hạ", "thu", "đông", "mưa",
  "nắng", "gió", "mây", "sương", "tuyết", "đất", "trời", "biển", "sông", "núi",
  "rừng", "cây", "hoa", "lá", "quả", "chim", "cá", "chó", "mèo", "gà",
  "vịt", "lợn", "bò", "trâu", "ngựa", "voi", "hổ", "sư", "tử", "khỉ"
];

// Hàm lấy âm cuối của từ (đơn giản hóa)
function getLastSyllable(word) {
  const cleanWord = word.toLowerCase().trim();
  // Tách từ thành các âm tiết (đơn giản)
  const syllables = cleanWord.split(/[\s-]/);
  return syllables[syllables.length - 1];
}

// Hàm lấy âm đầu của từ
function getFirstSyllable(word) {
  const cleanWord = word.toLowerCase().trim();
  const syllables = cleanWord.split(/[\s-]/);
  return syllables[0];
}

// Hàm kiểm tra từ có trong từ điển không
function isValidWord(word) {
  return dictionary.includes(word.toLowerCase().trim());
}

// Hàm tạo embed cho trạng thái trò chơi
function createGameEmbed(gameState) {
  const embed = new EmbedBuilder()
    .setTitle("🎮 Trò Chơi Nối Từ")
    .setColor(0x00AE86);

  if (gameState.currentWord) {
    embed.addFields(
      { name: "Từ hiện tại", value: `**${gameState.currentWord}**`, inline: true },
      { name: "Âm cần nối", value: `**${getLastSyllable(gameState.currentWord)}**`, inline: true },
      { name: "Lượt của", value: gameState.mode === "all" ? "Tất cả mọi người" : `<@${gameState.currentPlayer}>`, inline: true }
    );
  }

  embed.addFields(
    { name: "Chế độ", value: gameState.mode === "all" ? "Tất cả" : "Tag người chơi", inline: true },
    { name: "Số từ đã dùng", value: gameState.usedWords.length.toString(), inline: true },
    { name: "Thời gian còn lại", value: "10 giây", inline: true }
  );

  if (gameState.usedWords.length > 0) {
    const recentWords = gameState.usedWords.slice(-5).join(", ");
    embed.addFields({ name: "Từ gần đây", value: recentWords, inline: false });
  }

  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tro_noi_tu")
    .setDescription("Bắt đầu trò chơi nối từ")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Chế độ chơi")
        .setRequired(true)
        .addChoices(
          { name: "Tất cả có thể chơi", value: "all" },
          { name: "Tag người chơi", value: "tag" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("start_word")
        .setDescription("Từ bắt đầu (tùy chọn)")
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("first_player")
        .setDescription("Người chơi đầu tiên (chỉ dùng cho chế độ tag)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const channelId = interaction.channel.id;
    const mode = interaction.options.getString("mode");
    const startWord = interaction.options.getString("start_word") || "xin chào";
    const firstPlayer = interaction.options.getUser("first_player");

    // Kiểm tra nếu đã có trò chơi đang diễn ra
    if (gameStates.has(channelId)) {
      return await interaction.reply({
        content: "❌ Đã có trò chơi nối từ đang diễn ra trong kênh này! Sử dụng `/stop_game` để dừng trò chơi hiện tại.",
        ephemeral: true
      });
    }

    // Kiểm tra từ bắt đầu có hợp lệ không
    if (!isValidWord(startWord)) {
      return await interaction.reply({
        content: `❌ Từ "${startWord}" không có trong từ điển! Vui lòng chọn từ khác.`,
        ephemeral: true
      });
    }

    // Kiểm tra chế độ tag có người chơi đầu tiên không
    if (mode === "tag" && !firstPlayer) {
      return await interaction.reply({
        content: "❌ Chế độ tag cần chọn người chơi đầu tiên!",
        ephemeral: true
      });
    }

    // Tạo trạng thái trò chơi mới
    const gameState = {
      channelId: channelId,
      mode: mode,
      currentWord: startWord,
      currentPlayer: mode === "tag" ? firstPlayer.id : null,
      usedWords: [startWord],
      players: mode === "tag" ? [firstPlayer.id] : [],
      startTime: Date.now(),
      lastMoveTime: Date.now(),
      timeout: null
    };

    gameStates.set(channelId, gameState);

    // Tạo embed thông báo bắt đầu
    const embed = createGameEmbed(gameState);
    embed.setDescription(`🎉 Trò chơi nối từ đã bắt đầu!\n\n**Luật chơi:**\n• Nối từ dựa trên âm cuối của từ trước\n• Không được dùng lại từ đã sử dụng\n• Thời gian suy nghĩ: 10 giây\n• Từ phải có trong từ điển\n\n**Cách chơi:** Gõ từ tiếp theo vào chat!`);

    await interaction.reply({ embeds: [embed] });

    // Thiết lập timeout cho lượt đầu tiên
    gameState.timeout = setTimeout(() => {
      handleTimeout(interaction.channel, gameState);
    }, 10000);

    // Lắng nghe tin nhắn trong kênh
    const filter = (message) => {
      if (message.author.bot) return false;
      if (message.channel.id !== channelId) return false;
      
      if (mode === "tag") {
        return message.author.id === gameState.currentPlayer;
      } else {
        return true; // Chế độ all, ai cũng có thể chơi
      }
    };

    const collector = interaction.channel.createMessageCollector({ 
      filter, 
      time: 300000 // 5 phút
    });

    collector.on('collect', async (message) => {
      await handlePlayerMove(message, gameState, collector);
    });

    collector.on('end', () => {
      if (gameStates.has(channelId)) {
        gameStates.delete(channelId);
        interaction.channel.send("⏰ Trò chơi đã kết thúc do hết thời gian!");
      }
    });
  },
};

// Hàm xử lý nước đi của người chơi
async function handlePlayerMove(message, gameState, collector) {
  const word = message.content.toLowerCase().trim();
  
  // Kiểm tra từ có hợp lệ không
  if (!isValidWord(word)) {
    return message.reply(`❌ Từ "${word}" không có trong từ điển!`);
  }

  // Kiểm tra từ đã được sử dụng chưa
  if (gameState.usedWords.includes(word)) {
    return message.reply(`❌ Từ "${word}" đã được sử dụng rồi!`);
  }

  // Kiểm tra âm đầu của từ mới có khớp với âm cuối của từ trước không
  const lastSyllable = getLastSyllable(gameState.currentWord);
  const firstSyllable = getFirstSyllable(word);
  
  if (lastSyllable !== firstSyllable) {
    return message.reply(`❌ Từ "${word}" không nối được với "${gameState.currentWord}"! Cần từ bắt đầu bằng âm "${lastSyllable}".`);
  }

  // Xóa timeout hiện tại
  if (gameState.timeout) {
    clearTimeout(gameState.timeout);
  }

  // Cập nhật trạng thái trò chơi
  gameState.currentWord = word;
  gameState.usedWords.push(word);
  gameState.lastMoveTime = Date.now();

  // Chọn người chơi tiếp theo (nếu chế độ tag)
  if (gameState.mode === "tag") {
    // Thêm người chơi hiện tại vào danh sách nếu chưa có
    if (!gameState.players.includes(message.author.id)) {
      gameState.players.push(message.author.id);
    }
    
    // Chọn người chơi tiếp theo (ngẫu nhiên từ danh sách)
    const availablePlayers = gameState.players.filter(id => id !== message.author.id);
    if (availablePlayers.length > 0) {
      gameState.currentPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    } else {
      gameState.currentPlayer = message.author.id; // Nếu chỉ có 1 người chơi
    }
  }

  // Tạo embed cập nhật
  const embed = createGameEmbed(gameState);
  embed.setDescription(`✅ **${message.author.username}** đã nối từ: **${word}**`);

  await message.reply({ embeds: [embed] });

  // Thiết lập timeout cho lượt tiếp theo
  gameState.timeout = setTimeout(() => {
    handleTimeout(message.channel, gameState);
  }, 10000);
}

// Hàm xử lý hết thời gian
async function handleTimeout(channel, gameState) {
  const embed = new EmbedBuilder()
    .setTitle("⏰ Hết thời gian!")
    .setColor(0xFF0000)
    .setDescription(`Trò chơi kết thúc! ${gameState.mode === "tag" ? `<@${gameState.currentPlayer}>` : "Người chơi"} đã hết thời gian.`)
    .addFields(
      { name: "Từ cuối cùng", value: gameState.currentWord, inline: true },
      { name: "Tổng số từ", value: gameState.usedWords.length.toString(), inline: true },
      { name: "Thời gian chơi", value: `${Math.floor((Date.now() - gameState.startTime) / 1000)} giây`, inline: true }
    );

  await channel.send({ embeds: [embed] });
  
  // Xóa trạng thái trò chơi
  gameStates.delete(gameState.channelId);
}

// Lệnh dừng trò chơi
module.exports.stopGame = {
  data: new SlashCommandBuilder()
    .setName("stop_game")
    .setDescription("Dừng trò chơi nối từ hiện tại"),
  
  async execute(interaction) {
    const channelId = interaction.channel.id;
    
    if (!gameStates.has(channelId)) {
      return await interaction.reply({
        content: "❌ Không có trò chơi nào đang diễn ra trong kênh này!",
        ephemeral: true
      });
    }

    const gameState = gameStates.get(channelId);
    
    // Xóa timeout
    if (gameState.timeout) {
      clearTimeout(gameState.timeout);
    }
    
    // Xóa trạng thái trò chơi
    gameStates.delete(channelId);
    
    const embed = new EmbedBuilder()
      .setTitle("🛑 Trò chơi đã dừng")
      .setColor(0xFF6B6B)
      .setDescription(`Trò chơi nối từ đã được dừng bởi ${interaction.user.username}`)
      .addFields(
        { name: "Từ cuối cùng", value: gameState.currentWord, inline: true },
        { name: "Tổng số từ", value: gameState.usedWords.length.toString(), inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};

