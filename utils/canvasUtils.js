const { createCanvas, loadImage } = require('canvas');

/**
 * Tạo welcome image với canvas
 * @param {Object} member - Discord member object
 * @returns {Buffer} - Canvas buffer
 */
async function createWelcomeImage(member) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);

  // Welcome text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Chào mừng!', 400, 100);

  // User name
  ctx.font = 'bold 32px Arial';
  ctx.fillText(member.user.username, 400, 160);

  // Server info
  ctx.font = '24px Arial';
  ctx.fillText(`Thành viên thứ ${member.guild.memberCount}`, 400, 200);
  ctx.fillText(`Chào mừng đến với ${member.guild.name}!`, 400, 240);

  // Load và vẽ avatar
  await drawAvatar(ctx, member.user, 400, 320, 50, false);

  return canvas.toBuffer();
}

/**
 * Tạo goodbye image với canvas
 * @param {Object} member - Discord member object
 * @returns {Buffer} - Canvas buffer
 */
async function createGoodbyeImage(member) {
  const canvas = createCanvas(800, 400);
  const ctx = canvas.getContext('2d');

  // Background gradient (màu tối hơn cho goodbye)
  const gradient = ctx.createLinearGradient(0, 0, 800, 400);
  gradient.addColorStop(0, '#434343');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 400);

  // Goodbye text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Tạm biệt!', 400, 100);

  // User name
  ctx.font = 'bold 32px Arial';
  ctx.fillText(member.user.username, 400, 160);

  // Server info
  ctx.font = '24px Arial';
  ctx.fillText(`Còn lại ${member.guild.memberCount} thành viên`, 400, 200);
  ctx.fillText(`Cảm ơn bạn đã tham gia ${member.guild.name}!`, 400, 240);

  // Load và vẽ avatar với hiệu ứng goodbye
  await drawAvatar(ctx, member.user, 400, 320, 50, true);

  return canvas.toBuffer();
}

/**
 * Vẽ avatar user lên canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} user - Discord user object
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Avatar radius
 * @param {boolean} isGoodbye - Có phải goodbye không
 */
async function drawAvatar(ctx, user, x, y, radius, isGoodbye = false) {
  try {
    const avatarURL = user.displayAvatarURL({ 
      extension: 'png', 
      size: 128 
    });
    const avatar = await loadImage(avatarURL);
    
    // Vẽ circle mask cho avatar
    ctx.save();
    if (isGoodbye) {
      ctx.globalAlpha = 0.7; // Làm mờ avatar cho goodbye
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    // Vẽ avatar
    ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
    
    // Vẽ border cho avatar
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Thêm hiệu ứng "X" cho goodbye
    if (isGoodbye) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.6, y - radius * 0.6);
      ctx.lineTo(x + radius * 0.6, y + radius * 0.6);
      ctx.moveTo(x + radius * 0.6, y - radius * 0.6);
      ctx.lineTo(x - radius * 0.6, y + radius * 0.6);
      ctx.stroke();
    }
    
  } catch (avatarError) {
    console.log('Không thể load avatar:', avatarError.message);
    // Vẽ default avatar circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = isGoodbye ? '#666666' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Vẽ icon
    ctx.fillStyle = isGoodbye ? '#ffffff' : '#667eea';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(isGoodbye ? '😢' : '👤', x, y + 15);
  }
}

/**
 * Tạo custom background từ URL
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} backgroundURL - URL của background image
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
async function drawCustomBackground(ctx, backgroundURL, width, height) {
  try {
    const background = await loadImage(backgroundURL);
    ctx.drawImage(background, 0, 0, width, height);
  } catch (error) {
    console.log('Không thể load background:', error.message);
    // Fallback to gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
}

module.exports = {
  createWelcomeImage,
  createGoodbyeImage,
  drawAvatar,
  drawCustomBackground
};

