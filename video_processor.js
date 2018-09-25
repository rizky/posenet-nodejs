var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

const generateProcentage = (number) => [...Array(number)]
  .map((i, index) => `${index * (100 / number) + ( 100 / number / 2 )}%`);

const generateImages = async (name, length) => {
  console.log(generateProcentage(length));
  
  const command = await ffmpeg(`./videos/${name}.mp4`);
  if (!fs.existsSync(name)) { fs.mkdirSync(name); }
  await command.screenshots({
    timestamps: generateProcentage(length),
    filename: `${name}.png`,
    folder: `./images/${name}`,
    size: '320x240',
  });
}

module.exports = { generateImages };