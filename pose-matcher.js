// Great npm package for computing cosine similarity  
const similarity = require('compute-cosine-similarity');
const VPTreeFactory = require('vptree');
const fs = require('fs');
const _ = require('lodash');

const utils = require('./utils.js')

let vptree ; // where we’ll store a reference to our vptree

// Cosine similarity as a distance function. The lower the number, the closer // the match
// poseVector1 and poseVector2 are a L2 normalized 34-float vectors (17 keypoints each  
// with an x and y. 17 * 2 = 32)
const cosineDistanceMatching = (poseVector1, poseVector2) => {
  let cosineSimilarity = similarity(poseVector1, poseVector2);
  let distance = 2 * (1 - cosineSimilarity);
  return Math.sqrt(distance);
}

const poseLoader = (path) => {
  var content = fs.readFileSync(path);
  var data = JSON.parse(content);
  const x_min =_.min(data.map((key) => key.position.x));
  const y_min =_.min(data.map((key) => key.position.y));

  const x_max =_.max(data.map((key) => key.position.x));
  const y_max =_.max(data.map((key) => key.position.y));
  data = _.slice(data, 4, 11); // focus on upper body keypoints
  positions = data.reduce((positions, key) => ([...positions, (key.position.x - x_min) / x_max, (key.position.y - y_min) / y_max]), []);
  return  positions;
}

const loadPoseData = (filenames, length) => {
  let poseData = [];
  filenames.forEach((filename) => {
    [...Array(length)].forEach((_, i) => {
        positions = poseLoader(`./images/${filename}/d${filename}_${utils.formatIndex(i + 1)}.json`);
        poseData = [...poseData, { name: filename, index: i, positions}];
      }
    )
  });
  return poseData;
}

const buildVPTree = (poseData) => {
  // Initialize our vptree with our images’ pose data and a distance function
  vptree = VPTreeFactory.build(poseData.map((data) => data.positions), cosineDistanceMatching);
}

const findMostSimilarMatch = (userPose) => {
  // search the vp tree for the image pose that is nearest (in cosine distance) to userPose
  let nearestImage = vptree.search(userPose);
  // return index (in relation to poseData) of nearest match. 
  return nearestImage[0].i; 
}

const main = async () => {
  try {
    const input = loadPoseData(['8_hour'], 20);
    const poseData = loadPoseData(['5_dollars', '1_dollar'], 20);
    // Build the tree once
    buildVPTree(poseData);

    const currentUserPose = input[19] // an L2 normalized vector representing a user pose. 34-float array (17 keypoints x 2).  
    console.log(`./images/${currentUserPose.name}/r${currentUserPose.name}_${utils.formatIndex(currentUserPose.index + 1)}.jpg`);
    const closestMatchIndex = findMostSimilarMatch(currentUserPose.positions);
    const closestMatch = poseData[closestMatchIndex];
    console.log(`./images/${closestMatch.name}/r${closestMatch.name}_${utils.formatIndex(closestMatch.index + 1)}.jpg`);
  } catch (err) {
    console.log(err);
  }
}

main();