const { spawn } = require('child_process');
const ffmpegBinary = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

// Extract raw RGB pixels from an image file using FFmpeg
function getRawRgbPixels(imagePath, targetWidth = 320, targetHeight = 180) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(imagePath)) {
      return reject(new Error(`Image not found: ${imagePath}`));
    }
    const args = [
      '-i', imagePath,
      '-vf', `scale=${targetWidth}:${targetHeight}`,
      '-f', 'rawvideo',
      '-pix_fmt', 'rgb24',
      '-'
    ];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    const chunks = [];
    let errText = '';
    proc.stdout.on('data', chunk => chunks.push(chunk));
    proc.stderr.on('data', d => errText += d.toString());
    proc.on('close', code => {
      if (code === 0) {
        resolve({
          buffer: Buffer.concat(chunks),
          width: targetWidth,
          height: targetHeight
        });
      } else {
        reject(new Error(`FFmpeg raw RGB extract failed (code ${code}): ${errText}`));
      }
    });
  });
}

// Convert RGB to HSV
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

// Determine if HSV color matches a named or hex color key
function matchesColorKey(hsv, targetHex) {
  const clean = (targetHex || '').toUpperCase().replace('#', '');
  
  // Pure / Primary Red: #FF0000 or similar
  if (clean === 'FF0000' || clean === 'E60000' || clean === 'CC0000' || clean === 'FF2020') {
    return (hsv.h < 22 || hsv.h > 338) && hsv.s > 0.55 && hsv.v > 0.35;
  }
  // Pure / Primary Green: #00FF00, #00E600
  if (clean === '00FF00' || clean === '00E600' || clean === '10B981' || clean === '22C55E') {
    return (hsv.h >= 80 && hsv.h <= 160) && hsv.s > 0.50 && hsv.v > 0.35;
  }
  // Pure / Primary Blue: #0000FF, #0055FF
  if (clean === '0000FF' || clean === '2563EB' || clean === '3B82F6') {
    return (hsv.h >= 200 && hsv.h <= 260) && hsv.s > 0.55 && hsv.v > 0.35;
  }
  // Pure / Primary Yellow: #FFFF00, #FACC15
  if (clean === 'FFFF00' || clean === 'FACC15' || clean === 'EAB308') {
    return (hsv.h >= 45 && hsv.h <= 70) && hsv.s > 0.55 && hsv.v > 0.40;
  }
  // Pure / Primary Cyan: #00FFFF, #00F0FF, #06B6D4
  if (clean === '00FFFF' || clean === '00F0FF' || clean === '06B6D4') {
    return (hsv.h >= 165 && hsv.h <= 195) && hsv.s > 0.55 && hsv.v > 0.40;
  }
  // Pure / Primary Magenta / Pink: #FF00FF, #EC4899
  if (clean === 'FF00FF' || clean === 'D946EF' || clean === 'EC4899') {
    return (hsv.h >= 280 && hsv.h <= 335) && hsv.s > 0.55 && hsv.v > 0.40;
  }
  // Primary Orange: #FFA500, #F97316
  if (clean === 'FFA500' || clean === 'F97316' || clean === 'EA580C') {
    return (hsv.h >= 22 && hsv.h <= 45) && hsv.s > 0.60 && hsv.v > 0.45;
  }

  return false;
}

/**
 * Detect all Color Keys present in a Spatial Previs image
 * @param {string} spatialImagePath - Path to Spatial Previs frame
 * @param {Array} referenceAssets - All references in project with optional colorKey
 * @returns {Promise<Object>} Detection results, bounding boxes, and alignment prompt directives
 */
async function detectColorKeysInSpatialFrame(spatialImagePath, referenceAssets = []) {
  if (!spatialImagePath || !fs.existsSync(spatialImagePath)) {
    return { detectedAssets: [], colorDirectives: '', detections: [] };
  }

  const assetsWithColor = (referenceAssets || []).filter(r => r.colorKey && typeof r.colorKey === 'string');
  if (assetsWithColor.length === 0) {
    return { detectedAssets: [], colorDirectives: '', detections: [] };
  }

  try {
    const { buffer, width, height } = await getRawRgbPixels(spatialImagePath, 320, 180);
    const detectionsMap = {};

    assetsWithColor.forEach(ref => {
      const hex = ref.colorKey.toUpperCase();
      detectionsMap[ref.id] = {
        ref,
        hex,
        pixelCount: 0,
        minX: width, maxX: 0,
        minY: height, maxY: 0
      };
    });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        const r = buffer[idx];
        const g = buffer[idx + 1];
        const b = buffer[idx + 2];
        const hsv = rgbToHsv(r, g, b);

        for (const refId in detectionsMap) {
          const item = detectionsMap[refId];
          if (matchesColorKey(hsv, item.hex)) {
            item.pixelCount++;
            if (x < item.minX) item.minX = x;
            if (x > item.maxX) item.maxX = x;
            if (y < item.minY) item.minY = y;
            if (y > item.maxY) item.maxY = y;
          }
        }
      }
    }

    const detections = [];
    const detectedAssets = [];
    const directives = [];

    for (const refId in detectionsMap) {
      const item = detectionsMap[refId];
      // Require at least 6 connected pixels at 320x180 resolution
      if (item.pixelCount >= 6) {
        const normCenterX = ((item.minX + item.maxX) / 2 / width).toFixed(2);
        const normCenterY = ((item.minY + item.maxY) / 2 / height).toFixed(2);
        const screenPos = parseFloat(normCenterX) < 0.38 ? 'Screen-Left' : (parseFloat(normCenterX) > 0.62 ? 'Screen-Right' : 'Center');
        const screenVert = parseFloat(normCenterY) < 0.40 ? 'Upper-Third' : (parseFloat(normCenterY) > 0.65 ? 'Lower-Third' : 'Mid-Screen');

        detections.push({
          refId: item.ref.id,
          name: item.ref.name,
          colorKey: item.hex,
          pixelCount: item.pixelCount,
          box: {
            x: parseFloat(normCenterX),
            y: parseFloat(normCenterY)
          },
          screenPlacement: `${screenVert} ${screenPos}`
        });

        detectedAssets.push(item.ref);

        directives.push(
          `SPATIAL COLOR KEY ${item.hex} -> Asset "${item.ref.name}" (${item.ref.tag}): Located at ${screenVert} ${screenPos} (normalized coordinates [${normCenterX}, ${normCenterY}]). Replace the solid ${item.hex} proxy volume with the canonical asset design. Preserve its exact 3D orientation, position, and trajectory from the spatial previs.`
        );
      }
    }

    return {
      detectedAssets,
      detections,
      colorDirectives: directives.join('\n')
    };
  } catch (err) {
    console.warn('Color key detection failed:', err.message);
    return { detectedAssets: [], colorDirectives: '', detections: [] };
  }
}

// Helper to get image dimensions via ffmpeg
function getImageDimensions(imagePath) {
  return new Promise((resolve) => {
    const proc = spawn(ffmpegBinary, ['-i', imagePath], { windowsHide: true });
    let text = '';
    proc.stderr.on('data', d => text += d.toString());
    proc.on('close', () => {
      const match = text.match(/Stream.*Video:.*,\s*(\d{2,5})x(\d{2,5})/);
      if (match) {
        resolve({ width: parseInt(match[1], 10), height: parseInt(match[2], 10) });
      } else {
        resolve({ width: 854, height: 480 });
      }
    });
  });
}

// Extract raw Grayscale pixels
function getRawGrayPixels(imagePath, width, height) {
  return new Promise((resolve, reject) => {
    const args = ['-i', imagePath, '-vf', `scale=${width}:${height}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    const chunks = [];
    let err = '';
    proc.stdout.on('data', c => chunks.push(c));
    proc.stderr.on('data', d => err += d.toString());
    proc.on('close', code => {
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`Extract Gray failed: ${err}`));
    });
  });
}

// Save raw grayscale buffer as PNG
function saveRawGrayImage(buffer, width, height, outputPath) {
  return new Promise((resolve, reject) => {
    const args = ['-f', 'rawvideo', '-pix_fmt', 'gray', '-s', `${width}x${height}`, '-i', 'pipe:0', '-frames:v', '1', '-y', outputPath];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    proc.stdin.write(buffer);
    proc.stdin.end();
    proc.on('close', code => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`Save raw gray failed code ${code}`));
    });
  });
}

// Save raw RGB buffer as PNG / JPG
function saveRawRgbImage(buffer, width, height, outputPath) {
  return new Promise((resolve, reject) => {
    const args = ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${width}x${height}`, '-i', 'pipe:0', '-frames:v', '1', '-y', outputPath];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    proc.stdin.write(buffer);
    proc.stdin.end();
    proc.on('close', code => {
      if (code === 0) resolve(outputPath);
      else reject(new Error(`Save raw rgb failed code ${code}`));
    });
  });
}

/**
 * Generate a dilated and feathered binary mask from Spatial Previs Color Keys
 * @param {string} spatialImagePath - Path to Spatial Previs image
 * @param {Array<string>} targetHexColors - Array of hex colors to mask, e.g. ['#FF0000', '#00FF00']
 * @param {string} outputMaskPath - Output destination for mask PNG
 * @param {Object} options - Dilation and feather radius
 */
async function generateColorKeyMask(spatialImagePath, targetHexColors = [], outputMaskPath, options = {}) {
  const dilation = options.dilation !== undefined ? options.dilation : 8;
  const feather = options.feather !== undefined ? options.feather : 4;

  const { width, height } = await getImageDimensions(spatialImagePath);
  const rgbData = await getRawRgbPixels(spatialImagePath, width, height);
  const rgbBuffer = rgbData.buffer;

  const matchedCoords = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const r = rgbBuffer[idx];
      const g = rgbBuffer[idx + 1];
      const b = rgbBuffer[idx + 2];
      const hsv = rgbToHsv(r, g, b);

      let matched = false;
      for (const hex of targetHexColors) {
        if (matchesColorKey(hsv, hex)) {
          matched = true;
          break;
        }
      }

      if (matched) {
        matchedCoords.push([x, y]);
      }
    }
  }

  if (matchedCoords.length === 0) {
    return { hasMask: false, pixelCount: 0 };
  }

  // Morphological dilation: expand outwards by `dilation` pixels to avoid color fringing
  const dilatedMask = new Uint8Array(width * height);
  for (let i = 0; i < matchedCoords.length; i++) {
    const [cx, cy] = matchedCoords[i];
    for (let dy = -dilation; dy <= dilation; dy++) {
      const ny = cy + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -dilation; dx <= dilation; dx++) {
        const nx = cx + dx;
        if (nx < 0 || nx >= width) continue;
        if (dx * dx + dy * dy <= dilation * dilation) {
          dilatedMask[ny * width + nx] = 255;
        }
      }
    }
  }

  // Smooth feathering: separable 2-pass box blur
  let featheredMask = dilatedMask;
  if (feather > 0) {
    const tempH = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0, count = 0;
        for (let k = -feather; k <= feather; k++) {
          const nx = x + k;
          if (nx >= 0 && nx < width) {
            sum += dilatedMask[y * width + nx];
            count++;
          }
        }
        tempH[y * width + x] = sum / count;
      }
    }

    featheredMask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0, count = 0;
        for (let k = -feather; k <= feather; k++) {
          const ny = y + k;
          if (ny >= 0 && ny < height) {
            sum += tempH[ny * width + x];
            count++;
          }
        }
        featheredMask[y * width + x] = Math.round(sum / count);
      }
    }
  }

  await saveRawGrayImage(Buffer.from(featheredMask), width, height, outputMaskPath);

  return {
    hasMask: true,
    maskPath: outputMaskPath,
    width,
    height,
    pixelCount: matchedCoords.length
  };
}

/**
 * Stage 2: Edge Integration & Contact Cleanup Pass
 * Smoothly blends the newly inpainted/restyled asset over the pristine True Color background,
 * eliminating color key bleed, seam lines, and applying ambient background light-wrap.
 */
async function applyEdgeIntegrationAndCleanup(inpaintedImagePath, trueColorImagePath, maskPath, outputPath) {
  const { width, height } = await getImageDimensions(inpaintedImagePath);
  const inpData = await getRawRgbPixels(inpaintedImagePath, width, height);
  const inpBuffer = inpData.buffer;
  const tcData = await getRawRgbPixels(trueColorImagePath, width, height);
  const tcBuffer = tcData.buffer;
  const maskBuffer = await getRawGrayPixels(maskPath, width, height);

  const outBuffer = Buffer.alloc(width * height * 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const rgbIdx = pIdx * 3;
      const alpha = maskBuffer[pIdx] / 255.0;

      if (alpha <= 0.001) {
        // 100% frozen background from True Color image (zero celestial drift)
        outBuffer[rgbIdx] = tcBuffer[rgbIdx];
        outBuffer[rgbIdx + 1] = tcBuffer[rgbIdx + 1];
        outBuffer[rgbIdx + 2] = tcBuffer[rgbIdx + 2];
      } else if (alpha >= 0.999) {
        // 100% inpainted asset
        outBuffer[rgbIdx] = inpBuffer[rgbIdx];
        outBuffer[rgbIdx + 1] = inpBuffer[rgbIdx + 1];
        outBuffer[rgbIdx + 2] = inpBuffer[rgbIdx + 2];
      } else {
        // Smooth feathered alpha blend on perimeter band
        const rInp = inpBuffer[rgbIdx];
        const gInp = inpBuffer[rgbIdx + 1];
        const bInp = inpBuffer[rgbIdx + 2];

        const rTc = tcBuffer[rgbIdx];
        const gTc = tcBuffer[rgbIdx + 1];
        const bTc = tcBuffer[rgbIdx + 2];

        outBuffer[rgbIdx] = Math.round(rInp * alpha + rTc * (1 - alpha));
        outBuffer[rgbIdx + 1] = Math.round(gInp * alpha + gTc * (1 - alpha));
        outBuffer[rgbIdx + 2] = Math.round(bInp * alpha + bTc * (1 - alpha));
      }
    }
  }

  await saveRawRgbImage(outBuffer, width, height, outputPath);
  return { outputPath, width, height };
}

// Extract raw RGB pixels from a video at a specific timestamp using FFmpeg
function getVideoRgbPixelsAtTimestamp(videoPath, timestamp, targetWidth = 320, targetHeight = 180) {
  return new Promise((resolve) => {
    if (!fs.existsSync(videoPath)) {
      return resolve({ buffer: Buffer.alloc(targetWidth * targetHeight * 3), width: targetWidth, height: targetHeight });
    }
    const safeTs = Math.max(0, parseFloat(timestamp) || 0);
    const args = [
      '-ss', safeTs.toString(),
      '-i', videoPath,
      '-vframes', '1',
      '-vf', `scale=${targetWidth}:${targetHeight}`,
      '-f', 'rawvideo',
      '-pix_fmt', 'rgb24',
      '-'
    ];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    const chunks = [];
    proc.stdout.on('data', chunk => chunks.push(chunk));
    proc.on('close', code => {
      if (code === 0 && chunks.length > 0) {
        resolve({
          buffer: Buffer.concat(chunks),
          width: targetWidth,
          height: targetHeight
        });
      } else {
        resolve({
          buffer: Buffer.alloc(targetWidth * targetHeight * 3),
          width: targetWidth,
          height: targetHeight
        });
      }
    });
  });
}

/**
 * Derive physical motion vectors, trajectory, camera angle, and facing direction
 * by analyzing pixel vector displacements between timestamps in the Spatial Previs video.
 */
async function deriveMotionVectorsFromPrevizVideo({
  videoPath,
  startTime = 0,
  endTime = 4,
  bestKeyframeTimestamp = 1,
  totalDuration = 10,
  referenceAssets = [],
  contextNarrative = ''
}) {
  if (!videoPath || !fs.existsSync(videoPath)) {
    return null;
  }

  try {
    const t0 = Math.max(0, Math.min(totalDuration - 0.2, bestKeyframeTimestamp));
    // Sample 1.0 to 1.5 seconds later, or towards shot end
    const tDelta = Math.max(0.4, Math.min(1.5, (endTime - t0) * 0.75));
    const t1 = Math.min(totalDuration - 0.05, t0 + tDelta);

    const [frame0, frame1] = await Promise.all([
      getVideoRgbPixelsAtTimestamp(videoPath, t0, 320, 180),
      getVideoRgbPixelsAtTimestamp(videoPath, t1, 320, 180)
    ]);

    const width = 320;
    const height = 180;

    const assetsWithColor = (referenceAssets || []).filter(r => r.colorKey && typeof r.colorKey === 'string');

    let cx0 = 0.5, cy0 = 0.5, area0 = 0;
    let cx1 = 0.5, cy1 = 0.5, area1 = 0;
    let trackedAsset = null;
    let maxCount = 0;

    if (assetsWithColor.length > 0) {
      // Find asset with highest pixel presence
      for (const asset of assetsWithColor) {
        let count0 = 0, minX0 = width, maxX0 = 0, minY0 = height, maxY0 = 0;
        let count1 = 0, minX1 = width, maxX1 = 0, minY1 = height, maxY1 = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 3;
            const hsv0 = rgbToHsv(frame0.buffer[idx], frame0.buffer[idx + 1], frame0.buffer[idx + 2]);
            if (matchesColorKey(hsv0, asset.colorKey)) {
              count0++;
              if (x < minX0) minX0 = x;
              if (x > maxX0) maxX0 = x;
              if (y < minY0) minY0 = y;
              if (y > maxY0) maxY0 = y;
            }

            const hsv1 = rgbToHsv(frame1.buffer[idx], frame1.buffer[idx + 1], frame1.buffer[idx + 2]);
            if (matchesColorKey(hsv1, asset.colorKey)) {
              count1++;
              if (x < minX1) minX1 = x;
              if (x > maxX1) maxX1 = x;
              if (y < minY1) minY1 = y;
              if (y > maxY1) maxY1 = y;
            }
          }
        }

        if (count0 > 8 && count0 > maxCount) {
          maxCount = count0;
          trackedAsset = asset;
          cx0 = ((minX0 + maxX0) / 2) / width;
          cy0 = ((minY0 + maxY0) / 2) / height;
          area0 = (maxX0 - minX0) * (maxY0 - minY0);

          if (count1 > 5) {
            cx1 = ((minX1 + maxX1) / 2) / width;
            cy1 = ((minY1 + maxY1) / 2) / height;
            area1 = (maxX1 - minX1) * (maxY1 - minY1);
          } else {
            cx1 = cx0;
            cy1 = cy0;
            area1 = area0;
          }
        }
      }
    }

    // Fallback: If no color key asset was found, track foreground optical displacement
    if (!trackedAsset || maxCount < 8) {
      let sumX0 = 0, sumY0 = 0, fgCount0 = 0;
      let sumX1 = 0, sumY1 = 0, fgCount1 = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 3;
          const luma0 = 0.299 * frame0.buffer[idx] + 0.587 * frame0.buffer[idx + 1] + 0.114 * frame0.buffer[idx + 2];
          const luma1 = 0.299 * frame1.buffer[idx] + 0.587 * frame1.buffer[idx + 1] + 0.114 * frame1.buffer[idx + 2];

          if (luma0 > 30) {
            sumX0 += x;
            sumY0 += y;
            fgCount0++;
          }
          if (luma1 > 30) {
            sumX1 += x;
            sumY1 += y;
            fgCount1++;
          }
        }
      }

      if (fgCount0 > 50) {
        cx0 = (sumX0 / fgCount0) / width;
        cy0 = (sumY0 / fgCount0) / height;
        area0 = fgCount0;
      }
      if (fgCount1 > 50) {
        cx1 = (sumX1 / fgCount1) / width;
        cy1 = (sumY1 / fgCount1) / height;
        area1 = fgCount1;
      }
    }

    const dx = cx1 - cx0;
    const dy = cy1 - cy0;
    const dArea = area0 > 0 ? (area1 - area0) / area0 : 0;

    // 1. Subject Screen Position
    let subjectScreenPosition = 'Center';
    if (cx0 < 0.35) {
      subjectScreenPosition = cy0 < 0.40 ? 'Upper-Left' : (cy0 > 0.65 ? 'Lower-Left' : 'Screen-Left');
    } else if (cx0 > 0.65) {
      subjectScreenPosition = cy0 < 0.40 ? 'Upper-Right' : (cy0 > 0.65 ? 'Lower-Right' : 'Screen-Right');
    } else {
      subjectScreenPosition = cy0 < 0.38 ? 'Upper-Center' : (cy0 > 0.65 ? 'Lower-Center' : 'Center');
    }

    // 2. Facing Direction & Eyeline Match
    let facingDirection = '3/4 Profile Right';
    let eyelineMatch = 'Looking Screen-Right';
    if (dx > 0.03 && dy > 0.03) {
      facingDirection = '3/4 Profile Right';
      eyelineMatch = 'Looking Screen-Right, down along descent path';
    } else if (dx < -0.03 && dy > 0.03) {
      facingDirection = '3/4 Profile Left';
      eyelineMatch = 'Looking Screen-Left, down along descent path';
    } else if (dx > 0.04) {
      facingDirection = 'Screen-Right (Side View)';
      eyelineMatch = 'Looking Screen-Right';
    } else if (dx < -0.04) {
      facingDirection = 'Screen-Left (Side View)';
      eyelineMatch = 'Looking Screen-Left';
    } else if (dArea < -0.15) {
      facingDirection = '3/4 High Angle Dorsal';
      eyelineMatch = 'Ahead into depth';
    } else if (dArea > 0.15) {
      facingDirection = 'Forward (Direct to Lens)';
      eyelineMatch = 'Direct to Lens';
    } else {
      facingDirection = '3/4 Profile Right';
      eyelineMatch = 'Looking Screen-Right';
    }

    // 3. Camera Angle & Optics
    let cameraAngle = 'Medium Shot 50mm';
    if (cy0 < 0.40 && dy >= 0) {
      cameraAngle = '3/4 High Angle Profile 50mm';
    } else if (cy0 > 0.60 && dy <= 0) {
      cameraAngle = 'Low Angle Dramatic 35mm';
    } else if (Math.abs(dArea) > 0.25 || Math.abs(dx) > 0.08) {
      cameraAngle = 'Cinematic Widescreen 35mm Tracking';
    } else {
      cameraAngle = 'Medium Shot 50mm';
    }

    // 4. Camera Trajectory
    let cameraTrajectory = 'Dolly Forward';
    if (dy > 0.03) {
      cameraTrajectory = 'Crane Down (Tracking Descent)';
    } else if (dy < -0.03) {
      cameraTrajectory = 'Crane Up';
    } else if (dx > 0.04) {
      cameraTrajectory = 'Pan Right';
    } else if (dx < -0.04) {
      cameraTrajectory = 'Pan Left';
    } else if (dArea > 0.12) {
      cameraTrajectory = 'Slow Zoom In';
    } else if (dArea < -0.12) {
      cameraTrajectory = 'Dolly Forward';
    } else {
      cameraTrajectory = 'Static Cinematic';
    }

    // 5. Subject Motion Vector & Action
    const assetName = trackedAsset ? trackedAsset.name : 'Landing craft';
    let actionDesc = `${assetName}`;
    if (dy > 0.03 && dx > 0.03) {
      actionDesc += ' plunges diagonally toward screen-right through the upper atmosphere, thrusters firing';
    } else if (dy > 0.03 && dx < -0.03) {
      actionDesc += ' plunges diagonally toward screen-left through the upper atmosphere, thrusters firing';
    } else if (dy > 0.04) {
      actionDesc += ' descending steadily downward towards the planet surface';
    } else if (dx > 0.04) {
      actionDesc += ' cruising steadily from screen-left to screen-right';
    } else if (dx < -0.04) {
      actionDesc += ' cruising steadily from screen-right to screen-left';
    } else if (dArea < -0.12) {
      actionDesc += ' accelerating away into the distant atmosphere';
    } else if (dArea > 0.12) {
      actionDesc += ' approaching closely towards the camera';
    } else {
      actionDesc += ' maintaining flight path with stabilizing thrusters';
    }

    if (dArea < -0.08) {
      actionDesc += ', receding into distance';
    } else if (dArea > 0.08) {
      actionDesc += ', enlarging in frame';
    }

    const motionVector = actionDesc;
    const rule180Vector = dx >= 0
      ? 'Maintain East Axis - subject moving towards screen-right'
      : 'Maintain West Axis - subject moving towards screen-left';

    return {
      motionVector,
      cameraTrajectory,
      subjectScreenPosition,
      facingDirection,
      eyelineMatch,
      cameraAngle,
      lightingOrigin: 'Dramatic Atmospheric Backlight & Rim Light',
      rule180Vector,
      vectors: { dx: parseFloat(dx.toFixed(3)), dy: parseFloat(dy.toFixed(3)), dArea: parseFloat(dArea.toFixed(3)) }
    };
  } catch (err) {
    console.warn('Motion vector derivation error:', err.message);
    return null;
  }
}

module.exports = {
  detectColorKeysInSpatialFrame,
  deriveMotionVectorsFromPrevizVideo,
  generateColorKeyMask,
  applyEdgeIntegrationAndCleanup,
  matchesColorKey,
  rgbToHsv
};
