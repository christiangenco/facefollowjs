const getFaces = require("./faceapi");
const FFmpeg = require("fluent-ffmpeg");
const Path = require("path");
const fs = require("fs");

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

async function main() {
  for (let i = 2; i < process.argv.length; i++) {
    const path = process.argv[i];
    const frameDir = path + ".frames";
    fs.mkdirSync(frameDir, { recursive: true });

    // await generateFrames(path, frameDir);
    const framePaths = (await fs.promises.readdir(frameDir)).filter((path) =>
      path.includes(".jpg")
    );

    const facePositions = {};
    await Promise.all(
      framePaths.map(async (framePath) => {
        const frame = parseInt(framePath);
        const faces = await getFaces(Path.join(frameDir, framePath));
        facePositions[frame] = faces;
        // console.log({ framePath, faces });
      })
    );
    console.log(facePositions);
  }
}
main();
