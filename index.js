const getFaces = require("./faceapi");
const FFmpeg = require("fluent-ffmpeg");
const Path = require("path");
const fs = require("fs");

const { repeatedSmooth, filterScript } = require("./utils");

function generateFrames(source, frameDir) {
  return new Promise((resolve, reject) => {
    const command = FFmpeg({ source })
      // .withSize("320x240")
      // .withVideoFilter("fps=1")
      .saveToFile(Path.join(frameDir, "%d.jpg"))
      .on("progress", (progress) => {
        console.log(progress.percent);
      })
      .on("error", reject)
      .on("end", resolve);
  });
}

function getMetadata(path) {
  return new Promise((resolve, reject) => {
    FFmpeg.ffprobe(path, function (err, metadata) {
      if (err) reject(err);
      else resolve(metadata);
    });
  });
}

async function main() {
  for (let i = 2; i < process.argv.length; i++) {
    const path = process.argv[i];
    console.info(path);

    const zoom = 2;
    const metadata = await getMetadata(path);
    const { width, height, duration } = metadata.streams[0];
    const outputWidth = Math.round(width / zoom);
    const outputHeight = Math.round(height / zoom);
    console.log({ width, height, duration, zoom, outputWidth, outputHeight });

    const frameJsonPath = path + ".frames.json";
    let facePositions;

    if (!fs.existsSync(frameJsonPath)) {
      const frameDir = path + ".frames";
      fs.mkdirSync(frameDir, { recursive: true });

      console.info("Extracting frames...");
      await generateFrames(path, frameDir);
      const framePaths = (await fs.promises.readdir(frameDir)).filter((path) =>
        path.includes(".jpg")
      );

      console.info("Recognizing faces in each frame...");
      facePositions = {};
      await Promise.all(
        framePaths.map(async (framePath, i) => {
          if (i % 30 === 0) {
            console.log(i / framePaths.length);
          }
          const frame = parseInt(framePath);
          const faces = await getFaces(Path.join(frameDir, framePath));
          facePositions[frame] = faces;
        })
      );
      fs.writeFileSync(frameJsonPath, JSON.stringify(facePositions));

      console.info("Cleaning up frames...");
      fs.rmSync(frameDir, { recursive: true });
    } else {
      console.info(frameJsonPath, "already exists");
      facePositions = JSON.parse(fs.readFileSync(frameJsonPath));
    }

    console.info("Generating ffmpeg cropping positions...");
    let faceCenters = Object.values(facePositions).map((faces) => {
      const { x, y, w, h } = faces[0] || {};
      return [x + w / 2, y + h / 2];
    });
    faceCenters = repeatedSmooth({ points: faceCenters, times: 10 });

    const filterScriptPath = path + ".filterscript";
    const script = filterScript({
      faceCenters,
      width,
      height,
      zoom,
      delay: 15,
    });
    fs.writeFileSync(filterScriptPath, script);

    const outputPath = path + ".facefollowed.mp4";
    console.info("Rendering video...");
    FFmpeg(path)
      .outputOptions("-filter_script:v:0", filterScriptPath)
      .audioCodec("copy")
      .output(outputPath)
      .on("progress", (progress) => {
        console.log(progress.percent);
      })
      .run();
  }
}
main();
