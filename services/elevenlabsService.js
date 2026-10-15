const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function requestBinary(method, urlStr, headers = {}, body = null, destPath) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(urlStr, {
      method,
      headers: { ...headers },
      timeout: 60000
    }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve({ success: true, destPath })));
      } else {
        let errData = '';
        res.on('data', chunk => errData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(errData);
            reject(new Error(parsed.detail?.message || parsed.message || `HTTP ${res.statusCode}: ${errData}`));
          } catch (e) {
            reject(new Error(`HTTP ${res.statusCode}: ${errData}`));
          }
        });
      }
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('ElevenLabs request timed out'));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function requestJson(method, urlStr, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(urlStr, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 20000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(parsed.detail?.message || parsed.message || `HTTP ${res.statusCode}`));
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.end();
  });
}

class ElevenLabsService {
  constructor(apiKey = '') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  // Get available voices
  async getVoices() {
    if (!this.isConfigured()) {
      return [
        { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Cinematic Calm)' },
        { voice_id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Strong & Confident)' },
        { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Expressive)' },
        { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Epic Trailer Narration)' },
        { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep Cinematic)' }
      ];
    }

    try {
      const data = await requestJson('GET', `${this.baseUrl}/voices`, {
        'xi-api-key': this.apiKey
      });
      return (data.voices || []).map(v => ({
        voice_id: v.voice_id,
        name: `${v.name}${v.labels?.accent ? ' (' + v.labels.accent + ')' : ''}`,
        preview_url: v.preview_url,
        category: v.category
      }));
    } catch (err) {
      console.warn('Failed to fetch ElevenLabs voices:', err.message);
      return [
        { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep Cinematic)' },
        { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Epic Trailer Narration)' },
        { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Cinematic Calm)' }
      ];
    }
  }

  // Generate Sound Effect (SFX)
  async generateSoundEffect({ text, durationSeconds = 4, promptInfluence = 0.3, outputDir }) {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs API key is not configured');
    }

    fs.mkdirSync(outputDir, { recursive: true });
    const filename = `sfx_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp3`;
    const destPath = path.join(outputDir, filename);

    const payload = {
      text: text.trim(),
      duration_seconds: Math.max(1, Math.min(Number(durationSeconds) || 4, 11)),
      prompt_influence: Math.max(0.1, Math.min(Number(promptInfluence) || 0.3, 1.0))
    };

    await requestBinary('POST', `${this.baseUrl}/sound-effects`, {
      'Content-Type': 'application/json',
      'xi-api-key': this.apiKey
    }, payload, destPath);

    return {
      success: true,
      filename,
      filePath: destPath,
      url: `/storage/audio/${filename}`,
      duration: payload.duration_seconds,
      type: 'sfx',
      prompt: text
    };
  }

  // Generate Dialogue or Voiceover (TTS)
  async generateSpeech({ text, voiceId = 'pNInz6obpgDQGcFmaJgB', modelId = 'eleven_multilingual_v2', outputDir }) {
    if (!this.isConfigured()) {
      throw new Error('ElevenLabs API key is not configured');
    }

    fs.mkdirSync(outputDir, { recursive: true });
    const filename = `voice_${Date.now()}_${Math.floor(Math.random() * 1000)}.mp3`;
    const destPath = path.join(outputDir, filename);

    const payload = {
      text: text.trim(),
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true
      }
    };

    const targetVoice = voiceId || 'pNInz6obpgDQGcFmaJgB'; // Adam default

    await requestBinary('POST', `${this.baseUrl}/text-to-speech/${targetVoice}`, {
      'Content-Type': 'application/json',
      'xi-api-key': this.apiKey
    }, payload, destPath);

    return {
      success: true,
      filename,
      filePath: destPath,
      url: `/storage/audio/${filename}`,
      type: 'dialogue',
      text
    };
  }
}

module.exports = { ElevenLabsService };
