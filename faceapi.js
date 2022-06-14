const tf = require("@tensorflow/tfjs-node");
const faceapi = require("@vladmandic/face-api");
const fs = require("fs");

// https://github.com/vladmandic/face-api/blob/master/demo/node.js
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

const minConfidence = 0.15;
const maxResults = 5;
const optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
  minConfidence,
  maxResults,
});

let loaded = false;
async function faces(path) {
  if (!loaded) {
    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();
    await faceapi.nets.ssdMobilenetv1.loadFromDisk("./models");
    loaded = true;
  }

  // console.log(
  //   `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
  //     faceapi.version
  //   } Backend: ${faceapi.tf?.getBackend()}`
  // );

  const img = loadImage(path);
  const results = await faceapi.detectAllFaces(img, optionsSSDMobileNet);
  return results.map((result) => {
    return {
      x: Math.round(result._box._x),
      y: Math.round(result._box._y),
      w: Math.round(result._box._width),
      h: Math.round(result._box._height),
    };
  });
}

module.exports = faces;

// faces("./frames/01.jpg");
