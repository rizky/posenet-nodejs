var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

const generateProcentage = (number) => [...Array(number)]
  .map((i, index) => `${index * (100 / number) + ( 100 / number / 2 )}%`);

const generateImages = async (name, length) => {  
  if (!fs.existsSync(name)) { fs.mkdirSync(name); }
  return new Promise((resolve, reject) => {
    ffmpeg(`./videos/${name}.mp4`)
      .screenshots({
        timestamps: generateProcentage(length),
        filename: `${name}.png`,
        folder: `./images/${name}`,
        size: '320x240',
      })
      .on('progress', (progress) => {
        console.log(`[ffmpeg] ${JSON.stringify(progress)}`);
      })
      .on('error', (err) => {
        console.log(`[ffmpeg] error: ${err.message}`);
        reject(err);
      })
      .on('end', () => {
        console.log('[ffmpeg] finished');
        resolve();
      })
  });
}

module.exports = { generateImages };