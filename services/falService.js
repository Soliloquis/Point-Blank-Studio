const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateColorKeyMask, applyEdgeIntegrationAndCleanup } = require('./colorKeyService');

function requestJson(method, urlStr, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(urlStr, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            let errorMsg = '';
            if (typeof parsed.detail === 'string') {
              errorMsg = parsed.detail;
            } else if (Array.isArray(parsed.detail)) {
              errorMsg = parsed.detail.map(d => `${d.loc ? d.loc.join('.') + ': ' : ''}${d.msg || JSON.stringify(d)}`).join('; ');
            } else if (parsed.detail && typeof parsed.detail === 'object') {
              errorMsg = JSON.stringify(parsed.detail);
            } else if (typeof parsed.message === 'string') {
              errorMsg = parsed.message;
            } else if (typeof parsed.error === 'string') {
              errorMsg = parsed.error;
            } else {
              errorMsg = `HTTP ${res.statusCode}: ${data}`;
            }
            reject(new Error(errorMsg));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Fal.ai API request timed out'));
    });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

function downloadFile(urlStr, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = urlStr.startsWith('https:') ? https : http;
    client.get(urlStr, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode >= 400) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`Failed to download file: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(destPath)));
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function parseLoraStack(loraStackStr) {
  if (!loraStackStr || typeof loraStackStr !== 'string') return [];
  const entries = loraStackStr.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  const loras = [];
  for (const entry of entries) {
    const lastColonIdx = entry.lastIndexOf(':');
    let loraPath = entry;
    let scale = 1.0;
    // Check if last colon is part of "http:" or "https:"
    const isProtocolColon = (lastColonIdx === 4 && entry.startsWith('http:')) || (lastColonIdx === 5 && entry.startsWith('https:'));
    if (lastColonIdx !== -1 && !isProtocolColon) {
      const possibleScale = parseFloat(entry.slice(lastColonIdx + 1));
      if (!isNaN(possibleScale)) {
        scale = possibleScale;
        loraPath = entry.slice(0, lastColonIdx).trim();
      }
    }
    if (loraPath) {
      loras.push({ path: loraPath, scale });
    }
  }
  return loras;
}

class FalService {
  constructor(apiKey = '') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://queue.fal.run';
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async getBalance() {
    if (!this.isConfigured()) {
      return { configured: false, balance: null };
    }
    try {
      const res = await requestJson('GET', 'https://api.fal.ai/v1/account/billing?expand=credits', {
        'Authorization': `Key ${this.apiKey}`
      });
      const currentCredits = res.credits?.current_credits ?? res.credits?.balance ?? null;
      return {
        configured: true,
        balance: currentCredits !== null ? (Math.round(currentCredits * 100) / 100) : null,
        currency: res.credits?.currency || 'USD',
        details: res
      };
    } catch (err) {
      return {
        configured: true,
        balance: null,
        error: err.message
      };
    }
  }

  async runQueueJob(endpoint, payload, methodTag = 'job', outputDir = null) {
    if (!this.isConfigured()) throw new Error('Fal.ai API key is not configured');
    const targetDir = outputDir || path.join(__dirname, '..', 'storage', 'keyframes');
    const queueRes = await requestJson('POST', `${this.baseUrl}/${endpoint}`, {
      'Authorization': `Key ${this.apiKey}`
    }, payload);

    const requestId = queueRes.request_id;
    if (!requestId) throw new Error('No request_id returned from Fal.ai');

    const statusUrl = queueRes.status_url || `${this.baseUrl}/${endpoint}/requests/${requestId}/status`;
    const responseUrl = queueRes.response_url || `${this.baseUrl}/${endpoint}/requests/${requestId}`;

    for (let i = 0; i < 90; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await requestJson('GET', statusUrl, {
        'Authorization': `Key ${this.apiKey}`
      });

      if (statusRes.status === 'COMPLETED') {
        const result = await requestJson('GET', responseUrl, {
          'Authorization': `Key ${this.apiKey}`
        });
        const imageUrl = result.images?.[0]?.url || result.image?.url;
        if (!imageUrl) throw new Error('Fal.ai completed but returned no image URL');

        const filename = `styled_flux_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
        const outputPath = path.join(targetDir, filename);
        await downloadFile(imageUrl, outputPath);
        return {
          success: true,
          imageUrl: `/storage/keyframes/${filename}`,
          imagePath: outputPath,
          filename,
          method: methodTag
        };
      } else if (statusRes.status === 'FAILED') {
        throw new Error(statusRes.error || statusRes.detail || `Fal.ai ${endpoint} failed`);
      }
    }
    throw new Error(`Fal.ai ${endpoint} timed out`);
  }

  // Pass 1: High-fidelity Keyframe Restyling via Flux + LoRA Stack + Neural IP-Adapter (Spatial + True Color)
  async restyleKeyframe({
    keyframePath,
    colorFramePath = null,
    styleImagePath = null,
    prompt,
    styleBrief,
    styleBible,
    assignedReferences = [],
    spatialContinuity,
    outputDir,
    isPlayblastMode = true,
    strength = null,
    modelEndpoint = null
  }) {
    if (!this.isConfigured()) {
      throw new Error('Fal.ai API key is not configured');
    }

    const runQueueJob = (endpoint, payload, methodTag) => this.runQueueJob(endpoint, payload, methodTag, outputDir);

    // Base image canvas selection:
    // When a True Color Reference Frame is available, it serves as the canonical environmental ground truth
    // (filling in all blanks: atmospheric glow, planetary rings, surface terrain, space, lighting),
    // while the Spatial Previs Color Keys identify where to place and orient the Consistent Assets!
    const baseImagePath = (colorFramePath && fs.existsSync(colorFramePath)) ? colorFramePath : keyframePath;
    const b64 = fs.readFileSync(baseImagePath).toString('base64');
    const ext = path.extname(baseImagePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const imageDataUri = `data:${mime};base64,${b64}`;

    let targetStrength = 0.65;
    const hasTrueColor = !!(colorFramePath && fs.existsSync(colorFramePath));
    if (hasTrueColor) {
      // True Color Keyframe Pass: Contains the rendered 3D geometry and environment from the engine.
      // Denoise > 0.45 obliterates the ships, landing craft, and terrain.
      // Calibrated 0.32-0.38 preserves 100% of the 3D ship hulls, orange hazard stripes,
      // landing craft, and planetary curvature, while applying the painterly impasto aesthetic from the Style Bible.
      if (typeof strength === 'number' && !isNaN(strength) && strength <= 0.45) {
        targetStrength = Math.max(0.2, strength);
      } else {
        targetStrength = 0.35;
      }
    } else if (typeof strength === 'number' && !isNaN(strength)) {
      targetStrength = Math.max(0.2, Math.min(0.98, strength));
    } else if (isPlayblastMode) {
      targetStrength = 0.82;
    }

    // Build IP-Adapters from assigned reference image files (prioritizing Consistent Assets)
    const ipAdapters = [];
    const consistencyDirectives = [];

    if (assignedReferences && assignedReferences.length > 0) {
      assignedReferences.forEach(ref => {
        const cat = ref.category === 'characters' ? 'Character' : (ref.category === 'props' ? 'Prop' : 'Location');
        const traits = [];
        if (ref.colorKey) traits.push(`Color Key ID: ${ref.colorKey}`);
        if (ref.wardrobe) traits.push(`Costume: ${ref.wardrobe}`);
        if (ref.hair) traits.push(`Identity: ${ref.hair}`);
        if (ref.architecture) traits.push(`Architecture: ${ref.architecture}`);
        if (ref.atmosphere) traits.push(`Atmosphere: ${ref.atmosphere}`);
        if (ref.description) traits.push(ref.description);
        consistencyDirectives.push(`${cat} "${ref.name}" (${ref.tag || ''}): [${traits.join(', ')}]`);

        // Encode reference image for neural IP-Adapter conditioning
        if (ref.imagePath && fs.existsSync(ref.imagePath)) {
          try {
            const rExt = path.extname(ref.imagePath).toLowerCase();
            const rMime = rExt === '.png' ? 'image/png' : 'image/jpeg';
            const rB64 = fs.readFileSync(ref.imagePath).toString('base64');
            ipAdapters.push({
              path: 'XLabs-AI/flux-ip-adapter',
              weight_name: 'ip_adapter.safetensors',
              image_encoder_path: 'openai/clip-vit-large-patch14',
              image_url: `data:${rMime};base64,${rB64}`,
              scale: 0.85 // High-fidelity conditioning for consistent canonical assets
            });
          } catch (rErr) {
            console.warn('Failed to encode reference image for IP-Adapter:', ref.name, rErr.message);
          }
        }
      });
    }

    let playblastDirective = '';
    if (isPlayblastMode) {
      playblastDirective = 'COLOR KEY & PREVIS OVERHAUL MANDATE: The scene layout is derived from a 3D previs playblast using primary color ID proxies. Replace each colored proxy volume with the corresponding Consistent Asset matching its assigned Color Key. Retain the exact spatial placement, scale, and 3D flight trajectory from the spatial previs. Fill in all environmental blanks (atmosphere, planetary rings, terrain, space, lighting) strictly adhering to the True Color Reference.';
    }

    const bibleParts = [];
    if (styleBrief) bibleParts.push(styleBrief.trim());
    if (styleBible) {
      if (styleBible.medium) bibleParts.push(`Medium: ${styleBible.medium}`);
      if (styleBible.lighting) bibleParts.push(`Lighting: ${styleBible.lighting}`);
      if (styleBible.grain) bibleParts.push(`Texture/Lineart: ${styleBible.grain}`);
      if (styleBible.cameraFeel) bibleParts.push(`Optics: ${styleBible.cameraFeel}`);
      if (Array.isArray(styleBible.palette) && styleBible.palette.length > 0) {
        bibleParts.push(`Color Palette: ${styleBible.palette.join(', ')}`);
      }
    }

    const spatialParts = [];
    if (spatialContinuity) {
      if (spatialContinuity.motionVector) spatialParts.push(`Action/Motion: ${spatialContinuity.motionVector}`);
      if (spatialContinuity.cameraTrajectory) spatialParts.push(`Camera Trajectory: ${spatialContinuity.cameraTrajectory}`);
      if (spatialContinuity.cameraAngle) spatialParts.push(`Optics/Framing: ${spatialContinuity.cameraAngle}`);
      if (spatialContinuity.subjectScreenPosition) spatialParts.push(`Position: ${spatialContinuity.subjectScreenPosition}`);
      if (spatialContinuity.facingDirection) spatialParts.push(`Facing: ${spatialContinuity.facingDirection}`);
      if (spatialContinuity.eyelineMatch) spatialParts.push(`Eyeline: ${spatialContinuity.eyelineMatch}`);
      if (spatialContinuity.lightingOrigin) spatialParts.push(`Lighting: ${spatialContinuity.lightingOrigin}`);
      if (spatialContinuity.rule180Vector) spatialParts.push(`Axis: ${spatialContinuity.rule180Vector}`);
    }

    let fullPrompt = `${prompt || 'Cinematic composition'}.`;
    if (playblastDirective) fullPrompt += ` ${playblastDirective}.`;
    if (consistencyDirectives.length > 0) fullPrompt += ` Canonical Identity: ${consistencyDirectives.join('; ')}.`;
    if (bibleParts.length > 0) fullPrompt += ` Style Matrix: ${bibleParts.join('. ')}.`;
    if (spatialParts.length > 0) fullPrompt += ` Spatial Continuity: ${spatialParts.join(', ')}.`;
    fullPrompt += ' Negative: no generic white earth clouds, no plain blue sky, no unshaded geometry.';

    const loras = parseLoraStack(styleBible?.loraStack);
    const useLora = loras.length > 0;



    // =========================================================================
    // COLOR KEY INPAINTING: ONLY FOR RAW PREVIS (Solid Proxy Blocks without True Color Pass)
    // When a True Color Pass exists, the 3D models and textures are ALREADY rendered by the engine.
    // Inpainting over them destroys the real 3D geometry; Direct Style Translation preserves 100% of it.
    // =========================================================================
    const colorKeyList = (assignedReferences || []).map(r => r.colorKey).filter(Boolean);
    if (!hasTrueColor && colorKeyList.length > 0 && fs.existsSync(keyframePath)) {
      try {
        console.log('[Multi-Pass Restyle] Raw previs mode: Generating Color Key mask for proxy replacement...');
        const maskFilename = `mask_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
        const maskPath = path.join(outputDir, maskFilename);

        const maskRes = await generateColorKeyMask(keyframePath, colorKeyList, maskPath, { dilation: 8, feather: 4 });
        if (maskRes.hasMask) {
          console.log(`[Multi-Pass Restyle] Stage 1: Color Key mask generated (${maskRes.pixelCount} px). Inpainting proxy volumes...`);

          const maskB64 = fs.readFileSync(maskPath).toString('base64');
          const maskDataUri = `data:image/png;base64,${maskB64}`;

          const assetPrompt = `Replace the masked proxy volume with the canonical consistent asset: ${consistencyDirectives.join('; ')}. Retain exact 3D orientation, scale, and spatial placement. Hard surface armor plates, crisp hazard stripes, quad thrusters, high fidelity sci-fi spacecraft.`;

          const inpaintPayload = {
            prompt: assetPrompt,
            image_url: imageDataUri,
            mask_url: maskDataUri,
            num_inference_steps: 28,
            guidance_scale: 4.0,
            enable_safety_checker: false
          };
          if (ipAdapters.length > 0) {
            inpaintPayload.ip_adapter = ipAdapters.map(a => ({
              image_url: a.image_url,
              weight: a.scale || 0.85
            }));
          }

          let stage1Res = null;
          try {
            stage1Res = await runQueueJob('fal-ai/flux-general/inpainting', inpaintPayload, 'stage1-inpaint');
          } catch (inpErr) {
            console.warn('[Multi-Pass Restyle] flux-general/inpainting fallback to flux/dev/inpainting:', inpErr.message);
            const devInpaintPayload = {
              prompt: assetPrompt,
              image_url: imageDataUri,
              mask_url: maskDataUri,
              num_inference_steps: 28,
              guidance_scale: 3.5,
              enable_safety_checker: false
            };
            stage1Res = await runQueueJob('fal-ai/flux/dev/inpainting', devInpaintPayload, 'stage1-inpaint-dev');
          }

          if (stage1Res && stage1Res.imagePath && fs.existsSync(stage1Res.imagePath)) {
            // Stage 2: Edge Integration & Contact Cleanup Pass
            console.log('[Multi-Pass Restyle] Stage 2: Running Edge Integration & Contact Cleanup Pass...');
            const stage2Filename = `cleaned_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
            const stage2Path = path.join(outputDir, stage2Filename);
            await applyEdgeIntegrationAndCleanup(stage1Res.imagePath, keyframePath, maskPath, stage2Path);

            // Stage 3: Global Style Harmonization (The Beauty Pass)
            console.log('[Multi-Pass Restyle] Stage 3: Running Global Style Harmonization (strength: 0.28)...');
            const stage2B64 = fs.readFileSync(stage2Path).toString('base64');
            const stage2DataUri = `data:image/png;base64,${stage2B64}`;

            const stylePayload = {
              image_url: stage2DataUri,
              prompt: fullPrompt,
              strength: 0.28,
              num_inference_steps: 28,
              guidance_scale: 3.5,
              enable_safety_checker: false
            };
            if (useLora) stylePayload.loras = loras;

            const finalStyleModel = (modelEndpoint && !modelEndpoint.includes('inpainting')) ? modelEndpoint : (useLora ? 'fal-ai/flux-lora/image-to-image' : 'fal-ai/flux/dev/image-to-image');
            const stage3Res = await runQueueJob(finalStyleModel, stylePayload, '3-stage-pipeline');

            return {
              ...stage3Res,
              stage1ImageUrl: stage1Res.imageUrl,
              stage2ImageUrl: `/storage/keyframes/${stage2Filename}`,
              maskImageUrl: `/storage/keyframes/${maskFilename}`,
              isMultiPass: true
            };
          }
        }
      } catch (multiPassErr) {
        console.warn('[Multi-Pass Restyle] Multi-pass pipeline error, falling back to standard pass:', multiPassErr.message);
      }
    }


    let successResult = null;
    const requestedModel = (modelEndpoint || 'fal-ai/nano-banana-pro/edit').trim();

    // 0. Nano Banana Pro (Primary Reasoning Engine applying Visual Anchor Style Bible)
    if (requestedModel.includes('nano-banana') || !modelEndpoint || requestedModel === 'fal-ai/nano-banana-pro/edit') {
      try {
        console.log('[Fal Restyle] Running Nano Banana Pro with Visual Anchor Style Bible (Zero Image Donor Bleed)...');
        // Do NOT pass styleImagePath as an image donor to prevent semantic character/cliff transplantation
        const nanoImageUrls = [imageDataUri];

        if (assignedReferences && assignedReferences.length > 0) {
          assignedReferences.forEach(ref => {
            if (ref.imagePath && fs.existsSync(ref.imagePath) && nanoImageUrls.length < 10) {
              try {
                const rExt = path.extname(ref.imagePath).toLowerCase();
                const rMime = rExt === '.png' ? 'image/png' : 'image/jpeg';
                const rB64 = fs.readFileSync(ref.imagePath).toString('base64');
                nanoImageUrls.push(`data:${rMime};base64,${rB64}`);
              } catch (e) {
                console.warn('Failed to encode asset image for Nano Banana Pro:', ref.name, e.message);
              }
            }
          });
        }

        const paletteTokens = Array.isArray(styleBible?.palette) && styleBible.palette.length > 0
          ? styleBible.palette.join(', ')
          : '';

        let nanoBrief = `Cinematic Art Director Restyling Brief:
Scene Subject & Action: ${prompt || 'Cinematic composition'}.
${playblastDirective ? playblastDirective + '\n' : ''}

VISUAL STYLE BIBLE MATRIX (STRICT TEXT & TOKEN CONDITIONING):
- Master Style Brief: ${styleBrief || styleBible?.brief || 'Rich painterly digital illustration evoking a sense of melancholic wonder with dramatic atmospheric sunset tones.'}
- Medium & Technique: ${styleBible?.medium || 'Stylized Digital Painting'}
- Surface Texture & Grain: ${styleBible?.grain || 'Fine Canvas Impasto, rich brushwork texture'}
- Lighting Architecture: ${styleBible?.lighting || 'Dramatic sunset lighting with strong side- and backlighting, casting deep defined shadows and warm orange volumetric glow.'}
- Camera & Optics: ${styleBible?.cameraFeel || 'Cinematic widescreen 2.39:1, deep focus with atmospheric depth'}
${paletteTokens ? `- Dominant Color Palette (Strictly Enforce): ${paletteTokens}` : ''}
${consistencyDirectives.length ? `- Consistent Asset Identifiers: ${consistencyDirectives.join('; ')}` : ''}
${spatialParts.length ? `- Spatial Continuity: ${spatialParts.join(', ')}` : ''}

CRITICAL PRESERVATION MANDATE:
- Maintain 100% of the exact 3D spatial layout, perspective lines, spacecraft hulls, terrain, and scene composition from Image 1.
- Apply the lighting, color grading, brushwork texture, and atmospheric tone from the Style Bible strictly to the existing scene elements.
- NEGATIVE: Do NOT introduce new characters, people, musical instruments, banjos, cliff ledges, or foreign geometry not present in the scene composition.`;

        const nanoPayload = {
          prompt: nanoBrief,
          image_urls: nanoImageUrls,
          aspect_ratio: '16:9'
        };

        successResult = await runQueueJob('fal-ai/nano-banana-pro/edit', nanoPayload, 'nano-banana-pro');
      } catch (nanoErr) {
        console.warn('[Fal Restyle] Nano Banana Pro failed, falling back to diffusion:', nanoErr.message);
      }
    }

    // 1. FLUX.1.1 [pro] Ultra
    if (requestedModel.includes('flux-pro') || requestedModel.includes('ultra')) {
      try {
        console.log(`[Fal Restyle] Running flux-pro v1.1-ultra (strength: ${targetStrength})...`);
        const proPayload = {
          prompt: fullPrompt,
          image_url: imageDataUri,
          strength: targetStrength,
          aspect_ratio: '16:9',
          safety_tolerance: '5'
        };
        successResult = await runQueueJob('fal-ai/flux-pro/v1.1-ultra', proPayload, 'flux-pro-ultra');
      } catch (proErr) {
        console.warn('[Fal Restyle] flux-pro failed, falling back:', proErr.message);
      }
    }

    // 2. SDXL Fast Img2Img
    if (!successResult && (requestedModel.includes('fast-sdxl') || requestedModel.includes('sdxl'))) {
      try {
        console.log(`[Fal Restyle] Running fast-sdxl (strength: ${targetStrength})...`);
        const sdxlPayload = {
          prompt: fullPrompt,
          image_url: imageDataUri,
          strength: targetStrength,
          num_inference_steps: 30,
          guidance_scale: 7.5
        };
        successResult = await runQueueJob('fal-ai/fast-sdxl/image-to-image', sdxlPayload, 'fast-sdxl');
      } catch (sdxlErr) {
        console.warn('[Fal Restyle] fast-sdxl failed, falling back:', sdxlErr.message);
      }
    }

    // 3. FLUX LoRA
    if (!successResult && requestedModel.includes('flux-lora')) {
      try {
        console.log(`[Fal Restyle] Running flux-lora (strength: ${targetStrength})...`);
        const loraPayload = {
          image_url: imageDataUri,
          prompt: fullPrompt,
          strength: targetStrength,
          num_inference_steps: 28,
          guidance_scale: 3.5,
          enable_safety_checker: false
        };
        if (useLora) loraPayload.loras = loras;
        successResult = await runQueueJob('fal-ai/flux-lora/image-to-image', loraPayload, 'flux-lora');
      } catch (loraErr) {
        console.warn('[Fal Restyle] flux-lora failed, falling back:', loraErr.message);
      }
    }

    // 4. FLUX General with IP-Adapters (Default for Consistent Assets & Color Keys)
    if (!successResult && (requestedModel.includes('flux-general') || requestedModel.includes('general')) && ipAdapters.length > 0) {
      try {
        console.log(`[Fal Restyle] Running flux-general with ${ipAdapters.length} IP-Adapter references (strength: ${targetStrength})...`);
        const generalPayload = {
          prompt: fullPrompt,
          image_url: imageDataUri,
          strength: targetStrength,
          num_inference_steps: 28,
          guidance_scale: 4.0,
          ip_adapters: ipAdapters,
          enable_safety_checker: false
        };
        if (useLora) generalPayload.loras = loras;

        successResult = await runQueueJob('fal-ai/flux-general/image-to-image', generalPayload, 'ip-adapter');
      } catch (ipErr) {
        console.warn('[Fal Restyle] flux-general IP-Adapter failed, falling back to standard Flux:', ipErr.message);
      }
    }

    // 5. Standard Flux Dev img2img (Fallback or when standard dev requested)
    if (!successResult) {
      const fallbackEndpoint = useLora ? 'fal-ai/flux-lora/image-to-image' : 'fal-ai/flux/dev/image-to-image';
      console.log(`[Fal Restyle] Running standard Flux img2img (${fallbackEndpoint}, strength: ${targetStrength})...`);
      const standardPayload = {
        image_url: imageDataUri,
        prompt: fullPrompt,
        strength: targetStrength,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        enable_safety_checker: false
      };
      if (useLora) standardPayload.loras = loras;

      successResult = await runQueueJob(fallbackEndpoint, standardPayload, 'flux-dev');
    }

    if (successResult) return successResult;
    throw new Error('Fal.ai Flux restyle failed or timed out');
  }

  // Pass 2: Neural Video Motion (Wan 2.1 / Kling 1.6 / Minimax via Fal Gateway)
  async generateVideo({
    imagePath,
    tailImagePath = null,
    prompt,
    cameraMotion = 'Dolly Forward',
    duration = 5,
    modelEndpoint = null,
    animationCadence = '24',
    audioMode = 'sfx_only',
    outputDir
  }) {
    if (!this.isConfigured()) {
      throw new Error('Fal.ai API key is not configured');
    }

    // Default to Wan 2.1 for highest motion quality & line preservation across stylized & realistic media
    let endpoint = modelEndpoint || 'fal-ai/wan-i2v';
    if (endpoint.includes('wan') && (endpoint.includes('v2.1') || endpoint.includes('image-to-video'))) {
      endpoint = (tailImagePath && fs.existsSync(tailImagePath)) ? 'fal-ai/wan-flf2v' : 'fal-ai/wan-i2v';
    }

    const b64 = fs.readFileSync(imagePath).toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const imageDataUri = `data:${mime};base64,${b64}`;

    let tailDataUri = null;
    if (tailImagePath && fs.existsSync(tailImagePath)) {
      const tb64 = fs.readFileSync(tailImagePath).toString('base64');
      const text = path.extname(tailImagePath).toLowerCase();
      const tmime = text === '.png' ? 'image/png' : 'image/jpeg';
      tailDataUri = `data:${tmime};base64,${tb64}`;
    }

    const cadenceInstruction = animationCadence === '12' 
      ? 'Animated on twos, hand-drawn timing, 12fps cadence.' 
      : (animationCadence === '8' ? 'Stop-motion physical cadence, 8fps tactile timing.' : 'Fluid cinematic motion, 24fps.');

    const mode = audioMode || 'sfx_only';
    let audioPromptDirective = '';
    let shouldGenerateAudio = true;

    if (mode === 'mute' || mode === 'silent' || mode === 'none') {
      shouldGenerateAudio = false;
    } else if (mode === 'sfx_only') {
      shouldGenerateAudio = true;
      audioPromptDirective = ' Authentic environmental sound effects and foley only. No background music, no musical score, no songs.';
    } else if (mode === 'full_audio' || mode === 'music_and_sfx') {
      shouldGenerateAudio = true;
      audioPromptDirective = ' Immersive sound effects with dramatic cinematic background music.';
    }

    const finalPrompt = audioPromptDirective ? `${prompt}.${audioPromptDirective}` : prompt;
    const videoPrompt = `${finalPrompt}. Dynamic camera movement: ${cameraMotion}. ${cadenceInstruction}`;

    const isWan = endpoint.includes('wan');
    const isKling = endpoint.includes('kling');
    const isSeedance = endpoint.includes('seedance');

    let payload;
    if (isSeedance && endpoint.includes('reference-to-video')) {
      const promptWithRef = finalPrompt.includes('@Image1') ? finalPrompt : `@Image1: ${finalPrompt}`;
      const imageUrls = [imageDataUri];
      if (tailDataUri) {
        imageUrls.push(tailDataUri);
      }
      payload = {
        prompt: `${promptWithRef}. Dynamic camera movement: ${cameraMotion}. ${cadenceInstruction}`,
        image_urls: imageUrls,
        duration: String(Math.min(Math.max(parseInt(duration, 10) || 5, 4), 30)),
        resolution: '720p',
        aspect_ratio: '16:9',
        generate_audio: shouldGenerateAudio
      };
    } else if (isSeedance) {
      // ByteDance Seedance 2.5 Image-to-Video: True First-Frame Keyframe Conditioning
      payload = {
        image_url: imageDataUri,
        prompt: `${finalPrompt}. Dynamic camera movement: ${cameraMotion}. ${cadenceInstruction}`,
        duration: String(Math.min(Math.max(parseInt(duration, 10) || 5, 4), 30)),
        resolution: '720p',
        aspect_ratio: '16:9',
        generate_audio: shouldGenerateAudio
      };
      if (tailDataUri) {
        payload.last_image = tailDataUri;
      }
    } else {
      payload = {
        image_url: imageDataUri,
        prompt: videoPrompt,
        aspect_ratio: '16:9'
      };

      if (endpoint === 'fal-ai/wan-flf2v') {
        delete payload.image_url;
        delete payload.aspect_ratio;
        payload.start_image_url = imageDataUri;
        payload.end_image_url = tailDataUri || imageDataUri;
      } else if (isWan) {
        payload.num_inference_steps = 30;
      } else if (isKling) {
        payload.duration = duration >= 10 ? '10' : '5';
        if (tailDataUri) {
          payload.tail_image_url = tailDataUri;
        }
      }
    }

    const queueRes = await requestJson('POST', `${this.baseUrl}/${endpoint}`, {
      'Authorization': `Key ${this.apiKey}`
    }, payload);

    const requestId = queueRes.request_id;
    if (!requestId) throw new Error('No request_id returned from Fal.ai');

    // Use Fal's canonical status_url and response_url to prevent HTTP 405 Method Not Allowed
    const statusUrl = queueRes.status_url || `${this.baseUrl}/${endpoint}/requests/${requestId}/status`;
    const responseUrl = queueRes.response_url || `${this.baseUrl}/${endpoint}/requests/${requestId}`;

    // Poll status (allow up to ~17.5 minutes for busy GPU queues and deep 81-frame diffusion)
    const maxPolls = 300;
    const pollInterval = 3500;
    console.log(`[Fal Video] Submitted request ${requestId} to ${endpoint}. Beginning queue polling...`);

    let lastStatus = null;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, pollInterval));
      let statusRes;
      try {
        statusRes = await requestJson('GET', statusUrl, {
          'Authorization': `Key ${this.apiKey}`
        });
      } catch (pollErr) {
        console.warn(`[Fal Video] Status poll error at ${Math.round((i + 1) * (pollInterval / 1000))}s: ${pollErr.message}. Retrying...`);
        continue;
      }

      if (statusRes.status !== lastStatus || i % 6 === 0) {
        lastStatus = statusRes.status;
        const qPos = statusRes.queue_position !== undefined ? ` (queue pos: ${statusRes.queue_position})` : '';
        console.log(`[Fal Video] ${endpoint} [${requestId.slice(0, 8)}...] (${Math.round((i + 1) * (pollInterval / 1000))}s elapsed): status=${statusRes.status}${qPos}`);
      }

      if (statusRes.status === 'COMPLETED') {
        console.log(`[Fal Video] Request ${requestId} COMPLETED! Fetching final video payload...`);
        const result = await requestJson('GET', responseUrl, {
          'Authorization': `Key ${this.apiKey}`
        });
        const videoUrl = result.video?.url || result.videos?.[0]?.url;
        if (!videoUrl) throw new Error('Fal.ai completed but returned no video URL');

        const filename = `fal_${isWan ? 'wan' : (isSeedance ? 'seedance' : 'kling')}_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp4`;
        const outputPath = path.join(outputDir, filename);
        console.log(`[Fal Video] Downloading generated video from ${videoUrl} to ${filename}...`);
        await downloadFile(videoUrl, outputPath);
        console.log(`[Fal Video] Successfully saved generated clip to ${outputPath}`);

        let modelName = 'Fal.ai Video';
        if (isSeedance) modelName = 'Seedance 2.5 (via Fal)';
        else if (isWan) modelName = 'Wan 2.1 (via Fal)';
        else if (isKling && endpoint.includes('pro')) modelName = 'Kling 1.6 Pro (via Fal)';
        else if (isKling) modelName = 'Kling 1.6 Standard (via Fal)';
        else if (endpoint.includes('minimax')) modelName = 'Minimax Video-01 (via Fal)';
        else if (endpoint.includes('luma')) modelName = 'Luma Ray 2 (via Fal)';

        return {
          success: true,
          filename,
          filePath: outputPath,
          duration: parseInt(duration, 10) || 5,
          model: modelName,
          provider: 'fal',
          videoUrl
        };
      } else if (statusRes.status === 'FAILED') {
        const errMsg = statusRes.error || statusRes.detail || (statusRes.logs ? JSON.stringify(statusRes.logs) : 'Fal.ai video generation failed');
        console.error(`[Fal Video] Generation failed for request ${requestId}:`, errMsg);
        throw new Error(errMsg);
      }
    }

    throw new Error(`Fal.ai video generation timed out after ${Math.round((maxPolls * pollInterval) / 60000)} minutes`);
  }
}

module.exports = { FalService, parseLoraStack, downloadFile };
