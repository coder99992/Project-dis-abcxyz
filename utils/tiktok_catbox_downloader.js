const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function downloadTikTokVideo(tiktokUrl) {
  try {
    const response = await axios.get(`https://api.douyin.wtf/api?url=${tiktokUrl}&hd=1`);
    const videoUrl = response.data.nwm_video_url;
    if (!videoUrl) {
      throw new Error("Could not get video URL from TikTok API.");
    }

    const videoResponse = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
    });

    const videoPath = `/tmp/tiktok_video_${Date.now()}.mp4`;
    const writer = fs.createWriteStream(videoPath);
    videoResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(videoPath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error downloading TikTok video:", error.message);
    throw error;
  }
}

async function uploadToCatbox(filePath) {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    if (response.data.startsWith("https://files.catbox.moe/")) {
      return response.data;
    } else {
      throw new Error(`Catbox upload failed: ${response.data}`);
    }
  } catch (error) {
    console.error("Error uploading to Catbox:", error.message);
    throw error;
  }
}

module.exports = {
  downloadTikTokVideo,
  uploadToCatbox,
};


