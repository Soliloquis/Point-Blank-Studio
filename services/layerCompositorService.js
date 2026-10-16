const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegBinary = require('ffmpeg-static');
const { generateColorKeyMask } = require('./colorKeyService');

// Helper to run FFmpeg commands
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    let errText = '';
    proc.stderr.on('data', d => errText += d.toString());
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${errText}`));
    });
  });
}

// Compute bounding box and corner quad for a binary mask file
async function computeMaskBoundsAndQuad(maskPath) {
  return new Promise((resolve, reject) => {
    // Extract raw grayscale bytes via FFmpeg
    const args = [
      '-i', maskPath,
      '-f', 'rawvideo',
      '-pix_fmt', 'gray',
      '-'
    ];
    const proc = spawn(ffmpegBinary, args, { windowsHide: true });
    const chunks = [];
    proc.stdout.on('data', c => chunks.push(c));
    proc.on('close', code => {
      if (code !== 0) return resolve({ minX: 100, minY: 100, maxX: 500, maxY: 400, width: 1920, height: 1080 });
      const buf = Buffer.concat(chunks);
      // Determine dimensions: standard 1920x1080 if buffer matches
      let width = 1920;
      let height = 1080;
      if (buf.length !== 1920 * 1080) {
        // Try aspect ratio calculation
        width = Math.round(Math.sqrt((buf.length * 16) / 9));
        height = Math.round(buf.length / width);
      }

      let minX = width;
      let minY = height;
      let maxX = 0;
      let maxY = 0;
      let hitCount = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = buf[y * width + x];
          if (val > 128) {
            hitCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (hitCount === 0 || minX >= maxX || minY >= maxY) {
        minX = Math.round(width * 0.2);
        maxX = Math.round(width * 0.8);
        minY = Math.round(height * 0.2);
        maxY = Math.round(height * 0.8);
      }

      // Add a small safety padding
      const pad = 12;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(width, maxX + pad);
      maxY = Math.min(height, maxY + pad);

      resolve({
        minX,
        minY,
        maxX,
        maxY,
        width,
        height,
        pixelCount: hitCount,
        quad: [
          { x: minX, y: minY }, // Top-Left
          { x: maxX, y: minY }, // Top-Right
          { x: maxX, y: maxY }, // Bottom-Right
          { x: minX, y: maxY }  // Bottom-Left
        ]
      });
    });
  });
}

/**
 * Extract isolated transparent layers for each Consistent Asset and create a cleaned background.
 */
async function extractShotLayers({ shot, project, outputDir, falService, targetFrame = 'start' }) {
  const isEnd = targetFrame === 'end';
  const spatialPath = isEnd ? (shot.endKeyframePath || shot.keyframePath) : shot.keyframePath;
  const colorPath = isEnd
    ? ((shot.endColorFramePath && fs.existsSync(shot.endColorFramePath)) ? shot.endColorFramePath : spatialPath)
    : ((shot.colorFramePath && fs.existsSync(shot.colorFramePath)) ? shot.colorFramePath : spatialPath);

  if (!fs.existsSync(spatialPath)) {
    throw new Error('Spatial Previs Keyframe file not found');
  }

  const allRefs = [];
  if (project.references) {
    if (Array.isArray(project.references)) {
      allRefs.push(...project.references);
    } else {
      ['characters', 'props', 'places'].forEach(cat => {
        if (Array.isArray(project.references[cat])) allRefs.push(...project.references[cat]);
      });
    }
  }
  if (Array.isArray(project.visualReference?.assets)) {
    allRefs.push(...project.visualReference.assets);
  }
  // Robust Candidate Asset Discovery for Color Keying
  const keyedRefs = allRefs.filter(a => a && a.colorKey && typeof a.colorKey === 'string' && a.colorKey.trim().length > 0);
  const assignedRefIds = Array.isArray(shot.assignedReferences) ? shot.assignedReferences : [];
  const shotText = `${shot.title || ''} ${shot.description || ''}`.toLowerCase();

  const candidateAssets = [];
  const seenColorKeys = new Set();
  const seenAssetIds = new Set();

  function addCandidate(asset) {
    if (!asset || seenAssetIds.has(asset.id)) return;
    const normKey = asset.colorKey.toLowerCase().trim();
    if (seenColorKeys.has(normKey)) return;
    candidateAssets.push(asset);
    seenAssetIds.add(asset.id);
    seenColorKeys.add(normKey);
  }

  // Priority 1: Explicitly assigned references in shot.assignedReferences
  keyedRefs.filter(a => assignedRefIds.includes(a.id)).forEach(addCandidate);

  // Priority 2: References mentioned in shot title or description by name or tag
  keyedRefs.filter(a => {
    const nameMatch = a.name && shotText.includes(a.name.toLowerCase());
    const tagMatch = a.tag && shotText.includes(a.tag.toLowerCase());
    return nameMatch || tagMatch;
  }).forEach(addCandidate);

  // Priority 3: All remaining keyed references in the project (proactively scanned in Spatial Previs)
  keyedRefs.forEach(addCandidate);

  console.log(`[LayerCompositor] Decomposing Shot ${shot.shotNumber || shot.id} (${targetFrame.toUpperCase()} frame) scanning ${candidateAssets.length} candidate keyed assets...`);

  const layers = [];
  const unionMaskPaths = [];
  const ts = Date.now();

  // 1. Extract each keyed asset as an isolated transparent PNG layer
  for (let i = 0; i < candidateAssets.length; i++) {
    const asset = candidateAssets[i];
    const colorKey = asset.colorKey;
    const maskFilename = `mask_layer_${shot.id}_${targetFrame}_${asset.id}_${ts}.png`;
    const maskPath = path.join(outputDir, maskFilename);

    // Generate feathered mask for this specific color key
    const maskResult = await generateColorKeyMask(spatialPath, [colorKey], maskPath, { dilation: 6, feather: 3 });

    if (maskResult.hasMask && maskResult.pixelCount > 40) {
      console.log(`[LayerCompositor] Successfully extracted asset "${asset.name}" (${colorKey}, ${maskResult.pixelCount} px) into ${targetFrame.toUpperCase()} layer`);
      unionMaskPaths.push(maskPath);

      // Automatically register visible keyed asset on shot.assignedReferences
      if (!Array.isArray(shot.assignedReferences)) shot.assignedReferences = [];
      if (!shot.assignedReferences.includes(asset.id)) {
        shot.assignedReferences.push(asset.id);
      }

      // Compute bounding box and corner quad
      const bounds = await computeMaskBoundsAndQuad(maskPath);

      // Extract transparent RGBA layer from color pass using FFmpeg alphamerge
      const layerFilename = `layer_${shot.id}_${targetFrame}_${asset.id}_${ts}.png`;
      const layerPath = path.join(outputDir, layerFilename);

      await runFfmpeg([
        '-i', colorPath,
        '-i', maskPath,
        '-filter_complex', '[0:v][1:v]alphamerge[out]',
        '-map', '[out]',
        '-y', layerPath
      ]);

      layers.push({
        id: `layer_${asset.id}_${targetFrame}_${ts}`,
        assetId: asset.id,
        assetName: asset.name,
        category: asset.category || 'props',
        colorKey: asset.colorKey,
        referenceImageUrl: asset.imageUrl || null,
        referenceImagePath: asset.imagePath || null,
        imageUrl: `/storage/keyframes/${layerFilename}`,
        imagePath: layerPath,
        maskUrl: `/storage/keyframes/${maskFilename}`,
        maskPath,
        bounds: {
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY
        },
        // Fit layer quad to the entire 1920x1080 canvas so extracted asset displays at 1:1 true scale
        quad: [
          { x: 0, y: 0 },
          { x: 1920, y: 0 },
          { x: 1920, y: 1080 },
          { x: 0, y: 1080 }
        ],
        opacity: 1.0,
        visible: true,
        zIndex: i + 1,
        blendMode: 'normal'
      });
    }
  }

  // 2. Generate Clean Background Layer (Inpaint/Remove foreground assets from True Color canvas)
  const bgFilename = `layer_bg_${shot.id}_${targetFrame}_${ts}.png`;
  const bgPath = path.join(outputDir, bgFilename);

  if (unionMaskPaths.length > 0) {
    // Merge all asset masks into one master cutout mask
    const masterMaskFilename = `mask_union_${shot.id}_${ts}.png`;
    const masterMaskPath = path.join(outputDir, masterMaskFilename);

    if (unionMaskPaths.length === 1) {
      fs.copyFileSync(unionMaskPaths[0], masterMaskPath);
    } else {
      // Blend masks together with FFmpeg max / screen
      const filterInputs = unionMaskPaths.map((_, idx) => `[${idx}:v]`).join('');
      const blendFilter = unionMaskPaths.slice(1).reduce((acc, _, idx) => {
        return idx === 0 ? `[0:v][1:v]blend=all_mode=lighten[b0]` : `${acc};[b${idx - 1}][${idx + 1}:v]blend=all_mode=lighten[b${idx}]`;
      }, '');
      const lastOutput = unionMaskPaths.length === 2 ? '[b0]' : `[b${unionMaskPaths.length - 2}]`;

      const ffmpegArgs = [];
      unionMaskPaths.forEach(p => ffmpegArgs.push('-i', p));
      ffmpegArgs.push('-filter_complex', `${blendFilter}`, '-map', lastOutput, '-y', masterMaskPath);
      await runFfmpeg(ffmpegArgs);
    }

    // Inpaint the background behind the removed assets
    let bgInpainted = false;
    if (falService && falService.isConfigured()) {
      try {
        console.log('[LayerCompositor] AI Inpainting clean background behind extracted assets via flux-general/inpainting...');
        const colorB64 = fs.readFileSync(colorPath).toString('base64');
        const maskB64 = fs.readFileSync(masterMaskPath).toString('base64');
        const colorDataUri = `data:image/jpeg;base64,${colorB64}`;
        const maskDataUri = `data:image/png;base64,${maskB64}`;

        const inpaintPayload = {
          prompt: 'Seamless background, deep space, celestial rings, stars, clean atmospheric horizon without foreground spacecraft, high resolution sci-fi backdrop',
          image_url: colorDataUri,
          mask_url: maskDataUri,
          num_inference_steps: 24,
          guidance_scale: 3.5,
          enable_safety_checker: false
        };

        const inpaintRes = await falService.runQueueJob('fal-ai/flux-general/inpainting', inpaintPayload, 'bg-inpaint', outputDir);
        if (inpaintRes && inpaintRes.imagePath && fs.existsSync(inpaintRes.imagePath)) {
          fs.copyFileSync(inpaintRes.imagePath, bgPath);
          bgInpainted = true;
          console.log('[LayerCompositor] Clean background inpainting successful:', bgPath);
        }
      } catch (inpErr) {
        console.warn('[LayerCompositor] Background AI inpaint fallback:', inpErr.message);
      }
    }

    if (!bgInpainted) {
      // Fallback: Copy True Color frame as background
      fs.copyFileSync(colorPath, bgPath);
    }
  } else {
    fs.copyFileSync(colorPath, bgPath);
  }

  const bgLayer = {
    id: `layer_bg_${shot.id}_${targetFrame}`,
    assetId: 'background',
    assetName: 'Clean Background',
    category: 'environment',
    colorKey: null,
    imageUrl: `/storage/keyframes/${bgFilename}`,
    imagePath: bgPath,
    bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    quad: [
      { x: 0, y: 0 },
      { x: 1920, y: 0 },
      { x: 1920, y: 1080 },
      { x: 0, y: 1080 }
    ],
    opacity: 1.0,
    visible: true,
    zIndex: 0,
    isBackground: true
  };

  return {
    shotId: shot.id,
    canvasWidth: 1920,
    canvasHeight: 1080,
    backgroundLayer: bgLayer,
    layers: [bgLayer, ...layers]
  };
}

/**
 * Regenerate an individual asset layer using its Consistent Asset reference and configured 3D model
 */
async function regenerateLayerAsset({ shotId, layer, asset, userPrompt, styleBible, model = 'openai/gpt-image-2.5/flare/edit', outputDir, falService }) {
  if (!falService || !falService.isConfigured()) {
    throw new Error('Fal.ai API key is not configured');
  }

  if (!asset) {
    throw new Error('No consistent asset assigned to this layer');
  }

  const ts = Date.now();
  console.log(`[LayerCompositor] Regenerating layer ${layer.id} for asset "${asset.name}" with model "${model}"...`);

  // Locate the canonical reference image
  let refPath = asset.imagePath;
  if (!refPath && asset.imageUrl) {
    const cleanUrl = asset.imageUrl.replace(/^\//, '');
    const candidate = path.join(process.cwd(), cleanUrl);
    if (fs.existsSync(candidate)) {
      refPath = candidate;
    }
  }

  if (!refPath || !fs.existsSync(refPath)) {
    throw new Error(`Consistent asset reference image not found on disk for "${asset.name}"`);
  }

  const ext = path.extname(refPath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const b64 = fs.readFileSync(refPath).toString('base64');
  const dataUri = `data:${mime};base64,${b64}`;

  // Build high-fidelity visual description prompt with strict canonical lock
  const viewDesc = (userPrompt && userPrompt.trim()) ? userPrompt.trim() : '3/4 dynamic perspective angle view';
  
  const designTokens = [];
  if (asset.description) designTokens.push(asset.description);
  if (asset.wardrobe) designTokens.push(`Materials: ${asset.wardrobe}`);
  if (asset.hair) designTokens.push(`Features: ${asset.hair}`);
  if (asset.architecture) designTokens.push(`Structure: ${asset.architecture}`);

  let cameraOrientationConstraint = '';
  if (/rear|aft|thruster|engine|behind/i.test(viewDesc)) {
    cameraOrientationConstraint = `
Strict Camera Perspective Constraint (Rear/Aft View):
- The camera is positioned strictly BEHIND the subject.
- The rear stern, aft engine exhaust blocks, thruster nozzles, and aft superstructure MUST be in the immediate foreground facing directly toward the camera.
- The vessel's hull must recede forward away from the camera into the distance.
- ABSOLUTELY DO NOT render the front bow, nose, or cockpit facing the camera.`;
  } else if (/front|bow|head-on|cockpit/i.test(viewDesc)) {
    cameraOrientationConstraint = `
Strict Camera Perspective Constraint (Front/Bow View):
- The camera is positioned in front of the subject looking directly back at its front bow and cockpit.`;
  }

  let prompt = `Subject: Canonical Consistent Asset "${asset.name}". ${designTokens.join('. ')}.
Task: Generate a pristine 3D camera-rotated view: ${viewDesc}.${cameraOrientationConstraint}
Strict Design Continuity:
- Retain 100% identical geometry, structural proportions, hull plating, weapon turrets, communications bridge, and engine clusters from the reference image.
- Retain exact color palette, paint patterns, stripes, decals, weathering, and material reflectivity.
- Do not alter silhouette or add extra random geometry.
Environment:
- Isolated subject floating in space on a solid flat pure black void (#000000) background.
- Crisp directional cinematic lighting matching the scene context, high contrast rim lighting for clean alpha isolation.
Aesthetic: ${styleBible?.medium || 'Gritty hand-drawn concept art style'}.`;

  let genResult = null;
  const chosenModel = (model || 'openai/gpt-image-2.5/flare/edit').trim();

  if (chosenModel.includes('nano-banana')) {
    const payload = {
      prompt,
      image_urls: [dataUri],
      aspect_ratio: '16:9'
    };
    genResult = await falService.runQueueJob('fal-ai/nano-banana-pro/edit', payload, 'nano-layer-regen', outputDir);
  } else if (chosenModel.includes('flux')) {
    const payload = {
      prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 30,
      guidance_scale: 3.5,
      ip_adapters: [{
        path: 'XLabs-AI/flux-ip-adapter',
        weight_name: 'ip_adapter.safetensors',
        image_encoder_path: 'openai/clip-vit-large-patch14',
        image_url: dataUri,
        scale: 0.95
      }],
      enable_safety_checker: false
    };
    genResult = await falService.runQueueJob('fal-ai/flux-general', payload, 'flux-layer-regen', outputDir);
  } else {
    // Default: OpenAI GPT-Image-2.5 Flare
    const payload = {
      prompt,
      image_urls: [dataUri],
      quality: 'high',
      aspect_ratio: '16:9'
    };
    genResult = await falService.runQueueJob('openai/gpt-image-2.5/flare/edit', payload, 'flare-layer-regen', outputDir);
  }

  if (!genResult || !genResult.imagePath || !fs.existsSync(genResult.imagePath)) {
    throw new Error(`Fal.ai failed to generate layer asset with ${chosenModel}`);
  }

  // Remove background to create transparent alpha PNG via Fal rembg or FFmpeg colorkey
  const transparentFilename = `layer_regen_asset_${shotId}_${asset.id}_${ts}.png`;
  const transparentPath = path.join(outputDir, transparentFilename);

  let alphaExtracted = false;
  try {
    const rawB64 = fs.readFileSync(genResult.imagePath).toString('base64');
    const rembgRes = await falService.runQueueJob('fal-ai/imageutils/rembg', {
      image_url: `data:image/png;base64,${rawB64}`
    }, 'layer-rembg', outputDir);
    if (rembgRes && rembgRes.imagePath && fs.existsSync(rembgRes.imagePath)) {
      fs.copyFileSync(rembgRes.imagePath, transparentPath);
      alphaExtracted = true;
    }
  } catch (rembgErr) {
    console.warn('[LayerCompositor] Fal rembg fallback to FFmpeg colorkey:', rembgErr.message);
  }

  if (!alphaExtracted) {
    // FFmpeg colorkey fallback for black background
    await runFfmpeg([
      '-i', genResult.imagePath,
      '-vf', 'colorkey=0x000000:0.15:0.1',
      '-y', transparentPath
    ]);
  }

  return {
    success: true,
    layerId: layer.id,
    imageUrl: `/storage/keyframes/${transparentFilename}`,
    imagePath: transparentPath
  };
}

/**
 * Bake client perspective canvas composite and apply optional style harmonization
 */
async function bakeAndCommitComposite({ shot, bakedImageBase64, harmonyStrength = 0.20, styleBible, styleImagePath = null, model = 'fal-ai/nano-banana-pro/edit', outputDir, falService, targetFrame = 'start' }) {
  const ts = Date.now();
  const isEnd = targetFrame === 'end';
  const rawCompositeFilename = `styled_composite_${shot.id}_${isEnd ? 'end_' : ''}${ts}.png`;
  const rawCompositePath = path.join(outputDir, rawCompositeFilename);

  // Strip data:image/...;base64, header
  const base64Data = bakedImageBase64.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(rawCompositePath, Buffer.from(base64Data, 'base64'));

  let finalImagePath = rawCompositePath;
  let finalImageUrl = `/storage/keyframes/${rawCompositeFilename}`;
  let method = 'layered-compositor-raw';

  const chosenHarmonyModel = (model || 'fal-ai/nano-banana-pro/edit').trim();

  // Apply optional Style Harmonization if enabled and model is not 'raw'/'none'
  if (harmonyStrength > 0.05 && chosenHarmonyModel !== 'raw' && chosenHarmonyModel !== 'none' && falService && falService.isConfigured()) {
    try {
      console.log(`[LayerCompositor] Applying Style Harmonization with model "${chosenHarmonyModel}" (strength: ${harmonyStrength})...`);
      const harmonizedFilename = `styled_harmonized_${shot.id}_${ts}.png`;
      const harmonizedPath = path.join(outputDir, harmonizedFilename);

      if (chosenHarmonyModel.includes('iclight')) {
        // IC-Light V2: Photometric Relighting
        let icPrompt = 'Warm atmospheric rim lighting, coherent directional shadows from background light source, cinematic depth.';
        if (styleBible?.lighting) icPrompt += ` Lighting: ${styleBible.lighting}.`;

        const icRes = await falService.runQueueJob('fal-ai/iclight-v2', {
          image_url: `data:image/png;base64,${base64Data}`,
          prompt: icPrompt
        }, 'harmony-iclight', outputDir);

        if (icRes && icRes.imagePath && fs.existsSync(icRes.imagePath)) {
          finalImagePath = icRes.imagePath;
          finalImageUrl = icRes.imageUrl;
          method = 'layered-compositor-iclight';
        }
      } else if (chosenHarmonyModel.includes('flux')) {
        // FLUX.1 [dev]: Subtle Latent Denoise
        let stylePrompt = 'Harmonious digital illustration, fine canvas impasto, warm cinematic lighting, volumetric haze, atmospheric coherence.';
        if (styleBible?.medium) stylePrompt += ` Medium: ${styleBible.medium}.`;
        if (styleBible?.lighting) stylePrompt += ` Lighting: ${styleBible.lighting}.`;
        if (styleBible?.grain) stylePrompt += ` Texture: ${styleBible.grain}.`;

        const harmRes = await falService.runQueueJob('fal-ai/flux/dev/image-to-image', {
          image_url: `data:image/png;base64,${base64Data}`,
          prompt: stylePrompt,
          strength: Math.min(0.35, Math.max(0.10, harmonyStrength)),
          num_inference_steps: 24,
          guidance_scale: 3.5,
          enable_safety_checker: false
        }, 'harmony-flux', outputDir);

        if (harmRes && harmRes.imagePath && fs.existsSync(harmRes.imagePath)) {
          finalImagePath = harmRes.imagePath;
          finalImageUrl = harmRes.imageUrl;
          method = 'layered-compositor-flux-harmonized';
        }
      } else {
        // Default: Nano Banana Pro (Token & Style Bible Matrix Conditioning - Zero Image Donor Bleed)
        const harmonyImageUrls = [`data:image/png;base64,${base64Data}`];

        const paletteStr = Array.isArray(styleBible?.palette) && styleBible.palette.length > 0
          ? styleBible.palette.join(', ')
          : '';

        let harmonyPrompt = `Perform seamless cinematic style harmonization and lighting integration on this composite scene.
Input Image is the assembled multi-layer scene layout.

STYLE BIBLE MATRIX SPECIFICATION (STRICT CONDITIONING):
- Artistic Style & Mood: ${styleBible?.styleBrief || 'Stylized painterly digital concept art, rich atmospheric depth and melancholic wonder.'}
- Rendering Medium: ${styleBible?.medium || 'Stylized Digital Painting'}
- Surface Texture & Grain: ${styleBible?.grain || 'Fine Canvas Impasto, rich brushwork texture'}
- Lighting Architecture: ${styleBible?.lighting || 'Dramatic sunset lighting with strong side- and backlighting, casting deep defined shadows and warm volumetric glow.'}
- Camera & Optics: ${styleBible?.cameraFeel || 'Cinematic widescreen 2.39:1, atmospheric depth and sharp focus.'}
${paletteStr ? `- Dominant Color Palette (Strictly Enforce): ${paletteStr}` : ''}

CRITICAL INTEGRATION & PRESERVATION MANDATE:
- Retain 100% of the exact spatial composition, hull geometry, spacecraft, perspective alignment, and background from the Input Image.
- Cast cohesive directional bounce lighting and rim lights from background celestial bodies/light sources onto foreground vessels and objects.
- Wrap natural volumetric atmospheric haze and depth cues around all asset contact seams.
- NEGATIVE: Do NOT introduce new characters, people, musical instruments, banjos, cliff ledges, or foreign geometry not present in the Input Image. Harmonize ONLY the existing scene elements.`;

        const harmRes = await falService.runQueueJob('fal-ai/nano-banana-pro/edit', {
          prompt: harmonyPrompt,
          image_urls: harmonyImageUrls,
          aspect_ratio: '16:9'
        }, 'style-harmony-nano', outputDir);

        if (harmRes && harmRes.imagePath && fs.existsSync(harmRes.imagePath)) {
          finalImagePath = harmRes.imagePath;
          finalImageUrl = harmRes.imageUrl;
          method = 'layered-compositor-nano-harmonized';
        }
      }
    } catch (harmErr) {
      console.warn('[LayerCompositor] Style harmonization pass fallback:', harmErr.message);
    }
  }

  // Update shot record
  if (isEnd) {
    shot.compositeEndKeyframeUrl = `/storage/keyframes/${rawCompositeFilename}`;
    shot.compositeEndKeyframePath = rawCompositePath;
    shot.compositeEndAt = ts;
    shot.styledEndKeyframeUrl = finalImageUrl;
    shot.styledEndKeyframePath = finalImagePath;
    shot.styledEndAt = ts;
    shot.endRestyleMethod = method;
    shot.endRestyleStrength = harmonyStrength;
  } else {
    shot.compositeKeyframeUrl = `/storage/keyframes/${rawCompositeFilename}`;
    shot.compositeKeyframePath = rawCompositePath;
    shot.compositeAt = ts;
    shot.styledKeyframeUrl = finalImageUrl;
    shot.styledKeyframePath = finalImagePath;
    shot.styledAt = ts;
    shot.restyleMethod = method;
    shot.restyleStrength = harmonyStrength;
  }

  return {
    success: true,
    shot,
    targetFrame,
    compositeKeyframeUrl: isEnd ? shot.compositeEndKeyframeUrl : shot.compositeKeyframeUrl,
    styledKeyframeUrl: isEnd ? shot.styledEndKeyframeUrl : shot.styledKeyframeUrl,
    styledKeyframePath: isEnd ? shot.styledEndKeyframePath : shot.styledKeyframePath,
    method
  };
}

/**
 * Extract or retrieve canonical orthographic sprite directly from reference asset (Option B)
 */
async function getCanonicalAssetSprite({ asset, view = 'side', flipH = false, outputDir, falService }) {
  const ts = Date.now();
  const safeName = (asset.name || 'asset').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const baseFilename = `sprite_${safeName}_${view}_${ts}.png`;
  const basePath = path.join(outputDir, baseFilename);

  // If already pre-extracted
  const preExtracted = path.join(outputDir, `asset_sprite_raiding_vessel_${view}.png`);
  let sourceSpritePath = null;
  if (fs.existsSync(preExtracted)) {
    sourceSpritePath = preExtracted;
  } else if (asset.imagePath && fs.existsSync(asset.imagePath)) {
    // Crop view from reference sheet if 1300x1300 or isolate directly
    const cropBox = {
      side: '1050:320:100:15',
      top: '1050:320:100:340',
      front: '560:560:50:700',
      back: '560:560:670:700'
    }[view];

    const tempCrop = path.join(outputDir, `temp_crop_${ts}.png`);
    if (cropBox) {
      await runFfmpeg(['-i', asset.imagePath, '-vf', `crop=${cropBox}`, '-y', tempCrop]);
    } else {
      fs.copyFileSync(asset.imagePath, tempCrop);
    }

    // Cut out background with rembg
    try {
      const b64 = fs.readFileSync(tempCrop).toString('base64');
      const rembgRes = await falService.runQueueJob('fal-ai/imageutils/rembg', {
        image_url: `data:image/png;base64,${b64}`
      }, `rembg-${view}`, outputDir);
      if (rembgRes && rembgRes.imagePath && fs.existsSync(rembgRes.imagePath)) {
        sourceSpritePath = rembgRes.imagePath;
      }
    } catch (e) {
      console.warn('Rembg fallback:', e.message);
      sourceSpritePath = tempCrop;
    }
    if (fs.existsSync(tempCrop)) {
      try { fs.unlinkSync(tempCrop); } catch (e) {}
    }
  }

  if (!sourceSpritePath || !fs.existsSync(sourceSpritePath)) {
    throw new Error('Could not extract asset sprite from reference image');
  }

  if (flipH) {
    const flippedFilename = `sprite_${safeName}_${view}_flip_${ts}.png`;
    const flippedPath = path.join(outputDir, flippedFilename);
    await runFfmpeg(['-i', sourceSpritePath, '-vf', 'hflip', '-y', flippedPath]);
    return {
      imageUrl: `/storage/keyframes/${flippedFilename}`,
      imagePath: flippedPath
    };
  } else {
    fs.copyFileSync(sourceSpritePath, basePath);
    return {
      imageUrl: `/storage/keyframes/${baseFilename}`,
      imagePath: basePath
    };
  }
}

module.exports = {
  extractShotLayers,
  regenerateLayerAsset,
  getCanonicalAssetSprite,
  bakeAndCommitComposite,
  computeMaskBoundsAndQuad
};

