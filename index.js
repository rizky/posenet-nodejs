global.XMLHttpRequest = require('xhr2');

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const fetch = require('node-fetch');
const {Image, createCanvas} = require('canvas');
const posenet = require('@tensorflow-models/posenet')
const videoProcessor = require('./video_processor')
fs = require('fs');

const formatIndex = (index) => index.toString().padStart(2, '0');

const drawKeypoints = (name, index, canvas, keypoints) => {
  ctx = canvas.getContext('2d');
  keypoints.forEach((key, index) => {
    if (index > 4 && index < 11) {
      console.log(key);
      ctx.beginPath();
      ctx.arc(key.position.x, key.position.y, 5, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();
    }
  });
  const buf = canvas.toBuffer();
  fs.writeFileSync(`./images/${name}/r${name}_${formatIndex(index)}.jpg`, buf);
  fs.writeFileSync(`./images/${name}/d${name}_${formatIndex(index)}.json`, JSON.stringify(keypoints) , 'utf-8');
}

const run = async (name, index) => {
  let img_path = `./images/${name}/${name}_${formatIndex(index)}.png`;
  let { Response } = fetch;
  let stream = fs.createReadStream(img_path);
  let buffer = await new Response(stream).buffer()
  let img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width,img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);

  const imageScaleFactor = 1;
  const flipHorizontal = false;
  const outputStride = 8;
  const multiplier = 1.01;

  const net  = await posenet.load(multiplier);
  const pose = await net.estimateSinglePose(canvas, imageScaleFactor, flipHorizontal, outputStride);
  drawKeypoints(name, index, canvas, pose.keypoints);
}

const main = async () => {
  const length =  10;
  await videoProcessor.generateImages('1_dollar', length);
  [...Array(length)].map(async (i, index) =>
    run('1_dollar', index + 1));
}

main();
