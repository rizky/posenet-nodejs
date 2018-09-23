global.XMLHttpRequest = require('xhr2');

const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

const fetch = require('node-fetch');
const {Image, createCanvas} = require('canvas');
const posenet = require('@tensorflow-models/posenet')
fs = require('fs');

const drawKeypoints = (canvas, keypoints) => {
  ctx = canvas.getContext('2d');
  keypoints.forEach((key) => {
    ctx.beginPath();
    ctx.arc(key.position.x, key.position.y, 5, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00ff00';
    ctx.stroke();
  });
  const buf = canvas.toBuffer();
  fs.writeFileSync('test.png', buf);
}

const run = async () => {
  let img_path = 'https://d2z0k43lzfi12d.cloudfront.net/blog/vcdn231/wp-content/uploads/2017/06/15.06._Running-Stamina-1.jpg';
  let buffer = await fetch(img_path).then(res => res.buffer());
  let img = new Image();
  img.src = buffer;
  const canvas = createCanvas(img.width,img.height);
  canvas.getContext('2d').drawImage(img,0,0);

  const imageScaleFactor = 0.5;
  const flipHorizontal = false;
  const outputStride = 8;
  const multiplier = 0.5;

  const net  = await posenet.load(multiplier);
  const pose = await net.estimateSinglePose(canvas, imageScaleFactor, flipHorizontal, outputStride);
  drawKeypoints(canvas, pose.keypoints);
  console.log(pose);
  return pose;
}

run();
