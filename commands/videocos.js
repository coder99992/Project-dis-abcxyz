const { SlashCommandBuilder } = require("discord.js");

// Danh sách các link video của bạn
const videoLinks = [
  "https://files.catbox.moe/9u1i15.mp4",
  "https://files.catbox.moe/bkxm0s.mp4",
  "https://files.catbox.moe/b7bf5i.mp4",
  "https://files.catbox.moe/it15ik.mp4",
  "https://files.catbox.moe/xdjflz.mp4",
  "https://files.catbox.moe/zhkvp4.mp4",
  "https://files.catbox.moe/ol4xpw.mp4",
  "https://files.catbox.moe/187l9v.mp4",
  "https://files.catbox.moe/9xokkf.mp4",
  "https://files.catbox.moe/75695h.mp4",
  "https://files.catbox.moe/cujf0m.mp4",
  "https://files.catbox.moe/5c4h2g.mp4",
  "https://files.catbox.moe/5kffi6.mp4",
  "https://files.catbox.moe/zdgn13.mp4",
  "https://files.catbox.moe/1e1qz7.mp4",
  "https://files.catbox.moe/h9sb01.mp4",
  "https://files.catbox.moe/klmwsu.mp4",
  "https://files.catbox.moe/8j4ttp.mp4",
  "https://files.catbox.moe/f87cdl.mp4",
  "https://files.catbox.moe/hxjbxg.mp4",
  "https://files.catbox.moe/iegmzp.mp4",
  "https://files.catbox.moe/ukdh6q.mp4",
  "https://files.catbox.moe/a8bruj.mp4",
  "https://files.catbox.moe/dradrb.mp4",
  "https://files.catbox.moe/mr6xzc.mp4",
  "https://files.catbox.moe/89wf0n.mp4",
  "https://files.catbox.moe/9yp91s.mp4",
  "https://files.catbox.moe/q4tisu.mp4",
  "https://files.catbox.moe/skgxoq.mp4",
  "https://files.catbox.moe/tx2uc0.mp4",
  "https://files.catbox.moe/7ebvxb.mp4",
  "https://files.catbox.moe/bv5wwi.mp4",
  "https://files.catbox.moe/ii4kf9.mp4"
];

// Danh sách các tin nhắn chào hỏi ngẫu nhiên
const greetings = [
  "Xin chào! Video của bạn đây:",
  "Đây là video bạn yêu cầu:",
  "Tuyệt vời! Cùng xem video này nhé:",
  "Chào bạn, chúc bạn một ngày tốt lành! Video cho bạn:",
  "Hey! Video ngẫu nhiên dành cho bạn:"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("videocos") // Tên lệnh là "video", người dùng sẽ gõ /video
    .setDescription("Gửi một video ngẫu nhiên kèm lời chào."),
  async execute(interaction) {
    // Chọn một video ngẫu nhiên từ danh sách
    const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    
    // Chọn một lời chào ngẫu nhiên
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Tạo tin nhắn trả lời
    const replyMessage = `${randomGreeting} ${randomVideo}`;

    // Gửi tin nhắn trả lời
    await interaction.reply(replyMessage);
  },
};
