const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// File lưu dữ liệu người chơi
const DATA_FILE = path.join(__dirname, '..', 'data', 'players.json');
const GAME_STATE_FILE = path.join(__dirname, '..', 'data', 'gamestate.json');

// Đảm bảo thư mục data tồn tại
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Khởi tạo dữ liệu mặc định
let players = {};
let gameState = {
    isRunning: false,
    currentRound: 0,
    bets: {},
    lastResult: null,
    roundStartTime: null,
    bettingOpen: false
};

// Load dữ liệu từ file
function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            players = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
        if (fs.existsSync(GAME_STATE_FILE)) {
            gameState = { ...gameState, ...JSON.parse(fs.readFileSync(GAME_STATE_FILE, 'utf8')) };
        }
    } catch (error) {
        console.error('Lỗi khi load dữ liệu:', error);
    }
}

// Lưu dữ liệu vào file
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
        fs.writeFileSync(GAME_STATE_FILE, JSON.stringify(gameState, null, 2));
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu:', error);
    }
}

// Khởi tạo người chơi mới
function initPlayer(userId) {
    if (!players[userId]) {
        players[userId] = {
            balance: 10000,
            totalWins: 0,
            totalLoses: 0,
            totalBets: 0
        };
        saveData();
    }
}

// Tung xúc xắc
function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const dice3 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2 + dice3;
    
    let result;
    if (total === 3 || total === 18) {
        result = 'special'; // Nhà cái thắng
    } else if (total >= 11 && total <= 17) {
        result = 'tai';
    } else {
        result = 'xiu';
    }
    
    return { dice1, dice2, dice3, total, result };
}

// Xử lý kết quả phiên
function processRound(channel) {
    const diceResult = rollDice();
    gameState.lastResult = diceResult;
    
    const embed = new EmbedBuilder()
        .setTitle('🎲 KẾT QUẢ TÀI XỈU')
        .setColor(diceResult.result === 'tai' ? 0xFF0000 : diceResult.result === 'xiu' ? 0x0000FF : 0x808080)
        .addFields(
            { name: '🎲 Xúc xắc', value: `${diceResult.dice1} - ${diceResult.dice2} - ${diceResult.dice3}`, inline: true },
            { name: '📊 Tổng điểm', value: `${diceResult.total}`, inline: true },
            { name: '🏆 Kết quả', value: diceResult.result === 'special' ? 'ĐẶC BIỆT (Nhà cái thắng)' : diceResult.result.toUpperCase(), inline: true }
        );

    // Xử lý cược
    let winners = [];
    let losers = [];
    
    for (const [userId, bet] of Object.entries(gameState.bets)) {
        initPlayer(userId);
        
        if (diceResult.result === 'special') {
            // Nhà cái thắng, tất cả đều thua
            players[userId].balance -= bet.amount;
            players[userId].totalLoses++;
            losers.push(`<@${userId}>: -${bet.amount.toLocaleString()}`);
        } else if (bet.choice === diceResult.result) {
            // Thắng x2
            const winAmount = bet.amount;
            players[userId].balance += winAmount;
            players[userId].totalWins++;
            winners.push(`<@${userId}>: +${winAmount.toLocaleString()}`);
        } else {
            // Thua
            players[userId].balance -= bet.amount;
            players[userId].totalLoses++;
            losers.push(`<@${userId}>: -${bet.amount.toLocaleString()}`);
        }
    }
    
    if (winners.length > 0) {
        embed.addFields({ name: '🎉 Người thắng', value: winners.join('\n'), inline: false });
    }
    if (losers.length > 0) {
        embed.addFields({ name: '😢 Người thua', value: losers.join('\n'), inline: false });
    }
    
    // Reset cược cho phiên mới
    gameState.bets = {};
    gameState.currentRound++;
    saveData();
    
    channel.send({ embeds: [embed] });
}

// Timer cho game
let gameTimer = null;

function startGameTimer(channel) {
    if (gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(() => {
        if (!gameState.isRunning) return;
        
        // Mở cửa đặt cược
        gameState.bettingOpen = true;
        gameState.roundStartTime = Date.now();
        
        const embed = new EmbedBuilder()
            .setTitle('🎰 PHIÊN TÀI XỈU MỚI')
            .setDescription(`**Phiên #${gameState.currentRound + 1}**\n\n🔥 Đặt cược ngay! Còn **45 giây**\nDùng lệnh: \`/taixiu bet tai 1000\` hoặc \`/taixiu bet xiu 1000\``)
            .setColor(0x00FF00)
            .addFields(
                { name: '💰 Tài (11-17)', value: 'Thắng x2 tiền cược', inline: true },
                { name: '💰 Xỉu (4-10)', value: 'Thắng x2 tiền cược', inline: true },
                { name: '⚠️ Đặc biệt (3,18)', value: 'Nhà cái thắng', inline: true }
            );
        
        channel.send({ embeds: [embed] });
        
        // Đóng cửa đặt cược sau 45 giây
        setTimeout(() => {
            gameState.bettingOpen = false;
            channel.send('🔒 **ĐÓNG CỬA ĐẶT CƯỢC!** Chuẩn bị tung xúc xắc...');
            
            // Tung xúc xắc sau 5 giây
            setTimeout(() => {
                processRound(channel);
            }, 5000);
        }, 45000);
        
    }, 60000); // Mỗi 60 giây
}

// Load dữ liệu khi khởi động
loadData();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taixiu')
        .setDescription('Game Tài Xỉu')
        .addSubcommand(subcommand =>
            subcommand
                .setName('on')
                .setDescription('Bật game Tài Xỉu'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('off')
                .setDescription('Tắt game Tài Xỉu'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bet')
                .setDescription('Đặt cược Tài Xỉu')
                .addStringOption(option =>
                    option.setName('choice')
                        .setDescription('Chọn Tài hoặc Xỉu')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Tài', value: 'tai' },
                            { name: 'Xỉu', value: 'xiu' }
                        ))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Số tiền cược')
                        .setRequired(true)
                        .setMinValue(100)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('balance')
                .setDescription('Xem số dư tài khoản'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Xem trạng thái game')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        switch (subcommand) {
            case 'on':
                if (gameState.isRunning) {
                    await interaction.reply({ content: '⚠️ Game Tài Xỉu đã đang chạy!', ephemeral: true });
                    return;
                }
                
                gameState.isRunning = true;
                gameState.currentRound = 0;
                saveData();
                startGameTimer(interaction.channel);
                
                await interaction.reply('🎰 **GAME TÀI XỈU ĐÃ BẮT ĐẦU!**\nPhiên đầu tiên sẽ bắt đầu trong 1 phút...');
                break;

            case 'off':
                if (!gameState.isRunning) {
                    await interaction.reply({ content: '⚠️ Game Tài Xỉu chưa được bật!', ephemeral: true });
                    return;
                }
                
                gameState.isRunning = false;
                gameState.bettingOpen = false;
                if (gameTimer) {
                    clearInterval(gameTimer);
                    gameTimer = null;
                }
                saveData();
                
                await interaction.reply('🛑 **GAME TÀI XỈU ĐÃ DỪNG!**');
                break;

            case 'bet':
                if (!gameState.isRunning) {
                    await interaction.reply({ content: '⚠️ Game Tài Xỉu chưa được bật!', ephemeral: true });
                    return;
                }
                
                if (!gameState.bettingOpen) {
                    await interaction.reply({ content: '🔒 Hiện tại không thể đặt cược! Vui lòng chờ phiên tiếp theo.', ephemeral: true });
                    return;
                }
                
                initPlayer(userId);
                
                const choice = interaction.options.getString('choice');
                const amount = interaction.options.getInteger('amount');
                
                if (players[userId].balance < amount) {
                    await interaction.reply({ content: `💸 Bạn không đủ tiền! Số dư hiện tại: ${players[userId].balance.toLocaleString()}`, ephemeral: true });
                    return;
                }
                
                if (gameState.bets[userId]) {
                    await interaction.reply({ content: '⚠️ Bạn đã đặt cược trong phiên này rồi!', ephemeral: true });
                    return;
                }
                
                gameState.bets[userId] = { choice, amount };
                players[userId].totalBets++;
                saveData();
                
                await interaction.reply({ content: `✅ Đã đặt cược **${choice.toUpperCase()}** với số tiền **${amount.toLocaleString()}**!`, ephemeral: true });
                break;

            case 'balance':
                initPlayer(userId);
                
                const embed = new EmbedBuilder()
                    .setTitle('💰 Thông tin tài khoản')
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '💵 Số dư', value: `${players[userId].balance.toLocaleString()}`, inline: true },
                        { name: '🏆 Thắng', value: `${players[userId].totalWins}`, inline: true },
                        { name: '😢 Thua', value: `${players[userId].totalLoses}`, inline: true },
                        { name: '🎲 Tổng cược', value: `${players[userId].totalBets}`, inline: true }
                    )
                    .setFooter({ text: `ID: ${userId}` });
                
                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;

            case 'status':
                const statusEmbed = new EmbedBuilder()
                    .setTitle('📊 Trạng thái Game Tài Xỉu')
                    .setColor(gameState.isRunning ? 0x00FF00 : 0xFF0000)
                    .addFields(
                        { name: '🎮 Trạng thái', value: gameState.isRunning ? '🟢 Đang chạy' : '🔴 Đã dừng', inline: true },
                        { name: '🎯 Phiên hiện tại', value: `#${gameState.currentRound}`, inline: true },
                        { name: '🎲 Đặt cược', value: gameState.bettingOpen ? '🟢 Mở' : '🔴 Đóng', inline: true }
                    );
                
                if (gameState.lastResult) {
                    statusEmbed.addFields(
                        { name: '🎲 Kết quả gần nhất', value: `${gameState.lastResult.dice1}-${gameState.lastResult.dice2}-${gameState.lastResult.dice3} (${gameState.lastResult.total}) - ${gameState.lastResult.result.toUpperCase()}`, inline: false }
                    );
                }
                
                const currentBets = Object.keys(gameState.bets).length;
                if (currentBets > 0) {
                    statusEmbed.addFields(
                        { name: '👥 Người đặt cược phiên này', value: `${currentBets} người`, inline: true }
                    );
                }
                
                await interaction.reply({ embeds: [statusEmbed] });
                break;
        }
    },
};

