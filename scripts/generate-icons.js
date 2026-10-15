import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height) {
  const buffer = Buffer.alloc(width * height * 4);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Squircle background shape
      const nx = Math.abs(dx) / (width * 0.44);
      const ny = Math.abs(dy) / (height * 0.44);
      const isInsideApp = Math.pow(nx, 4) + Math.pow(ny, 4) <= 1.0;

      if (!isInsideApp) {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
        continue;
      }

      // Base deep space navy/black background
      let r = 8 + Math.floor((y / height) * 8);
      let g = 10 + Math.floor((y / height) * 12);
      let b = 22 + Math.floor((y / height) * 16);

      // Subtle squircle border glow
      const borderDist = Math.pow(nx, 4) + Math.pow(ny, 4);
      if (borderDist > 0.85 && borderDist <= 1.0) {
        const edgeFactor = (borderDist - 0.85) / 0.15;
        r = Math.min(255, r + Math.floor(edgeFactor * 60));
        g = Math.min(255, g + Math.floor(edgeFactor * 130));
        b = Math.min(255, b + Math.floor(edgeFactor * 240));
      }

      // Swirling torus ribbon representation
      const rOrb = width * 0.32;
      if (dist < rOrb * 1.3) {
        const angle = Math.atan2(dy, dx);
        const spiralDist = Math.abs(dist - rOrb * (0.8 + 0.25 * Math.sin(angle * 2.5)));
        
        if (spiralDist < width * 0.12) {
          const intensity = 1 - (spiralDist / (width * 0.12));
          // Cyan to magenta to violet gradient depending on angle
          const blend = (Math.sin(angle) + 1) / 2; // 0 to 1
          
          const cyanR = 0, cyanG = 230, cyanB = 255;
          const magR = 255, magG = 20, magB = 147;
          
          r = Math.min(255, r + Math.floor(intensity * (cyanR * (1 - blend) + magR * blend)));
          g = Math.min(255, g + Math.floor(intensity * (cyanG * (1 - blend) + magG * blend)));
          b = Math.min(255, b + Math.floor(intensity * (cyanB * (1 - blend) + magB * blend)));
        }

        // Inner glowing core
        if (dist < width * 0.15) {
          const coreFactor = 1 - (dist / (width * 0.15));
          r = Math.min(255, r + Math.floor(coreFactor * 220));
          g = Math.min(255, g + Math.floor(coreFactor * 140));
          b = Math.min(255, b + Math.floor(coreFactor * 255));
        }
      }

      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = 255;
    }
  }

  // PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    scanlines[rowOffset] = 0;
    buffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = c ^ buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/icon-192.png', createPng(192, 192));
fs.writeFileSync('public/icon-512.png', createPng(512, 512));
fs.writeFileSync('public/nova-orb.png', createPng(512, 512));
console.log('Generated PNG icons matching user orb successfully!');
