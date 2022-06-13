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
import * as tf from "@tensorflow/tfjs-node";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as fs from "fs";

const readImage = (path) => {
  //reads the entire contents of a file.
  //readFileSync() is synchronous and blocks execution until finished.
  const imageBuffer = fs.readFileSync(path);
  //Given the encoded bytes of an image,
  //it returns a 3D or 4D tensor of the decoded image. Supports BMP, GIF, JPEG and PNG formats.
  // const tfimage = tfnode.node.decodeImage(imageBuffer);
  // return tfimage;
  return tf.node.decodeImage(imageBuffer);
};

async function main() {
  const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detectorConfig = {
    // runtime: "mediapipe",
    // solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection",
    // solutionPath: "base/node_modules/@mediapipe/face_detection",
    runtime: "tfjs",
  };
  const detector = await faceDetection.createDetector(model, detectorConfig);

  const image = readImage("./frames/01.jpg");
  console.log({ image });
  const faces = await detector.estimateFaces(image);
  console.log({ faces });
}
main();
