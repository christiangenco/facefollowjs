// import * as tf from "@tensorflow/tfjs-node";

// // Way faster but only works on linux. You need to have CUDA installed on your machine with an NVIDIA graphics card before going this route.
// // import * as tf from '@tensorflow/tfjs-node-gpu'

// const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
// const detectorConfig = {
//   runtime: 'mediapipe', // or 'tfjs'
// }
// const detector = await faceDetection.createDetector(model, detectorConfig);
// const faces = await detector.estimateFaces(image);

// https://github.com/tensorflow/tfjs-models/tree/master/face-detection/src/tfjs
import "@mediapipe/face_detection";
import "@tensorflow/tfjs-core";
// Register WebGL backend.
// import "@tensorflow/tfjs-backend-webgl";
// import * as tf from "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as fs from "fs";

const readImage = (path) => tf.node.decodeImage(fs.readFileSync(path));

async function main() {
  const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detectorConfig = {
    runtime: "tfjs",
    // runtime: "mediapipe",
    // solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
    // solutionPath: "base/node_modules/@mediapipe/face_detection",
    maxFaces: 1,
    modelType: "short", // "full" for >5m
  };
  const detector = await faceDetection.createDetector(model, detectorConfig);

  const image = readImage("./frames/01.jpg");
  console.log({ image });
  const faces = await detector.estimateFaces(image);
  console.log({ faces });
}
main();
