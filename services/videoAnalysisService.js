const https = require('https');
const fs = require('fs');
const path = require('path');
const { extractKeyframes, sampleVideoFrames, extractSingleKeyframe, getVideoDuration, runFfmpeg } = require('./ffmpegService');
const { deriveMotionVectorsFromPrevizVideo } = require('./colorKeyService');

// Helper to make HTTPS requests
function requestJson(urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request(urlStr, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('AI request timed out'));
    });
    req.write(JSON.stringify(body));
    req.end();
  });
}

// Convert image to base64
function fileToBase64(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}

const VALID_MEDIUMS = [
  'Large-Format IMAX 70mm Photorealism',
  'Vintage 35mm Eastman Color Print',
  '2D Anime & Manga (Studio Ghibli / Makoto Shinkai style)',
  'Classic 90s Retro Cel Animation (Grainy ink lineart)',
  'Arcane & Fortiche Painterly Impasto (Textured brushstrokes)',
  '3D Pixar / DreamWorks CGI Animation (Stylized shaders)',
  'Claymation & Stop-Motion (Tactile physical texture)',
  'Graphic Novel / Comic Book Noir (Heavy ink & halftones)',
  'Stylized Digital Painting & Cyberpunk Photorealism'
];

function matchMediumOption(raw) {
  if (!raw || typeof raw !== 'string') return 'Stylized Digital Painting & Cyberpunk Photorealism';
  const trimmed = raw.trim();
  if (VALID_MEDIUMS.includes(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (lower.includes('anime') || lower.includes('ghibli') || lower.includes('manga')) {
    return '2D Anime & Manga (Studio Ghibli / Makoto Shinkai style)';
  }
  if (lower.includes('cel') || lower.includes('retro') || lower.includes('90s')) {
    return 'Classic 90s Retro Cel Animation (Grainy ink lineart)';
  }
  if (lower.includes('arcane') || lower.includes('impasto') || lower.includes('brush') || lower.includes('oil') || lower.includes('painterly')) {
    return 'Arcane & Fortiche Painterly Impasto (Textured brushstrokes)';
  }
  if (lower.includes('pixar') || lower.includes('3d') || lower.includes('cgi') || lower.includes('dreamworks')) {
    return '3D Pixar / DreamWorks CGI Animation (Stylized shaders)';
  }
  if (lower.includes('clay') || lower.includes('stop-motion') || lower.includes('stop motion')) {
    return 'Claymation & Stop-Motion (Tactile physical texture)';
  }
  if (lower.includes('comic') || lower.includes('graphic novel') || lower.includes('noir') || lower.includes('halftone')) {
    return 'Graphic Novel / Comic Book Noir (Heavy ink & halftones)';
  }
  if (lower.includes('vintage') || lower.includes('eastman') || lower.includes('16mm') || lower.includes('sepia')) {
    return 'Vintage 35mm Eastman Color Print';
  }
  if (lower.includes('imax') || lower.includes('70mm') || lower.includes('live-action') || lower.includes('photoreal')) {
    return 'Large-Format IMAX 70mm Photorealism';
  }
  return 'Stylized Digital Painting & Cyberpunk Photorealism';
}

function sanitizePalette(palette) {
  if (!Array.isArray(palette)) return ['#0B0F19', '#FF007F', '#00F0FF', '#FFE600', '#1C2438'];
  const cleaned = [];
  for (const item of palette) {
    if (typeof item === 'string') {
      const match = item.trim().match(/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
      if (match) {
        let hex = match[1];
        if (hex.length === 3) {
          hex = hex.split('').map(c => c + c).join('');
        }
        cleaned.push('#' + hex.toUpperCase());
      }
    }
  }
  const defaults = ['#0B0F19', '#FF007F', '#00F0FF', '#FFE600', '#1C2438'];
  while (cleaned.length < 5) {
    cleaned.push(defaults[cleaned.length]);
  }
  return cleaned.slice(0, 5);
}

// Helper for Fal.ai Any-LLM Vision requests
function requestFalAnyLlmVision({ apiKey, imageUrls, prompt }) {
  return new Promise((resolve, reject) => {
    const authHeader = apiKey.trim().startsWith('Key ') ? apiKey.trim() : `Key ${apiKey.trim()}`;
    const bodyStr = JSON.stringify({
      prompt,
      image_urls: imageUrls
    });

    const req = https.request('https://fal.run/fal-ai/any-llm/vision', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      },
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const rawOutput = parsed.output || parsed.text || '';
            if (typeof rawOutput === 'object' && rawOutput !== null) {
              resolve(rawOutput);
              return;
            }
            const jsonMatch = typeof rawOutput === 'string' ? rawOutput.match(/\{[\s\S]*\}/) : null;
            if (jsonMatch) {
              const result = JSON.parse(jsonMatch[0].trim());
              resolve(result);
            } else {
              reject(new Error('No valid JSON object found in Fal vision output: ' + String(rawOutput).slice(0, 150)));
            }
          } else {
            const msg = (parsed && (parsed.detail?.[0]?.msg || parsed.error || parsed.message)) || `HTTP ${res.statusCode}: ${data.slice(0, 200)}`;
            reject(new Error(msg));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Fal response: ${e.message} - data: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Fal AI Vision request timed out'));
    });
    req.write(bodyStr);
    req.end();
  });
}

// End-to-End High Level Context Generation analyzing both Spatial Previs and True Color videos
async function generateHighLevelContext({ videoPath, colorVideoPath = null, userDescription = '', keyframesDir, falApiKey, openaiApiKey, geminiApiKey, options = {} }) {
  fs.mkdirSync(keyframesDir, { recursive: true });
  const totalDuration = await getVideoDuration(videoPath);
  const tempSampleDir = path.join(keyframesDir, `temp_hlc_${Date.now()}`);
  fs.mkdirSync(tempSampleDir, { recursive: true });

  const sampleCount = 6;
  const step = totalDuration / sampleCount;
  const samples = [];

  try {
    for (let i = 0; i < sampleCount; i++) {
      const ts = Math.max(0.1, Math.min(totalDuration - 0.2, (i + 0.5) * step));
      const sThumb = path.join(tempSampleDir, `sp_${i + 1}.jpg`);
      try {
        await runFfmpeg([
          '-y', '-ss', `${ts}`, '-i', videoPath, '-vframes', '1', '-q:v', '4', '-vf', 'scale=480:-1', sThumb
        ]);
      } catch (e) {}

      let cThumb = null;
      if (colorVideoPath && fs.existsSync(colorVideoPath)) {
        cThumb = path.join(tempSampleDir, `col_${i + 1}.jpg`);
        try {
          await runFfmpeg([
            '-y', '-ss', `${ts}`, '-i', colorVideoPath, '-vframes', '1', '-q:v', '4', '-vf', 'scale=480:-1', cThumb
          ]);
        } catch (e) {
          cThumb = null;
        }
      }

      samples.push({
        index: i + 1,
        timestamp: Math.round(ts * 10) / 10,
        spatialPath: fs.existsSync(sThumb) ? sThumb : null,
        colorPath: (cThumb && fs.existsSync(cThumb)) ? cThumb : null
      });
    }

    let result = null;
    if (falApiKey && falApiKey.trim()) {
      try {
        result = await analyzeHighLevelWithFal(samples, totalDuration, userDescription, falApiKey);
      } catch (err) {
        console.warn('[HighLevelContext] Fal.ai analysis failed:', err.message);
      }
    }

    if (!result && openaiApiKey && openaiApiKey.trim()) {
      try {
        result = await analyzeHighLevelWithOpenAI(samples, totalDuration, userDescription, openaiApiKey);
      } catch (err) {
        console.warn('[HighLevelContext] OpenAI analysis failed:', err.message);
      }
    }

    if (!result && geminiApiKey && geminiApiKey.trim()) {
      try {
        result = await analyzeHighLevelWithGemini(samples, totalDuration, userDescription, geminiApiKey);
      } catch (err) {
        console.warn('[HighLevelContext] Gemini analysis failed:', err.message);
      }
    }

    if (result && result.highLevelContext) {
      return {
        highLevelContext: result.highLevelContext,
        detectedPacing: result.detectedPacing || 'Cinematic Pace'
      };
    }
  } catch (err) {
    console.warn('[HighLevelContext] Video sampling error:', err.message);
  } finally {
    try {
      if (fs.existsSync(tempSampleDir)) {
        fs.rmSync(tempSampleDir, { recursive: true, force: true });
      }
    } catch (e) {}
  }

  // Fallback context synthesis
  const cleanDesc = (userDescription || '').trim();
  const baseText = cleanDesc
    ? cleanDesc
    : 'Cinematic sequence featuring dynamic subject action, camera motion tracking, and textured lighting contrast.';
  return {
    highLevelContext: `${baseText} Across the ${totalDuration.toFixed(1)}s sequence, camera movements establish dramatic scene framing, spatial depth, and pacing continuity.`,
    detectedPacing: 'Cinematic Pace'
  };
}

// Multi-Modal High Level Context using Fal.ai Any-LLM Vision
async function analyzeHighLevelWithFal(samples, totalDuration, userDescription, apiKey) {
  const imageUrls = [];
  const beatNotes = [];
  for (const s of samples) {
    if (s.spatialPath && fs.existsSync(s.spatialPath)) {
      imageUrls.push(`data:image/jpeg;base64,${fileToBase64(s.spatialPath)}`);
      beatNotes.push(`Beat ${s.index} (${s.timestamp}s): Spatial Previs (camera trajectory/geometry)`);
    }
    if (s.colorPath && fs.existsSync(s.colorPath)) {
      imageUrls.push(`data:image/jpeg;base64,${fileToBase64(s.colorPath)}`);
      beatNotes.push(`Beat ${s.index} (${s.timestamp}s): True Color (lighting/materials/palette)`);
    }
  }

  const prompt = `You are an expert cinematic director, continuity supervisor, and cinematographer conducting an end-to-end sequence analysis on companion production video footage.

INPUT TRACKS:
1. Spatial Previs: Camera trajectories, 3D blocking, wireframe/proxy geometry.
2. True Color: Final textures, lighting mood, color palette, atmospheric fog/smoke, environmental materials.

USER MANUAL NARRATIVE & CONTEXT INPUT:
"${(userDescription || '').trim() || 'No manual description provided.'}"

TOTAL SEQUENCE DURATION: ${totalDuration.toFixed(1)} seconds.
CHRONOLOGICAL SAMPLED BEATS:
${beatNotes.join('\n')}

INSTRUCTIONS:
1. Treat the user's manual narrative input as ground truth story context. Correlate it with the visual progression across the Spatial Previs and True Color frames.
2. Formulate "highLevelContext": A comprehensive, evocative 2-4 sentence director's scene overview describing the overarching narrative arc, visual tone, setting/environment, primary subjects/vehicles, key lighting and atmospheric conditions, and camera pacing.
3. Formulate "detectedPacing": e.g. "Cinematic Pace", "Fast Kinetic Action", "Deliberate Suspense", "Explosive Dogfight", "Slow Tension Build".

Respond with strictly valid JSON:
{
  "highLevelContext": "Comprehensive 2-4 sentence director scene overview...",
  "detectedPacing": "Cinematic Pace"
}`;

  return await requestFalAnyLlmVision({
    apiKey,
    imageUrls,
    prompt
  });
}

// Multi-Modal High Level Context using OpenAI GPT-4o-mini
async function analyzeHighLevelWithOpenAI(samples, totalDuration, userDescription, apiKey) {
  const content = [
    {
      type: 'text',
      text: `You are an expert cinematic director, continuity supervisor, and cinematographer conducting an end-to-end sequence analysis on companion production video footage.

INPUT TRACKS:
1. Spatial Previs: Camera trajectories, 3D blocking, wireframe/proxy geometry.
2. True Color: Final textures, lighting mood, color palette, atmospheric fog/smoke, environmental materials.

USER MANUAL NARRATIVE & CONTEXT INPUT:
"${(userDescription || '').trim() || 'No manual description provided.'}"

TOTAL SEQUENCE DURATION: ${totalDuration.toFixed(1)} seconds.

INSTRUCTIONS:
1. Treat the user's manual narrative input as ground truth story context. Correlate it with the visual progression across the Spatial Previs and True Color frames.
2. Formulate "highLevelContext": A comprehensive, evocative 2-4 sentence director's scene overview describing the overarching narrative arc, visual tone, setting/environment, primary subjects/vehicles, key lighting and atmospheric conditions, and camera pacing.
3. Formulate "detectedPacing": e.g. "Cinematic Pace", "Fast Kinetic Action", "Deliberate Suspense", "Explosive Dogfight", "Slow Tension Build".

Respond with strictly valid JSON matching this schema:
{
  "highLevelContext": "Comprehensive 2-4 sentence director scene overview...",
  "detectedPacing": "Cinematic Pace"
}`
    }
  ];

  for (const s of samples) {
    if (s.spatialPath && fs.existsSync(s.spatialPath)) {
      content.push({ type: 'text', text: `[Beat ${s.index} at ${s.timestamp}s - Spatial Previs Track]:` });
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${fileToBase64(s.spatialPath)}`, detail: 'low' }
      });
    }
    if (s.colorPath && fs.existsSync(s.colorPath)) {
      content.push({ type: 'text', text: `[Beat ${s.index} at ${s.timestamp}s - True Color Companion Track]:` });
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${fileToBase64(s.colorPath)}`, detail: 'low' }
      });
    }
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content }],
    response_format: { type: 'json_object' }
  };

  const response = await requestJson('https://api.openai.com/v1/chat/completions', {
    'Authorization': `Bearer ${apiKey.trim()}`
  }, payload);

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// Multi-Modal High Level Context using Gemini 2.0 Flash
async function analyzeHighLevelWithGemini(samples, totalDuration, userDescription, apiKey) {
  const parts = [
    {
      text: `You are an expert cinematic director, continuity supervisor, and cinematographer conducting an end-to-end sequence analysis on companion production video footage.

INPUT TRACKS:
1. Spatial Previs: Camera trajectories, 3D blocking, wireframe/proxy geometry.
2. True Color: Final textures, lighting mood, color palette, atmospheric fog/smoke, environmental materials.

USER MANUAL NARRATIVE & CONTEXT INPUT:
"${(userDescription || '').trim() || 'No manual description provided.'}"

TOTAL SEQUENCE DURATION: ${totalDuration.toFixed(1)} seconds.

INSTRUCTIONS:
1. Treat the user's manual narrative input as ground truth story context. Correlate it with the visual progression across the Spatial Previs and True Color frames.
2. Formulate "highLevelContext": A comprehensive, evocative 2-4 sentence director's scene overview describing the overarching narrative arc, visual tone, setting/environment, primary subjects/vehicles, key lighting and atmospheric conditions, and camera pacing.
3. Formulate "detectedPacing": e.g. "Cinematic Pace", "Fast Kinetic Action", "Deliberate Suspense", "Explosive Dogfight", "Slow Tension Build".

Respond with strictly valid JSON:
{
  "highLevelContext": "Comprehensive 2-4 sentence director scene overview...",
  "detectedPacing": "Cinematic Pace"
}`
    }
  ];

  for (const s of samples) {
    if (s.spatialPath && fs.existsSync(s.spatialPath)) {
      parts.push({ text: `[Beat ${s.index} at ${s.timestamp}s - Spatial Previs Track]:` });
      parts.push({
        inline_data: { mime_type: 'image/jpeg', data: fileToBase64(s.spatialPath) }
      });
    }
    if (s.colorPath && fs.existsSync(s.colorPath)) {
      parts.push({ text: `[Beat ${s.index} at ${s.timestamp}s - True Color Companion Track]:` });
      parts.push({
        inline_data: { mime_type: 'image/jpeg', data: fileToBase64(s.colorPath) }
      });
    }
  }

  const payload = { contents: [{ parts }] };
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`;
  const response = await requestJson(endpoint, {}, payload);

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// End-to-End Multi-Modal Video Analysis combining visual timeline sampling with manual user description & High Level Context
async function analyzeAndDeconstructVideo({ videoPath, colorVideoPath = null, keyframesDir, userDescription = '', highLevelContext = '', falApiKey, openaiApiKey, geminiApiKey, options = {} }) {
  fs.mkdirSync(keyframesDir, { recursive: true });
  const totalDuration = await getVideoDuration(videoPath);
  
  const tempSampleDir = path.join(keyframesDir, `temp_e2e_${Date.now()}`);
  let e2eResult = null;

  try {
    // 1. Visual Sampling: Extract lightweight candidate frames across the video for end-to-end analysis
    const targetSampleCount = options.maxFrames ? Math.min(Number(options.maxFrames) + 2, 16) : 8;
    const { samples } = await sampleVideoFrames(videoPath, tempSampleDir, targetSampleCount);

    if (samples && samples.length > 0) {
      // 2. Perform End-to-End Multi-Modal Analysis with User's Manual Description & High Level Context
      if (falApiKey && falApiKey.trim()) {
        try {
          e2eResult = await analyzeEndToEndWithFal(samples, totalDuration, userDescription, falApiKey, highLevelContext);
        } catch (err) {
          console.warn('Fal.ai End-to-End video analysis failed, falling back:', err.message);
        }
      }

      if (!e2eResult && openaiApiKey && openaiApiKey.trim()) {
        try {
          e2eResult = await analyzeEndToEndWithOpenAI(samples, totalDuration, userDescription, openaiApiKey, highLevelContext);
        } catch (err) {
          console.warn('OpenAI End-to-End video analysis failed:', err.message);
        }
      }

      if (!e2eResult && geminiApiKey && geminiApiKey.trim()) {
        try {
          e2eResult = await analyzeEndToEndWithGemini(samples, totalDuration, userDescription, geminiApiKey, highLevelContext);
        } catch (err) {
          console.warn('Gemini End-to-End video analysis failed:', err.message);
        }
      }
    }
  } catch (err) {
    console.warn('Visual sampling error, falling back to interval extraction:', err.message);
  } finally {
    // Clean up temporary sample frames
    try {
      if (fs.existsSync(tempSampleDir)) {
        fs.rmSync(tempSampleDir, { recursive: true, force: true });
      }
    } catch (e) {}
  }

  // 3. If End-to-End AI Analysis succeeded: extract high-quality Start & End keyframes
  if (e2eResult && Array.isArray(e2eResult.shots) && e2eResult.shots.length > 0) {
    const storyboardShots = [];

    for (let idx = 0; idx < e2eResult.shots.length; idx++) {
      const shotData = e2eResult.shots[idx];
      const shotNum = shotData.shotNumber || idx + 1;
      
      let bestTs = shotData.bestKeyframeTimestamp !== undefined ? Number(shotData.bestKeyframeTimestamp) : null;
      if (bestTs === null || isNaN(bestTs)) {
        bestTs = shotData.timestamp !== undefined ? Number(shotData.timestamp) : null;
      }
      if (bestTs === null || isNaN(bestTs)) {
        const s = Number(shotData.startTime || 0);
        const e = Number(shotData.endTime || s + 3);
        bestTs = (s + e) / 2;
      }
      bestTs = Math.max(0, Math.min(totalDuration - 0.1, bestTs));

      const startTime = shotData.startTime !== undefined ? Number(shotData.startTime) : Math.round(bestTs * 10) / 10;
      const endTime = shotData.endTime !== undefined ? Number(shotData.endTime) : Math.min(totalDuration, startTime + 4);
      const duration = Math.max(1, Math.round((endTime - startTime) * 10) / 10);

      // Extract Start & End Spatial Previs keyframes
      const sTs = startTime;
      const eTs = Math.max(startTime + 0.1, endTime - 0.05);
      const startKf = await extractSingleKeyframe(videoPath, keyframesDir, sTs, `${shotNum}_start`);
      const endKf = await extractSingleKeyframe(videoPath, keyframesDir, eTs, `${shotNum}_end`);

      // Extract matching True Color companion frames (if available)
      let startColorKf = null;
      let endColorKf = null;
      if (colorVideoPath && fs.existsSync(colorVideoPath)) {
        try {
          startColorKf = await extractSingleKeyframe(colorVideoPath, keyframesDir, sTs, `color_${shotNum}_start`);
          endColorKf = await extractSingleKeyframe(colorVideoPath, keyframesDir, eTs, `color_${shotNum}_end`);
        } catch (err) {
          console.warn(`Failed to extract companion color keyframes for shot ${shotNum}:`, err.message);
        }
      }

      // Derive physical motion vectors and camera tracking from Spatial Previs video pixel vectors
      let derivedSpatial = null;
      try {
        derivedSpatial = await deriveMotionVectorsFromPrevizVideo({
          videoPath,
          startTime,
          endTime,
          bestKeyframeTimestamp: bestTs,
          totalDuration,
          referenceAssets: options.referenceAssets || []
        });
      } catch (err) {
        console.warn(`[Pixel Vectors] Motion derivation failed for shot ${shotNum}:`, err.message);
      }

      // Spatial continuity: combine derived pixel vector ground truth with AI analysis
      const spatial = shotData.spatialContinuity || {};
      const spatialContinuity = {
        motionVector: derivedSpatial?.motionVector || spatial.motionVector || `${shotData.description || 'Subject'} moving through scene`,
        cameraTrajectory: derivedSpatial?.cameraTrajectory || spatial.cameraTrajectory || shotData.cameraMotion || 'Dolly Forward',
        subjectScreenPosition: derivedSpatial?.subjectScreenPosition || spatial.subjectScreenPosition || (idx % 2 === 0 ? 'Screen-Left' : 'Screen-Right'),
        facingDirection: derivedSpatial?.facingDirection || spatial.facingDirection || (idx % 2 === 0 ? 'Screen-Right' : 'Screen-Left'),
        eyelineMatch: derivedSpatial?.eyelineMatch || spatial.eyelineMatch || (idx % 2 === 0 ? 'Looking Screen-Right' : 'Looking Screen-Left'),
        cameraAngle: derivedSpatial?.cameraAngle || spatial.cameraAngle || (idx === 0 ? 'Wide Establishing 35mm' : (idx % 2 === 0 ? 'Medium 50mm' : 'Reverse OTS 85mm')),
        lightingOrigin: spatial.lightingOrigin || derivedSpatial?.lightingOrigin || 'Dramatic Atmospheric Backlight & Rim Light',
        rule180Vector: derivedSpatial?.rule180Vector || spatial.rule180Vector || (idx % 2 === 0 ? 'East Axis - subject faces screen-right' : 'East Axis - reverse angle matching eyeline')
      };

      storyboardShots.push({
        id: `sb_shot_${Date.now()}_${idx + 1}`,
        shotNumber: shotNum,
        title: shotData.title || `Shot ${shotNum}`,
        startTime,
        endTime,
        duration,
        keyframeTimestamp: Math.round(bestTs * 10) / 10,
        keyframeUrl: startKf?.frameUrl || null,
        keyframePath: startKf?.framePath || null,
        endKeyframeUrl: endKf?.frameUrl || null,
        endKeyframePath: endKf?.framePath || null,
        colorFrameUrl: startColorKf?.frameUrl || null,
        colorFramePath: startColorKf?.framePath || null,
        endColorFrameUrl: endColorKf?.frameUrl || null,
        endColorFramePath: endColorKf?.framePath || null,
        description: shotData.description || `Cinematic shot capturing scene from ${startTime.toFixed(1)}s to ${endTime.toFixed(1)}s.`,
        cameraMotion: spatialContinuity.cameraTrajectory || shotData.cameraMotion || 'Dolly Forward',
        spatialContinuity,
        status: 'pending',
        approved: false,
        generatedClip: null
      });
    }

    return {
      storyboardShots,
      analysisSummary: e2eResult.analysisSummary || highLevelContext || 'End-to-end video deconstruction aligned with manual user context.',
      detectedPacing: e2eResult.detectedPacing || 'Cinematic Pace'
    };
  }

  // 4. Fallback: Standard keyframe extraction if no AI key or AI failed
  const keyframes = await extractKeyframes(videoPath, keyframesDir, options);
  if (!keyframes || keyframes.length === 0) {
    throw new Error('Could not extract keyframes from the ingested video.');
  }

  const motionPresets = [
    'Dolly Forward', 'Pan Right', 'Close-up Focus', 'Crane Up',
    'Slow Zoom In', 'Pan Left', 'Slow Orbit', 'Static'
  ];

  const defaultSpatialCycle = [
    { subjectScreenPosition: 'Center', facingDirection: 'Forward', eyelineMatch: 'Direct to Lens', cameraAngle: 'Wide Establishing 35mm', lightingOrigin: 'Balanced Ambient Daylight', rule180Vector: 'Establishing Axis' },
    { subjectScreenPosition: 'Screen-Left', facingDirection: 'Screen-Right', eyelineMatch: 'Looking Screen-Right', cameraAngle: 'Medium 50mm', lightingOrigin: 'Screen-Left Key Window Light', rule180Vector: 'East Axis (Subject faces screen-right)' },
    { subjectScreenPosition: 'Screen-Right', facingDirection: 'Screen-Left', eyelineMatch: 'Looking Screen-Left', cameraAngle: 'Reverse OTS 85mm', lightingOrigin: 'Screen-Left Key Window Light', rule180Vector: 'East Axis (Reverse eyeline match)' },
    { subjectScreenPosition: 'Center', facingDirection: '3/4 Profile Right', eyelineMatch: 'Looking Screen-Right', cameraAngle: 'Low Angle Hero 35mm', lightingOrigin: 'High Rim Backlight', rule180Vector: 'East Axis' }
  ];

  const storyboardShots = [];
  for (let idx = 0; idx < keyframes.length; idx++) {
    const kf = keyframes[idx];
    const defaultMotion = motionPresets[idx % motionPresets.length];
    const defaultSpatial = defaultSpatialCycle[idx % defaultSpatialCycle.length];
    const userHint = userDescription ? ` Context: ${userDescription}.` : '';

    const startKf = kf;
    const endKf = await extractSingleKeyframe(videoPath, keyframesDir, Math.max(kf.startTime + 0.1, kf.endTime - 0.05), `${kf.shotNumber}_end`);

    let startColorKf = null;
    let endColorKf = null;
    if (colorVideoPath && fs.existsSync(colorVideoPath)) {
      try {
        startColorKf = await extractSingleKeyframe(colorVideoPath, keyframesDir, kf.startTime, `color_${kf.shotNumber}_start`);
        endColorKf = await extractSingleKeyframe(colorVideoPath, keyframesDir, Math.max(kf.startTime + 0.1, kf.endTime - 0.05), `color_${kf.shotNumber}_end`);
      } catch (err) {
        console.warn(`Failed to extract fallback color keyframes for shot ${kf.shotNumber}:`, err.message);
      }
    }

    storyboardShots.push({
      id: `sb_shot_${Date.now()}_${idx + 1}`,
      shotNumber: kf.shotNumber,
      title: `Shot ${kf.shotNumber} (${kf.startTime}s - ${kf.endTime}s)`,
      startTime: kf.startTime,
      endTime: kf.endTime,
      duration: kf.duration,
      keyframeTimestamp: kf.timestamp,
      keyframeUrl: startKf?.frameUrl || kf.keyframeUrl,
      keyframePath: startKf?.framePath || kf.keyframePath,
      endKeyframeUrl: endKf?.frameUrl || null,
      endKeyframePath: endKf?.framePath || null,
      colorFrameUrl: startColorKf?.frameUrl || null,
      colorFramePath: startColorKf?.framePath || null,
      endColorFrameUrl: endColorKf?.frameUrl || null,
      endColorFramePath: endColorKf?.framePath || null,
      description: `Visual action sequence capturing framing at ${kf.timestamp}s.${userHint}`,
      cameraMotion: defaultMotion,
      spatialContinuity: { ...defaultSpatial },
      status: 'pending',
      approved: false,
      generatedClip: null
    });
  }

  return {
    storyboardShots,
    analysisSummary: userDescription ? `Analysis deconstructed using user context: "${userDescription}".` : (highLevelContext || 'Deconstructed using uniform time sampling.'),
    detectedPacing: 'Standard Pace'
  };
}

// Continuity Prompt Compiler: Assembles spatial, directional, and lighting constraints across cuts
function compileContinuityDirectives(currentShot, previousShot = null, referenceAnchors = {}) {
  const spatial = currentShot?.spatialContinuity || {};
  const prevSpatial = previousShot?.spatialContinuity || null;
  const directives = [];

  // 1. Motion Vector & Action
  if (spatial.motionVector) {
    directives.push(`Subject Motion Vector & Action: ${spatial.motionVector}`);
  }

  // 2. Spatial Framing & Lens Blocking
  if (spatial.cameraAngle) {
    directives.push(`Framing & Optics: ${spatial.cameraAngle}`);
  }
  if (spatial.subjectScreenPosition) {
    directives.push(`Subject Screen Position: ${spatial.subjectScreenPosition}`);
  }
  if (spatial.facingDirection) {
    directives.push(`Facing: ${spatial.facingDirection}`);
  }
  if (spatial.eyelineMatch) {
    directives.push(`Eyeline Direction: ${spatial.eyelineMatch}`);
  }

  // 3. 180-Degree Rule & Continuity Cut Handoff
  if (prevSpatial) {
    if (spatial.rule180Vector) {
      directives.push(`Continuity Axis (180° Rule): ${spatial.rule180Vector}`);
    } else if (prevSpatial.eyelineMatch) {
      directives.push(`Eyeline Continuity: Cut from Shot ${previousShot.shotNumber || 'previous'}, match eyeline alignment`);
    }

    // Lighting vector continuity
    if (spatial.lightingOrigin) {
      directives.push(`Lighting Vector: ${spatial.lightingOrigin}`);
    } else if (prevSpatial.lightingOrigin) {
      directives.push(`Lighting Vector: Maintain ${prevSpatial.lightingOrigin}`);
    }
  } else if (spatial.lightingOrigin) {
    directives.push(`Lighting Vector: ${spatial.lightingOrigin}`);
  }

  // 4. Camera Dynamics & Trajectory
  const camTraj = spatial.cameraTrajectory || currentShot?.cameraMotion;
  if (camTraj) {
    directives.push(`Camera Tracking Trajectory: ${camTraj}`);
  }

  return directives.join('. ');
}
// Multi-modal Fal.ai Any-LLM Vision: End-to-End narrative analysis, spatial continuity, and optimal keyframe selection
async function analyzeEndToEndWithFal(samples, totalDuration, userDescription, apiKey, highLevelContext = '') {
  const selectedSamples = samples.slice(0, 8);
  const imageUrls = selectedSamples.map(s => {
    const ext = path.extname(s.filePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${fileToBase64(s.filePath)}`;
  });

  const timestampsStr = selectedSamples.map(s => `Frame ${s.index} at timestamp ${s.timestamp}s`).join(', ');

  const prompt = `You are an expert cinematic director, continuity supervisor, and film editor conducting an end-to-end narrative, visual, and spatial continuity analysis on a video.

SEQUENCE HIGH-LEVEL CONTEXT:
"${(highLevelContext || '').trim() || 'No prior sequence context established.'}"

USER MANUAL VIDEO DESCRIPTION & CONTEXT:
"${(userDescription || '').trim() || 'No manual description provided.'}"

VIDEO INFO:
Total Duration: ${totalDuration.toFixed(1)} seconds.
Chronological sample frames provided: ${timestampsStr}.

INSTRUCTIONS:
1. Treat the sequence high-level context and user's manual video description as the story/narrative ground truth, and correlate it with the visual progression in the frames.
2. Formulate an overall "analysisSummary" (2-3 sentences explaining overarching narrative arc, visual tone, and pacing).
3. Break the video down into distinct, cohesive storyboard shots that best capture the story beats.
4. For EACH shot, specify the OPTIMAL keyframe timestamp "bestKeyframeTimestamp" (in seconds, e.g. 2.4) that provides the clearest visual moment.
5. Provide a rich visual description for each shot combining the user's narrative context with visual action.
6. Choose the best camera motion from: ["Dolly Forward", "Pan Right", "Pan Left", "Slow Zoom In", "Crane Down", "Orbit 360", "Static Cinematic"].
7. SPATIAL CONTINUITY ANALYSIS:
   Analyze the spatial geometry of the shot:
   - "subjectScreenPosition": "Screen-Left", "Center", or "Screen-Right"
   - "facingDirection": "Screen-Right", "Screen-Left", "Forward", "3/4 Profile Right", "3/4 Profile Left", or "Back to Camera"
   - "eyelineMatch": e.g. "Looking Screen-Right", "Looking Screen-Left", "Direct to Lens"
   - "cameraAngle": e.g. "Wide Establishing 35mm", "Medium Close-Up 50mm", "Low Angle 35mm", "Reverse OTS 85mm"
   - "lightingOrigin": e.g. "Screen-Left Window Light (cool 5600K)", "High Overhead Neon", "Warm Tungsten Practical"
   - "rule180Vector": Axis directive, e.g. "Maintain East Axis - subject faces screen-right"

Respond with strictly valid JSON matching this schema:
{
  "analysisSummary": "2-3 sentence overview of narrative arc, visual tone, and pacing.",
  "detectedPacing": "Cinematic Pace",
  "shots": [
    {
      "shotNumber": 1,
      "title": "Establishment of Scene",
      "bestKeyframeTimestamp": 1.5,
      "startTime": 0,
      "endTime": 3.5,
      "description": "Visual action description...",
      "cameraMotion": "Dolly Forward",
      "spatialContinuity": {
        "subjectScreenPosition": "Screen-Left",
        "facingDirection": "Screen-Right",
        "eyelineMatch": "Looking Screen-Right",
        "cameraAngle": "Medium 50mm",
        "lightingOrigin": "Screen-Left Window Light (cool 5600K)",
        "rule180Vector": "East Axis - subject faces screen-right"
      }
    }
  ]
}`;

  return await requestFalAnyLlmVision({
    apiKey,
    imageUrls,
    prompt
  });
}

// Multi-modal ChatGPT Vision: End-to-End narrative analysis, spatial continuity, and optimal keyframe selection
async function analyzeEndToEndWithOpenAI(samples, totalDuration, userDescription, apiKey, highLevelContext = '') {
  const content = [
    {
      type: 'text',
      text: `You are an expert cinematic director, continuity supervisor, and film editor conducting an end-to-end narrative, visual, and spatial continuity analysis on a video.

SEQUENCE HIGH-LEVEL CONTEXT:
"${(highLevelContext || '').trim() || 'No prior sequence context established.'}"

USER MANUAL VIDEO DESCRIPTION & CONTEXT:
"${(userDescription || '').trim() || 'No manual description provided.'}"

VIDEO INFO:
Total Duration: ${totalDuration.toFixed(1)} seconds.
Below are ${samples.length} chronological sample frames extracted across the video from start to finish with their exact timestamps.

INSTRUCTIONS:
1. Treat the sequence high-level context and user's manual video description as the story/narrative ground truth, and correlate it with the visual progression in the frames.
2. Formulate an overall "analysisSummary" (2-3 sentences explaining overarching narrative arc, visual tone, and pacing).
3. Break the video down into distinct, cohesive storyboard shots that best capture the story beats.
4. For EACH shot, specify the OPTIMAL keyframe timestamp "bestKeyframeTimestamp" (in seconds, e.g. 2.4) that provides the clearest visual moment.
5. Provide a rich visual description for each shot combining the user's narrative context with visual action.
6. Choose the best camera motion from: ["Dolly Forward", "Pan Right", "Pan Left", "Slow Zoom In", "Crane Down", "Orbit 360", "Static Cinematic"].
7. SPATIAL CONTINUITY ANALYSIS (Critical for consistent cuts without breaking spatial awareness):
   Analyze the spatial geometry of the shot:
   - "subjectScreenPosition": "Screen-Left", "Center", or "Screen-Right"
   - "facingDirection": "Screen-Right", "Screen-Left", "Forward", "3/4 Profile Right", "3/4 Profile Left", or "Back to Camera"
   - "eyelineMatch": Where the main subject looks, e.g. "Looking Screen-Right", "Looking Screen-Left", "Direct to Lens", "Off-Screen Left"
   - "cameraAngle": e.g. "Wide Establishing 35mm", "Medium Close-Up 50mm", "Low Angle 35mm", "Reverse OTS 85mm", "Overhead 24mm"
   - "lightingOrigin": Origin and color tone of primary key light, e.g. "Screen-Left Window Light (cool 5600K)", "High Overhead Neon", "Warm Tungsten Practical from Screen-Right"
   - "rule180Vector": Axis directive, e.g. "Maintain East Axis - subject faces screen-right"

Respond with strictly valid JSON matching this schema:
{
  "analysisSummary": "2-3 sentence overview of narrative arc, visual tone, and pacing.",
  "detectedPacing": "Cinematic Pace",
  "shots": [
    {
      "shotNumber": 1,
      "title": "Establishment of Scene",
      "bestKeyframeTimestamp": 1.5,
      "startTime": 0,
      "endTime": 3.5,
      "description": "Visual action description...",
      "cameraMotion": "Dolly Forward",
      "spatialContinuity": {
        "subjectScreenPosition": "Screen-Left",
        "facingDirection": "Screen-Right",
        "eyelineMatch": "Looking Screen-Right",
        "cameraAngle": "Medium 50mm",
        "lightingOrigin": "Screen-Left Window Light (cool 5600K)",
      }
    }
  ]
}`
    }
  ];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const b64 = fileToBase64(s.filePath);
    content.push({
      type: 'text',
      text: `[Sample Frame ${s.index} at timestamp ${s.timestamp}s]:`
    });
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${b64}`,
        detail: 'low'
      }
    });
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content
      }
    ],
    response_format: { type: 'json_object' }
  };

  const response = await requestJson('https://api.openai.com/v1/chat/completions', {
    'Authorization': `Bearer ${apiKey.trim()}`
  }, payload);

  const raw = response.choices?.[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    return null;
  }
}

// Multi-modal Gemini Vision: End-to-End narrative analysis and optimal keyframe selection
async function analyzeEndToEndWithGemini(samples, totalDuration, userDescription, apiKey, highLevelContext = '') {
  const parts = [
    {
      text: `You are an expert cinematic director, continuity supervisor, and film editor conducting an end-to-end narrative, visual, and spatial continuity analysis on a video.

SEQUENCE HIGH-LEVEL CONTEXT:
"${(highLevelContext || '').trim() || 'No prior sequence context established.'}"

USER MANUAL VIDEO DESCRIPTION & CONTEXT:
"${(userDescription || '').trim() || 'No manual description provided.'}"

VIDEO INFO:
Total Duration: ${totalDuration.toFixed(1)} seconds.
Below are ${samples.length} chronological sample frames extracted across the video from start to finish with their exact timestamps.

INSTRUCTIONS:
1. Treat the sequence high-level context and user's manual video description as the story/narrative ground truth, and correlate it with the visual progression in the frames.
2. Formulate an overall "analysisSummary" (2-3 sentences explaining overarching narrative arc, visual tone, and pacing).
3. Break the video down into distinct, cohesive storyboard shots that best capture the story beats.
4. For EACH shot, specify the OPTIMAL keyframe timestamp "bestKeyframeTimestamp" (in seconds) that provides the clearest visual moment.
5. Provide a rich visual description for each shot combining the user's narrative context with visual action.
6. Choose the best camera motion from: ["Dolly Forward", "Pan Right", "Pan Left", "Slow Zoom In", "Crane Down", "Orbit 360", "Static Cinematic"].
7. SPATIAL CONTINUITY ANALYSIS (Critical for consistent cuts without breaking spatial awareness):
   Analyze the spatial geometry of the shot:
   - "subjectScreenPosition": "Screen-Left", "Center", or "Screen-Right"
   - "facingDirection": "Screen-Right", "Screen-Left", "Forward", "3/4 Profile Right", "3/4 Profile Left", or "Back to Camera"
   - "eyelineMatch": Where the main subject looks, e.g. "Looking Screen-Right", "Looking Screen-Left", "Direct to Lens", "Off-Screen Left"
   - "cameraAngle": e.g. "Wide Establishing 35mm", "Medium Close-Up 50mm", "Low Angle 35mm", "Reverse OTS 85mm", "Overhead 24mm"
   - "lightingOrigin": Origin and color tone of primary key light, e.g. "Screen-Left Window Light (cool 5600K)", "High Overhead Neon", "Warm Tungsten Practical from Screen-Right"
   - "rule180Vector": Axis directive, e.g. "Maintain East Axis - subject faces screen-right"

Respond with strictly valid JSON:
{
  "analysisSummary": "2-3 sentence overview of the video's end-to-end visual narrative, progression, and style.",
  "detectedPacing": "Cinematic Pace",
  "shots": [
    {
      "shotNumber": 1,
      "title": "Establishment of Scene",
      "bestKeyframeTimestamp": 1.5,
      "startTime": 0,
      "endTime": 3.5,
      "description": "Visual action description...",
      "cameraMotion": "Dolly Forward",
      "spatialContinuity": {
        "subjectScreenPosition": "Screen-Left",
        "facingDirection": "Screen-Right",
        "eyelineMatch": "Looking Screen-Right",
        "cameraAngle": "Medium 50mm",
        "lightingOrigin": "Screen-Left Window Light (cool 5600K)",
        "rule180Vector": "East Axis - subject faces screen-right"
      }
    }
  ]
}`
    }
  ];

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const b64 = fileToBase64(s.filePath);
    parts.push({
      text: `[Sample Frame ${s.index} at timestamp ${s.timestamp}s]:`
    });
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: b64
      }
    });
  }

  const payload = { contents: [{ parts }] };
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`;
  const response = await requestJson(endpoint, {}, payload);

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) return null;

  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// Image-to-Description: Synthesize visual reference style with keyframe action and assigned reference assets
async function generateImageToDescription({ referenceImagePath, keyframeImagePath, currentDescription = '', assignedReferences = [], falApiKey, openaiApiKey, geminiApiKey }) {
  if (!referenceImagePath && !keyframeImagePath) {
    throw new Error('At least one image (Visual Reference or Keyframe) is required for AI description.');
  }

  let refDirectives = '';
  if (assignedReferences && assignedReferences.length > 0) {
    const list = assignedReferences.map(r => `${r.category === 'characters' ? 'Character' : (r.category === 'props' ? 'Prop' : 'Place')} [${r.name}]: ${r.description || 'Consistent canonical appearance'}`).join(' | ');
    refDirectives = `\nAssigned Canonical Reference Assets (ensure visual consistency for these defined elements): ${list}`;
  }

  // 1. Try Fal.ai Any-LLM Vision (Primary)
  if (falApiKey && falApiKey.trim()) {
    try {
      const imageUrls = [];
      const imgRoleNotes = [];

      if (referenceImagePath && fs.existsSync(referenceImagePath)) {
        const ext = path.extname(referenceImagePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        imageUrls.push(`data:${mime};base64,${fileToBase64(referenceImagePath)}`);
        imgRoleNotes.push(`Image 1 is the Master Visual Reference Style Anchor (sole source of truth for color grading, art direction, and lighting).`);
      }

      if (keyframeImagePath && fs.existsSync(keyframeImagePath) && !keyframeImagePath.endsWith('.mp4') && !keyframeImagePath.endsWith('.webm')) {
        const ext = path.extname(keyframeImagePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        imageUrls.push(`data:${mime};base64,${fileToBase64(keyframeImagePath)}`);
        imgRoleNotes.push(`Image ${imageUrls.length} is the Storyboard Keyframe (defines scene staging, subject action, and composition).`);
      }

      if (imageUrls.length > 0) {
        const prompt = `You are an expert cinematic director and visual prompt engineer for video production.
${imgRoleNotes.join(' ')}
CURRENT SHOT ACTION / NOTES: "${currentDescription || 'Cinematic shot'}"
${refDirectives}

TASK: Synthesize a rich cinematic video generation prompt that combines the visual aesthetic and lighting from the Visual Style Reference with the composition and subjects in the keyframe.
Respond with strictly valid JSON:
{
  "description": "Rich 2-3 sentence cinematic description specifying subjects, movement, lighting, visual reference aesthetic, and canonical assets suitable for video generation",
  "styleNotes": "Brief summary of inherited style features (color palette, medium, lighting)",
  "cameraMotion": "Dolly Forward"
}
Recommend cameraMotion from: ["Dolly Forward", "Pan Right", "Pan Left", "Slow Zoom In", "Crane Down", "Orbit 360", "Static Cinematic"].`;

        const falRes = await requestFalAnyLlmVision({
          apiKey: falApiKey.trim(),
          imageUrls,
          prompt
        });

        if (falRes && falRes.description) {
          return {
            success: true,
            description: falRes.description,
            styleNotes: falRes.styleNotes || '',
            cameraMotion: falRes.cameraMotion || 'Dolly Forward'
          };
        }
      }
    } catch (err) {
      console.warn('Fal.ai Image-to-Description failed, falling back to OpenAI/Gemini:', err.message);
    }
  }

  // 2. Try OpenAI GPT-4o-mini
  if (openaiApiKey && openaiApiKey.trim()) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an expert AI cinematographer and art director for video production. You synthesize visual style anchors with storyboard scene compositions and canonical reference assets into rich, production-ready prompts.'
        }
      ];

      const userContent = [
        {
          type: 'text',
          text: `Compare the provided images and generate an optimized cinematic description.
${referenceImagePath ? 'Image 1 is the Visual Reference Style Anchor (sole source of truth for color grading, lighting, art direction, and texture).' : ''}
${keyframeImagePath ? 'Image 2 is the Storyboard Keyframe (defines scene staging, subject action, and composition).' : ''}
Current Shot Notes: "${currentDescription || 'Cinematic shot'}"${refDirectives}

Instructions:
1. Combine the action and framing from the keyframe with the exact aesthetic style, color palette, lighting, and textures of the visual reference.
2. Incorporate any assigned canonical reference assets (Characters, Props, Places), preserving their exact descriptions, distinctive clothing, ship markings, or environmental features.
3. Select the single best camera motion from: ["Dolly Forward", "Pan Right", "Pan Left", "Slow Zoom In", "Crane Down", "Orbit 360", "Static Cinematic"].

Respond with strictly valid JSON:
{
  "description": "Rich 2-3 sentence cinematic description specifying subjects, movement, lighting, visual reference aesthetic, and canonical assets",
  "styleNotes": "Brief summary of inherited style features (color palette, medium, lighting)",
  "cameraMotion": "Dolly Forward"
}`
        }
      ];

      if (referenceImagePath && fs.existsSync(referenceImagePath)) {
        const ext = path.extname(referenceImagePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${mime};base64,${fileToBase64(referenceImagePath)}` }
        });
      }

      if (keyframeImagePath && fs.existsSync(keyframeImagePath) && !keyframeImagePath.endsWith('.mp4') && !keyframeImagePath.endsWith('.webm')) {
        const ext = path.extname(keyframeImagePath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${mime};base64,${fileToBase64(keyframeImagePath)}` }
        });
      }

      messages.push({ role: 'user', content: userContent });

      const res = await requestJson('https://api.openai.com/v1/chat/completions', {
        'Authorization': `Bearer ${openaiApiKey.trim()}`
      }, {
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 350,
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(res.choices[0].message.content);
      return {
        success: true,
        description: parsed.description,
        styleNotes: parsed.styleNotes,
        cameraMotion: parsed.cameraMotion || 'Dolly Forward'
      };
    } catch (err) {
      console.warn('OpenAI Image-to-Description failed, trying Gemini:', err.message);
    }
  }

  // 2. Try Gemini 2.0 Flash
  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const parts = [
        {
          text: `You are an expert AI cinematographer. Analyze the attached images and output strictly valid JSON:
{
  "description": "Rich 2-3 sentence cinematic description specifying subject movement, lighting, and visual reference aesthetic",
  "styleNotes": "Brief summary of inherited style features",
  "cameraMotion": "Dolly Forward"
}
Recommend one of: ["Dolly Forward", "Pan Right", "Pan Left", "Slow Zoom In", "Crane Down", "Orbit 360", "Static Cinematic"].`
        }
      ];

      if (referenceImagePath && fs.existsSync(referenceImagePath)) {
        parts.push({
          inline_data: {
            mime_type: path.extname(referenceImagePath) === '.png' ? 'image/png' : 'image/jpeg',
            data: fileToBase64(referenceImagePath)
          }
        });
      }

      if (keyframeImagePath && fs.existsSync(keyframeImagePath)) {
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: fileToBase64(keyframeImagePath)
          }
        });
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey.trim()}`;
      const response = await requestJson(endpoint, {}, { contents: [{ parts }] });
      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          success: true,
          description: parsed.description,
          styleNotes: parsed.styleNotes,
          cameraMotion: parsed.cameraMotion || 'Dolly Forward'
        };
      }
    } catch (err) {
      console.warn('Gemini Image-to-Description failed:', err.message);
    }
  }

  throw new Error('AI Vision Key (OpenAI or Gemini) is needed for Image-to-Description.');
}



// Extract raw artistic principles & multi-vector Style Bible from Visual Style Anchor
async function generateStyleBrief({ imagePath, falApiKey, openaiApiKey, geminiApiKey }) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    throw new Error('Valid visual style reference image path is required.');
  }

  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const b64 = fileToBase64(imagePath);
  const dataUri = `data:${mime};base64,${b64}`;

  // 1. Try Fal.ai Any-LLM Vision (Primary High-Precision Vision)
  if (falApiKey && falApiKey.trim()) {
    try {
      const prompt = `You are an elite Hollywood art director and visual style analyst. Deconstruct the raw artistic principles of this Visual Style Anchor image into structured Style Bible tokens.
CRITICAL MANDATE: Ignore the specific subject matter, individual characters, and narrative contents (e.g. do NOT mention a specific person, animal, vehicle, or specific objects).
Extract ONLY the raw transferrable artistic principles.

Respond with strictly valid JSON matching this schema:
{
  "styleBrief": "A concise artistic brief (under 80 words) describing the transferrable medium, lighting, color harmony, and texture.",
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "lighting": "Description of lighting architecture (key light, rim light, shadow contrast, volumetric haze)",
  "medium": "Rendering medium. Choose closest match from: ['Large-Format IMAX 70mm Photorealism', 'Vintage 35mm Eastman Color Print', '2D Anime & Manga (Studio Ghibli / Makoto Shinkai style)', 'Classic 90s Retro Cel Animation (Grainy ink lineart)', 'Arcane & Fortiche Painterly Impasto (Textured brushstrokes)', '3D Pixar / DreamWorks CGI Animation (Stylized shaders)', 'Claymation & Stop-Motion (Tactile physical texture)', 'Graphic Novel / Comic Book Noir (Heavy ink & halftones)', 'Stylized Digital Painting & Cyberpunk Photorealism']",
  "grain": "Texture and grain feel (e.g. 35mm Anamorphic Film Grain, Fine Matte, Heavy Canvas Impasto)",
  "cameraFeel": "Cinematic lens and camera staging feel (e.g. Cinematic Widescreen 2.39:1, shallow DOF, anamorphic flares)"
}`;

      const falRes = await requestFalAnyLlmVision({
        apiKey: falApiKey.trim(),
        imageUrls: [dataUri],
        prompt
      });

      if (falRes && (falRes.styleBrief || falRes.palette)) {
        return {
          success: true,
          styleBrief: falRes.styleBrief || 'Artistic style extracted from anchor.',
          styleBible: {
            palette: sanitizePalette(falRes.palette),
            lighting: falRes.lighting || 'Volumetric rim lighting with deep shadows',
            medium: matchMediumOption(falRes.medium),
            grain: falRes.grain || '35mm Film Grain',
            cameraFeel: falRes.cameraFeel || 'Cinematic Widescreen 2.39:1'
          }
        };
      }
    } catch (err) {
      console.warn('Fal.ai style brief deconstruction failed, falling back to OpenAI/Gemini:', err.message);
    }
  }

  // 2. Try OpenAI GPT-4o-mini
  if (openaiApiKey && openaiApiKey.trim()) {
    try {
      const messages = [
        {
          role: 'system',
          content: 'You are an elite Hollywood art director and visual style analyst. Deconstruct the raw artistic principles of images into structured Style Bible tokens.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this Visual Style Anchor image.
CRITICAL MANDATE: Ignore the specific subject matter, individual characters, and narrative contents (e.g. do NOT mention a boy, a banjo, a spaceship, or specific people).
Extract ONLY the raw transferrable artistic principles.

Respond with ONLY valid JSON in this exact structure:
{
  "styleBrief": "A concise artistic brief (under 80 words) describing the transferrable medium, lighting, color harmony, and texture.",
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "lighting": "Description of lighting architecture (key light, rim light, shadow contrast, volumetric haze)",
  "medium": "Rendering medium (e.g. Digital Oil Painting, Cel Anime, 35mm Anamorphic Film, 3D Octane)",
  "grain": "Texture and grain feel (e.g. 35mm Film Grain, Fine Matte, Heavy Canvas Impasto)",
  "cameraFeel": "Cinematic lens and camera staging feel (e.g. Widescreen 2.39:1, shallow DOF, anamorphic flares)"
}`
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mime};base64,${b64}` }
            }
          ]
        }
      ];

      const res = await requestJson('https://api.openai.com/v1/chat/completions', {
        'Authorization': `Bearer ${openaiApiKey.trim()}`
      }, {
        model: 'gpt-4o-mini',
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 450
      });

      const raw = res.choices?.[0]?.message?.content?.trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          success: true,
          styleBrief: parsed.styleBrief || 'Artistic style extracted from anchor.',
          styleBible: {
            palette: Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.slice(0, 5) : ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'],
            lighting: parsed.lighting || 'Volumetric rim lighting with deep shadows',
            medium: parsed.medium || 'Stylized Digital Painting',
            grain: parsed.grain || '35mm Film Grain',
            cameraFeel: parsed.cameraFeel || 'Cinematic Widescreen 2.39:1'
          }
        };
      }
    } catch (err) {
      console.warn('OpenAI style brief generation failed, trying Gemini:', err.message);
    }
  }

  // 2. Try Gemini
  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const parts = [
        {
          text: `You are an elite art director. Analyze this visual style anchor image.
Ignore specific characters or narrative subjects. Extract ONLY raw transferrable artistic principles.
Respond in valid JSON format:
{
  "styleBrief": "Artistic brief under 80 words",
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "lighting": "Lighting architecture",
  "medium": "Medium and rendering",
  "grain": "Texture and grain",
  "cameraFeel": "Camera and lens feel"
}`
        },
        {
          inline_data: {
            mime_type: mime,
            data: b64
          }
        }
      ];

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey.trim()}`;
      const response = await requestJson(endpoint, {}, { contents: [{ parts }] });
      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          success: true,
          styleBrief: parsed.styleBrief || 'Artistic style extracted from anchor.',
          styleBible: {
            palette: Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette.slice(0, 5) : ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'],
            lighting: parsed.lighting || 'Volumetric rim lighting with deep shadows',
            medium: parsed.medium || 'Stylized Digital Painting',
            grain: parsed.grain || '35mm Film Grain',
            cameraFeel: parsed.cameraFeel || 'Cinematic Widescreen 2.39:1'
          }
        };
      }
    } catch (err) {
      console.warn('Gemini style brief generation failed:', err.message);
    }
  }

  // Fallback default style bible
  return {
    success: true,
    styleBrief: 'Artistic Style Brief: High-contrast digital painting with detailed line work and textured surfaces. Warm vibrant neon highlights contrasting against deep obsidian shadows. Atmospheric volumetric lighting with painterly rendering.',
    styleBible: {
      palette: ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'],
      lighting: 'Volumetric neon rim lighting, high contrast chiaroscuro',
      medium: 'Stylized Digital Impasto & Cinematic Cel',
      grain: '35mm Anamorphic Film Grain',
      cameraFeel: 'Cinematic Widescreen 2.39:1 with subtle lens flares'
    }
  };
}

// Scoped Shot Motion Delta Analysis: Analyzes the physical delta between Start Frame (t0) and End Frame (t1)
async function analyzeShotMotionDelta({
  startFramePath,
  endFramePath,
  colorStartFramePath = null,
  colorEndFramePath = null,
  duration = 4,
  shotNumber = 1,
  userDescription = '',
  highLevelContext = '',
  falApiKey = '',
  openaiApiKey = '',
  geminiApiKey = ''
}) {
  const images = [];
  const sPath = (colorStartFramePath && fs.existsSync(colorStartFramePath)) ? colorStartFramePath : startFramePath;
  const ePath = (colorEndFramePath && fs.existsSync(colorEndFramePath)) ? colorEndFramePath : endFramePath;

  if (sPath && fs.existsSync(sPath)) {
    const ext = path.extname(sPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    images.push({ label: 'Frame 1 (Start of Shot)', dataUri: `data:${mime};base64,${fileToBase64(sPath)}` });
  }
  if (ePath && fs.existsSync(ePath)) {
    const ext = path.extname(ePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    images.push({ label: 'Frame 2 (End of Shot)', dataUri: `data:${mime};base64,${fileToBase64(ePath)}` });
  }

  if (images.length === 0) {
    throw new Error('No valid start or end frame images provided for delta analysis');
  }

  const prompt = `You are an expert cinematic director, camera tracker, and continuity supervisor analyzing a single film shot delimited by its exact Start Frame (Frame 1) and End Frame (Frame 2).

SEQUENCE HIGH-LEVEL CONTEXT:
"${(highLevelContext || userDescription || '').trim() || 'Cinematic sequence'}"

USER MANUAL CONTEXT / SHOT HINT:
"${(userDescription || '').trim() || 'Progression between Start Frame and End Frame'}"

SHOT INFO:
Shot Number: #${shotNumber}
Duration: ${Number(duration).toFixed(1)} seconds

INSTRUCTIONS:
1. Compare Frame 1 (Start of Shot) directly against Frame 2 (End of Shot) within the overarching sequence high-level context.
2. Compute the exact physical motion vector: How did the focal subject move, rotate, scale, or accelerate?
3. Compute the exact camera trajectory: Did the camera dolly forward, pan, crane down, orbit, tilt, or lock?
4. Formulate an evocative action description (1-2 sentences) capturing what occurs from Start to End and how it advances the scene described in the high-level context.
5. Provide strict spatial continuity directives.

Respond with strictly valid JSON matching this schema:
{
  "title": "Short evocative shot title",
  "description": "Precise visual action description of what occurs from Frame 1 to Frame 2...",
  "cameraMotion": "Dolly Forward",
  "spatialContinuity": {
    "motionVector": "Subject translation and speed from start to end",
    "cameraTrajectory": "Trajectory and lens perspective shift",
    "subjectScreenPosition": "Center",
    "facingDirection": "3/4 Profile Right",
    "eyelineMatch": "Looking Screen-Right",
    "cameraAngle": "Medium 50mm",
    "lightingOrigin": "Screen-Right Key Lighting",
    "rule180Vector": "Maintain East Axis continuity"
  }
}`;

  if (falApiKey && falApiKey.trim()) {
    try {
      const falRes = await requestFalAnyLlmVision({
        apiKey: falApiKey,
        imageUrls: images.map(img => img.dataUri),
        prompt
      });
      if (falRes && (falRes.description || falRes.title)) {
        return falRes;
      }
    } catch (e) {
      console.warn('[VideoAnalysis] Fal Any-LLM shot delta failed, trying fallback:', e.message);
    }
  }

  if (openaiApiKey && openaiApiKey.trim()) {
    try {
      const content = [
        { type: 'text', text: prompt }
      ];
      for (const img of images) {
        content.push({ type: 'text', text: `[${img.label}]:` });
        content.push({
          type: 'image_url',
          image_url: { url: img.dataUri, detail: 'low' }
        });
      }
      const payload = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content }],
        response_format: { type: 'json_object' }
      };
      const response = await requestJson('https://api.openai.com/v1/chat/completions', {
        'Authorization': `Bearer ${openaiApiKey.trim()}`
      }, payload);
      const raw = response.choices?.[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.description || parsed.title)) return parsed;
      }
    } catch (e) {
      console.warn('[VideoAnalysis] OpenAI vision shot delta failed:', e.message);
    }
  }

  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const parts = [{ text: prompt }];
      for (const img of images) {
        const b64 = img.dataUri.split(',')[1];
        parts.push({ text: `[${img.label}]:` });
        parts.push({
          inline_data: { mime_type: 'image/jpeg', data: b64 }
        });
      }
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey.trim()}`;
      const response = await requestJson(endpoint, {}, { contents: [{ parts }] });
      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && (parsed.description || parsed.title)) return parsed;
      }
    } catch (e) {
      console.warn('[VideoAnalysis] Gemini vision shot delta failed:', e.message);
    }
  }

  // Fallback heuristic delta
  return {
    title: `Shot ${shotNumber}: Action Progression`,
    description: `Dynamic progression across ${Number(duration).toFixed(1)}s as subjects move from initial position toward destination.`,
    cameraMotion: 'Dolly Forward',
    spatialContinuity: {
      motionVector: 'Subject moving through 3D space along camera axis',
      cameraTrajectory: 'Dolly Forward tracking action',
      subjectScreenPosition: 'Center',
      facingDirection: 'Forward',
      eyelineMatch: 'Direct to Lens',
      cameraAngle: 'Medium 50mm',
      lightingOrigin: 'Ambient Key Lighting',
      rule180Vector: 'Maintain Axis'
    }
  };
}


/**
 * Synthesizes director grease pen markup layers over 3D Spatial Previs into a unified action prompt.
 */
async function enhancePromptWithSpatialMarkup({
  startFramePath,
  endFramePath,
  startMarkupPath = null,
  endMarkupPath = null,
  currentDescription = '',
  highLevelContext = '',
  cameraMotion = 'Dolly Forward',
  shotNumber = 1,
  falApiKey = '',
  openaiApiKey = '',
  geminiApiKey = ''
}) {
  const images = [];

  // Start frame: prefer flattened markup if available, else raw start frame
  const sPath = (startMarkupPath && fs.existsSync(startMarkupPath)) ? startMarkupPath : startFramePath;
  if (sPath && fs.existsSync(sPath)) {
    const ext = path.extname(sPath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    images.push({ label: 'Frame 1 (Start Frame with Director Grease Pen Markup)', dataUri: `data:${mime};base64,${fileToBase64(sPath)}` });
  }

  // End frame: prefer flattened markup if available, else raw end frame
  const ePath = (endMarkupPath && fs.existsSync(endMarkupPath)) ? endMarkupPath : endFramePath;
  if (ePath && fs.existsSync(ePath)) {
    const ext = path.extname(ePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    images.push({ label: 'Frame 2 (End Frame with Director Grease Pen Markup)', dataUri: `data:${mime};base64,${fileToBase64(ePath)}` });
  }

  if (images.length === 0) {
    throw new Error('No valid start or end frame images provided for markup analysis');
  }

  const prompt = `You are an expert Virtual Production Supervisor, Director, and VFX Cinematographer analyzing director draw-overs and grease pen annotations on 3D spatial previz frames for an action sequence.

Images provided:
1. Frame 1 (Start Frame): 3D spatial blocking showing initial positions and layout. Any brightly colored grease pen annotations (arrows, circles, lines, callouts) represent the director's instructions for motion trajectories, velocity, entry angles, or focal emphasis.
2. Frame 2 (End Frame): 3D spatial blocking showing concluding positions and layout with any ending director annotations.

SEQUENCE HIGH-LEVEL CONTEXT (Ground Truth):
"${(highLevelContext || currentDescription || '').trim() || 'Cinematic sequence'}"

EXISTING SHOT DESCRIPTION:
"${(currentDescription || '').trim() || 'Dynamic action progression'}"

CAMERA MOTION SETTING:
"${cameraMotion || 'Dolly Forward'}"

TASK:
Interpret the director's grease pen markings together with the 3D geometry progression between Frame 1 and Frame 2:
- Directional arrows indicate flight paths, trajectory arcs, camera dolly/pan tracks, or weapon fire vectors.
- Circles / boxes highlight key focal elements, points of impact, or clearance margins.
- Lines show speed trails or relative movement against the background.

Synthesize the existing shot description, the director's visual markup directives, and the overarching sequence context into a single, unified, punchy, and cinematic prompt. The prompt must describe the dynamic physical action, subject movement, velocity, and camera movement clearly so a video generation model can execute the shot with authentic choreography.

Respond with strictly valid JSON matching this schema:
{
  "description": "Unified enhanced action prompt incorporating the director's markup vectors and spatial choreography...",
  "cameraMotion": "Dolly Forward",
  "markupInterpretation": "Brief summary of what the grease pen marks indicated"
}`;

  if (falApiKey && falApiKey.trim()) {
    try {
      const falRes = await requestFalAnyLlmVision({
        apiKey: falApiKey,
        imageUrls: images.map(img => img.dataUri),
        prompt
      });
      if (falRes && falRes.description) {
        return falRes;
      }
    } catch (e) {
      console.warn('[VideoAnalysis] Fal Any-LLM markup enhancement failed, trying fallback:', e.message);
    }
  }

  if (openaiApiKey && openaiApiKey.trim()) {
    try {
      const content = [
        { type: 'text', text: prompt }
      ];
      for (const img of images) {
        content.push({ type: 'text', text: `[${img.label}]:` });
        content.push({
          type: 'image_url',
          image_url: { url: img.dataUri, detail: 'high' }
        });
      }
      const payload = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        response_format: { type: 'json_object' }
      };
      const response = await requestJson('https://api.openai.com/v1/chat/completions', {
        'Authorization': `Bearer ${openaiApiKey.trim()}`
      }, payload);
      const raw = response.choices?.[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.description) return parsed;
      }
    } catch (e) {
      console.warn('[VideoAnalysis] OpenAI vision markup enhancement failed:', e.message);
    }
  }

  if (geminiApiKey && geminiApiKey.trim()) {
    try {
      const parts = [{ text: prompt }];
      for (const img of images) {
        const b64 = img.dataUri.split(',')[1];
        parts.push({ text: `[${img.label}]:` });
        parts.push({
          inline_data: { mime_type: 'image/jpeg', data: b64 }
        });
      }
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey.trim()}`;
      const response = await requestJson(endpoint, {}, { contents: [{ parts }] });
      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        const cleaned = raw.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.description) return parsed;
      }
    } catch (e) {
      console.warn('[VideoAnalysis] Gemini vision markup enhancement failed:', e.message);
    }
  }

  // Fallback heuristic synthesis
  const baseDesc = currentDescription.trim() || 'Dynamic action progression';
  const enhancedFallback = `${baseDesc} Tracking along the director's spatial vector, moving dynamically with ${cameraMotion.toLowerCase()} framing as velocity accelerates through the designated trajectory.`;
  return {
    description: enhancedFallback,
    cameraMotion: cameraMotion || 'Dolly Forward',
    markupInterpretation: 'Heuristic alignment with spatial motion vector.'
  };
}

module.exports = {
  generateHighLevelContext,
  analyzeAndDeconstructVideo,
  generateImageToDescription,
  generateStyleBrief,
  compileContinuityDirectives,
  analyzeShotMotionDelta,
  enhancePromptWithSpatialMarkup
};

