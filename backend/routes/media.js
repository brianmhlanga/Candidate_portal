const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const uploadDirs = {
  photo: path.join(__dirname, '../uploads/photos'),
  audio: path.join(__dirname, '../uploads/audio'),
  video: path.join(__dirname, '../uploads/video')
};

const isSafeFilename = (name) => /^[A-Za-z0-9._-]+$/.test(name);

router.get('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;

    if (!uploadDirs[type]) {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const safeName = path.basename(filename);
    if (!isSafeFilename(safeName)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(uploadDirs[type], safeName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (type !== 'video') {
      return res.sendFile(filePath);
    }

    // Support range requests for video playback/seek.
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/webm'
      });
      return stream.pipe(res);
    }

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/webm',
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Media serving error:', error);
    res.status(500).json({ error: 'Failed to serve media' });
  }
});

module.exports = router;

