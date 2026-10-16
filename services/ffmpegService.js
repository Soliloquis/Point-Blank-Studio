const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const ffmpegBinary = require('ffmpeg-static');

// Helper to run ffmpeg command
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: '', stderr });
      } else {
        reject(new Error(`FFmpeg exited with code ${code}:\n${stderr}`));
      }
    });
    proc.on('error', reject);
  });
}

// Generate an animated video clip from an image or dynamic canvas (NEVER blank black!)
async function generateSampleClip({
  title,
  prompt,
  duration = 4,
  outputPath,
  keyframePath,
  referenceImagePath,
  cameraMotion = 'Dolly Forward'
}) {
  const d = Math.max(2, Math.min(duration, 15));
  const frames = d * 30;

  // Check if we have an image to animate (keyframe or reference image)
  let sourceImage = null;
  let tempExtractedFrame = null;
  if (keyframePath && fs.existsSync(keyframePath)) {
    if (keyframePath.endsWith('.mp4') || keyframePath.endsWith('.webm')) {
      tempExtractedFrame = path.join(path.dirname(outputPath), `kf_temp_${Date.now()}.jpg`);
      try {
        await runFfmpeg(['-y', '-ss', '0.5', '-i', keyframePath, '-vframes', '1', tempExtractedFrame]);
        if (fs.existsSync(tempExtractedFrame)) {
          sourceImage = tempExtractedFrame;
        }
      } catch (e) {}
    } else {
      sourceImage = keyframePath;
    }
  }

  if (!sourceImage && referenceImagePath && fs.existsSync(referenceImagePath)) {
    sourceImage = referenceImagePath;
  }

  // Camera Motion filters for zoompan
  let zoomFilter = `zoompan=z='min(zoom+0.0015,1.25)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`;
  
  if (cameraMotion === 'Pan Right') {
    zoomFilter = `zoompan=z=1.18:d=${frames}:x='if(lte(on,1),(iw-iw/zoom)/6,min(x+2.5,iw-iw/zoom))':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`;
  } else if (cameraMotion === 'Pan Left') {
    zoomFilter = `zoompan=z=1.18:d=${frames}:x='if(lte(on,1),(iw-iw/zoom)*5/6,max(x-2.5,0))':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`;
  } else if (cameraMotion === 'Crane Down') {
    zoomFilter = `zoompan=z=1.18:d=${frames}:x='iw/2-(iw/zoom/2)':y='if(lte(on,1),0,min(y+2.5,ih-ih/zoom))':s=1280x720:fps=30`;
  } else if (cameraMotion === 'Slow Zoom In' || cameraMotion === 'Dolly Forward') {
    zoomFilter = `zoompan=z='min(zoom+0.0018,1.3)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`;
  } else if (cameraMotion === 'Orbit 360' || cameraMotion === 'Dolly Backward') {
    zoomFilter = `zoompan=z='max(1.3-0.0015*on,1.02)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`;
  } else {
    zoomFilter = `zoompan=z='min(zoom+0.0008,1.1)':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30`;
  }

  // 1. If an image is available: animate the image with camera motion
  if (sourceImage) {
    try {
      const filterChain = `scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,${zoomFilter},format=yuv420p`;
      const args = [
        '-y',
        '-loop', '1',
        '-t', `${d}`,
        '-i', sourceImage,
        '-f', 'lavfi',
        '-t', `${d}`,
        '-i', 'anullsrc=r=44100:cl=stereo',
        '-vf', filterChain,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-c:a', 'aac',
        '-shortest',
        outputPath
      ];
      await runFfmpeg(args);
      if (tempExtractedFrame && fs.existsSync(tempExtractedFrame)) {
        try { fs.unlinkSync(tempExtractedFrame); } catch (e) {}
      }
      if (fs.existsSync(outputPath)) {
        return outputPath;
      }
    } catch (err) {
      console.warn('Image zoompan failed, using colorful canvas:', err.message);
      if (tempExtractedFrame && fs.existsSync(tempExtractedFrame)) {
        try { fs.unlinkSync(tempExtractedFrame); } catch (e) {}
      }
    }
  }

  // 2. If no image or if filter fails: generate a dynamic colorful test pattern with silent audio (NEVER pure black!)
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `testsrc=size=1280x720:rate=30:duration=${d}`,
    '-f', 'lavfi',
    '-t', `${d}`,
    '-i', 'anullsrc=r=44100:cl=stereo',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    outputPath
  ];
  await runFfmpeg(args);
  return outputPath;
}

// Get video duration using ffmpeg
async function getVideoDuration(filePath) {
  try {
    const args = ['-i', filePath];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    let output = '';
    return new Promise((resolve) => {
      proc.stderr.on('data', (data) => {
        output += data.toString();
      });
      proc.on('close', () => {
        const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
        if (match) {
          const hours = parseFloat(match[1]);
          const minutes = parseFloat(match[2]);
          const seconds = parseFloat(match[3]);
          resolve(hours * 3600 + minutes * 60 + seconds);
        } else {
          resolve(5);
        }
      });
      proc.on('error', () => resolve(5));
    });
  } catch (e) {
    return 5;
  }
}

// Stitch timeline clips together into a long-format video with transitions (Cut, Dissolve, Fade to Black, Wipe)
async function stitchTimelineClips({ clips, transitions = [], outputPath, audioPath, targetResolution = '1280x720' }) {
  if (!clips || clips.length === 0) {
    throw new Error('No clips provided to stitch');
  }

  const tempDir = path.join(path.dirname(outputPath), `temp_${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const normalizedClips = [];
    const clipDurations = [];

    // Pre-process and normalize each clip with uniform framerate, resolution, and stereo audio
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const normPath = path.join(tempDir, `norm_${i}.mp4`);
      
      const trimStart = Number(clip.trimStart || 0);
      const hasTrimEnd = clip.trimEnd !== undefined && clip.trimEnd !== null && Number(clip.trimEnd) > 0;
      
      const isImage = Boolean(clip.isAnimatic || /\.(png|jpg|jpeg|webp)$/i.test(clip.filePath || clip.url || ''));
      const args = ['-y'];
      if (isImage) {
        args.push('-loop', '1');
      } else if (trimStart > 0) {
        args.push('-ss', `${trimStart}`);
      }

      args.push('-i', clip.filePath);

      let customAudioPath = clip.audioPath;
      if (!customAudioPath && Array.isArray(clip.audioTracks) && clip.audioTracks.length > 0) {
        customAudioPath = clip.audioTracks[0].filePath;
      }

      const hasCustomAudio = customAudioPath && fs.existsSync(customAudioPath);
      if (hasCustomAudio) {
        args.push('-i', customAudioPath);
      } else if (isImage) {
        // Provide silent audio for image clip so all clips have audio stream
        args.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
      }

      const trimDuration = hasTrimEnd ? (Number(clip.trimEnd) - trimStart) : (Number(clip.duration) || 4);
      if (trimDuration > 0) {
        args.push('-t', `${trimDuration}`);
      }

      const [w, h] = targetResolution.split('x');
      const vf = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30,format=yuv420p`;

      if (hasCustomAudio || isImage) {
        args.push(
          '-vf', vf,
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-c:v', 'libx264',
          '-preset', 'veryfast',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-ar', '44100',
          '-ac', '2',
          '-shortest',
          normPath
        );
      } else {
        args.push(
          '-vf', vf,
          '-c:v', 'libx264',
          '-preset', 'veryfast',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-ar', '44100',
          '-ac', '2',
          normPath
        );
      }

      await runFfmpeg(args);
      normalizedClips.push(normPath);

      // Measure exact duration of normalized clip
      const dur = await getVideoDuration(normPath);
      clipDurations.push(dur || 4);
    }

    const stitchedTemp = path.join(tempDir, 'stitched_noaudio.mp4');

    // Check if there are any non-cut transitions
    const hasTransitions = transitions.some(t => t && t.type && t.type !== 'cut' && Number(t.duration || 0) > 0);

    if (normalizedClips.length > 1 && hasTransitions) {
      // Build FFmpeg xfade and acrossfade filter graph
      const inputArgs = ['-y'];
      normalizedClips.forEach(p => {
        inputArgs.push('-i', p);
      });

      let videoFilterGraph = '';
      let audioFilterGraph = '';
      let accumulatedDuration = clipDurations[0];
      let lastVideoLabel = '0:v';
      let lastAudioLabel = '0:a';

      // Map transition type to FFmpeg xfade transition name
      const xfadeTypeMap = {
        'dissolve': 'dissolve',
        'crossfade': 'dissolve',
        'fade': 'fade',
        'fadeblack': 'fadeblack',
        'fadewhite': 'fadewhite',
        'wipeleft': 'wipeleft',
        'wiperight': 'wiperight',
        'circleopen': 'circleopen',
        'smoothleft': 'smoothleft'
      };

      for (let i = 0; i < normalizedClips.length - 1; i++) {
        const nextClipDuration = clipDurations[i + 1];
        const trans = transitions[i] || { type: 'cut', duration: 0 };
        
        let transType = xfadeTypeMap[trans.type] || 'fade';
        let transDur = Number(trans.duration || 0.8);
        
        // Safety cap duration to at most half of the shorter clip
        const maxAllowed = Math.min(accumulatedDuration, nextClipDuration) / 2.1;
        if (transDur > maxAllowed) transDur = Math.max(0.2, Math.floor(maxAllowed * 10) / 10);

        if (trans.type === 'cut' || transDur <= 0.05) {
          // Hard cut simulation via minimal 0.02s crossfade to prevent discontinuities
          transType = 'fade';
          transDur = 0.02;
        }

        const offset = Math.max(0.1, accumulatedDuration - transDur);
        const nextVideoLabel = `v_${i + 1}`;
        const nextAudioLabel = `a_${i + 1}`;

        videoFilterGraph += `[${lastVideoLabel}][${i + 1}:v]xfade=transition=${transType}:duration=${transDur}:offset=${offset.toFixed(2)}[${nextVideoLabel}];`;
        audioFilterGraph += `[${lastAudioLabel}][${i + 1}:a]acrossfade=d=${transDur}:c1=tri:c2=tri[${nextAudioLabel}];`;

        accumulatedDuration = accumulatedDuration + nextClipDuration - transDur;
        lastVideoLabel = nextVideoLabel;
        lastAudioLabel = nextAudioLabel;
      }

      // Strip trailing semicolons
      const filterComplex = `${videoFilterGraph} ${audioFilterGraph}`.trim().replace(/;$/, '');

      const xfadeArgs = [
        ...inputArgs,
        '-filter_complex', filterComplex,
        '-map', `[${lastVideoLabel}]`,
        '-map', `[${lastAudioLabel}]`,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-c:a', 'aac',
        '-b:a', '128k',
        stitchedTemp
      ];

      try {
        await runFfmpeg(xfadeArgs);
      } catch (err) {
        console.warn('XFade transition filter failed, falling back to concat:', err.message);
        // Fallback to concat demuxer if xfade fails
        await runConcatFallback(normalizedClips, tempDir, stitchedTemp);
      }
    } else {
      // Direct concat demuxer (when all cuts or single clip)
      await runConcatFallback(normalizedClips, tempDir, stitchedTemp);
    }

    if (audioPath && fs.existsSync(audioPath)) {
      const audioArgs = [
        '-y',
        '-i', stitchedTemp,
        '-i', audioPath,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-shortest',
        outputPath
      ];
      await runFfmpeg(audioArgs);
    } else {
      fs.copyFileSync(stitchedTemp, outputPath);
    }

    return outputPath;
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (err) {}
  }
}

// Concat demuxer fallback helper
async function runConcatFallback(normalizedClips, tempDir, stitchedTemp) {
  const concatListPath = path.join(tempDir, 'concat_list.txt');
  const concatContent = normalizedClips
    .map((p) => `file '${p.replace(/\\/g, '/')}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  const concatArgs = [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-c:a', 'aac',
    '-b:a', '128k',
    stitchedTemp
  ];
  await runFfmpeg(concatArgs);
}

// Extract lightweight sample candidate frames across the video for end-to-end analysis
async function sampleVideoFrames(videoPath, tempDir, count = 10) {
  fs.mkdirSync(tempDir, { recursive: true });
  const totalDuration = await getVideoDuration(videoPath);
  const sampleCount = Math.max(4, Math.min(count, 16));
  const step = totalDuration / sampleCount;
  const samples = [];

  for (let i = 0; i < sampleCount; i++) {
    const ts = Math.max(0.1, Math.min(totalDuration - 0.2, (i + 0.5) * step));
    const thumbFilename = `sample_${i + 1}_${Date.now()}.jpg`;
    const thumbPath = path.join(tempDir, thumbFilename);
    try {
      await runFfmpeg([
        '-y',
        '-ss', `${ts}`,
        '-i', videoPath,
        '-vframes', '1',
        '-q:v', '4',
        '-vf', 'scale=480:-1',
        thumbPath
      ]);
      if (fs.existsSync(thumbPath)) {
        samples.push({
          index: i + 1,
          timestamp: Math.round(ts * 10) / 10,
          filePath: thumbPath
        });
      }
    } catch (e) {
      console.warn(`Sample extraction failed at ${ts}s:`, e.message);
    }
  }
  return { samples, totalDuration };
}

// Extract a single high-quality keyframe at a specified timestamp
async function extractSingleKeyframe(videoPath, outputDir, timestamp, shotNumber) {
  fs.mkdirSync(outputDir, { recursive: true });
  const baseName = path.basename(videoPath, path.extname(videoPath));
  const frameFilename = `kf_${baseName}_${shotNumber}_${Date.now()}.jpg`;
  const framePath = path.join(outputDir, frameFilename);
  const ts = Math.max(0, Number(timestamp));

  try {
    await runFfmpeg([
      '-y',
      '-ss', `${ts}`,
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '2',
      '-vf', 'scale=854:-1',
      framePath
    ]);

    if (fs.existsSync(framePath)) {
      return {
        frameFilename,
        framePath,
        frameUrl: `/storage/keyframes/${frameFilename}`
      };
    }
  } catch (err) {
    console.warn(`Single keyframe extraction failed at ${ts}s:`, err.message);
  }
  return null;
}

// Extract keyframes with customizable mode, interval, and count controls
async function extractKeyframes(videoPath, outputDir, options = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const totalDuration = await getVideoDuration(videoPath);
  
  const mode = options.mode || 'count'; // 'count', 'interval', 'scene'
  const maxFrames = Math.max(2, Math.min(Number(options.maxFrames || 8), 24));
  const reqInterval = Number(options.interval || 3.5);
  const startTime = Math.max(0, Number(options.startTime || 0));
  const endTime = options.endTime ? Math.min(totalDuration, Number(options.endTime)) : totalDuration;
  const usableDuration = Math.max(1, endTime - startTime);

  let timestamps = [];

  if (Array.isArray(options.customTimestamps) && options.customTimestamps.length > 0) {
    timestamps = options.customTimestamps.map((t) => Math.min(endTime - 0.1, Math.max(startTime, Number(t))));
  } else if (mode === 'interval') {
    const step = Math.max(1, reqInterval);
    for (let t = startTime; t < endTime; t += step) {
      timestamps.push(t);
      if (timestamps.length >= 24) break;
    }
  } else {
    // 'count' or fallback
    const frameCount = Math.max(2, Math.min(maxFrames, Math.ceil(usableDuration / 3.0)));
    const step = usableDuration / frameCount;
    for (let i = 0; i < frameCount; i++) {
      timestamps.push(Math.min(endTime - 0.2, startTime + i * step + 0.3));
    }
  }

  const results = [];
  const baseName = path.basename(videoPath, path.extname(videoPath));

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const nextTs = (i < timestamps.length - 1) ? timestamps[i + 1] : endTime;
    const shotDuration = Math.max(1, Math.round((nextTs - ts) * 10) / 10);
    const frameFilename = `kf_${baseName}_${i + 1}_${Date.now()}.jpg`;
    const framePath = path.join(outputDir, frameFilename);

    try {
      const args = [
        '-y',
        '-ss', `${ts}`,
        '-i', videoPath,
        '-vframes', '1',
        '-q:v', '2',
        '-vf', 'scale=640:-1',
        framePath
      ];
      await runFfmpeg(args);
      if (fs.existsSync(framePath)) {
        results.push({
          shotNumber: i + 1,
          timestamp: Math.round(ts * 10) / 10,
          duration: shotDuration,
          startTime: Math.round(ts * 10) / 10,
          endTime: Math.round(nextTs * 10) / 10,
          keyframePath: framePath,
          keyframeFilename: frameFilename,
          keyframeUrl: `/storage/keyframes/${frameFilename}`
        });
      }
    } catch (err) {
      console.warn(`Keyframe extraction failed at ${ts}s:`, err.message);
    }
  }

  return results;
}

// Extract the last frame of a video clip for tail-to-head keyframe continuity chaining
async function extractLastFrame(videoPath, outputDir, shotNumber = '') {
  fs.mkdirSync(outputDir, { recursive: true });
  const baseName = path.basename(videoPath, path.extname(videoPath));
  const frameFilename = `tail_kf_${baseName}_${shotNumber ? 'shot' + shotNumber + '_' : ''}${Date.now()}.jpg`;
  const framePath = path.join(outputDir, frameFilename);

  try {
    const duration = await getVideoDuration(videoPath);
    const ts = Math.max(0, duration - 0.12);

    // Fast seek near end
    await runFfmpeg([
      '-y',
      '-ss', `${ts}`,
      '-i', videoPath,
      '-vframes', '1',
      '-q:v', '2',
      '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease',
      framePath
    ]);

    if (fs.existsSync(framePath) && fs.statSync(framePath).size > 0) {
      return {
        frameFilename,
        framePath,
        frameUrl: `/storage/keyframes/${frameFilename}`
      };
    }
  } catch (err) {
    console.warn(`Last frame extraction notice:`, err.message);
  }
  return null;
}

module.exports = {
  runFfmpeg,
  generateSampleClip,
  getVideoDuration,
  stitchTimelineClips,
  extractKeyframes,
  sampleVideoFrames,
  extractSingleKeyframe,
  extractLastFrame
};
