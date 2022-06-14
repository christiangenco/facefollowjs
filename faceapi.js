import * as tf from "@tensorflow/tfjs-node";
import * as canvas from "canvas";
// import * as faceapi from "face-api.js";
import * as faceapi from "@vladmandic/face-api";
import * as fs from "fs";
// const { Canvas, Image, ImageData, loadImage } = require("canvas");

// const { Canvas, Image, ImageData } = canvas;
// faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

function loadImage(path) {
  const buffer = fs.readFileSync(path);
  const tensor = tf.tidy(() => {
    const decode = faceapi.tf.node.decodeImage(buffer, 3);
    let expand;
    if (decode.shape[2] === 4) {
      // input is in rgba format, need to convert to rgb
      const channels = faceapi.tf.split(decode, 4, 2); // tf.split(tensor, 4, 2); // split rgba to channels
      const rgb = faceapi.tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb and ignore alpha
      expand = faceapi.tf.reshape(rgb, [
        1,
        decode.shape[0],
        decode.shape[1],
        3,
      ]); // move extra dim from the end of tensor and use it as batch number instead
    } else {
      expand = faceapi.tf.expandDims(decode, 0);
    }
    const cast = faceapi.tf.cast(expand, "float32");
    return cast;
  });
  return tensor;
}

async function main() {
  await faceapi.tf.setBackend("tensorflow");
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set("DEBUG", false);
  await faceapi.tf.ready();
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");

  console.log(
    `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
      faceapi.version
    } Backend: ${faceapi.tf?.getBackend()}`
  );
  const minConfidence = 0.15;
  const maxResults = 5;
  const optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence,
    maxResults,
  });

  const img = loadImage("./frames/01.jpg");
  const result = await faceapi.detectAllFaces(img, optionsSSDMobileNet);
  console.log(result[0]._box);

  // https://github.com/vladmandic/face-api/blob/master/demo/node.js

  // const img = await canvas.loadImage("./frames/01.jpg");
  // const detection = await faceapi.detectSingleFace(img);
  // console.log({ detection });

  // const detectionsForSize = faceapi.resizeResults(detections, { width: input.width, height: input.height })

  // const detections = await faceapi.detectAllFaces(input)
}
main();
