global.XMLHttpRequest = require('xhr2');

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const fetch = require('node-fetch');
const {Image, createCanvas} = require('canvas');
const posenet = require('@tensorflow-models/posenet')
const videoProcessor = require('./video_processor')
fs = require('fs');

const drawKeypoints = (name, canvas, keypoints) => {
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
  fs.writeFileSync(`./images/${name}/${name}-result.jpg`, buf);
}

const run = async (name) => {
  let img_path = `./images/${name}/${name}_2.png`;
  let { Response } = fetch;
  let stream = fs.createReadStream(img_path);
  let buffer = await new Response(stream).buffer()
  let img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width,img.height);
  canvas.getContext('2d').drawImage(img, 0, 0);

  const imageScaleFactor = 0.5;
  const flipHorizontal = false;
  const outputStride = 8;
  const multiplier = 0.5;

  const net  = await posenet.load(multiplier);
  const pose = await net.estimateSinglePose(canvas, imageScaleFactor, flipHorizontal, outputStride);
  drawKeypoints(name, canvas, pose.keypoints);
  return pose;
}

videoProcessor.generateImages('1_dollar');
run('1_dollar');
