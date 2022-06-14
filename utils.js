function map(value, istart, istop, ostart, ostop) {
  return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function smooth({ points }) {
  const smoothPoints = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const [px, py] = points[i - 1];
    const [nx, ny] = points[i + 1];
    smoothPoints[i] = [(x + px + nx) / 3, (y + py + ny) / 3];
  }
  smoothPoints[points.length - 1] = points[points.length - 1];
  return smoothPoints;
}

function repeatedSmooth({ points, times }) {
  let res = smooth({ points });
  for (var i = 0; i < times; i++) {
    res = smooth({ points: res });
  }
  return res;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cameraPosition({ width, height, face, zoom = 2 }) {
  if (!face) return {};
  const outputWidth = Math.round(width / zoom);
  const outputHeight = Math.round(height / zoom);
  const maxX = width - outputWidth;
  const maxY = height - outputHeight;

  // faceCenterPoints[Math.max(0, i - frameDelay)];
  const [x, y] = face;

  // top left corner of the box centered on x,y
  const tlX = clamp(Math.round(x - outputWidth / 2.0), 0, maxX);
  const tlY = clamp(Math.round(y - outputHeight / 2.0), 0, maxY);
  return { x: tlX, y: tlY, w: outputWidth, h: outputHeight };
}

function filterScript({ faceCenters, width, height, zoom, delay }) {
  const script = [];

  const { w: outputWidth, h: outputHeight } = cameraPosition({
    width,
    height,
    face: faceCenters[0],
    zoom,
  });

  // faceCenters.forEach((faceCenter, i) => {
  for (let i = 0; i < faceCenters.length; i++) {
    const faceCenter = faceCenters[Math.max(0, i - delay)];
    const {
      x: camX,
      y: camY,
      w: camW,
      h: camH,
    } = cameraPosition({ width, height, face: faceCenter, zoom });

    script.push(
      `swaprect=${camW}:${camH}:0:0:${camX}:${camY}:enable='eq(n,${i})',`
    );
  }
  script.push(`crop=${outputWidth}:${outputHeight}:0:0`);

  return script.join("\n");
}

exports.map = map;
exports.sleep = sleep;
exports.smooth = smooth;
exports.repeatedSmooth = repeatedSmooth;
exports.clamp = clamp;
exports.cameraPosition = cameraPosition;
exports.filterScript = filterScript;
