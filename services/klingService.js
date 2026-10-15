const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate JWT for Kling AI API using native Node.js crypto
function generateKlingToken(accessKey, secretKey) {
  if (!accessKey || !secretKey) return null;
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: accessKey.trim(),
    exp: now + 1800,
    nbf: now - 5
  };

  const encHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signInput = `${encHeader}.${encPayload}`;
  const signature = crypto.createHmac('sha256', secretKey.trim()).update(signInput).digest('base64url');
  return `${signInput}.${signature}`;
}

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
            reject(new Error(parsed.message || parsed.error || `HTTP ${res.statusCode}: ${data}`));
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
      reject(new Error('Kling API request timed out'));
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
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(destPath)));
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// Convert camera motion string to Kling numerical camera control vector
function mapCameraControl(motion) {
  const m = (motion || '').toLowerCase();
  if (m.includes('pan right')) return { pan: 5, zoom: 0 };
  if (m.includes('pan left')) return { pan: -5, zoom: 0 };
  if (m.includes('dolly forward') || m.includes('zoom in')) return { zoom: 5, pan: 0 };
  if (m.includes('slow zoom in')) return { zoom: 3, pan: 0 };
  if (m.includes('crane down')) return { vertical: -5, zoom: 0 };
  if (m.includes('orbit')) return { pan: 6, tilt: 2 };
  return { zoom: 0, pan: 0 };
}

class KlingService {
  constructor(accessKey = '', secretKey = '') {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.klingai.com/v1';
  }

  setCredentials(accessKey, secretKey) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  isConfigured() {
    return Boolean(this.accessKey && this.secretKey);
  }

  async generateImageToVideo({
    imagePath,
    imageTailPath,
    prompt,
    cameraMotion = 'Dolly Forward',
    duration = 5,
    mode = 'pro', // 'std' or 'pro'
    modelName = 'kling-v1-5',
    outputDir
  }) {
    if (!this.isConfigured()) {
      throw new Error('Kling AI API Access Key and Secret Key are not configured');
    }

    const token = generateKlingToken(this.accessKey, this.secretKey);
    if (!token) throw new Error('Failed to generate Kling authentication token');

    // Read keyframe image as base64
    if (!imagePath || !fs.existsSync(imagePath)) {
      throw new Error(`Keyframe image not found at ${imagePath}`);
    }
    const ext = path.extname(imagePath).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    const base64Data = fs.readFileSync(imagePath).toString('base64');
    const imageUri = `data:${mime};base64,${base64Data}`;

    let imageTailUri = null;
    if (imageTailPath && fs.existsSync(imageTailPath)) {
      const tExt = path.extname(imageTailPath).toLowerCase();
      const tMime = tExt === '.png' ? 'image/png' : 'image/jpeg';
      const tB64 = fs.readFileSync(imageTailPath).toString('base64');
      imageTailUri = `data:${tMime};base64,${tB64}`;
    }

    const camVector = mapCameraControl(cameraMotion);
    const payload = {
      model_name: modelName,
      image: imageUri,
      prompt: (prompt || 'Cinematic action shot').slice(0, 2400),
      duration: duration >= 10 ? '10' : '5',
      mode: mode === 'std' ? 'std' : 'pro',
      camera_control: {
        type: 'simple',
        config: camVector
      }
    };
    if (imageTailUri) {
      payload.image_tail = imageTailUri;
    }

    // 1. Submit task
    const taskRes = await requestJson('POST', `${this.baseUrl}/videos/image2video`, {
      'Authorization': `Bearer ${token}`
    }, payload);

    if (taskRes.code !== 0 || !taskRes.data || !taskRes.data.task_id) {
      throw new Error(taskRes.message || 'Failed to submit Kling image2video task');
    }

    const taskId = taskRes.data.task_id;

    // 2. Poll for completion (up to 4 minutes)
    for (let i = 0; i < 80; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollToken = generateKlingToken(this.accessKey, this.secretKey);
      const statusRes = await requestJson('GET', `${this.baseUrl}/videos/image2video/${taskId}`, {
        'Authorization': `Bearer ${pollToken}`
      });

      if (statusRes.code === 0 && statusRes.data) {
        const { task_status, task_result, task_status_msg } = statusRes.data;
        if (task_status === 'succeed') {
          const videoUrl = task_result?.videos?.[0]?.url;
          if (!videoUrl) throw new Error('Kling task succeeded but no video URL returned');
          
          const filename = `kling_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp4`;
          const outputPath = path.join(outputDir, filename);
          await downloadFile(videoUrl, outputPath);

          return {
            success: true,
            filename,
            filePath: outputPath,
            duration: parseInt(duration, 10) || 5,
            model: `Kling AI (${modelName})`,
            provider: 'kling',
            videoUrl
          };
        } else if (task_status === 'failed') {
          throw new Error(task_status_msg || 'Kling video generation task failed');
        }
      }
    }

    throw new Error('Kling video generation timed out after 4 minutes');
  }
}

module.exports = { KlingService, generateKlingToken };
