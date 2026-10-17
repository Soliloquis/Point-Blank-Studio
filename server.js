const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { FalService } = require('./services/falService');
const { VideoGenerationService } = require('./services/seedanceService');
const { ElevenLabsService } = require('./services/elevenlabsService');
const { stitchTimelineClips, getVideoDuration, extractLastFrame, extractSingleKeyframe } = require('./services/ffmpegService');
const { analyzeAndDeconstructVideo, generateHighLevelContext, analyzeShotMotionDelta, generateImageToDescription, generateStyleBrief, compileContinuityDirectives, enhancePromptWithSpatialMarkup, deriveLayerOrientationFromMarkup } = require('./services/videoAnalysisService');
const { detectColorKeysInSpatialFrame } = require('./services/colorKeyService');
const { extractShotLayers, regenerateLayerAsset, getCanonicalAssetSprite, bakeAndCommitComposite } = require('./services/layerCompositorService');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Security: Restrict Cross-Origin Requests strictly to Localhost / Local Studio App
const allowedLocalhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin header (native app window, desktop shortcut, local scripts, curl)
    if (!origin) return callback(null, true);
    if (allowedLocalhostRegex.test(origin)) {
      return callback(null, true);
    }
    console.warn(`[SECURITY] Blocked Cross-Origin request from unauthorized origin: ${origin}`);
    return callback(new Error('Cross-Origin Request Blocked by Studio Security Policy.'));
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security: Path Traversal Defenses & Sanitization Helpers
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return '';
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function resolveSafeStoragePath(baseDir, filename) {
  const safeName = sanitizeFilename(filename);
  const resolved = path.resolve(baseDir, safeName);
  const root = path.resolve(baseDir);
  if (!resolved.startsWith(root)) {
    throw new Error('Directory traversal attempt detected');
  }
  return resolved;
}

// Directories
const STORAGE_DIR = path.join(__dirname, 'storage');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const CLIPS_DIR = path.join(STORAGE_DIR, 'clips');
const KEYFRAMES_DIR = path.join(STORAGE_DIR, 'keyframes');
const EXPORTS_DIR = path.join(STORAGE_DIR, 'exports');
const PROJECTS_DIR = path.join(STORAGE_DIR, 'projects');
const REFERENCES_DIR = path.join(STORAGE_DIR, 'references');
const AUDIO_DIR = path.join(STORAGE_DIR, 'audio');
const PROJECT_FILE = path.join(PROJECTS_DIR, 'current_project.json');
const CONFIG_FILE = path.join(PROJECTS_DIR, 'config.json');

[STORAGE_DIR, UPLOADS_DIR, CLIPS_DIR, KEYFRAMES_DIR, EXPORTS_DIR, PROJECTS_DIR, REFERENCES_DIR, AUDIO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve static assets
app.use('/storage/uploads', express.static(UPLOADS_DIR));
app.use('/storage/clips', express.static(CLIPS_DIR));
app.use('/storage/keyframes', express.static(KEYFRAMES_DIR));
app.use('/storage/exports', express.static(EXPORTS_DIR));
app.use('/storage/references', express.static(REFERENCES_DIR));
app.use('/storage/audio', express.static(AUDIO_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// Security: Allowed File Type Whitelists
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp']);
const ALLOWED_VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.mkv', '.avi']);

function imageFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_IMAGE_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Security: Invalid image extension "${ext}". Allowed: .png, .jpg, .jpeg, .webp, .bmp`));
  }
}

function videoFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_VIDEO_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Security: Invalid video extension "${ext}". Allowed: .mp4, .mov, .webm, .mkv, .avi`));
  }
}

// Multer storage configs with sanitized names and strict filters
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const field = sanitizeFilename(file.fieldname) || 'upload';
    cb(null, `${field}_${Date.now()}${ext}`);
  }
});
const styleUpload = multer({
  storage: uploadStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});
const videoUpload = multer({
  storage: uploadStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});
const upload = videoUpload; // Backward compatibility alias

const keyframeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, KEYFRAMES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `kf_custom_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
  }
});
const keyframeUpload = multer({
  storage: keyframeStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const referenceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, REFERENCES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`);
  }
});
const referenceUpload = multer({
  storage: referenceStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const clipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CLIPS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const base = sanitizeFilename(path.basename(file.originalname, ext));
    cb(null, `manual_${base}_${Date.now()}${ext}`);
  }
});
const clipUpload = multer({
  storage: clipStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
});

const mediaPoolUpload = multer({
  storage: uploadStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'];
    if (allowed.includes(ext) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`));
    }
  }
});

// Settings / Config
let appConfig = {
  videoProvider: process.env.VIDEO_PROVIDER || 'fal', // 'fal', 'kling', 'simulator', 'custom'
  videoApiKey: process.env.VIDEO_API_KEY || '',
  klingAccessKey: process.env.KLING_ACCESS_KEY || '',
  klingSecretKey: process.env.KLING_SECRET_KEY || '',
  falApiKey: process.env.FAL_KEY || process.env.FAL_API_KEY || '',
  falModel: process.env.FAL_MODEL || 'fal-ai/wan-i2v',
  falRestyleModel: process.env.FAL_RESTYLE_MODEL || 'fal-ai/nano-banana-pro/edit',
  assetGenModel: process.env.ASSET_GEN_MODEL || 'openai/gpt-image-2.5/flare/edit',
  harmonizeModel: process.env.HARMONIZE_MODEL || 'fal-ai/nano-banana-pro/edit',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  customEndpoint: process.env.CUSTOM_ENDPOINT || ''
};

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const loaded = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    appConfig = { ...appConfig, ...loaded };
  } catch (err) {}
}

if (appConfig.falModel === 'fal-ai/wan/v2.1/image-to-video') {
  appConfig.falModel = 'fal-ai/wan-i2v';
}
if (appConfig.falModel === 'bytedance/seedance-2.5/reference-to-video') {
  appConfig.falModel = 'bytedance/seedance-2.5/image-to-video';
}

if (appConfig.falApiKey) {
  process.env.FAL_KEY = appConfig.falApiKey;
  process.env.FAL_API_KEY = appConfig.falApiKey;
}
if (appConfig.elevenLabsApiKey) {
  process.env.ELEVENLABS_API_KEY = appConfig.elevenLabsApiKey;
}

const falService = new FalService(appConfig.falApiKey);
const elevenLabsService = new ElevenLabsService(appConfig.elevenLabsApiKey);
const videoService = new VideoGenerationService({
  provider: appConfig.videoProvider,
  apiKey: appConfig.videoApiKey,
  klingAccessKey: appConfig.klingAccessKey,
  klingSecretKey: appConfig.klingSecretKey,
  falApiKey: appConfig.falApiKey,
  customEndpoint: appConfig.customEndpoint
});

// Default project template with Storyboard and Timeline workspaces
const defaultProject = {
  id: 'proj_default',
  name: 'Cinematic Storyboard Project',
  activeWorkspace: 'storyboard', // 'storyboard' | 'timeline'
  visualReference: {
    imageUrl: null,
    filename: null,
    promptHint: 'Visual Style Reference (Sole Source of Truth)'
  },
  ingestedVideo: null,
  storyboard: [
    {
      id: 'sb_1',
      shotNumber: 1,
      title: 'Shot 1: Neon Entrance',
      startTime: 0,
      endTime: 4,
      duration: 4,
      keyframeUrl: '/storage/clips/clip_sample_1.mp4',
      description: 'Slow aerial dolly tracking forward across high-rise futuristic towers drenched in neon reflections and atmospheric mist.',
      cameraMotion: 'Dolly Forward',
      spatialContinuity: {
        subjectScreenPosition: 'Center',
        facingDirection: 'Forward',
        eyelineMatch: 'Direct to Lens',
        cameraAngle: 'Wide Establishing 35mm',
        lightingOrigin: 'Volumetric Cyan/Magenta Neon Overhead',
        rule180Vector: 'Establishing Master Axis'
      },
      status: 'generated',
      approved: true,
      generatedClip: {
        id: 'clip_1',
        title: 'Shot 1: Neon Entrance',
        filename: 'clip_sample_1.mp4',
        url: '/storage/clips/clip_sample_1.mp4',
        duration: 4
      }
    },
    {
      id: 'sb_2',
      shotNumber: 2,
      title: 'Shot 2: Character in Alley',
      startTime: 4,
      endTime: 8,
      duration: 4,
      keyframeUrl: '/storage/clips/clip_sample_2.mp4',
      description: 'Medium tracking shot of a mysterious figure in a reflective trench coat walking through a vibrant illuminated alleyway.',
      cameraMotion: 'Pan Right',
      spatialContinuity: {
        subjectScreenPosition: 'Screen-Left',
        facingDirection: 'Screen-Right',
        eyelineMatch: 'Looking Screen-Right',
        cameraAngle: 'Medium Tracking 50mm',
        lightingOrigin: 'Screen-Left Streetlamp (Amber 3200K)',
        rule180Vector: 'East Axis - subject walks screen-right'
      },
      status: 'generated',
      approved: true,
      generatedClip: {
        id: 'clip_2',
        title: 'Shot 2: Character in Alley',
        filename: 'clip_sample_2.mp4',
        url: '/storage/clips/clip_sample_2.mp4',
        duration: 4
      }
    },
    {
      id: 'sb_3',
      shotNumber: 3,
      title: 'Shot 3: Augmented Gaze',
      startTime: 8,
      endTime: 11,
      duration: 3,
      keyframeUrl: '/storage/clips/clip_sample_3.mp4',
      description: 'Dramatic macro close-up of high-tech augmented eyes scanning the rainy surroundings, reflections gleaming in iris.',
      cameraMotion: 'Slow Zoom In',
      spatialContinuity: {
        subjectScreenPosition: 'Screen-Right',
        facingDirection: 'Screen-Left',
        eyelineMatch: 'Looking Screen-Left (Reverse Cut)',
        cameraAngle: 'Macro Close-Up 100mm',
        lightingOrigin: 'Screen-Left Streetlamp (Fill Right)',
        rule180Vector: 'East Axis - reverse angle matching eyeline'
      },
      status: 'generated',
      approved: false,
      generatedClip: {
        id: 'clip_3',
        title: 'Shot 3: Augmented Gaze',
        filename: 'clip_sample_3.mp4',
        url: '/storage/clips/clip_sample_3.mp4',
        duration: 3
      }
    }
  ],
  timeline: [
    {
      timelineId: 'tl_1',
      id: 'clip_1',
      title: 'Shot 1: Neon Entrance',
      filename: 'clip_sample_1.mp4',
      filePath: path.join(CLIPS_DIR, 'clip_sample_1.mp4'),
      url: '/storage/clips/clip_sample_1.mp4',
      duration: 4,
      trimStart: 0,
      trimEnd: 4,
      model: 'Wan 2.1 (Fal.ai)'
    },
    {
      timelineId: 'tl_2',
      id: 'clip_2',
      title: 'Shot 2: Character in Alley',
      filename: 'clip_sample_2.mp4',
      filePath: path.join(CLIPS_DIR, 'clip_sample_2.mp4'),
      url: '/storage/clips/clip_sample_2.mp4',
      duration: 4,
      trimStart: 0,
      trimEnd: 4,
      model: 'Wan 2.1 (Fal.ai)'
    }
  ],
  exports: [],
  references: {
    characters: [],
    props: [],
    places: []
  },
  colorGrading: {
    enabled: true,
    activeChannel: 'exposure',
    channels: {
      exposure: {
        name: 'Exposure',
        unit: 'EV',
        min: -2.0,
        max: 2.0,
        defaultVal: 0.0,
        color: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.35)',
        keyframes: [
          { time: 0.0, value: 0.0, inHandle: { dt: -0.4, dv: 0.0 }, outHandle: { dt: 0.4, dv: 0.0 }, interpolation: 'bezier' }
        ]
      },
      contrast: {
        name: 'Contrast',
        unit: '',
        min: -0.8,
        max: 0.8,
        defaultVal: 0.0,
        color: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.35)',
        keyframes: [
          { time: 0.0, value: 0.0, inHandle: { dt: -0.4, dv: 0.0 }, outHandle: { dt: 0.4, dv: 0.0 }, interpolation: 'bezier' }
        ]
      },
      saturation: {
        name: 'Saturation',
        unit: '',
        min: -1.0,
        max: 1.0,
        defaultVal: 0.0,
        color: '#ec4899',
        glow: 'rgba(236, 72, 153, 0.35)',
        keyframes: [
          { time: 0.0, value: 0.0, inHandle: { dt: -0.4, dv: 0.0 }, outHandle: { dt: 0.4, dv: 0.0 }, interpolation: 'bezier' }
        ]
      },
      temperature: {
        name: 'Temperature',
        unit: 'K',
        min: -100,
        max: 100,
        defaultVal: 0,
        color: '#f97316',
        glow: 'rgba(249, 115, 22, 0.35)',
        keyframes: [
          { time: 0.0, value: 0, inHandle: { dt: -0.4, dv: 0 }, outHandle: { dt: 0.4, dv: 0 }, interpolation: 'bezier' }
        ]
      },
      tint: {
        name: 'Tint',
        unit: '',
        min: -100,
        max: 100,
        defaultVal: 0,
        color: '#10b981',
        glow: 'rgba(16, 185, 129, 0.35)',
        keyframes: [
          { time: 0.0, value: 0, inHandle: { dt: -0.4, dv: 0 }, outHandle: { dt: 0.4, dv: 0 }, interpolation: 'bezier' }
        ]
      }
    }
  }
};

function getProject() {
  let project = defaultProject;
  if (fs.existsSync(PROJECT_FILE)) {
    try {
      project = JSON.parse(fs.readFileSync(PROJECT_FILE, 'utf-8'));
    } catch (err) {}
  }
  if (!project.references) {
    project.references = { characters: [], props: [], places: [] };
  }
  if (!project.references.characters) project.references.characters = [];
  if (!project.references.props) project.references.props = [];
  if (!project.references.places) project.references.places = [];
  if (!project.colorGrading) {
    project.colorGrading = defaultProject.colorGrading;
  }
  return project;
}

function getAllReferences(project) {
  const refs = project.references || { characters: [], props: [], places: [] };
  return [
    ...(refs.characters || []),
    ...(refs.props || []),
    ...(refs.places || [])
  ];
}

function saveProject(data) {
  fs.writeFileSync(PROJECT_FILE, JSON.stringify(data, null, 2));
}

// ----------------- ROUTES -----------------

// Project
app.get('/api/project', (req, res) => {
  res.json(getProject());
});

app.post('/api/project', (req, res) => {
  try {
    const current = getProject();
    const updated = {
      ...current,
      ...req.body
    };
    if (req.body.colorGrading) {
      updated.colorGrading = req.body.colorGrading;
    }
    saveProject(updated);
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dedicated Color Grading Curve State API
app.post('/api/color-grading', (req, res) => {
  try {
    const project = getProject();
    project.colorGrading = req.body;
    saveProject(project);
    res.json({ success: true, colorGrading: project.colorGrading });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Reference Construction API (Characters, Props, Places) ---

// Get all references
app.get('/api/references', (req, res) => {
  const project = getProject();
  res.json({
    success: true,
    references: project.references
  });
});

// Create a new reference asset
app.post('/api/references', referenceUpload.single('image'), (req, res) => {
  try {
    const { name, category, description, tag, colorKey, wardrobe, hair, architecture, atmosphere } = req.body;
    const cat = ['characters', 'props', 'places'].includes(category) ? category : 'characters';
    const project = getProject();

    const refId = `ref_${cat.slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const imageUrl = req.file ? `/storage/references/${req.file.filename}` : null;
    const imagePath = req.file ? req.file.path : null;

    const newRef = {
      id: refId,
      name: (name || 'Untitled Asset').trim(),
      category: cat,
      tag: (tag || `@${(name || 'Asset').replace(/\s+/g, '')}`).trim(),
      colorKey: (colorKey || '').trim(),
      description: (description || '').trim(),
      wardrobe: (wardrobe || '').trim(),
      hair: (hair || '').trim(),
      architecture: (architecture || '').trim(),
      atmosphere: (atmosphere || '').trim(),
      imageUrl,
      imagePath,
      updatedAt: Date.now(),
      createdAt: new Date().toISOString()
    };

    project.lastReferenceUpdatedAt = Date.now();
    project.references[cat].push(newRef);
    saveProject(project);

    res.json({
      success: true,
      reference: newRef,
      references: project.references
    });
  } catch (err) {
    console.error('Create reference error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update an existing reference asset
app.put('/api/references/:id', referenceUpload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, tag, category, wardrobe, hair, architecture, atmosphere } = req.body;
    const project = getProject();

    let foundCat = null;
    let foundIdx = -1;

    for (const cat of ['characters', 'props', 'places']) {
      const idx = (project.references[cat] || []).findIndex(r => r.id === id);
      if (idx !== -1) {
        foundCat = cat;
        foundIdx = idx;
        break;
      }
    }

    if (foundIdx === -1) {
      return res.status(404).json({ error: 'Reference asset not found' });
    }

    const target = project.references[foundCat][foundIdx];
    if (name) target.name = name.trim();
    if (description !== undefined) target.description = description.trim();
    if (tag) target.tag = tag.trim();
    if (req.body.colorKey !== undefined) target.colorKey = req.body.colorKey.trim();
    if (wardrobe !== undefined) target.wardrobe = wardrobe.trim();
    if (hair !== undefined) target.hair = hair.trim();
    if (architecture !== undefined) target.architecture = architecture.trim();
    if (atmosphere !== undefined) target.atmosphere = atmosphere.trim();
    if (req.file) {
      target.imageUrl = `/storage/references/${req.file.filename}`;
      target.imagePath = req.file.path;
    }

    if (category && category !== foundCat && ['characters', 'props', 'places'].includes(category)) {
      project.references[foundCat].splice(foundIdx, 1);
      target.category = category;
      project.references[category].push(target);
    }

    target.updatedAt = Date.now();
    project.lastReferenceUpdatedAt = Date.now();
    saveProject(project);
    res.json({ success: true, reference: target, references: project.references });
  } catch (err) {
    console.error('Update reference error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a reference asset
app.delete('/api/references/:id', (req, res) => {
  try {
    const { id } = req.params;
    const project = getProject();
    let deletedImagePath = null;

    for (const cat of ['characters', 'props', 'places']) {
      const idx = (project.references[cat] || []).findIndex(r => r.id === id);
      if (idx !== -1) {
        const [removed] = project.references[cat].splice(idx, 1);
        deletedImagePath = removed.imagePath;
        break;
      }
    }

    // Unassign from any storyboard shots
    (project.storyboard || []).forEach(shot => {
      if (Array.isArray(shot.assignedReferences)) {
        shot.assignedReferences = shot.assignedReferences.filter(rId => rId !== id);
      }
    });

    saveProject(project);

    if (deletedImagePath && fs.existsSync(deletedImagePath)) {
      try { fs.unlinkSync(deletedImagePath); } catch (e) {}
    }

    res.json({ success: true, references: project.references });
  } catch (err) {
    console.error('Delete reference error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Assign or unassign reference assets to a specific storyboard shot
app.post('/api/storyboard/:shotId/references', (req, res) => {
  try {
    const { shotId } = req.params;
    const { referenceIds } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    shot.assignedReferences = Array.isArray(referenceIds) ? referenceIds : [];
    saveProject(project);
    res.json({ success: true, shot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings
app.get('/api/settings', (req, res) => {
  res.json({
    videoProvider: appConfig.videoProvider,
    videoApiKey: appConfig.videoApiKey ? '••••••••' + appConfig.videoApiKey.slice(-4) : '',
    hasVideoKey: Boolean(appConfig.videoApiKey),
    klingAccessKey: appConfig.klingAccessKey ? '••••••••' + appConfig.klingAccessKey.slice(-4) : '',
    klingSecretKey: appConfig.klingSecretKey ? '••••••••' + appConfig.klingSecretKey.slice(-4) : '',
    hasKlingKey: Boolean(appConfig.klingAccessKey && appConfig.klingSecretKey),
    falApiKey: appConfig.falApiKey ? '••••••••' + appConfig.falApiKey.slice(-4) : '',
    hasFalKey: Boolean(appConfig.falApiKey),
    falModel: appConfig.falModel || 'fal-ai/wan-i2v',
    falRestyleModel: appConfig.falRestyleModel || 'fal-ai/nano-banana-pro/edit',
    assetGenModel: appConfig.assetGenModel || 'openai/gpt-image-2.5/flare/edit',
    harmonizeModel: appConfig.harmonizeModel || 'fal-ai/nano-banana-pro/edit',
    elevenLabsApiKey: appConfig.elevenLabsApiKey ? '••••••••' + appConfig.elevenLabsApiKey.slice(-4) : '',
    hasElevenLabsKey: Boolean(appConfig.elevenLabsApiKey),
    openaiApiKey: appConfig.openaiApiKey ? '••••••••' + appConfig.openaiApiKey.slice(-4) : '',
    hasOpenAiKey: Boolean(appConfig.openaiApiKey),
    geminiApiKey: appConfig.geminiApiKey ? '••••••••' + appConfig.geminiApiKey.slice(-4) : '',
    hasGeminiKey: Boolean(appConfig.geminiApiKey),
    customEndpoint: appConfig.customEndpoint
  });
});

app.post('/api/settings', (req, res) => {
  const {
    videoProvider,
    videoApiKey,
    klingAccessKey,
    klingSecretKey,
    falApiKey,
    falModel,
    falRestyleModel,
    assetGenModel,
    harmonizeModel,
    elevenLabsApiKey,
    openaiApiKey,
    geminiApiKey,
    customEndpoint
  } = req.body;

  if (videoProvider !== undefined) {
    appConfig.videoProvider = videoProvider;
  }
  if (videoApiKey !== undefined && videoApiKey !== '') {
    appConfig.videoApiKey = videoApiKey;
  }
  if (klingAccessKey !== undefined && klingAccessKey !== '') {
    appConfig.klingAccessKey = klingAccessKey;
  }
  if (klingSecretKey !== undefined && klingSecretKey !== '') {
    appConfig.klingSecretKey = klingSecretKey;
  }
  if (falApiKey !== undefined && falApiKey !== '') {
    appConfig.falApiKey = falApiKey;
    process.env.FAL_KEY = falApiKey;
    process.env.FAL_API_KEY = falApiKey;
    falService.setApiKey(falApiKey);
  }
  if (falModel !== undefined) {
    appConfig.falModel = falModel;
  }
  if (falRestyleModel !== undefined) {
    appConfig.falRestyleModel = falRestyleModel;
  }
  if (assetGenModel !== undefined) {
    appConfig.assetGenModel = assetGenModel;
  }
  if (harmonizeModel !== undefined) {
    appConfig.harmonizeModel = harmonizeModel;
  }
  if (elevenLabsApiKey !== undefined && elevenLabsApiKey !== '') {
    appConfig.elevenLabsApiKey = elevenLabsApiKey;
    process.env.ELEVENLABS_API_KEY = elevenLabsApiKey;
    elevenLabsService.setApiKey(elevenLabsApiKey);
  }
  if (openaiApiKey !== undefined && openaiApiKey !== '') {
    appConfig.openaiApiKey = openaiApiKey;
    process.env.OPENAI_API_KEY = openaiApiKey;
  }
  if (geminiApiKey !== undefined && geminiApiKey !== '') {
    appConfig.geminiApiKey = geminiApiKey;
    process.env.GEMINI_API_KEY = geminiApiKey;
  }
  if (customEndpoint !== undefined) {
    appConfig.customEndpoint = customEndpoint;
  }

  videoService.setCredentials({
    provider: appConfig.videoProvider,
    apiKey: appConfig.videoApiKey,
    klingAccessKey: appConfig.klingAccessKey,
    klingSecretKey: appConfig.klingSecretKey,
    falApiKey: appConfig.falApiKey,
    customEndpoint: appConfig.customEndpoint
  });

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(appConfig, null, 2));

  // Also sync to .env file if it exists so server restarts retain the keys
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
    const updateEnvVar = (key, val) => {
      if (!val) return;
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${val}`);
      } else {
        envContent = (envContent.trim() ? envContent.trim() + '\n' : '') + `${key}=${val}\n`;
      }
    };
    if (appConfig.falApiKey) {
      updateEnvVar('FAL_KEY', appConfig.falApiKey);
      updateEnvVar('FAL_API_KEY', appConfig.falApiKey);
    }
    if (appConfig.videoProvider) updateEnvVar('VIDEO_PROVIDER', appConfig.videoProvider);
    if (appConfig.falModel) updateEnvVar('FAL_MODEL', appConfig.falModel);
    if (appConfig.falRestyleModel) updateEnvVar('FAL_RESTYLE_MODEL', appConfig.falRestyleModel);
    if (appConfig.assetGenModel) updateEnvVar('ASSET_GEN_MODEL', appConfig.assetGenModel);
    if (appConfig.harmonizeModel) updateEnvVar('HARMONIZE_MODEL', appConfig.harmonizeModel);
    if (appConfig.elevenLabsApiKey) updateEnvVar('ELEVENLABS_API_KEY', appConfig.elevenLabsApiKey);
    if (appConfig.klingAccessKey) updateEnvVar('KLING_ACCESS_KEY', appConfig.klingAccessKey);
    if (appConfig.klingSecretKey) updateEnvVar('KLING_SECRET_KEY', appConfig.klingSecretKey);
    fs.writeFileSync(envPath, envContent, 'utf-8');
  } catch (e) {
    console.warn('Could not sync .env:', e.message);
  }

  res.json({ success: true, message: 'Settings saved successfully' });
});

// Upload Visual Reference Image (Sole source of truth for style) & Generate Style Brief
app.post('/api/upload-style-image', styleUpload.single('styleImage'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const relativeUrl = `/storage/uploads/${req.file.filename}`;
  const filePath = req.file.path;

  let styleBrief = null;
  let styleBible = null;
  try {
    const briefRes = await generateStyleBrief({
      imagePath: filePath,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey
    });
    styleBrief = briefRes.styleBrief;
    styleBible = briefRes.styleBible;
  } catch (e) {
    console.warn('Style brief extraction notice:', e.message);
  }

  const project = getProject();
  project.visualReference = {
    imageUrl: relativeUrl,
    filename: req.file.filename,
    styleBrief: styleBrief || project.visualReference?.styleBrief || '',
    styleBible: styleBible || project.visualReference?.styleBible || {
      palette: ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'],
      lighting: 'Volumetric neon rim lighting, high-contrast chiaroscuro',
      medium: 'Stylized Digital Painting & Cyberpunk Photorealism',
      grain: '35mm Anamorphic Film Grain',
      cameraFeel: 'Cinematic Widescreen 2.39:1'
    },
    updatedAt: Date.now()
  };
  saveProject(project);

  res.json({
    success: true,
    imageUrl: relativeUrl,
    filename: req.file.filename,
    styleBrief: project.visualReference.styleBrief,
    styleBible: project.visualReference.styleBible
  });
});

// Update or re-analyze Style Brief from Visual Style Anchor
app.post('/api/generate-style-brief', async (req, res) => {
  try {
    const project = getProject();
    let targetPath = null;
    if (project.visualReference?.filename) {
      targetPath = path.join(UPLOADS_DIR, project.visualReference.filename);
    }
    if (!targetPath || !fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'No visual reference image found to analyze.' });
    }

    const briefRes = await generateStyleBrief({
      imagePath: targetPath,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey
    });

    project.visualReference = project.visualReference || {};
    project.visualReference.styleBrief = briefRes.styleBrief;
    if (briefRes.styleBible) {
      project.visualReference.styleBible = briefRes.styleBible;
    }
    project.visualReference.updatedAt = Date.now();
    saveProject(project);

    res.json({
      success: true,
      styleBrief: briefRes.styleBrief,
      styleBible: project.visualReference.styleBible
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Style Presets are deprecated: Visual Style Anchor AI Deconstruction is enforced project-wide
app.get('/api/style-presets', (req, res) => {
  res.status(410).json({ error: 'Curated style presets have been deprecated in favor of project-wide Visual Style Anchor AI Deconstruction.' });
});

app.post('/api/style-presets/:presetKey/apply', (req, res) => {
  res.status(410).json({ error: 'Curated style presets have been deprecated in favor of project-wide Visual Style Anchor AI Deconstruction.' });
});

// Update manual Style Bible parameters and brief
app.post('/api/style-anchor/update', (req, res) => {
  const { styleBrief, styleBible } = req.body;
  const project = getProject();
  project.visualReference = project.visualReference || {};
  if (styleBrief !== undefined) project.visualReference.styleBrief = styleBrief;
  if (styleBible) {
    project.visualReference.styleBible = {
      ...(project.visualReference.styleBible || {}),
      ...styleBible
    };
  }
  project.visualReference.updatedAt = Date.now();
  saveProject(project);

  res.json({ success: true, visualReference: project.visualReference });
});

// Video Ingestion: Upload a single video to break down into storyboard
app.post('/api/ingest-video', upload.single('inputVideo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
  const videoPath = req.file.path;
  const duration = await getVideoDuration(videoPath);
  res.json({
    success: true,
    filename: req.file.filename,
    filePath: videoPath,
    url: `/storage/uploads/${req.file.filename}`,
    duration
  });
});

// Dual Video Upload Ingestion: Upload both Spatial Previs & True Color videos simultaneously
app.post('/api/ingest-dual-videos', upload.fields([
  { name: 'spatialVideo', maxCount: 1 },
  { name: 'colorVideo', maxCount: 1 },
  { name: 'dualVideos', maxCount: 2 }
]), async (req, res) => {
  try {
    let spatialFile = req.files?.spatialVideo?.[0] || null;
    let colorFile = req.files?.colorVideo?.[0] || null;

    if (!spatialFile && req.files?.dualVideos && req.files.dualVideos.length >= 2) {
      const v1 = req.files.dualVideos[0];
      const v2 = req.files.dualVideos[1];
      const lower1 = v1.originalname.toLowerCase();
      const lower2 = v2.originalname.toLowerCase();

      if (lower1.includes('movie') || lower1.includes('previs') || lower1.includes('playblast') || lower1.includes('spatial')) {
        spatialFile = v1;
        colorFile = v2;
      } else if (lower2.includes('movie') || lower2.includes('previs') || lower2.includes('playblast') || lower2.includes('spatial')) {
        spatialFile = v2;
        colorFile = v1;
      } else {
        spatialFile = v1;
        colorFile = v2;
      }
    }

    if (!spatialFile || !colorFile) {
      return res.status(400).json({ error: 'Please provide both Spatial Previs and True Color video files.' });
    }

    const spatialDuration = await getVideoDuration(spatialFile.path);
    const colorDuration = await getVideoDuration(colorFile.path);

    const project = getProject();
    project.ingestedVideo = {
      filename: spatialFile.filename,
      filePath: spatialFile.path,
      url: `/storage/uploads/${spatialFile.filename}`,
      originalFilename: spatialFile.originalname,
      duration: spatialDuration,
      userDescription: req.body.userDescription || project.ingestedVideo?.userDescription || ''
    };

    project.companionVideo = {
      filename: colorFile.filename,
      filePath: colorFile.path,
      url: `/storage/uploads/${colorFile.filename}`,
      originalFilename: colorFile.originalname,
      duration: colorDuration
    };

    // Auto-analyze and deconstruct both videos into synchronized shots
    let extractionOptions = {};
    if (req.body.extractionOptions) {
      try {
        extractionOptions = typeof req.body.extractionOptions === 'string' ? JSON.parse(req.body.extractionOptions) : req.body.extractionOptions;
      } catch (e) {}
    }

    const analysisResult = await analyzeAndDeconstructVideo({
      videoPath: spatialFile.path,
      colorVideoPath: colorFile.path,
      userDescription: project.ingestedVideo.userDescription,
      keyframesDir: KEYFRAMES_DIR,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey,
      options: extractionOptions
    });

    const storyboardShots = Array.isArray(analysisResult) ? analysisResult : (analysisResult.storyboardShots || []);
    const analysisSummary = analysisResult.analysisSummary || null;
    const detectedPacing = analysisResult.detectedPacing || null;

    project.storyboard = storyboardShots;
    project.ingestedVideo.analysisSummary = analysisSummary;
    project.ingestedVideo.detectedPacing = detectedPacing;
    saveProject(project);

    res.json({
      success: true,
      message: `Dual video construction complete: ${storyboardShots.length} synchronized shots created with Spatial Previs & True Color frames!`,
      storyboard: storyboardShots,
      spatialVideo: project.ingestedVideo,
      companionVideo: project.companionVideo,
      analysisSummary,
      detectedPacing
    });
  } catch (err) {
    console.error('Dual video upload ingestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dual Folder Ingestion: Ingest directly from local folder (e.g. C:\_PersonalProjects\FR_B\trunk\Unity6\FrontiersReach_CBG\Recordings)
app.post('/api/ingest-dual-folder', async (req, res) => {
  try {
    const defaultRecordingsDir = 'C:\\_PersonalProjects\\FR_B\\trunk\\Unity6\\FrontiersReach_CBG\\Recordings';
    const folderPath = (req.body.folderPath || defaultRecordingsDir).trim();
    const userDescription = req.body.userDescription || '';
    const extractionOptions = req.body.extractionOptions || {};

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: `Directory not found: "${folderPath}"` });
    }

    const dirEntries = fs.readdirSync(folderPath);
    const videoFiles = dirEntries.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ['.mp4', '.mov', '.webm', '.mkv'].includes(ext);
    });

    if (videoFiles.length < 2) {
      return res.status(400).json({
        error: `Found ${videoFiles.length} video(s) in "${folderPath}". Exactly 2 companion video recordings (Spatial Previs + True Color) are expected.`
      });
    }

    // Identify Spatial Previs vs True Color based on naming convention
    let spatialFilename = null;
    let colorFilename = null;

    for (const vf of videoFiles) {
      const lower = vf.toLowerCase();
      if (!spatialFilename && (lower.includes('movie') || lower.includes('previs') || lower.includes('playblast') || lower.includes('spatial') || lower.includes('blockout') || lower.includes('graybox'))) {
        spatialFilename = vf;
      } else if (!colorFilename && (lower.includes('drop') || lower.includes('pirate') || lower.includes('color') || lower.includes('shaded') || lower.includes('texture') || lower.includes('render'))) {
        colorFilename = vf;
      }
    }

    // If keywords didn't disambiguate, assign first to spatial and second to color
    if (!spatialFilename || !colorFilename) {
      if (!spatialFilename) spatialFilename = videoFiles[0];
      if (!colorFilename) colorFilename = videoFiles.find((f) => f !== spatialFilename) || videoFiles[1];
    }

    const srcSpatial = path.join(folderPath, spatialFilename);
    const srcColor = path.join(folderPath, colorFilename);

    const destSpatialFilename = `spatial_${Date.now()}_${spatialFilename}`;
    const destColorFilename = `color_${Date.now()}_${colorFilename}`;
    const destSpatial = path.join(UPLOADS_DIR, destSpatialFilename);
    const destColor = path.join(UPLOADS_DIR, destColorFilename);

    fs.copyFileSync(srcSpatial, destSpatial);
    fs.copyFileSync(srcColor, destColor);

    const spatialDuration = await getVideoDuration(destSpatial);
    const colorDuration = await getVideoDuration(destColor);

    const project = getProject();
    project.ingestedVideo = {
      filename: destSpatialFilename,
      filePath: destSpatial,
      url: `/storage/uploads/${destSpatialFilename}`,
      originalFilename: spatialFilename,
      duration: spatialDuration,
      userDescription: userDescription || project.ingestedVideo?.userDescription || 'A fleet of 3 pirate raiding vessels hold in orbit over the small moon Frontiers Reach as they drop rickety improvised landing craft made of heat shields with some thrusters and seats attached to them. The camera chasing the landing craft as they descend through the atmosphere through a storm of flak fire.'
    };

    project.companionVideo = {
      filename: destColorFilename,
      filePath: destColor,
      url: `/storage/uploads/${destColorFilename}`,
      originalFilename: colorFilename,
      duration: colorDuration
    };

    // Run dual analysis & keyframe extraction across both recordings
    const analysisResult = await analyzeAndDeconstructVideo({
      videoPath: destSpatial,
      colorVideoPath: destColor,
      userDescription: project.ingestedVideo.userDescription,
      keyframesDir: KEYFRAMES_DIR,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey,
      options: extractionOptions
    });

    const storyboardShots = Array.isArray(analysisResult) ? analysisResult : (analysisResult.storyboardShots || []);
    const analysisSummary = analysisResult.analysisSummary || null;
    const detectedPacing = analysisResult.detectedPacing || null;

    project.storyboard = storyboardShots;
    project.ingestedVideo.analysisSummary = analysisSummary;
    project.ingestedVideo.detectedPacing = detectedPacing;
    saveProject(project);

    res.json({
      success: true,
      message: `Successfully ingested and synchronized ${spatialFilename} (Spatial Previs) & ${colorFilename} (True Color) into ${storyboardShots.length} storyboard shots!`,
      storyboard: storyboardShots,
      spatialVideo: project.ingestedVideo,
      companionVideo: project.companionVideo,
      analysisSummary,
      detectedPacing
    });
  } catch (err) {
    console.error('Dual folder ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

// End-to-End Analysis: Generates High-Level Context from Spatial Previs + True Color + User Description
app.post('/api/storyboard/analyze-context', async (req, res) => {
  try {
    const { videoPath, filename, colorVideoPath, userDescription } = req.body;
    const project = getProject();
    let targetPath = videoPath || project.ingestedVideo?.filePath;
    if (!targetPath || !fs.existsSync(targetPath)) {
      targetPath = path.join(UPLOADS_DIR, filename || '');
    }
    if (!fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'Spatial Previs Video file not found' });
    }

    let targetColorPath = colorVideoPath || project.companionVideo?.filePath || null;
    if (targetColorPath && !fs.existsSync(targetColorPath)) {
      targetColorPath = null;
    }

    if (!targetColorPath) {
      return res.status(400).json({
        error: 'End-to-End Analysis requires BOTH Spatial Previs Video and True Color Video. Please load both recordings before running analysis.'
      });
    }

    const allRefs = getAllReferences(project);
    const descToUse = userDescription !== undefined ? userDescription : (project.ingestedVideo?.userDescription || '');

    const result = await generateHighLevelContext({
      videoPath: targetPath,
      colorVideoPath: targetColorPath,
      userDescription: descToUse,
      keyframesDir: KEYFRAMES_DIR,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey,
      options: { referenceAssets: allRefs }
    });

    const highLevelContext = result.highLevelContext || '';
    const detectedPacing = result.detectedPacing || 'Cinematic Pace';

    project.highLevelContext = highLevelContext;
    if (!project.ingestedVideo) project.ingestedVideo = {};
    project.ingestedVideo.filePath = targetPath;
    project.ingestedVideo.filename = path.basename(targetPath);
    project.ingestedVideo.url = `/storage/uploads/${path.basename(targetPath)}`;
    project.ingestedVideo.userDescription = descToUse;
    project.ingestedVideo.highLevelContext = highLevelContext;
    project.ingestedVideo.analysisSummary = highLevelContext;
    project.ingestedVideo.detectedPacing = detectedPacing;
    saveProject(project);

    res.json({
      success: true,
      highLevelContext,
      detectedPacing
    });
  } catch (err) {
    console.error('End-to-End Context Analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update or manually edit High-Level Context
app.post('/api/storyboard/high-level-context', (req, res) => {
  const { highLevelContext } = req.body;
  const project = getProject();
  project.highLevelContext = highLevelContext || '';
  if (!project.ingestedVideo) project.ingestedVideo = {};
  project.ingestedVideo.highLevelContext = highLevelContext || '';
  project.ingestedVideo.analysisSummary = highLevelContext || '';
  saveProject(project);
  res.json({ success: true, highLevelContext: project.highLevelContext });
});

// AI Shot Analysis: Deconstructs video into optimal storyboard shots informed by High Level Context
app.post('/api/storyboard/ai-shot-analysis', async (req, res) => {
  try {
    const { videoPath, filename, colorVideoPath, highLevelContext, userDescription, extractionOptions } = req.body;
    const project = getProject();
    let targetPath = videoPath || project.ingestedVideo?.filePath;
    if (!targetPath || !fs.existsSync(targetPath)) {
      targetPath = path.join(UPLOADS_DIR, filename || '');
    }
    if (!fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'Spatial Previs Video file not found' });
    }

    let targetColorPath = colorVideoPath || project.companionVideo?.filePath || null;
    if (targetColorPath && !fs.existsSync(targetColorPath)) {
      targetColorPath = null;
    }

    const allRefs = getAllReferences(project);
    const contextToUse = highLevelContext || project.highLevelContext || project.ingestedVideo?.highLevelContext || '';
    const descToUse = userDescription !== undefined ? userDescription : (project.ingestedVideo?.userDescription || '');

    const analysisResult = await analyzeAndDeconstructVideo({
      videoPath: targetPath,
      colorVideoPath: targetColorPath,
      userDescription: descToUse,
      highLevelContext: contextToUse,
      keyframesDir: KEYFRAMES_DIR,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey,
      options: { ...(extractionOptions || {}), referenceAssets: allRefs }
    });

    const storyboardShots = Array.isArray(analysisResult) ? analysisResult : (analysisResult.storyboardShots || []);
    const analysisSummary = analysisResult.analysisSummary || contextToUse || null;
    const detectedPacing = analysisResult.detectedPacing || 'Cinematic Pace';

    project.storyboard = storyboardShots;
    if (!project.ingestedVideo) project.ingestedVideo = {};
    project.ingestedVideo.filePath = targetPath;
    project.ingestedVideo.filename = path.basename(targetPath);
    project.ingestedVideo.url = `/storage/uploads/${path.basename(targetPath)}`;
    project.ingestedVideo.userDescription = descToUse;
    project.ingestedVideo.highLevelContext = contextToUse || analysisSummary;
    project.ingestedVideo.analysisSummary = analysisSummary;
    project.ingestedVideo.detectedPacing = detectedPacing;
    saveProject(project);

    res.json({
      success: true,
      storyboard: storyboardShots,
      analysisSummary,
      detectedPacing
    });
  } catch (err) {
    console.error('AI Shot Analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility alias for /api/analyze-video
app.post('/api/analyze-video', async (req, res) => {
  try {
    const { videoPath, filename, colorVideoPath, highLevelContext, userDescription, extractionOptions } = req.body;
    let targetPath = videoPath;
    if (!targetPath || !fs.existsSync(targetPath)) {
      targetPath = path.join(UPLOADS_DIR, filename || '');
    }
    if (!fs.existsSync(targetPath)) {
      return res.status(400).json({ error: 'Video file not found' });
    }

    const project = getProject();
    let targetColorPath = colorVideoPath || project.companionVideo?.filePath || null;
    if (targetColorPath && !fs.existsSync(targetColorPath)) {
      targetColorPath = null;
    }

    const allRefs = getAllReferences(project);
    const contextToUse = highLevelContext || project.highLevelContext || project.ingestedVideo?.highLevelContext || '';
    const descToUse = userDescription !== undefined ? userDescription : (project.ingestedVideo?.userDescription || '');

    const analysisResult = await analyzeAndDeconstructVideo({
      videoPath: targetPath,
      colorVideoPath: targetColorPath,
      userDescription: descToUse,
      highLevelContext: contextToUse,
      keyframesDir: KEYFRAMES_DIR,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey,
      options: { ...(extractionOptions || {}), referenceAssets: allRefs }
    });

    const storyboardShots = Array.isArray(analysisResult) ? analysisResult : (analysisResult.storyboardShots || []);
    const analysisSummary = analysisResult.analysisSummary || contextToUse || null;
    const detectedPacing = analysisResult.detectedPacing || 'Cinematic Pace';

    project.storyboard = storyboardShots;
    if (!project.ingestedVideo) project.ingestedVideo = {};
    project.ingestedVideo.filePath = targetPath;
    project.ingestedVideo.filename = path.basename(targetPath);
    project.ingestedVideo.url = `/storage/uploads/${path.basename(targetPath)}`;
    project.ingestedVideo.userDescription = descToUse;
    project.ingestedVideo.highLevelContext = contextToUse || analysisSummary;
    project.ingestedVideo.analysisSummary = analysisSummary;
    project.ingestedVideo.detectedPacing = detectedPacing;
    saveProject(project);

    res.json({
      success: true,
      storyboard: storyboardShots,
      analysisSummary,
      detectedPacing
    });
  } catch (err) {
    console.error('Video analysis error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user manual video description
app.post('/api/ingested-video/description', (req, res) => {
  const { userDescription } = req.body;
  const project = getProject();
  if (!project.ingestedVideo) {
    project.ingestedVideo = {};
  }
  project.ingestedVideo.userDescription = userDescription || '';
  saveProject(project);
  res.json({ success: true, userDescription: project.ingestedVideo.userDescription });
});

// Upload custom keyframe images manually to create storyboard shots
app.post('/api/upload-keyframes', keyframeUpload.array('keyframeImages', 24), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No images uploaded' });
  const project = getProject();
  project.storyboard = project.storyboard || [];
  const startNum = project.storyboard.length + 1;

  const newShots = req.files.map((file, idx) => {
    const relativeUrl = `/storage/keyframes/${file.filename}`;
    const shotNum = startNum + idx;
    return {
      id: `sb_custom_${Date.now()}_${idx + 1}`,
      shotNumber: shotNum,
      title: `Shot ${shotNum}: ${file.originalname.replace(/\.[^/.]+$/, '')}`,
      startTime: (shotNum - 1) * 4,
      endTime: shotNum * 4,
      duration: 4,
      keyframeUrl: relativeUrl,
      keyframePath: file.path,
      description: `Cinematic shot capturing ${file.originalname.replace(/\.[^/.]+$/, '')}.`,
      cameraMotion: 'Dolly Forward',
      status: 'pending',
      approved: false,
      generatedClip: null
    };
  });

  project.storyboard.push(...newShots);
  saveProject(project);
  res.json({ success: true, newShots, storyboard: project.storyboard });
});

// Replace keyframe for a specific shot
app.post('/api/storyboard/:shotId/replace-keyframe', keyframeUpload.single('keyframeImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const { shotId } = req.params;
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  const targetFrame = req.body?.targetFrame || 'start';
  const fileUrl = `/storage/keyframes/${req.file.filename}`;
  if (targetFrame === 'end') {
    shot.endKeyframeUrl = fileUrl;
    shot.endKeyframePath = req.file.path;
  } else {
    shot.keyframeUrl = fileUrl;
    shot.keyframePath = req.file.path;
  }
  saveProject(project);
  res.json({ success: true, shot, targetFrame, keyframeUrl: fileUrl });
});

// Add a blank custom shot to storyboard
app.post('/api/storyboard/add-custom-shot', (req, res) => {
  const project = getProject();
  project.storyboard = project.storyboard || [];
  const shotNum = project.storyboard.length + 1;
  const newShot = {
    id: `sb_custom_${Date.now()}`,
    shotNumber: shotNum,
    title: req.body.title || `Shot ${shotNum}: Custom Scene`,
    startTime: (shotNum - 1) * 4,
    endTime: shotNum * 4,
    duration: req.body.duration || 4,
    keyframeUrl: req.body.keyframeUrl || null,
    keyframePath: req.body.keyframePath || null,
    description: req.body.description || 'Describe the visual action, subjects, and camera movements...',
    cameraMotion: req.body.cameraMotion || 'Dolly Forward',
    spatialContinuity: req.body.spatialContinuity || {
      subjectScreenPosition: shotNum % 2 === 0 ? 'Screen-Left' : 'Screen-Right',
      facingDirection: shotNum % 2 === 0 ? 'Screen-Right' : 'Screen-Left',
      eyelineMatch: shotNum % 2 === 0 ? 'Looking Screen-Right' : 'Looking Screen-Left',
      cameraAngle: shotNum === 1 ? 'Wide Establishing 35mm' : (shotNum % 2 === 0 ? 'Medium 50mm' : 'Reverse OTS 85mm'),
      lightingOrigin: 'Balanced Key Lighting (5600K)',
      rule180Vector: 'East Axis Continuity'
    },
    status: 'pending',
    approved: false,
    generatedClip: null
  };
  project.storyboard.push(newShot);
  saveProject(project);
  res.json({ success: true, shot: newShot, storyboard: project.storyboard });
});

// Add a range-defined shot with extracted Start & End keyframes (Spatial Previs + True Color)
app.post('/api/storyboard/add-range', async (req, res) => {
  try {
    const project = getProject();
    project.storyboard = project.storyboard || [];
    const shotNum = project.storyboard.length + 1;
    
    let { startTime = 0, endTime = 4, title, description, cameraMotion } = req.body;
    startTime = Math.max(0, Number(startTime) || 0);
    endTime = Math.max(startTime + 0.5, Number(endTime) || (startTime + 4));
    const duration = +(endTime - startTime).toFixed(2);
    
    let keyframeUrl = null;
    let keyframePath = null;
    let endKeyframeUrl = null;
    let endKeyframePath = null;
    let colorFrameUrl = null;
    let colorFramePath = null;
    let endColorFrameUrl = null;
    let endColorFramePath = null;

    const spatialVideo = project.ingestedVideo?.filePath;
    const companionVideo = project.companionVideo?.filePath;

    // 1. Extract Start & End Spatial Previs Frames
    if (spatialVideo && fs.existsSync(spatialVideo)) {
      const startKf = await extractSingleKeyframe(spatialVideo, KEYFRAMES_DIR, startTime, `${shotNum}_start`);
      if (startKf) {
        keyframeUrl = startKf.frameUrl;
        keyframePath = startKf.framePath;
      }
      const endKf = await extractSingleKeyframe(spatialVideo, KEYFRAMES_DIR, Math.max(0, endTime - 0.05), `${shotNum}_end`);
      if (endKf) {
        endKeyframeUrl = endKf.frameUrl;
        endKeyframePath = endKf.framePath;
      }
    }

    // 2. Extract Start & End True Color Companion Frames (if available)
    if (companionVideo && fs.existsSync(companionVideo)) {
      const startColor = await extractSingleKeyframe(companionVideo, KEYFRAMES_DIR, startTime, `color_${shotNum}_start`);
      if (startColor) {
        colorFrameUrl = startColor.frameUrl;
        colorFramePath = startColor.framePath;
      }
      const endColor = await extractSingleKeyframe(companionVideo, KEYFRAMES_DIR, Math.max(0, endTime - 0.05), `color_${shotNum}_end`);
      if (endColor) {
        endColorFrameUrl = endColor.frameUrl;
        endColorFramePath = endColor.framePath;
      }
    }

    // 3. Analyze Shot between In & Out markers using High-Level Context
    let motionDelta = null;
    try {
      motionDelta = await analyzeShotMotionDelta({
        startFramePath: keyframePath,
        endFramePath: endKeyframePath,
        colorStartFramePath: colorFramePath,
        colorEndFramePath: endColorFramePath,
        duration,
        shotNumber: shotNum,
        userDescription: description || '',
        highLevelContext: req.body.highLevelContext || project.highLevelContext || project.ingestedVideo?.highLevelContext || '',
        falApiKey: appConfig.falApiKey,
        openaiApiKey: appConfig.openaiApiKey,
        geminiApiKey: appConfig.geminiApiKey
      });
    } catch (err) {
      console.warn('[add-range] Shot delta analysis warning:', err.message);
    }

    const finalTitle = title || motionDelta?.title || `Shot ${shotNum} (${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s)`;
    const finalDesc = description || motionDelta?.description || `Action progression from ${startTime.toFixed(1)}s to ${endTime.toFixed(1)}s.`;
    const finalMotion = (cameraMotion && cameraMotion !== 'Dolly Forward') ? cameraMotion : (motionDelta?.cameraMotion || cameraMotion || 'Dolly Forward');
    const finalSpatial = motionDelta?.spatialContinuity || {
      subjectScreenPosition: shotNum % 2 === 0 ? 'Screen-Left' : 'Screen-Right',
      facingDirection: shotNum % 2 === 0 ? 'Screen-Right' : 'Screen-Left',
      eyelineMatch: shotNum % 2 === 0 ? 'Looking Screen-Right' : 'Looking Screen-Left',
      cameraAngle: shotNum === 1 ? 'Wide Establishing 35mm' : (shotNum % 2 === 0 ? 'Medium 50mm' : 'Reverse OTS 85mm'),
      lightingOrigin: 'Balanced Key Lighting (5600K)',
      rule180Vector: 'East Axis Continuity'
    };

    // Auto-match Consistent Assets (Characters, Props, Places)
    const allRefs = getAllReferences(project);
    const textToMatch = `${finalTitle} ${finalDesc} ${(motionDelta?.matchedAssetKeywords || []).join(' ')}`.toLowerCase();
    const autoMatchedRefs = allRefs.filter(ref => {
      const name = (ref.name || '').toLowerCase();
      const tag = (ref.tag || '').toLowerCase().replace('@', '').replace(/_/g, ' ');
      const desc = (ref.description || '').toLowerCase();
      if (name && textToMatch.includes(name)) return true;
      if (tag && textToMatch.includes(tag)) return true;
      if (ref.category === 'props') {
        if ((name.includes('raiding vessel') || desc.includes('raiding vessel') || desc.includes('warship')) && (textToMatch.includes('raiding') || textToMatch.includes('vessel') || textToMatch.includes('fleet') || textToMatch.includes('pirate'))) return true;
        if ((name.includes('landing craft') || desc.includes('landing craft')) && (textToMatch.includes('landing craft') || textToMatch.includes('craft') || textToMatch.includes('heat shield'))) return true;
        if ((name.includes('frigate') || desc.includes('frigate')) && textToMatch.includes('frigate')) return true;
      }
      if (ref.category === 'places') {
        if (textToMatch.includes('orbit') && (name.includes('orbit') || desc.includes('orbit'))) return true;
        if (textToMatch.includes('surface') && (name.includes('surface') || desc.includes('surface'))) return true;
        if ((textToMatch.includes('atmosphere') || textToMatch.includes('altitude') || textToMatch.includes('clouds')) && (name.includes('altitude') || desc.includes('altitude'))) return true;
      }
      return false;
    });

    const newShot = {
      id: `sb_range_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      shotNumber: shotNum,
      title: finalTitle,
      startTime,
      endTime,
      duration,
      keyframeUrl,
      keyframePath,
      endKeyframeUrl,
      endKeyframePath,
      colorFrameUrl,
      colorFramePath,
      endColorFrameUrl,
      endColorFramePath,
      description: finalDesc,
      cameraMotion: finalMotion,
      spatialContinuity: finalSpatial,
      assignedReferences: autoMatchedRefs.map(r => r.id),
      status: 'pending',
      approved: false,
      generatedClip: null
    };

    project.storyboard.push(newShot);
    saveProject(project);
    res.json({ success: true, shot: newShot, storyboard: project.storyboard });
  } catch (err) {
    console.error('Add range shot error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Start and End frame range for an existing shot
app.post('/api/storyboard/:shotId/update-range', async (req, res) => {
  try {
    const { shotId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    let { startTime, endTime, reExtract = true } = req.body;
    if (startTime !== undefined) shot.startTime = Math.max(0, Number(startTime));
    if (endTime !== undefined) shot.endTime = Math.max(shot.startTime + 0.5, Number(endTime));
    shot.duration = +(shot.endTime - shot.startTime).toFixed(2);

    const spatialVideo = project.ingestedVideo?.filePath;
    const companionVideo = project.companionVideo?.filePath;

    if (reExtract && spatialVideo && fs.existsSync(spatialVideo)) {
      const startKf = await extractSingleKeyframe(spatialVideo, KEYFRAMES_DIR, shot.startTime, `${shot.shotNumber}_start`);
      if (startKf) {
        shot.keyframeUrl = startKf.frameUrl;
        shot.keyframePath = startKf.framePath;
      }
      const endKf = await extractSingleKeyframe(spatialVideo, KEYFRAMES_DIR, Math.max(0, shot.endTime - 0.05), `${shot.shotNumber}_end`);
      if (endKf) {
        shot.endKeyframeUrl = endKf.frameUrl;
        shot.endKeyframePath = endKf.framePath;
      }
    }

    if (reExtract && companionVideo && fs.existsSync(companionVideo)) {
      const startColor = await extractSingleKeyframe(companionVideo, KEYFRAMES_DIR, shot.startTime, `color_${shot.shotNumber}_start`);
      if (startColor) {
        shot.colorFrameUrl = startColor.frameUrl;
        shot.colorFramePath = startColor.framePath;
      }
      const endColor = await extractSingleKeyframe(companionVideo, KEYFRAMES_DIR, Math.max(0, shot.endTime - 0.05), `color_${shot.shotNumber}_end`);
      if (endColor) {
        shot.endColorFrameUrl = endColor.frameUrl;
        shot.endColorFramePath = endColor.framePath;
      }
    }

    saveProject(project);
    res.json({ success: true, shot });
  } catch (err) {
    console.error('Update shot range error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Run Targeted Motion & Spatial Delta Analysis on a shot
app.post('/api/storyboard/:shotId/analyze-motion', async (req, res) => {
  try {
    const { shotId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const falApiKey = process.env.FAL_KEY || process.env.FAL_API_KEY || '';
    const openaiApiKey = process.env.OPENAI_API_KEY || '';

    const deltaResult = await analyzeShotMotionDelta({
      startFramePath: shot.keyframePath,
      endFramePath: shot.endKeyframePath,
      colorStartFramePath: shot.colorFramePath,
      colorEndFramePath: shot.endColorFramePath,
      duration: shot.duration,
      shotNumber: shot.shotNumber,
      userDescription: project.ingestedVideo?.userDescription || shot.description || '',
      falApiKey,
      openaiApiKey
    });

    if (deltaResult.title) shot.title = deltaResult.title;
    if (deltaResult.description) shot.description = deltaResult.description;
    if (deltaResult.cameraMotion) shot.cameraMotion = deltaResult.cameraMotion;
    if (deltaResult.spatialContinuity) {
      shot.spatialContinuity = {
        ...shot.spatialContinuity,
        ...deltaResult.spatialContinuity
      };
    }

    saveProject(project);
    res.json({ success: true, shot, deltaResult });
  } catch (err) {
    console.error('Analyze shot motion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Spatial Continuity Ledger for a specific shot
app.post('/api/storyboard/:shotId/spatial', (req, res) => {
  try {
    const { shotId } = req.params;
    const { spatialContinuity } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    shot.spatialContinuity = {
      ...(shot.spatialContinuity || {}),
      ...(spatialContinuity || {})
    };
    if (spatialContinuity?.cameraTrajectory) {
      shot.cameraMotion = spatialContinuity.cameraTrajectory;
    }
    saveProject(project);

    res.json({ success: true, shot, spatialContinuity: shot.spatialContinuity });
  } catch (err) {
    console.error('Update spatial continuity error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Image-to-Description: AI vision prompt synthesis combining Visual Reference with Keyframe
// Save Director Grease Pen Markup for Start or End frame
app.post('/api/storyboard/:shotId/markup', (req, res) => {
  try {
    const { shotId } = req.params;
    const { frameType = 'start', markupDataUrl, flattenedDataUrl } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const timestamp = Date.now();
    const prefix = frameType === 'end' ? 'end' : 'start';

    if (markupDataUrl && markupDataUrl.startsWith('data:image/')) {
      const markupFilename = `markup_${shot.id}_${prefix}_${timestamp}.png`;
      const markupPath = path.join(KEYFRAMES_DIR, markupFilename);
      const b64 = markupDataUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(markupPath, Buffer.from(b64, 'base64'));
      shot[`${prefix}MarkupUrl`] = `/storage/keyframes/${markupFilename}`;
      shot[`${prefix}MarkupPath`] = markupPath;
    }

    if (flattenedDataUrl && flattenedDataUrl.startsWith('data:image/')) {
      const flattenedFilename = `flattened_markup_${shot.id}_${prefix}_${timestamp}.png`;
      const flattenedPath = path.join(KEYFRAMES_DIR, flattenedFilename);
      const b64 = flattenedDataUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(flattenedPath, Buffer.from(b64, 'base64'));
      shot[`${prefix}FlattenedMarkupUrl`] = `/storage/keyframes/${flattenedFilename}`;
      shot[`${prefix}FlattenedMarkupPath`] = flattenedPath;
    }

    saveProject(project);
    res.json({ success: true, shot });
  } catch (err) {
    console.error('[Markup API] Error saving markup:', err);
    res.status(500).json({ error: err.message });
  }
});

// Clear Director Grease Pen Markup for Start or End frame
app.delete('/api/storyboard/:shotId/markup/:frameType', (req, res) => {
  try {
    const { shotId, frameType } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const prefix = frameType === 'end' ? 'end' : 'start';
    delete shot[`${prefix}MarkupUrl`];
    delete shot[`${prefix}MarkupPath`];
    delete shot[`${prefix}FlattenedMarkupUrl`];
    delete shot[`${prefix}FlattenedMarkupPath`];

    saveProject(project);
    res.json({ success: true, shot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enhance Shot Description & Action with Spatial Previs Grease Pen Markup
app.post('/api/storyboard/:shotId/enhance-with-markup', async (req, res) => {
  try {
    const { shotId } = req.params;
    const { currentDescription, cameraMotion } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    // Resolve start and end frame paths (prefer flattened markup layers if available)
    let startFramePath = shot.startFlattenedMarkupPath;
    if (!startFramePath || !fs.existsSync(startFramePath)) {
      startFramePath = shot.keyframePath;
      if (!startFramePath && shot.keyframeUrl) {
        startFramePath = path.join(KEYFRAMES_DIR, path.basename(shot.keyframeUrl));
      }
    }

    let endFramePath = shot.endFlattenedMarkupPath;
    if (!endFramePath || !fs.existsSync(endFramePath)) {
      endFramePath = shot.endKeyframePath;
      if (!endFramePath && shot.endKeyframeUrl) {
        endFramePath = path.join(KEYFRAMES_DIR, path.basename(shot.endKeyframeUrl));
      }
    }

    const highLevelContext = project.highLevelContext || project.ingestedVideo?.highLevelContext || '';
    const desc = (currentDescription !== undefined ? currentDescription : shot.description) || '';
    const motion = cameraMotion || shot.cameraMotion || 'Dolly Forward';

    const result = await enhancePromptWithSpatialMarkup({
      startFramePath,
      endFramePath,
      startMarkupPath: shot.startFlattenedMarkupPath,
      endMarkupPath: shot.endFlattenedMarkupPath,
      currentDescription: desc,
      cameraMotion: motion,
      shotNumber: shot.shotNumber || 1,
      falApiKey: appConfig.falApiKey || process.env.FAL_KEY || '',
      openaiApiKey: appConfig.openaiApiKey || process.env.OPENAI_API_KEY || '',
      geminiApiKey: appConfig.geminiApiKey || process.env.GEMINI_API_KEY || ''
    });

    if (result && result.description) {
      shot.description = result.description;
      if (result.cameraMotion) shot.cameraMotion = result.cameraMotion;
      if (result.spatialContinuity) shot.spatialContinuity = result.spatialContinuity;
      saveProject(project);
      return res.json({
        success: true,
        description: shot.description,
        cameraMotion: shot.cameraMotion,
        markupInterpretation: result.markupInterpretation,
        shot
      });
    }

    throw new Error('Failed to synthesize markup into unified prompt');
  } catch (err) {
    console.error('[Enhance Markup API] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storyboard/:shotId/ai-describe', async (req, res) => {
  try {
    const { shotId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    let refPath = null;
    if (project.visualReference?.filename) {
      refPath = path.join(UPLOADS_DIR, project.visualReference.filename);
    }

    let kfPath = shot.keyframePath;
    if (!kfPath && shot.keyframeUrl) {
      const fn = path.basename(shot.keyframeUrl);
      const possible = path.join(KEYFRAMES_DIR, fn);
      if (fs.existsSync(possible)) kfPath = possible;
    }

    const allRefs = getAllReferences(project);
    const assignedRefs = (shot.assignedReferences || [])
      .map(id => allRefs.find(r => r.id === id))
      .filter(Boolean);

    const aiResult = await generateImageToDescription({
      referenceImagePath: refPath,
      keyframeImagePath: kfPath,
      currentDescription: req.body.currentDescription || shot.description,
      assignedReferences: assignedRefs,
      falApiKey: appConfig.falApiKey,
      openaiApiKey: appConfig.openaiApiKey,
      geminiApiKey: appConfig.geminiApiKey
    });

    shot.description = aiResult.description;
    if (aiResult.cameraMotion) {
      shot.cameraMotion = aiResult.cameraMotion;
    }
    shot.styleNotes = aiResult.styleNotes;
    saveProject(project);

    res.json({
      success: true,
      shot,
      aiResult
    });
  } catch (err) {
    console.error('AI Describe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Styled Clip for a specific Storyboard Shot
app.post('/api/generate-storyboard-clip', async (req, res) => {
  req.setTimeout(1200000); // 20 minutes for diffusion video synthesis
  res.setTimeout(1200000);
  try {
    const { shotId, description, cameraMotion, duration, model, audioMode } = req.body;
    const project = getProject();

    const shotIndex = (project.storyboard || []).findIndex((s) => s.id === shotId);
    if (shotIndex === -1) {
      return res.status(404).json({ error: 'Storyboard shot not found' });
    }

    const shot = project.storyboard[shotIndex];
    const visualRefUrl = project.visualReference?.imageUrl || null;
    let visualRefPath = null;
    if (project.visualReference?.filename) {
      visualRefPath = path.join(UPLOADS_DIR, project.visualReference.filename);
    }

    // Resolve keyframePath: Prioritize Pass 1 Regened Keyframe over raw Source Ingested Keyframe
    let keyframePath = null;
    let keyframeUrl = null;
    let keyframeType = 'source';

    const preferSource = req.body.keyframePreference === 'source';

    if (!preferSource) {
      // 1. Prioritize styled / regened keyframe (Pass 1 restyle output)
      if (shot.styledKeyframePath && fs.existsSync(shot.styledKeyframePath)) {
        keyframePath = shot.styledKeyframePath;
        keyframeUrl = shot.styledKeyframeUrl;
        keyframeType = 'regened';
      } else if (shot.styledKeyframeUrl) {
        const fn = path.basename(shot.styledKeyframeUrl);
        const possiblePath = path.join(KEYFRAMES_DIR, fn);
        if (fs.existsSync(possiblePath)) {
          keyframePath = possiblePath;
          keyframeUrl = shot.styledKeyframeUrl;
          keyframeType = 'regened';
        }
      } else if (shot.compositeKeyframeUrl) {
        const fn = path.basename(shot.compositeKeyframeUrl);
        const possiblePath = path.join(KEYFRAMES_DIR, fn);
        if (fs.existsSync(possiblePath)) {
          keyframePath = possiblePath;
          keyframeUrl = shot.compositeKeyframeUrl;
          keyframeType = 'composite';
        }
      } else if (shot.stage2ImageUrl) {
        const fn = path.basename(shot.stage2ImageUrl);
        const possiblePath = path.join(KEYFRAMES_DIR, fn);
        if (fs.existsSync(possiblePath)) {
          keyframePath = possiblePath;
          keyframeUrl = shot.stage2ImageUrl;
          keyframeType = 'stage2';
        }
      }
    }

    // 2. Fallback to Source Ingested Keyframe if no Regened Keyframe exists or if source explicitly preferred
    if (!keyframePath) {
      if (shot.keyframePath && fs.existsSync(shot.keyframePath)) {
        keyframePath = shot.keyframePath;
        keyframeUrl = shot.keyframeUrl;
        keyframeType = 'source';
      } else if (shot.keyframeUrl) {
        const fn = path.basename(shot.keyframeUrl);
        const possiblePath = path.join(KEYFRAMES_DIR, fn);
        if (fs.existsSync(possiblePath)) {
          keyframePath = possiblePath;
          keyframeUrl = shot.keyframeUrl;
          keyframeType = 'source';
        }
      }
    }

    console.log(`[Animation Generation] Shot #${shot.shotNumber || shotIndex + 1} (${shot.title || 'Untitled'}): dispatching ${keyframeType.toUpperCase()} keyframe to animation model: ${keyframePath || 'none'} (${keyframeUrl || 'no url'})`);

    // Tail-to-head chaining from preceding shot's clip (only if explicitly requested or if current shot has no keyframe)
    let tailKeyframePath = null;
    const previousShot = shotIndex > 0 ? project.storyboard[shotIndex - 1] : null;
    if (req.body.useTailChaining && previousShot?.generatedClip) {
      let prevClipPath = previousShot.generatedClip.filePath;
      if (!prevClipPath || !fs.existsSync(prevClipPath)) {
        prevClipPath = path.join(CLIPS_DIR, previousShot.generatedClip.filename || path.basename(previousShot.generatedClip.url || ''));
      }
      if (fs.existsSync(prevClipPath)) {
        const extractedTail = await extractLastFrame(prevClipPath, KEYFRAMES_DIR, previousShot.shotNumber);
        if (extractedTail) {
          keyframePath = extractedTail.framePath;
          keyframeUrl = extractedTail.frameUrl;
          shot.keyframePath = extractedTail.framePath;
          shot.keyframeUrl = extractedTail.frameUrl;
          keyframeType = 'chained-tail';
        }
      }
    }

    // Dual-Keyframe Interpolation: Bind End Keyframe for Wan FLF2V / Kling image_tail if available
    if (!tailKeyframePath) {
      if (shot.styledEndKeyframePath && fs.existsSync(shot.styledEndKeyframePath)) {
        tailKeyframePath = shot.styledEndKeyframePath;
      } else if (shot.styledEndKeyframeUrl) {
        const fn = path.basename(shot.styledEndKeyframeUrl);
        const possiblePath = path.join(KEYFRAMES_DIR, fn);
        if (fs.existsSync(possiblePath)) tailKeyframePath = possiblePath;
      } else if (shot.compositeEndKeyframeUrl) {
        const fn = path.basename(shot.compositeEndKeyframeUrl);
        const possiblePath = path.join(KEYFRAMES_DIR, fn);
        if (fs.existsSync(possiblePath)) tailKeyframePath = possiblePath;
      } else if (shot.endColorFramePath && fs.existsSync(shot.endColorFramePath)) {
        tailKeyframePath = shot.endColorFramePath;
      } else if (shot.endKeyframePath && fs.existsSync(shot.endKeyframePath)) {
        tailKeyframePath = shot.endKeyframePath;
      }
      if (tailKeyframePath) {
        console.log(`[Animation Generation] Shot #${shot.shotNumber || shotIndex + 1}: Binding End Keyframe for first-to-last-frame video model: ${tailKeyframePath}`);
      }
    }

    const allRefs = getAllReferences(project);
    const assignedRefs = (shot.assignedReferences || [])
      .map(id => allRefs.find(r => r.id === id))
      .filter(Boolean);

    shot.audioMode = audioMode || shot.audioMode || 'sfx_only';
    const continuityDirectives = compileContinuityDirectives(shot, previousShot, assignedRefs);
    const basePrompt = description || shot.description;
    const promptWithContinuity = continuityDirectives ? `${basePrompt}. Continuity Directives: ${continuityDirectives}` : basePrompt;

    const result = await videoService.generateClip({
      shotId: shot.id,
      title: shot.title,
      prompt: promptWithContinuity,
      referenceImageUrl: visualRefUrl,
      keyframePath: keyframePath || null,
      tailKeyframePath,
      referenceImagePath: visualRefPath,
      styleBrief: project.visualReference?.styleBrief || null,
      styleBible: project.visualReference?.styleBible || null,
      assignedReferences: assignedRefs,
      spatialContinuity: shot.spatialContinuity || null,
      continuityDirectives,
      duration: duration || shot.duration || 4,
      cameraMotion: cameraMotion || shot.cameraMotion || 'Dolly Forward',
      audioMode: shot.audioMode || audioMode || 'sfx_only',
      model: model || appConfig.falModel || 'bytedance/seedance-2.5/image-to-video',
      outputDir: CLIPS_DIR
    });

    const realDuration = await getVideoDuration(result.filePath);

    const generatedClip = {
      id: `clip_${Date.now()}`,
      shotId: shot.id,
      title: shot.title,
      description: description || shot.description,
      videoPrompt: result.videoPrompt || `${description || shot.description}. Dynamic camera motion: ${cameraMotion || shot.cameraMotion || 'Dolly Forward'}.`,
      filename: result.filename,
      filePath: result.filePath,
      url: `/storage/clips/${result.filename}`,
      duration: realDuration || shot.duration,
      trimStart: 0,
      trimEnd: realDuration || shot.duration,
      model: result.model,
      provider: result.provider,
      keyframeType: keyframeType,
      sourceKeyframeUrl: keyframeUrl,
      notice: result.notice || null
    };

    // Multi-Take Versioning for Shot
    shot.takes = shot.takes || [];
    const take = {
      id: `take_${Date.now()}`,
      takeNumber: shot.takes.length + 1,
      clip: generatedClip,
      createdAt: new Date().toISOString()
    };
    shot.takes.push(take);
    shot.activeTakeId = take.id;
    shot.status = 'generated';
    shot.description = description || shot.description;
    shot.generatedClip = generatedClip;
    project.storyboard[shotIndex] = shot;
    saveProject(project);

    res.json({
      success: true,
      shot,
      clip: generatedClip,
      take
    });
  } catch (err) {
    console.error('Storyboard clip generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Extract the last frame of preceding shot's video and set as this shot's keyframe (Tail-to-Head chaining)
app.post('/api/storyboard/:shotId/chain-tail-frame', async (req, res) => {
  try {
    const { shotId } = req.params;
    const project = getProject();
    const shotIndex = (project.storyboard || []).findIndex(s => s.id === shotId);
    if (shotIndex <= 0) {
      return res.status(400).json({ error: 'Cannot chain tail frame: This is the first shot or shot not found.' });
    }

    const previousShot = project.storyboard[shotIndex - 1];
    if (!previousShot.generatedClip || (!previousShot.generatedClip.filePath && !previousShot.generatedClip.filename)) {
      return res.status(400).json({ error: `Shot #${previousShot.shotNumber} has no generated clip to extract tail frame from.` });
    }

    let clipPath = previousShot.generatedClip.filePath;
    if (!clipPath || !fs.existsSync(clipPath)) {
      clipPath = path.join(CLIPS_DIR, previousShot.generatedClip.filename || path.basename(previousShot.generatedClip.url || ''));
    }

    if (!fs.existsSync(clipPath)) {
      return res.status(404).json({ error: 'Previous shot clip file not found on disk.' });
    }

    const currentShot = project.storyboard[shotIndex];
    const extracted = await extractLastFrame(clipPath, KEYFRAMES_DIR, previousShot.shotNumber);
    if (!extracted) {
      return res.status(500).json({ error: 'Failed to extract last frame from previous clip.' });
    }

    currentShot.keyframeUrl = extracted.frameUrl;
    currentShot.keyframePath = extracted.framePath;
    saveProject(project);

    res.json({
      success: true,
      message: `Chained last frame of Shot #${previousShot.shotNumber} to Shot #${currentShot.shotNumber}!`,
      shot: currentShot,
      keyframeUrl: extracted.frameUrl
    });
  } catch (err) {
    console.error('Chain tail frame error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Pass 1: Independent Keyframe Restyling (Render scene in Style Anchor & References before animating)
app.post('/api/storyboard/:shotId/restyle-keyframe', async (req, res) => {
  try {
    const { shotId } = req.params;
    const targetFrame = req.body.targetFrame || 'start'; // 'start' | 'end'
    const isEnd = targetFrame === 'end';
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Storyboard shot not found' });

    let kfPath = isEnd ? (shot.endKeyframePath || shot.keyframePath) : shot.keyframePath;
    const kfUrl = isEnd ? (shot.endKeyframeUrl || shot.keyframeUrl) : shot.keyframeUrl;
    if (!kfPath && kfUrl) {
      const fn = path.basename(kfUrl);
      const possible = path.join(KEYFRAMES_DIR, fn);
      if (fs.existsSync(possible)) kfPath = possible;
    }
    if (!kfPath) {
      return res.status(400).json({ error: `No keyframe image available for this shot (${targetFrame} frame)` });
    }

    let colorFramePath = isEnd ? (shot.endColorFramePath || null) : (shot.colorFramePath || null);
    const colorUrl = isEnd ? (shot.endColorFrameUrl || null) : (shot.colorFrameUrl || null);
    if (!colorFramePath && colorUrl) {
      const fn = path.basename(colorUrl);
      const possible = path.join(KEYFRAMES_DIR, fn);
      if (fs.existsSync(possible)) colorFramePath = possible;
    }

    const allRefs = getAllReferences(project);
    let assignedRefs = (shot.assignedReferences || [])
      .map(id => allRefs.find(r => r.id === id))
      .filter(Boolean);

    // Run automated Color Key Detection on Spatial Previs frame
    let colorKeyAnalysis = null;
    try {
      colorKeyAnalysis = await detectColorKeysInSpatialFrame(kfPath, allRefs);
      if (colorKeyAnalysis.detectedAssets && colorKeyAnalysis.detectedAssets.length > 0) {
        const assignedIds = new Set(shot.assignedReferences || []);
        colorKeyAnalysis.detectedAssets.forEach(da => {
          assignedIds.add(da.id);
          if (!assignedRefs.some(r => r.id === da.id)) {
            assignedRefs.push(da);
          }
        });
        shot.assignedReferences = Array.from(assignedIds);
      }
    } catch (ckErr) {
      console.warn('Color key detection notice:', ckErr.message);
    }

    const shotIdx = (project.storyboard || []).findIndex(s => s.id === shotId);
    const previousShot = shotIdx > 0 ? project.storyboard[shotIdx - 1] : null;
    const continuityDirectives = compileContinuityDirectives(shot, previousShot, assignedRefs);
    const basePrompt = req.body.description || shot.description;
    
    let promptWithContinuity = basePrompt;
    if (colorKeyAnalysis && colorKeyAnalysis.colorDirectives) {
      promptWithContinuity += `. ${colorKeyAnalysis.colorDirectives}`;
    }
    if (continuityDirectives) {
      promptWithContinuity += `. Continuity Directives: ${continuityDirectives}`;
    }

    const isPlayblastMode = req.body.isPlayblastMode !== undefined ? Boolean(req.body.isPlayblastMode) : (project.settings?.playblastMode !== false);
    
    // In dual-video previs workflow, if True Color frame exists, 0.35 preserves 3D ship hulls, orange hazard stripes, and landing craft while applying the Style Bible
    const defaultStrength = colorFramePath ? 0.35 : (isPlayblastMode ? 0.82 : 0.65);
    const strength = typeof req.body.strength === 'number' ? req.body.strength : defaultStrength;

    let styleImagePath = null;
    if (project.visualReference?.filename) {
      const candidate = path.join(process.cwd(), 'storage', 'uploads', project.visualReference.filename);
      if (fs.existsSync(candidate)) styleImagePath = candidate;
    } else if (project.visualReference?.imageUrl) {
      const candidate = path.join(process.cwd(), project.visualReference.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(candidate)) styleImagePath = candidate;
    }

    const result = await videoService.restyleKeyframe({
      keyframePath: kfPath,
      colorFramePath,
      styleImagePath,
      prompt: promptWithContinuity,
      styleBrief: project.visualReference?.styleBrief || null,
      styleBible: project.visualReference?.styleBible || null,
      assignedReferences: assignedRefs,
      spatialContinuity: shot.spatialContinuity || null,
      continuityDirectives,
      outputDir: KEYFRAMES_DIR,
      isPlayblastMode,
      strength,
      modelEndpoint: req.body.restyleModel || appConfig.falRestyleModel || 'fal-ai/nano-banana-pro/edit'
    });

    if (isEnd) {
      shot.styledEndKeyframeUrl = result.imageUrl;
      shot.styledEndKeyframePath = result.imagePath;
      shot.styledEndAt = Date.now();
      shot.endRestyleStrength = strength;
      shot.endRestyleMethod = result.method || 'flux';
    } else {
      shot.styledKeyframeUrl = result.imageUrl;
      shot.styledKeyframePath = result.imagePath;
      shot.styledAt = Date.now();
      shot.isPlayblastMode = isPlayblastMode;
      shot.restyleStrength = strength;
      shot.restyleMethod = result.method || 'flux';
      if (result.stage1ImageUrl) shot.stage1ImageUrl = result.stage1ImageUrl;
      if (result.stage2ImageUrl) shot.stage2ImageUrl = result.stage2ImageUrl;
      if (result.maskImageUrl) shot.maskImageUrl = result.maskImageUrl;
    }
    saveProject(project);

    res.json({
      success: true,
      shot,
      targetFrame,
      styledKeyframeUrl: result.imageUrl,
      method: result.method,
      isMultiPass: Boolean(result.isMultiPass)
    });
  } catch (err) {
    console.error('Keyframe restyle error:', err);
    res.status(500).json({ error: err.message });
  }
});

// =========================================================================
// LAYERED RESTYLE STUDIO API ROUTES
// =========================================================================

// Helper to locate a layer across start and end layer stacks
function findShotLayer(shot, layerId) {
  let layer = (shot.layers || []).find((l) => l.id === layerId);
  if (layer) return { layer, list: shot.layers, isEnd: false };
  layer = (shot.endLayers || []).find((l) => l.id === layerId);
  if (layer) return { layer, list: shot.endLayers, isEnd: true };
  return { layer: null, list: null, isEnd: false };
}

// 1. Decompose Shot into Transparent Layers with Clean Background
app.post('/api/storyboard/:shotId/layers/extract', async (req, res) => {
  try {
    const { shotId } = req.params;
    const targetFrame = req.body?.targetFrame || req.query?.targetFrame || 'start';
    const isEnd = targetFrame === 'end';
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const result = await extractShotLayers({
      shot,
      project,
      outputDir: KEYFRAMES_DIR,
      falService,
      targetFrame
    });

    if (isEnd) {
      shot.endLayers = result.layers;
    } else {
      shot.layers = result.layers;
    }
    saveProject(project);

    res.json({
      success: true,
      shotId,
      targetFrame,
      layers: result.layers,
      canvasWidth: result.canvasWidth,
      canvasHeight: result.canvasHeight
    });
  } catch (err) {
    console.error('Layer extraction error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Derive 3D Perspective & Orientation for a Layer from Spatial Previs Markup
app.post('/api/storyboard/:shotId/layers/:layerId/derive-markup-orientation', async (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const { targetFrame = 'start' } = req.body || {};
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer) return res.status(404).json({ error: 'Layer not found' });

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
    const asset = allRefs.find((a) => a.id === layer.assetId) || { name: layer.assetName || 'Target Asset' };

    const isTargetEnd = targetFrame === 'end' || isLayerEnd;
    const flattenedMarkupPath = isTargetEnd ? shot.endFlattenedMarkupPath : shot.startFlattenedMarkupPath;
    const rawMarkupPath = isTargetEnd ? shot.endMarkupPath : shot.startMarkupPath;

    if (!((flattenedMarkupPath && fs.existsSync(flattenedMarkupPath)) || (rawMarkupPath && fs.existsSync(rawMarkupPath)))) {
      return res.status(400).json({ error: 'No Spatial Previs Markup found on this frame' });
    }

    const orientation = await deriveLayerOrientationFromMarkup({
      markupPath: rawMarkupPath,
      flattenedMarkupPath: flattenedMarkupPath || rawMarkupPath,
      layer,
      asset,
      falApiKey: appConfig.falApiKey || process.env.FAL_KEY || '',
      openaiApiKey: appConfig.openaiApiKey || process.env.OPENAI_API_KEY || '',
      geminiApiKey: appConfig.geminiApiKey || process.env.GEMINI_API_KEY || ''
    });

    res.json({ success: true, orientation });
  } catch (err) {
    console.error('[Derive Layer Orientation] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Regenerate an Individual Layer Asset (Optionally Guided by Spatial Previs Markup)
app.post('/api/storyboard/:shotId/layers/:layerId/regenerate', async (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, list: layerList, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer) return res.status(404).json({ error: 'Layer not found' });

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
    const asset = allRefs.find((a) => a.id === layer.assetId);
    if (!asset) {
      return res.status(400).json({ error: `No consistent asset found for ID ${layer.assetId}` });
    }
    const { userPrompt, useMarkupGuidance, targetFrame = 'start' } = req.body || {};

    let effectiveUserPrompt = (userPrompt || '').trim();
    let markupOrientation = null;

    if (useMarkupGuidance) {
      const isTargetEnd = targetFrame === 'end' || isLayerEnd;
      const flattenedMarkupPath = isTargetEnd ? shot.endFlattenedMarkupPath : shot.startFlattenedMarkupPath;
      const rawMarkupPath = isTargetEnd ? shot.endMarkupPath : shot.startMarkupPath;

      if ((flattenedMarkupPath && fs.existsSync(flattenedMarkupPath)) || (rawMarkupPath && fs.existsSync(rawMarkupPath))) {
        try {
          markupOrientation = await deriveLayerOrientationFromMarkup({
            markupPath: rawMarkupPath,
            flattenedMarkupPath: flattenedMarkupPath || rawMarkupPath,
            layer,
            asset,
            falApiKey: appConfig.falApiKey || process.env.FAL_KEY || '',
            openaiApiKey: appConfig.openaiApiKey || process.env.OPENAI_API_KEY || '',
            geminiApiKey: appConfig.geminiApiKey || process.env.GEMINI_API_KEY || ''
          });

          if (markupOrientation && markupOrientation.orientationPrompt) {
            console.log(`[LayerRegen] Guided by Previs Markup: ${markupOrientation.orientationPrompt}`);
            effectiveUserPrompt = effectiveUserPrompt 
              ? `${markupOrientation.orientationPrompt}. ${effectiveUserPrompt}`
              : markupOrientation.orientationPrompt;
          }
        } catch (orientErr) {
          console.warn('[LayerRegen] Previs markup orientation derivation failed, using user prompt:', orientErr.message);
        }
      }
    }

    const result = await regenerateLayerAsset({
      shotId,
      layer,
      asset,
      userPrompt: effectiveUserPrompt,
      styleBible: project.visualReference?.styleBible || null,
      model: req.body.model || appConfig.assetGenModel || 'openai/gpt-image-2.5/flare/edit',
      outputDir: KEYFRAMES_DIR,
      falService
    });

    layer.imageUrl = result.imageUrl;
    layer.imagePath = result.imagePath;
    saveProject(project);

    res.json({ success: true, layer, markupOrientation });
  } catch (err) {
    console.error('Layer regeneration error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Assign / Swap Consistent Asset for an individual layer
app.post('/api/storyboard/:shotId/layers/:layerId/assign-asset', (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const { assetId } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, list: layerList, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer) return res.status(404).json({ error: 'Layer not found' });

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
    const asset = allRefs.find((a) => a.id === assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    layer.assetId = asset.id;
    layer.assetName = asset.name;
    layer.category = asset.category || 'props';
    layer.referenceImageUrl = asset.imageUrl || null;
    layer.referenceImagePath = asset.imagePath || null;
    if (asset.colorKey) layer.colorKey = asset.colorKey;

    saveProject(project);
    res.json({ success: true, layer });
  } catch (err) {
    console.error('Layer assign error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Apply a canonical orthographic sprite from reference asset directly to layer (Option B)
app.post('/api/storyboard/:shotId/layers/:layerId/apply-sprite', async (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const { view = 'side', flipH = false } = req.body || {};
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, list: layerList, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer) return res.status(404).json({ error: 'Layer not found' });

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
    const asset = allRefs.find((a) => a.id === layer.assetId);
    if (!asset) return res.status(404).json({ error: 'Associated consistent asset not found' });

    const result = await getCanonicalAssetSprite({
      asset,
      view,
      flipH,
      outputDir: KEYFRAMES_DIR,
      falService
    });

    layer.imageUrl = result.imageUrl;
    layer.imagePath = result.imagePath;
    saveProject(project);

    res.json({ success: true, layer });
  } catch (err) {
    console.error('Apply canonical sprite error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Import an external Transparent PNG layer directly into the shot layer stack
app.post('/api/storyboard/:shotId/layers/import', keyframeUpload.single('layerFile'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const { shotId } = req.params;
    const targetFrame = req.body?.targetFrame || req.query?.targetFrame || 'start';
    const isEnd = targetFrame === 'end';
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    if (!Array.isArray(shot.layers)) shot.layers = [];
    if (!Array.isArray(shot.endLayers)) shot.endLayers = [];
    const targetList = isEnd ? shot.endLayers : shot.layers;

    const ts = Date.now();
    const layerName = path.basename(req.file.originalname, path.extname(req.file.originalname)) || 'Imported Layer';

    const newLayer = {
      id: `layer_imported_${isEnd ? 'end_' : 'start_'}${ts}`,
      assetId: null,
      assetName: layerName,
      category: 'custom',
      colorKey: null,
      imageUrl: `/storage/keyframes/${req.file.filename}`,
      imagePath: req.file.path,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      quad: [
        { x: 0, y: 0 },
        { x: 1920, y: 0 },
        { x: 1920, y: 1080 },
        { x: 0, y: 1080 }
      ],
      opacity: 1.0,
      visible: true,
      zIndex: targetList.length + 1,
      blendMode: 'normal'
    };

    targetList.push(newLayer);
    saveProject(project);

    res.json({ success: true, layer: newLayer, layers: targetList });
  } catch (err) {
    console.error('Layer import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Duplicate a specific layer in a shot's layer stack
app.post('/api/storyboard/:shotId/layers/:layerId/duplicate', (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, list: layerList, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer || !layerList) return res.status(404).json({ error: 'Layer not found' });
    if (layer.isBackground) return res.status(400).json({ error: 'Cannot duplicate background layer' });

    const ts = Date.now();
    const cloned = JSON.parse(JSON.stringify(layer));
    cloned.id = `layer_copy_${ts}_${Math.floor(Math.random() * 1000)}`;
    cloned.assetName = `${layer.assetName || 'Layer'} (Copy)`;
    cloned.zIndex = layerList.length + 1;
    cloned.visible = true;

    if (Array.isArray(cloned.quad)) {
      const offset = 40;
      cloned.quad = cloned.quad.map(pt => ({
        x: Math.min(Math.max(pt.x + offset, 0), 1920),
        y: Math.min(Math.max(pt.y + offset, 0), 1080)
      }));
    }

    layerList.push(cloned);
    saveProject(project);

    res.json({ success: true, layer: cloned, layers: layerList });
  } catch (err) {
    console.error('Layer duplicate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific layer from a shot's layer stack
app.delete('/api/storyboard/:shotId/layers/:layerId', (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, list: layerList, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer || !layerList) return res.status(404).json({ error: 'Layer not found' });

    if (layer.isBackground) {
      return res.status(400).json({ error: 'Cannot delete the background layer' });
    }

    const idx = layerList.findIndex(l => l.id === layerId);
    if (idx !== -1) {
      layerList.splice(idx, 1);
      saveProject(project);
    }

    res.json({ success: true, layers: layerList });
  } catch (err) {
    console.error('Layer delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update or rename a specific layer in a shot's layer stack
app.patch('/api/storyboard/:shotId/layers/:layerId', (req, res) => {
  try {
    const { shotId, layerId } = req.params;
    const { assetName, zIndex, opacity, visible } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const { layer, list: layerList, isEnd: isLayerEnd } = findShotLayer(shot, layerId);
    if (!layer) return res.status(404).json({ error: 'Layer not found' });

    if (typeof assetName === 'string' && !layer.isBackground) {
      layer.assetName = assetName.trim() || layer.assetName;
    }
    if (typeof zIndex === 'number' && !layer.isBackground) {
      layer.zIndex = zIndex;
    }
    if (typeof opacity === 'number') {
      layer.opacity = opacity;
    }
    if (typeof visible === 'boolean') {
      layer.visible = visible;
    }

    saveProject(project);
    res.json({ success: true, layer, layers: layerList || shot.layers });
  } catch (err) {
    console.error('Layer update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reorder all layers in a shot's layer stack
app.post('/api/storyboard/:shotId/layers/reorder', (req, res) => {
  try {
    const { shotId } = req.params;
    const { orderedLayerIds, targetFrame = 'start' } = req.body;
    const isEnd = targetFrame === 'end';
    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const targetList = isEnd ? (shot.endLayers = shot.endLayers || []) : (shot.layers = shot.layers || []);
    if (Array.isArray(orderedLayerIds) && Array.isArray(targetList)) {
      const bg = targetList.find(l => l.isBackground);
      const fgMap = new Map();
      targetList.filter(l => !l.isBackground).forEach(l => fgMap.set(l.id, l));

      const newFg = [];
      orderedLayerIds.forEach(id => {
        if (fgMap.has(id)) {
          newFg.push(fgMap.get(id));
          fgMap.delete(id);
        }
      });
      fgMap.forEach(l => newFg.push(l));

      const total = newFg.length;
      newFg.forEach((l, idx) => {
        l.zIndex = total - idx;
      });
      if (bg) bg.zIndex = 0;

      const updated = bg ? [bg, ...newFg] : newFg;
      if (isEnd) {
        shot.endLayers = updated;
      } else {
        shot.layers = updated;
      }
      saveProject(project);
      return res.json({ success: true, layers: updated });
    }

    res.json({ success: true, layers: targetList });
  } catch (err) {
    console.error('Layer reorder error:', err);
    res.status(500).json({ error: err.message });
  }
});


// 3. Bake and Commit Layered Composite as Shot Keyframe
app.post('/api/storyboard/:shotId/layers/bake', async (req, res) => {
  try {
    const { shotId } = req.params;
    const { compositeBase64, harmonyStrength, layers, targetFrame = 'start' } = req.body;
    const isEnd = targetFrame === 'end';
    if (!compositeBase64) return res.status(400).json({ error: 'Missing compositeBase64' });

    const project = getProject();
    const shot = (project.storyboard || []).find((s) => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    if (Array.isArray(layers)) {
      if (isEnd) {
        shot.endLayers = layers;
      } else {
        shot.layers = layers;
      }
    }

    let styleImagePath = null;
    if (project.visualReference?.filename) {
      const candidate = path.join(process.cwd(), 'storage', 'uploads', project.visualReference.filename);
      if (fs.existsSync(candidate)) styleImagePath = candidate;
    } else if (project.visualReference?.imageUrl) {
      const candidate = path.join(process.cwd(), project.visualReference.imageUrl.replace(/^\//, ''));
      if (fs.existsSync(candidate)) styleImagePath = candidate;
    }

    const result = await bakeAndCommitComposite({
      shot,
      bakedImageBase64: compositeBase64,
      harmonyStrength: typeof harmonyStrength === 'number' ? harmonyStrength : 0.20,
      styleBible: project.visualReference?.styleBible || null,
      styleImagePath,
      model: req.body.harmonyModel || appConfig.harmonizeModel || 'fal-ai/nano-banana-pro/edit',
      outputDir: KEYFRAMES_DIR,
      falService,
      targetFrame
    });

    saveProject(project);

    res.json({
      success: true,
      shot: result.shot,
      targetFrame,
      compositeKeyframeUrl: result.compositeKeyframeUrl,
      styledKeyframeUrl: result.styledKeyframeUrl,
      method: result.method
    });
  } catch (err) {
    console.error('Bake layers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload or replace True Color Reference Frame for a specific shot
app.post('/api/storyboard/:shotId/upload-color-frame', keyframeUpload.single('colorFrame'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const { shotId } = req.params;
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  const targetFrame = req.body?.targetFrame || 'start';
  const fileUrl = `/storage/keyframes/${req.file.filename}`;
  if (targetFrame === 'end') {
    shot.endColorFrameUrl = fileUrl;
    shot.endColorFramePath = req.file.path;
  } else {
    shot.colorFrameUrl = fileUrl;
    shot.colorFramePath = req.file.path;
  }
  saveProject(project);
  res.json({ success: true, shot, targetFrame, colorFrameUrl: fileUrl });
});

// Remove True Color Reference Frame from a specific shot
app.delete('/api/storyboard/:shotId/color-frame', (req, res) => {
  const { shotId } = req.params;
  const targetFrame = req.query?.targetFrame || req.body?.targetFrame || 'start';
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  if (targetFrame === 'end') {
    shot.endColorFrameUrl = null;
    shot.endColorFramePath = null;
  } else {
    shot.colorFrameUrl = null;
    shot.colorFramePath = null;
  }
  saveProject(project);
  res.json({ success: true, shot, targetFrame });
});

// Upload or replace Restyled Keyframe for a specific shot
app.post('/api/storyboard/:shotId/upload-restyle-frame', keyframeUpload.single('restyleFrame'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const { shotId } = req.params;
  const targetFrame = req.body?.targetFrame || 'start';
  const isEnd = targetFrame === 'end';
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  const fileUrl = `/storage/keyframes/${req.file.filename}`;
  const filePath = req.file.path;

  if (isEnd) {
    shot.styledEndKeyframeUrl = fileUrl;
    shot.styledEndKeyframePath = filePath;
    shot.styledEndAt = Date.now();
    shot.endRestyleMethod = 'upload';
  } else {
    shot.styledKeyframeUrl = fileUrl;
    shot.styledKeyframePath = filePath;
    shot.styledAt = Date.now();
    shot.restyleMethod = 'upload';
  }

  saveProject(project);
  res.json({
    success: true,
    shot,
    targetFrame,
    styledKeyframeUrl: fileUrl
  });
});

// Remove Restyled Keyframe from a specific shot
app.delete('/api/storyboard/:shotId/restyle-frame', (req, res) => {
  const { shotId } = req.params;
  const targetFrame = req.query?.targetFrame || req.body?.targetFrame || 'start';
  const isEnd = targetFrame === 'end';
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  if (isEnd) {
    shot.styledEndKeyframeUrl = null;
    shot.styledEndKeyframePath = null;
    shot.styledEndAt = null;
    shot.endRestyleMethod = null;
  } else {
    shot.styledKeyframeUrl = null;
    shot.styledKeyframePath = null;
    shot.styledAt = null;
    shot.restyleMethod = null;
  }

  saveProject(project);
  res.json({ success: true, shot, targetFrame });
});

// Chain previous shot's End Frame into Restyle slot
app.post('/api/storyboard/:shotId/chain-prev-restyle', async (req, res) => {
  try {
    const { shotId } = req.params;
    const targetFrame = req.body?.targetFrame || 'start';
    const isEnd = targetFrame === 'end';
    const project = getProject();
    const shotIndex = (project.storyboard || []).findIndex(s => s.id === shotId);
    if (shotIndex <= 0) {
      return res.status(400).json({ error: 'Cannot chain: This is the first shot or shot not found.' });
    }

    const previousShot = project.storyboard[shotIndex - 1];
    const currentShot = project.storyboard[shotIndex];

    let srcPath = null;
    let methodDesc = '';

    // 1. Previous shot restyled end frame
    if (previousShot.styledEndKeyframePath && fs.existsSync(previousShot.styledEndKeyframePath)) {
      srcPath = previousShot.styledEndKeyframePath;
      methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Restyled End Frame`;
    } else if (previousShot.styledEndKeyframeUrl) {
      const p = path.join(KEYFRAMES_DIR, path.basename(previousShot.styledEndKeyframeUrl));
      if (fs.existsSync(p)) {
        srcPath = p;
        methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Restyled End Frame`;
      }
    }

    // 2. Previous shot video clip tail frame
    if (!srcPath && previousShot.generatedClip) {
      let clipPath = previousShot.generatedClip.filePath;
      if (!clipPath || !fs.existsSync(clipPath)) {
        clipPath = path.join(CLIPS_DIR, previousShot.generatedClip.filename || path.basename(previousShot.generatedClip.url || ''));
      }
      if (fs.existsSync(clipPath)) {
        const extracted = await extractLastFrame(clipPath, KEYFRAMES_DIR, previousShot.shotNumber || shotIndex);
        if (extracted && fs.existsSync(extracted.framePath)) {
          srcPath = extracted.framePath;
          methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Video Tail Frame`;
        }
      }
    }

    // 3. Previous shot composite end frame
    if (!srcPath && previousShot.compositeEndKeyframeUrl) {
      const p = path.join(KEYFRAMES_DIR, path.basename(previousShot.compositeEndKeyframeUrl));
      if (fs.existsSync(p)) {
        srcPath = p;
        methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Composite End Frame`;
      }
    }

    // 4. Previous shot restyled start frame
    if (!srcPath && previousShot.styledKeyframePath && fs.existsSync(previousShot.styledKeyframePath)) {
      srcPath = previousShot.styledKeyframePath;
      methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Restyled Start Frame`;
    } else if (!srcPath && previousShot.styledKeyframeUrl) {
      const p = path.join(KEYFRAMES_DIR, path.basename(previousShot.styledKeyframeUrl));
      if (fs.existsSync(p)) {
        srcPath = p;
        methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Restyled Start Frame`;
      }
    }

    // 5. Previous shot true color end frame or spatial previs end frame
    if (!srcPath && previousShot.endColorFramePath && fs.existsSync(previousShot.endColorFramePath)) {
      srcPath = previousShot.endColorFramePath;
      methodDesc = `Shot #${previousShot.shotNumber || shotIndex} True Color End Frame`;
    } else if (!srcPath && previousShot.endKeyframePath && fs.existsSync(previousShot.endKeyframePath)) {
      srcPath = previousShot.endKeyframePath;
      methodDesc = `Shot #${previousShot.shotNumber || shotIndex} Spatial Previs End Frame`;
    }

    if (!srcPath || !fs.existsSync(srcPath)) {
      return res.status(400).json({
        error: `Shot #${previousShot.shotNumber || shotIndex} does not have an end frame or generated video clip to chain from yet. Please restyle or generate Shot #${previousShot.shotNumber || shotIndex} first, or upload a custom image.`
      });
    }

    // Copy to a new unique keyframe file for current shot
    const ext = path.extname(srcPath) || '.png';
    const targetFilename = `restyle_chain_shot${currentShot.shotNumber || shotIndex + 1}_${Date.now()}${ext}`;
    const targetPath = path.join(KEYFRAMES_DIR, targetFilename);
    fs.copyFileSync(srcPath, targetPath);
    const targetUrl = `/storage/keyframes/${targetFilename}`;

    if (isEnd) {
      currentShot.styledEndKeyframeUrl = targetUrl;
      currentShot.styledEndKeyframePath = targetPath;
      currentShot.styledEndAt = Date.now();
      currentShot.endRestyleMethod = 'chain_prev_end';
    } else {
      currentShot.styledKeyframeUrl = targetUrl;
      currentShot.styledKeyframePath = targetPath;
      currentShot.styledAt = Date.now();
      currentShot.restyleMethod = 'chain_prev_end';
    }

    saveProject(project);

    res.json({
      success: true,
      message: `Chained ${methodDesc} into Shot #${currentShot.shotNumber || shotIndex + 1} ${targetFrame.toUpperCase()} restyle slot!`,
      shot: currentShot,
      targetFrame,
      styledKeyframeUrl: targetUrl
    });
  } catch (err) {
    console.error('Chain prev restyle error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload companion textured/shaded video to extract True Color frames for all storyboard shots
app.post('/api/storyboard/upload-companion-video', upload.single('companionVideo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No companion video uploaded' });
    const companionPath = req.file.path;
    const project = getProject();
    const shots = project.storyboard || [];
    if (shots.length === 0) {
      return res.status(400).json({ error: 'Storyboard is empty. Ingest spatial previs video first.' });
    }

    const companionDuration = await getVideoDuration(companionPath);
    let updatedCount = 0;

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      const ts = shot.timestamp !== undefined ? shot.timestamp : (shot.startTime || 0);
      const targetTs = Math.min(Math.max(0, ts), companionDuration - 0.1);

      const extracted = await extractSingleKeyframe(companionPath, KEYFRAMES_DIR, targetTs, `color_${shot.shotNumber || (i + 1)}`);
      if (extracted) {
        shot.colorFrameUrl = extracted.frameUrl;
        shot.colorFramePath = extracted.framePath;
        updatedCount++;
      }
    }

    project.companionVideo = {
      filename: req.file.filename,
      filePath: companionPath,
      url: `/storage/uploads/${req.file.filename}`,
      duration: companionDuration,
      uploadedAt: new Date().toISOString()
    };

    saveProject(project);
    res.json({
      success: true,
      message: `Extracted ${updatedCount} True Color frames from companion video!`,
      companionVideo: project.companionVideo,
      storyboard: project.storyboard
    });
  } catch (err) {
    console.error('Companion video extraction error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update global project restyling settings
app.post('/api/settings/restyle', (req, res) => {
  try {
    const { playblastMode, restyleStrength } = req.body;
    const project = getProject();
    project.settings = project.settings || {};
    if (playblastMode !== undefined) project.settings.playblastMode = Boolean(playblastMode);
    if (typeof restyleStrength === 'number') project.settings.restyleStrength = restyleStrength;
    saveProject(project);
    res.json({ success: true, settings: project.settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multi-Take Selection: Switch active take on a shot
app.post('/api/storyboard/:shotId/select-take', (req, res) => {
  try {
    const { shotId } = req.params;
    const { takeId } = req.body;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const targetTake = (shot.takes || []).find(t => t.id === takeId);
    if (!targetTake) return res.status(404).json({ error: 'Take not found' });

    shot.activeTakeId = takeId;
    shot.generatedClip = targetTake.clip;
    saveProject(project);

    res.json({ success: true, shot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific take from a shot
app.delete('/api/storyboard/:shotId/takes/:takeId', (req, res) => {
  try {
    const { shotId, takeId } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    shot.takes = shot.takes || [];
    const idx = shot.takes.findIndex(t => t.id === takeId);
    if (idx !== -1) {
      const [deleted] = shot.takes.splice(idx, 1);
      if (deleted.clip?.filePath && fs.existsSync(deleted.clip.filePath)) {
        try { fs.unlinkSync(deleted.clip.filePath); } catch (e) {}
      }
      if (shot.activeTakeId === takeId) {
        if (shot.takes.length > 0) {
          const nextTake = shot.takes[shot.takes.length - 1];
          shot.activeTakeId = nextTake.id;
          shot.generatedClip = nextTake.clip;
        } else {
          shot.activeTakeId = null;
          shot.generatedClip = null;
          shot.status = 'pending';
        }
      }
      saveProject(project);
    }

    res.json({ success: true, shot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Footage Library: Get all video clips in storage/clips with metadata & usage info
app.get('/api/footage-library', async (req, res) => {
  try {
    const project = getProject();
    if (!fs.existsSync(CLIPS_DIR)) {
      return res.json({ clips: [] });
    }

    const files = fs.readdirSync(CLIPS_DIR);
    const videoFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.mp4', '.mov', '.webm'].includes(ext);
    });

    // Build map of files used in current storyboard
    const usedMap = {};
    (project.storyboard || []).forEach(shot => {
      (shot.takes || []).forEach(take => {
        if (take.clip?.filename) {
          usedMap[take.clip.filename] = {
            shotId: shot.id,
            shotNumber: shot.shotNumber,
            shotTitle: shot.title,
            takeNumber: take.takeNumber,
            isActive: shot.activeTakeId === take.id
          };
        }
      });
      if (shot.generatedClip?.filename && !usedMap[shot.generatedClip.filename]) {
        usedMap[shot.generatedClip.filename] = {
          shotId: shot.id,
          shotNumber: shot.shotNumber,
          shotTitle: shot.title,
          isActive: true
        };
      }
    });

    const clipItems = [];
    for (const f of videoFiles) {
      try {
        const fullPath = path.join(CLIPS_DIR, f);
        const stat = fs.statSync(fullPath);

        let label = 'Video Clip';
        let providerBadge = 'Library';
        if (f.startsWith('fal_seedance_')) {
          label = 'Seedance 2.5 Video';
          providerBadge = 'Seedance 2.5';
        } else if (f.startsWith('fal_wan_')) {
          label = 'Wan 2.1 Video';
          providerBadge = 'Wan 2.1';
        } else if (f.startsWith('fal_kling_')) {
          label = 'Kling 1.6 Video';
          providerBadge = 'Kling 1.6';
        } else if (f.startsWith('manual_')) {
          label = 'Imported Footage';
          providerBadge = 'Manual Import';
        } else if (f.startsWith('clip_sample_')) {
          label = 'Sample Animatic Clip';
          providerBadge = 'Animatic';
        }

        clipItems.push({
          filename: f,
          url: `/storage/clips/${f}`,
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs,
          label,
          providerBadge,
          usedIn: usedMap[f] || null
        });
      } catch (e) {}
    }

    // Sort newest first
    clipItems.sort((a, b) => b.mtimeMs - a.mtimeMs);

    res.json({ success: true, clips: clipItems });
  } catch (err) {
    console.error('Error fetching footage library:', err);
    res.status(500).json({ error: err.message });
  }
});

// Assign an existing footage clip from storage/clips as a new take on a shot
app.post('/api/storyboard/:shotId/assign-take', async (req, res) => {
  try {
    const { shotId } = req.params;
    const { filename, modelLabel } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const filePath = path.join(CLIPS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Clip file not found on disk' });
    }

    let realDuration = 4.0;
    try {
      realDuration = await getVideoDuration(filePath);
    } catch (e) {
      console.warn('Could not probe clip duration:', e);
    }

    shot.takes = shot.takes || [];
    const takeNumber = shot.takes.length + 1;
    const take = {
      id: `take_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      takeNumber,
      clip: {
        id: `clip_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        shotId: shot.id,
        title: shot.title,
        description: shot.description,
        videoPrompt: shot.description || 'Assigned footage take',
        filename: filename,
        filePath: filePath,
        url: `/storage/clips/${filename}`,
        duration: realDuration || shot.duration || 4.0,
        trimStart: 0,
        trimEnd: realDuration || shot.duration || 4.0,
        model: modelLabel || 'Assigned Footage',
        provider: 'library',
        keyframeType: 'assigned-footage',
        sourceKeyframeUrl: shot.styledKeyframeUrl || shot.keyframeUrl || null
      },
      createdAt: new Date().toISOString()
    };

    shot.takes.push(take);
    shot.activeTakeId = take.id;
    shot.generatedClip = take.clip;
    shot.status = 'generated';
    saveProject(project);

    res.json({ success: true, shot, take });
  } catch (err) {
    console.error('Assign take error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload a local video file directly as a new take on a shot
app.post('/api/storyboard/:shotId/upload-take', clipUpload.single('videoClip'), async (req, res) => {
  try {
    const { shotId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    const filePath = req.file.path;
    const filename = req.file.filename;

    let realDuration = 4.0;
    try {
      realDuration = await getVideoDuration(filePath);
    } catch (e) {
      console.warn('Could not probe uploaded clip duration:', e);
    }

    shot.takes = shot.takes || [];
    const takeNumber = shot.takes.length + 1;
    const take = {
      id: `take_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      takeNumber,
      clip: {
        id: `clip_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        shotId: shot.id,
        title: shot.title,
        description: shot.description,
        videoPrompt: shot.description || 'Uploaded video take',
        filename: filename,
        filePath: filePath,
        url: `/storage/clips/${filename}`,
        duration: realDuration || shot.duration || 4.0,
        trimStart: 0,
        trimEnd: realDuration || shot.duration || 4.0,
        model: 'Manual Video Upload',
        provider: 'manual',
        keyframeType: 'manual-upload',
        sourceKeyframeUrl: shot.styledKeyframeUrl || shot.keyframeUrl || null
      },
      createdAt: new Date().toISOString()
    };

    shot.takes.push(take);
    shot.activeTakeId = take.id;
    shot.generatedClip = take.clip;
    shot.status = 'generated';
    saveProject(project);

    res.json({ success: true, shot, take });
  } catch (err) {
    console.error('Upload take error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Toggle Approval on Storyboard Shot
app.post('/api/approve-storyboard-clip', (req, res) => {
  const { shotId, approved } = req.body;
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  shot.approved = Boolean(approved);
  saveProject(project);
  res.json({ success: true, shot });
});

// Delete a single storyboard shot
app.delete('/api/storyboard/:shotId', (req, res) => {
  const { shotId } = req.params;
  const project = getProject();
  const shotIndex = (project.storyboard || []).findIndex((s) => s.id === shotId);
  if (shotIndex === -1) return res.status(404).json({ error: 'Shot not found' });

  const deletedShot = project.storyboard.splice(shotIndex, 1)[0];
  saveProject(project);
  res.json({ success: true, deletedShot, storyboard: project.storyboard });
});

// Delete only the generated video from a storyboard shot (reset to pending)
app.delete('/api/storyboard/:shotId/clip', (req, res) => {
  const { shotId } = req.params;
  const project = getProject();
  const shot = (project.storyboard || []).find((s) => s.id === shotId);
  if (!shot) return res.status(404).json({ error: 'Shot not found' });

  // Delete clip file if exists
  if (shot.generatedClip?.filename) {
    const clipFile = path.join(CLIPS_DIR, shot.generatedClip.filename);
    if (fs.existsSync(clipFile)) {
      try { fs.unlinkSync(clipFile); } catch (e) {}
    }
  }

  shot.generatedClip = null;
  shot.status = 'pending';
  shot.approved = false;
  saveProject(project);
  res.json({ success: true, shot });
});

// Clear all storyboard shots and ingested video
app.delete('/api/storyboard', (req, res) => {
  const project = getProject();
  project.storyboard = [];
  project.ingestedVideo = null;
  saveProject(project);
  res.json({ success: true, message: 'Storyboard cleared successfully', storyboard: [] });
});

// Clear only the ingested source video
app.delete('/api/ingested-video', (req, res) => {
  const project = getProject();
  project.ingestedVideo = null;
  saveProject(project);
  res.json({ success: true, message: 'Ingested video cleared' });
});

// Non-Destructive Send / Populate Storyboard Clips to Timeline
app.post('/api/populate-timeline', (req, res) => {
  const { shotIds, importAllApproved } = req.body;
  const project = getProject();
  project.timeline = project.timeline || [];

  let shotsToImport = [];
  if (importAllApproved) {
    shotsToImport = (project.storyboard || []).filter((s) => s.approved && (s.generatedClip || s.keyframeUrl || s.styledKeyframeUrl));
  } else if (Array.isArray(shotIds)) {
    shotsToImport = (project.storyboard || []).filter((s) => shotIds.includes(s.id) && (s.generatedClip || s.keyframeUrl || s.styledKeyframeUrl));
  }

  if (shotsToImport.length === 0) {
    return res.status(400).json({ error: 'No clips or keyframes available to add to timeline' });
  }

  if (importAllApproved) {
    // Synchronize timeline with all approved storyboard shots:
    // Update existing frames, add new approved frames, and clear out stale/unapproved frames.
    const updatedTimeline = [];
    shotsToImport.forEach((s) => {
      const clip = s.generatedClip || {
        id: `anim_${s.id}`,
        filename: `animatic_${s.id}.jpg`,
        filePath: s.keyframePath || '',
        url: s.styledKeyframeUrl || s.keyframeUrl || '',
        duration: s.duration || 4,
        model: 'Animatic (Keyframe)'
      };

      const existing = project.timeline.find((t) => t.shotId === s.id);
      if (existing) {
        // Update existing frame in place
        existing.id = clip.id;
        existing.title = s.title;
        existing.filename = clip.filename;
        existing.filePath = clip.filePath;
        existing.url = clip.url;
        existing.thumbnailUrl = s.styledKeyframeUrl || s.keyframeUrl || '';
        existing.duration = clip.duration || s.duration || 4;
        if (!existing.trimEnd || existing.trimEnd > existing.duration) {
          existing.trimEnd = existing.duration;
        }
        existing.model = s.generatedClip ? (clip.model || 'Wan 2.1 (Fal.ai)') : 'Animatic (Keyframe)';
        existing.isAnimatic = !s.generatedClip;
        existing.audioTracks = s.audioTracks || [];
        updatedTimeline.push(existing);
      } else {
        // Add new approved frame
        updatedTimeline.push({
          timelineId: `tl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          id: clip.id,
          shotId: s.id,
          title: s.title,
          filename: clip.filename,
          filePath: clip.filePath,
          url: clip.url,
          thumbnailUrl: s.styledKeyframeUrl || s.keyframeUrl || '',
          duration: clip.duration || s.duration || 4,
          trimStart: clip.trimStart || 0,
          trimEnd: clip.trimEnd || clip.duration || s.duration || 4,
          model: s.generatedClip ? (clip.model || 'Wan 2.1 (Fal.ai)') : 'Animatic (Keyframe)',
          isAnimatic: !s.generatedClip,
          audioTracks: s.audioTracks || []
        });
      }
    });

    project.timeline = updatedTimeline;
  } else {
    // Individual shot imports / updates
    shotsToImport.forEach((s) => {
      const clip = s.generatedClip || {
        id: `anim_${s.id}`,
        filename: `animatic_${s.id}.jpg`,
        filePath: s.keyframePath || '',
        url: s.styledKeyframeUrl || s.keyframeUrl || '',
        duration: s.duration || 4,
        model: 'Animatic (Keyframe)'
      };

      const existingIdx = project.timeline.findIndex((t) => t.shotId === s.id);
      const clipData = {
        id: clip.id,
        shotId: s.id,
        title: s.title,
        filename: clip.filename,
        filePath: clip.filePath,
        url: clip.url,
        thumbnailUrl: s.styledKeyframeUrl || s.keyframeUrl || '',
        duration: clip.duration || s.duration || 4,
        trimStart: clip.trimStart || 0,
        trimEnd: clip.trimEnd || clip.duration || s.duration || 4,
        model: s.generatedClip ? (clip.model || 'Wan 2.1 (Fal.ai)') : 'Animatic (Keyframe)',
        isAnimatic: !s.generatedClip,
        audioTracks: s.audioTracks || []
      };

      if (existingIdx !== -1) {
        project.timeline[existingIdx] = {
          ...project.timeline[existingIdx],
          ...clipData
        };
      } else {
        project.timeline.push({
          timelineId: `tl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          ...clipData
        });
      }
    });
  }

  // Ensure transitions array matches new timeline length
  if (Array.isArray(project.timelineTransitions)) {
    if (project.timeline.length <= 1) {
      project.timelineTransitions = [];
    } else if (project.timelineTransitions.length > project.timeline.length - 1) {
      project.timelineTransitions = project.timelineTransitions.slice(0, project.timeline.length - 1);
    }
  }

  saveProject(project);
  res.json({ success: true, timeline: project.timeline, addedCount: shotsToImport.length });
});

// =========================================================================
// Media Pool Endpoints (Video, Image, Audio for Decoupled Timeline Assembly)
// =========================================================================

// Get all items in Media Pool
app.get('/api/media-pool', (req, res) => {
  const project = getProject();
  res.json({ success: true, mediaPool: project.mediaPool || [] });
});

// Synchronize all approved Storyboard shots into Media Pool
app.post('/api/media-pool/sync-storyboard', (req, res) => {
  const project = getProject();
  project.mediaPool = project.mediaPool || [];
  const approvedShots = (project.storyboard || []).filter(s => s.approved);
  
  if (approvedShots.length === 0) {
    return res.status(400).json({ error: 'No approved storyboard shots found to sync.' });
  }

  let addedCount = 0;

  approvedShots.forEach(shot => {
    // 1. Video take (if available)
    if (shot.generatedClip && shot.generatedClip.url) {
      const vidExists = project.mediaPool.some(m => m.url === shot.generatedClip.url || (m.shotId === shot.id && m.type === 'video'));
      if (!vidExists) {
        project.mediaPool.push({
          id: `mp_vid_${shot.id}_${Date.now()}`,
          name: `${shot.title || 'Shot'} (Take)`,
          type: 'video',
          url: shot.generatedClip.url,
          filePath: shot.generatedClip.filePath || '',
          thumbnailUrl: shot.styledKeyframeUrl || shot.keyframeUrl || '',
          duration: Number(shot.generatedClip.duration || shot.duration || 4.0),
          source: 'storyboard',
          shotId: shot.id,
          model: shot.generatedClip.model || 'Wan 2.1',
          createdAt: Date.now()
        });
        addedCount++;
      }
    }

    // 2. Styled Keyframe / Animatic Still Image (if available)
    const imgUrl = shot.styledKeyframeUrl || shot.keyframeUrl;
    if (imgUrl) {
      const imgExists = project.mediaPool.some(m => m.url === imgUrl);
      if (!imgExists) {
        project.mediaPool.push({
          id: `mp_img_${shot.id}_${Date.now()}`,
          name: `${shot.title || 'Shot'} (Keyframe Still)`,
          type: 'image',
          url: imgUrl,
          filePath: shot.styledKeyframePath || shot.keyframePath || '',
          thumbnailUrl: imgUrl,
          duration: Number(shot.duration || 4.0),
          source: 'storyboard',
          shotId: shot.id,
          createdAt: Date.now()
        });
        addedCount++;
      }
    }

    // 3. Audio stems (if available)
    if (Array.isArray(shot.audioTracks)) {
      shot.audioTracks.forEach(track => {
        if (track && track.url) {
          const audExists = project.mediaPool.some(m => m.url === track.url);
          if (!audExists) {
            project.mediaPool.push({
              id: `mp_aud_${shot.id}_${track.id || Date.now()}`,
              name: `${shot.title || 'Shot'} (${track.type === 'dialogue' ? 'Dialogue' : 'SFX Stem'})`,
              type: 'audio',
              url: track.url,
              filePath: track.filePath || '',
              thumbnailUrl: '',
              duration: Number(track.duration || shot.duration || 4.0),
              source: 'storyboard',
              shotId: shot.id,
              createdAt: Date.now()
            });
            addedCount++;
          }
        }
      });
    }
  });

  saveProject(project);
  res.json({ success: true, addedCount, mediaPool: project.mediaPool });
});

// Upload local external media files into Media Pool
app.post('/api/media-pool/upload', mediaPoolUpload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const project = getProject();
    project.mediaPool = project.mediaPool || [];
    const addedItems = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext);
      
      const isVideo = ['.mp4', '.webm', '.mov', '.mkv'].includes(ext) || file.mimetype.startsWith('video/');
      const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext) || file.mimetype.startsWith('image/');
      const isAudio = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'].includes(ext) || file.mimetype.startsWith('audio/');

      let mediaType = 'image';
      let duration = 4.0;
      let thumbnailUrl = `/storage/uploads/${file.filename}`;

      if (isVideo) {
        mediaType = 'video';
        try {
          duration = await getVideoDuration(file.path);
        } catch (e) {
          duration = 5.0;
        }
        try {
          const thumb = await extractSingleKeyframe(file.path, KEYFRAMES_DIR, Math.min(0.8, duration * 0.1), 'mp_thumb');
          if (thumb) thumbnailUrl = thumb.frameUrl;
        } catch (e) {
          thumbnailUrl = '';
        }
      } else if (isAudio) {
        mediaType = 'audio';
        try {
          duration = await getVideoDuration(file.path);
        } catch (e) {
          duration = 4.0;
        }
        thumbnailUrl = '';
      }

      const item = {
        id: `mp_upl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: baseName || file.originalname,
        filename: file.filename,
        filePath: file.path,
        url: `/storage/uploads/${file.filename}`,
        thumbnailUrl,
        type: mediaType,
        duration: Math.max(0.5, Math.round(duration * 10) / 10),
        source: 'upload',
        size: file.size,
        createdAt: Date.now()
      };

      project.mediaPool.push(item);
      addedItems.push(item);
    }

    saveProject(project);
    res.json({ success: true, items: addedItems, mediaPool: project.mediaPool });
  } catch (err) {
    res.status(500).json({ error: 'Media Pool upload failed: ' + err.message });
  }
});

// Delete item from Media Pool
app.delete('/api/media-pool/:id', (req, res) => {
  const { id } = req.params;
  const project = getProject();
  project.mediaPool = (project.mediaPool || []).filter(m => m.id !== id);
  saveProject(project);
  res.json({ success: true, mediaPool: project.mediaPool });
});

// Fal.ai Balance & Account Status
app.get('/api/fal/balance', async (req, res) => {
  try {
    const balance = await falService.getBalance();
    res.json(balance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility for legacy balance route
app.get('/api/meshy/balance', async (req, res) => {
  try {
    const balance = await falService.getBalance();
    res.json(balance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ElevenLabs Audio Engine Endpoints ---

// Get available voices
app.get('/api/audio/voices', async (req, res) => {
  try {
    const voices = await elevenLabsService.getVoices();
    res.json({ success: true, voices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Cinematic Sound Effects (SFX)
app.post('/api/audio/generate-sfx', async (req, res) => {
  try {
    const { shotId, text, durationSeconds, promptInfluence } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text prompt required for SFX generation' });
    }

    const audioResult = await elevenLabsService.generateSoundEffect({
      text,
      durationSeconds: durationSeconds || 4,
      promptInfluence: promptInfluence || 0.3,
      outputDir: AUDIO_DIR
    });

    const project = getProject();
    if (shotId) {
      const shot = (project.storyboard || []).find(s => s.id === shotId);
      if (shot) {
        shot.audioTracks = shot.audioTracks || [];
        shot.audioTracks.push(audioResult);
        saveProject(project);
      }
    }

    res.json({ success: true, audio: audioResult, storyboard: project.storyboard });
  } catch (err) {
    console.error('SFX generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Character Dialogue or Director Voiceover (TTS)
app.post('/api/audio/generate-voice', async (req, res) => {
  try {
    const { shotId, text, voiceId, modelId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text content required for speech generation' });
    }

    const audioResult = await elevenLabsService.generateSpeech({
      text,
      voiceId,
      modelId,
      outputDir: AUDIO_DIR
    });

    const project = getProject();
    if (shotId) {
      const shot = (project.storyboard || []).find(s => s.id === shotId);
      if (shot) {
        shot.audioTracks = shot.audioTracks || [];
        shot.audioTracks.push(audioResult);
        saveProject(project);
      }
    }

    res.json({ success: true, audio: audioResult, storyboard: project.storyboard });
  } catch (err) {
    console.error('Speech generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove audio track from shot
app.delete('/api/storyboard/:shotId/audio/:filename', (req, res) => {
  try {
    const { shotId, filename } = req.params;
    const project = getProject();
    const shot = (project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return res.status(404).json({ error: 'Shot not found' });

    shot.audioTracks = (shot.audioTracks || []).filter(a => a.filename !== filename);
    saveProject(project);

    try {
      const filePath = resolveSafeStoragePath(AUDIO_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Audio delete security warning:', e.message);
    }

    res.json({ success: true, audioTracks: shot.audioTracks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export Timeline with local FFmpeg (including Transitions)
app.post('/api/export-video', async (req, res) => {
  try {
    const { timelineClips, transitions = [], projectName, targetResolution = '1280x720', backgroundAudio, colorGrading } = req.body;

    if (!timelineClips || timelineClips.length === 0) {
      return res.status(400).json({ error: 'No clips on timeline to export' });
    }

    const currentProject = getProject();
    const effectiveColorGrading = colorGrading || currentProject?.colorGrading || null;

    const resolveItemPath = (c) => {
      let resolvedPath = c.filePath;
      if (!resolvedPath || !fs.existsSync(resolvedPath)) {
        const fn = sanitizeFilename(c.filename || path.basename(c.url || ''));
        const possibleDirs = [CLIPS_DIR, AUDIO_DIR, UPLOADS_DIR, KEYFRAMES_DIR];
        for (const dir of possibleDirs) {
          const testPath = path.join(dir, fn);
          if (fs.existsSync(testPath)) {
            resolvedPath = testPath;
            break;
          }
        }
        if (!resolvedPath || !fs.existsSync(resolvedPath)) {
          const isAudio = c.track === 'a1' || c.track === 'a2' || c.type === 'audio' || /\.(wav|mp3|ogg|flac|m4a|aac)$/i.test(fn);
          resolvedPath = path.join(isAudio ? AUDIO_DIR : CLIPS_DIR, fn);
        }
      }
      return {
        ...c,
        filePath: resolvedPath
      };
    };

    const resolvedTimeline = timelineClips.map(resolveItemPath);

    // Separate visual clips from audio stems (audio tracks a1/a2, type=audio, or audio extension)
    const visualClips = resolvedTimeline.filter((c) => {
      const isAudioTrack = c.track === 'a1' || c.track === 'a2';
      const isAudioType = c.type === 'audio';
      const isAudioExt = /\.(wav|mp3|ogg|flac|m4a|aac)$/i.test(c.filePath || c.url || c.filename || '');
      return !isAudioTrack && !isAudioType && !isAudioExt;
    });

    const audioClips = resolvedTimeline.filter((c) => {
      const isAudioTrack = c.track === 'a1' || c.track === 'a2';
      const isAudioType = c.type === 'audio';
      const isAudioExt = /\.(wav|mp3|ogg|flac|m4a|aac)$/i.test(c.filePath || c.url || c.filename || '');
      return isAudioTrack || isAudioType || isAudioExt;
    });

    if (visualClips.length === 0) {
      return res.status(400).json({ error: 'No visual clips (video or animatic) on timeline to export' });
    }

    const exportFilename = `export_${Date.now()}.mp4`;
    const outputPath = path.join(EXPORTS_DIR, exportFilename);

    await stitchTimelineClips({
      clips: visualClips,
      audioClips,
      transitions,
      outputPath,
      targetResolution,
      audioPath: backgroundAudio || null,
      colorGrading: effectiveColorGrading
    });

    const totalDuration = await getVideoDuration(outputPath);

    const exportRecord = {
      id: `exp_${Date.now()}`,
      title: projectName || 'Long Format Master',
      filename: exportFilename,
      url: `/storage/exports/${exportFilename}`,
      duration: totalDuration,
      createdAt: new Date().toISOString(),
      clipCount: visualClips.length,
      colorGradingApplied: Boolean(effectiveColorGrading && effectiveColorGrading.enabled !== false)
    };

    const project = getProject();
    project.exports = project.exports || [];
    project.exports.unshift(exportRecord);
    saveProject(project);

    res.json({
      success: true,
      export: exportRecord
    });
  } catch (err) {
    console.error('Export video error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Single-click Studio & Services Shutdown
app.post('/api/shutdown', (req, res) => {
  console.log('⚡ [SHUTDOWN] Received request to shut down PointBlank Studio and all services.');
  res.json({
    success: true,
    message: 'PointBlank Studio server and all background services are shutting down.'
  });

  // Gracefully terminate server and services after flushing response
  setTimeout(() => {
    console.log('⚡ [SHUTDOWN] Closing server and exiting process...');
    process.exit(0);
  }, 400);
});

function openBrowser(targetUrl) {
  const { exec } = require('child_process');
  const platform = process.platform;
  let cmd = '';
  if (platform === 'win32') {
    const edgePath86 = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const edgePath = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
    if (fs.existsSync(edgePath86)) {
      cmd = `start "" "${edgePath86}" --app=${targetUrl}`;
    } else if (fs.existsSync(edgePath)) {
      cmd = `start "" "${edgePath}" --app=${targetUrl}`;
    } else {
      cmd = `start ${targetUrl}`;
    }
  } else if (platform === 'darwin') {
    cmd = `open "${targetUrl}"`;
  } else {
    cmd = `xdg-open "${targetUrl}"`;
  }
  exec(cmd, (err) => {
    if (err && platform === 'win32') {
      exec(`start ${targetUrl}`);
    }
  });
}

// Global security and upload error handler
app.use((err, req, res, next) => {
  if (err) {
    console.warn(`[SECURITY / REQUEST ERROR] ${req.method} ${req.url}:`, err.message);
    return res.status(400).json({ error: err.message || 'Request error' });
  }
  next();
});

const server = app.listen(PORT, HOST, () => {
  const url = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
  console.log(`PointBlank Studio server running securely at ${url} (host: ${HOST})`);
  if (process.argv.includes('--open') || process.env.AUTO_OPEN === 'true') {
    console.log(`⚡ Launching ${url} in your default browser...`);
    openBrowser(url);
  }
});

// Dual loopback support: bind IPv6 loopback (::1) alongside 127.0.0.1 so 'localhost' resolves instantly on Windows
if (HOST === '127.0.0.1') {
  try {
    const ipv6Server = app.listen(PORT, '::1');
    ipv6Server.on('error', () => {}); // Silently ignore if IPv6 is disabled on host system
    ipv6Server.timeout = 1200000;
  } catch (e) {}
}

server.timeout = 1200000; // 20 minutes
server.keepAliveTimeout = 650000;
server.headersTimeout = 660000;


