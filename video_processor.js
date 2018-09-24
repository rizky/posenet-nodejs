var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

const generateImages = (name) => {
  const command = ffmpeg(`./videos/${name}.mp4`);
  if (!fs.existsSync(name)) { fs.mkdirSync(name); }
  command.screenshots({
    timestamps: ['20%', '40%', '60%', '80%'],
    filename: `${name}.png`,
    folder: `./images/${name}`,
    size: '320x240',
  });
}

module.exports = { generateImages };