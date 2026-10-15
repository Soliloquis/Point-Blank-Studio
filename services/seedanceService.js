const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { generateSampleClip } = require('./ffmpegService');
const { KlingService } = require('./klingService');
const { FalService, downloadFile } = require('./falService');

function request(method, urlStr, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const req = client.request(urlStr, {
      method,
      headers: reqHeaders,
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || parsed.error || `HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

// Helper to synthesize complete project-wide deconstructed Style Bible directives
function formatFullStyleDirective(styleBrief, styleBible) {
  const parts = [];
  if (styleBrief) parts.push(styleBrief.trim());
  if (styleBible) {
    if (styleBible.medium) parts.push(`Medium: ${styleBible.medium}`);
    if (styleBible.lighting) parts.push(`Lighting: ${styleBible.lighting}`);
    if (styleBible.grain) parts.push(`Film Texture: ${styleBible.grain}`);
    if (styleBible.cameraFeel) parts.push(`Camera Optics: ${styleBible.cameraFeel}`);
    if (Array.isArray(styleBible.palette) && styleBible.palette.length > 0) {
      parts.push(`Palette: ${styleBible.palette.join(', ')}`);
    }
  }
  return parts.join('. ');
}

class VideoGenerationService {
  constructor(config = {}) {
    this.provider = config.provider || 'fal'; // 'fal', 'kling', 'simulator', 'custom'
    this.apiKey = config.apiKey || process.env.VIDEO_API_KEY || '';
    this.customEndpoint = config.customEndpoint || '';

    this.klingService = new KlingService(
      config.klingAccessKey || process.env.KLING_ACCESS_KEY || '',
      config.klingSecretKey || process.env.KLING_SECRET_KEY || ''
    );
    this.falService = new FalService(
      config.falApiKey || process.env.FAL_API_KEY || ''
    );
  }

  setCredentials({ provider, apiKey, customEndpoint, klingAccessKey, klingSecretKey, falApiKey }) {
    if (provider !== undefined) this.provider = provider;
    if (apiKey !== undefined) this.apiKey = apiKey;
    if (customEndpoint !== undefined) this.customEndpoint = customEndpoint;
    if (klingAccessKey !== undefined && klingSecretKey !== undefined) {
      this.klingService.setCredentials(klingAccessKey, klingSecretKey);
    }
    if (falApiKey !== undefined) {
      this.falService.setApiKey(falApiKey);
    }
  }

  setProvider(provider, apiKey, customEndpoint = '') {
    this.provider = provider;
    if (apiKey !== undefined) this.apiKey = apiKey;
    if (customEndpoint !== undefined) this.customEndpoint = customEndpoint;
  }

  buildFullPrompt(shotDescription, hasVisualReference = false) {
    let prompt = (shotDescription || '').trim();
    if (hasVisualReference) {
      prompt = `${prompt} -- Follow the exact visual style, lighting, art direction, and color aesthetics of the visual reference image.`;
    }
    return prompt;
  }

  // Generate video clip
  async generateClip({
    shotId,
    title,
    prompt,
    referenceImageUrl,
    keyframePath,
    referenceImagePath,
    styleBrief,
    styleBible,
    assignedReferences = [],
    duration = 5,
    aspectRatio = '16:9',
    cameraMotion = 'Dolly Forward',
    model = 'Wan 2.1 (Fal.ai)',
    tailKeyframePath = null,
    outputDir
  }) {
    // Consistency Context from assigned references (Characters, Props, Places)
    let consistencyDirectives = [];
    if (assignedReferences && assignedReferences.length > 0) {
      assignedReferences.forEach(ref => {
        const catLabel = ref.category === 'characters' ? 'Character' : (ref.category === 'props' ? 'Prop' : 'Location');
        const traits = [];
        if (ref.wardrobe) traits.push(`Costume: ${ref.wardrobe}`);
        if (ref.hair) traits.push(`Identity: ${ref.hair}`);
        if (ref.architecture) traits.push(`Set: ${ref.architecture}`);
        if (ref.atmosphere) traits.push(`Atmosphere: ${ref.atmosphere}`);
        if (ref.description) traits.push(ref.description);
        consistencyDirectives.push(`${catLabel} "${ref.name}": [${traits.join('; ') || 'Consistent canonical appearance'}]`);
      });
    }
    const consistencyText = consistencyDirectives.length > 0 
      ? `Maintain strict visual consistency with defined assets: [${consistencyDirectives.join(' | ')}].`
      : '';

    // Enforce project-wide deconstructed Style Bible
    const styleDirectiveText = formatFullStyleDirective(styleBrief, styleBible);
    const styleText = styleDirectiveText ? ` Style Directive: ${styleDirectiveText}.` : '';

    const videoPrompt = `${(prompt || title || 'Cinematic action sequence').trim()}${consistencyText ? ' ' + consistencyText : ''}.${styleText} Dynamic camera motion: ${cameraMotion || 'Dolly Forward'}.`;
    const clipFilename = `clip_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp4`;
    const outputPath = path.join(outputDir, clipFilename);

    // 1. Fal.ai Provider (Wan 2.1 / Kling 1.6 / Minimax / Luma via Fal Gateway) - PREFERRED & DEFAULT
    if (this.provider === 'fal' || (this.falService.isConfigured() && this.provider !== 'kling' && this.provider !== 'simulator')) {
      const targetKf = keyframePath || referenceImagePath;
      if (!targetKf || !fs.existsSync(targetKf)) {
        throw new Error('Fal.ai requires a valid keyframe or reference image');
      }

      const medium = (styleBible?.medium || '').toLowerCase();
      const isAnimeOrStylized = medium.includes('anime') || 
                                medium.includes('ghibli') || 
                                medium.includes('cel') || 
                                medium.includes('painterly') || 
                                medium.includes('arcane') || 
                                medium.includes('claymation') || 
                                medium.includes('comic');

      let endpoint = 'fal-ai/wan-i2v'; // Default to Wan 2.1 for superior motion and line integrity
      if (model && (model.startsWith('fal-ai/') || model.startsWith('bytedance/'))) {
        endpoint = model;
      } else {
        const modelLower = (model || '').toLowerCase();
        if (modelLower.includes('seedance') && modelLower.includes('reference')) {
          endpoint = 'bytedance/seedance-2.5/reference-to-video';
        } else if (modelLower.includes('seedance')) {
          endpoint = 'bytedance/seedance-2.5/image-to-video';
        } else if (modelLower.includes('kling') && (modelLower.includes('std') || modelLower.includes('standard'))) {
          endpoint = 'fal-ai/kling-video/v1.6/standard/image-to-video';
        } else if (modelLower.includes('kling')) {
          endpoint = 'fal-ai/kling-video/v1.6/pro/image-to-video';
        } else if (modelLower.includes('minimax') || modelLower.includes('hailuo')) {
          endpoint = 'fal-ai/minimax/video-01/image-to-video';
        } else if (modelLower.includes('luma')) {
          endpoint = 'fal-ai/luma-dream-machine';
        }
      }

      const res = await this.falService.generateVideo({
        imagePath: targetKf,
        tailImagePath: tailKeyframePath,
        prompt: videoPrompt,
        cameraMotion: cameraMotion || 'Dolly Forward',
        duration,
        modelEndpoint: endpoint,
        animationCadence: styleBible?.animationCadence || '24',
        outputDir
      });
      return {
        ...res,
        videoPrompt,
        cameraMotion
      };
    }

    // 2. Direct Kling AI Provider
    if (this.provider === 'kling') {
      const targetKf = keyframePath || referenceImagePath;
      if (!targetKf || !fs.existsSync(targetKf)) {
        throw new Error('Kling requires a valid keyframe or reference image');
      }
      const res = await this.klingService.generateImageToVideo({
        imagePath: targetKf,
        prompt: videoPrompt,
        cameraMotion: cameraMotion || 'Dolly Forward',
        duration: duration >= 10 ? 10 : 5,
        mode: 'pro',
        outputDir
      });
      return {
        ...res,
        videoPrompt,
        cameraMotion
      };
    }

    // 3. Studio Simulator Mode (Local animated generation with camera motion)
    if (this.provider === 'simulator' || (!this.apiKey && !this.klingService.isConfigured() && !this.falService.isConfigured())) {
      await generateSampleClip({
        title: title || 'Storyboard Scene',
        prompt: videoPrompt,
        duration: Math.min(Math.max(duration, 2), 12),
        outputPath,
        keyframePath,
        referenceImagePath,
        cameraMotion
      });

      return {
        success: true,
        filename: clipFilename,
        filePath: outputPath,
        duration: duration,
        provider: 'simulator',
        model: model || 'Studio Simulator',
        prompt: videoPrompt,
        videoPrompt,
        cameraMotion
      };
    }

    // 4. Custom Endpoint Provider
    if (this.provider === 'custom' && this.customEndpoint) {
      const payload = {
        prompt: videoPrompt,
        aspect_ratio: aspectRatio,
        duration,
        image_url: referenceImageUrl || undefined
      };
      const res = await request('POST', this.customEndpoint, {
        'Authorization': `Bearer ${this.apiKey}`
      }, payload);

      if (res.video_url || res.url) {
        await downloadFile(res.video_url || res.url, outputPath);
        return {
          success: true,
          filename: clipFilename,
          filePath: outputPath,
          duration,
          provider: 'custom',
          model: 'Custom Endpoint',
          videoPrompt
        };
      }
      throw new Error(res.message || 'Custom endpoint video generation failed');
    }

    throw new Error(`Unsupported provider: ${this.provider}. Please configure Fal.ai in Settings.`);
  }

  // Pass 1: High-fidelity Keyframe Restyler (Flux Pro / Dev + LoRA + IP-Adapter via Fal.ai)
  async restyleKeyframe({ keyframePath, colorFramePath = null, styleImagePath = null, prompt, styleBrief, styleBible, assignedReferences = [], spatialContinuity, outputDir, isPlayblastMode = true, strength = null, modelEndpoint = null }) {
    if (this.falService.isConfigured()) {
      return await this.falService.restyleKeyframe({
        keyframePath,
        colorFramePath,
        styleImagePath,
        prompt,
        styleBrief,
        styleBible,
        assignedReferences,
        spatialContinuity,
        outputDir,
        isPlayblastMode,
        strength,
        modelEndpoint
      });
    }

    throw new Error('Fal.ai API key is required for Keyframe Restyling (Flux + LoRA). Please enter your FAL_KEY in Settings.');
  }
}

module.exports = {
  VideoGenerationService
};
