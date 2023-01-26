# Installation

- install `ffmpeg` and `node` (perhaps with `nvm`)
- `git clone git@github.com:christiangenco/facefollowjs.git`

# Use

`node path/to/facefollowjs/index.js --zoom 2 --delay 8 video.mp4`

The script will:

- create a new temporary directory of images for each frame in the video
- analyze each frame to find a face position
- save those positions in a text file titled `${inputName}.frames.json` (if the script is called multiple times for the same file it will first check for the existence of this file before exporting and analyzing each frame)
- generate an `ffmpeg` filter script from the frame file titled `${inputName}.filterscript` which defines a camera position for each frame of the video
- run an `ffmpeg` command to render the output video at `${inputName}.facefollowed.mp4`
