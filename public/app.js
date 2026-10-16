// Point Blank Studio - Workspace Controller

class StudioApp {
  constructor() {
    window.studioApp = this;
    window.app = this;
    this.project = {
      name: 'Cinematic Storyboard Project',
      activeWorkspace: 'storyboard',
      visualReference: {
        imageUrl: null,
        filename: null
      },
      ingestedVideo: null,
      storyboard: [],
      timeline: [],
      exports: []
    };

    this.currentTimelineIndex = 0;
    this.isPlayingTimeline = false;
    this.selectedTimelineClipId = null;

    this.initElements();
    this.bindEvents();
    this.loadInitialData();
  }

  initElements() {
    // Header & Workspace Tabs
    this.projectTitleInput = document.getElementById('project-title-input');
    this.tabStyleAnchor = document.getElementById('tab-style-anchor');
    this.tabReferences = document.getElementById('tab-references');
    this.tabStoryboard = document.getElementById('tab-storyboard');
    this.tabTimeline = document.getElementById('tab-timeline');
    this.styleAnchorStatusBadge = document.getElementById('style-anchor-status-badge');
    this.referencesCountBadge = document.getElementById('references-count-badge');
    this.storyboardCountBadge = document.getElementById('storyboard-count-badge');
    this.timelineCountBadge = document.getElementById('timeline-count-badge');
    this.btnCheckPoints = document.getElementById('btn-check-points');
    this.meshyPointsLabel = document.getElementById('meshy-points-label');
    this.openSettingsBtn = document.getElementById('open-settings-btn');
    this.openExportModalBtn = document.getElementById('open-export-modal-btn');
    this.btnAppShutdown = document.getElementById('btn-app-shutdown');
    this.shutdownOverlay = document.getElementById('shutdown-overlay');
    this.shutdownStatusMessage = document.getElementById('shutdown-status-message');

    // Workspaces
    this.workspaceStyleAnchor = document.getElementById('workspace-style-anchor');
    this.workspaceReferences = document.getElementById('workspace-references');
    this.workspaceStoryboard = document.getElementById('workspace-storyboard');
    this.workspaceTimeline = document.getElementById('workspace-timeline');

    // Stage 1: Visual Style Anchor Studio Elements
    this.btnStage1ResetAnchor = document.getElementById('btn-stage1-reset-anchor');
    this.btnStage1AiDeconstruct = document.getElementById('btn-stage1-ai-deconstruct');
    this.styleDeconstructSpinner = document.getElementById('style-deconstruct-spinner');
    this.btnStage1SaveBible = document.getElementById('btn-stage1-save-bible');
    this.stage1AnchorBadge = document.getElementById('stage1-anchor-badge');
    this.stage1Dropzone = document.getElementById('stage1-dropzone');
    this.stage1FileInput = document.getElementById('stage1-file-input');
    this.stage1PreviewContainer = document.getElementById('stage1-preview-container');
    this.stage1StyleImg = document.getElementById('stage1-style-img');
    this.stage1RemoveImgBtn = document.getElementById('stage1-remove-img-btn');
    this.stage1DropzonePrompt = document.getElementById('stage1-dropzone-prompt');
    this.stage1PaletteGrid = document.getElementById('stage1-palette-grid');
    this.stage1LightingInput = document.getElementById('stage1-lighting-input');
    this.stage1MediumSelect = document.getElementById('stage1-medium-select');
    this.stage1CadenceSelect = document.getElementById('stage1-cadence-select');
    this.stage1LoraInput = document.getElementById('stage1-lora-input');
    this.stage1GrainInput = document.getElementById('stage1-grain-input');
    this.stage1CameraInput = document.getElementById('stage1-camera-input');
    this.stage1BriefTextarea = document.getElementById('stage1-brief-textarea');
    this.btnJumpToStyleStudio = document.getElementById('btn-jump-to-style-studio');

    // Timeline Transition Modal Elements
    this.transitionModal = document.getElementById('transition-modal');
    this.closeTransitionModalBtn = document.getElementById('close-transition-modal-btn');
    this.cancelTransitionModalBtn = document.getElementById('cancel-transition-modal-btn');
    this.saveTransitionModalBtn = document.getElementById('save-transition-modal-btn');
    this.transTypeSelect = document.getElementById('trans-type-select');
    this.transDurationInput = document.getElementById('trans-duration-input');
    this.activeTransitionIndex = null;

    // Floating @mention Autocomplete Dropdown
    this.atMentionDropdown = document.getElementById('at-mention-dropdown');
    this.activeMentionTextarea = null;
    this.activeMentionShot = null;
    this.activeMentionMatchIndex = 0;

    // Reference Construction Workspace Elements
    this.refGroupsContainer = document.getElementById('ref-groups-container');
    this.referencesGrid = document.getElementById('ref-groups-container') || document.getElementById('references-grid');
    this.refStickyTabBar = document.getElementById('ref-sticky-tab-bar');
    this.refGroupTabs = document.querySelectorAll('.ref-group-tab');
    this.btnOpenCreateRefModal = document.getElementById('btn-open-create-ref-modal');
    this.countAllRefs = document.getElementById('count-all-refs');
    this.countCharRefs = document.getElementById('count-char-refs');
    this.countPropRefs = document.getElementById('count-prop-refs');
    this.countPlaceRefs = document.getElementById('count-place-refs');
    this.refFilterPills = document.querySelectorAll('.ref-group-tab');

    // Reference Create/Edit Modal Elements
    this.referenceAssetModal = document.getElementById('reference-asset-modal');
    this.refModalTitle = document.getElementById('ref-modal-title');
    this.closeRefModalBtn = document.getElementById('close-ref-modal-btn');
    this.cancelRefModalBtn = document.getElementById('cancel-ref-modal-btn');
    this.saveRefBtn = document.getElementById('save-ref-btn');
    this.refEditId = document.getElementById('ref-edit-id');
    this.refNameInput = document.getElementById('ref-name-input');
    this.refTagInput = document.getElementById('ref-tag-input');
    this.refDescInput = document.getElementById('ref-desc-input');
    this.refCharacterFields = document.getElementById('ref-character-fields');
    this.refPlaceFields = document.getElementById('ref-place-fields');
    this.refWardrobeInput = document.getElementById('ref-wardrobe-input');
    this.refHairInput = document.getElementById('ref-hair-input');
    this.refArchitectureInput = document.getElementById('ref-architecture-input');
    this.refAtmosphereInput = document.getElementById('ref-atmosphere-input');
    this.refUploadDropzone = document.getElementById('ref-upload-dropzone');
    this.refImageFileInput = document.getElementById('ref-image-file-input');
    this.refDropzoneEmpty = document.getElementById('ref-dropzone-empty');
    this.refDropzonePreview = document.getElementById('ref-dropzone-preview');
    this.refPreviewImg = document.getElementById('ref-preview-img');
    this.btnRemoveRefImg = document.getElementById('btn-remove-ref-img');
    this.refColorPicker = document.getElementById('ref-color-picker');
    this.refColorKeyInput = document.getElementById('ref-color-key-input');
    this.refColorPreviewDot = document.getElementById('ref-color-preview-dot');
    this.refColorPreviewText = document.getElementById('ref-color-preview-text');
    this.refSelectedFile = null;
    this.activeRefCategory = 'all';

    // Assign References Modal Elements
    this.assignReferencesModal = document.getElementById('assign-references-modal');
    this.assignModalTitle = document.getElementById('assign-modal-title');
    this.closeAssignModalBtn = document.getElementById('close-assign-modal-btn');
    this.cancelAssignModalBtn = document.getElementById('cancel-assign-modal-btn');
    this.saveAssignRefsBtn = document.getElementById('save-assign-refs-btn');
    this.assignRefsChecklist = document.getElementById('assign-refs-checklist');
    this.activeAssigningShotId = null;

    // Visual Reference (Sole Source of Truth)
    this.referenceDropzone = document.getElementById('reference-dropzone');
    this.styleImageFileInput = document.getElementById('style-image-file-input');
    this.imagePreviewContainer = document.getElementById('image-preview-container');
    this.styleReferenceImg = document.getElementById('style-reference-img');
    this.removeReferenceImgBtn = document.getElementById('remove-reference-img-btn');
    this.dropzonePrompt = document.getElementById('dropzone-prompt');
    this.refStatusIndicator = document.getElementById('ref-status-indicator');
    this.refStatusText = document.getElementById('ref-status-text');
    this.styleBriefTextarea = document.getElementById('style-brief-textarea');
    this.btnUpdateStyleBrief = document.getElementById('btn-update-style-brief');

    // Storyboard Ingestion & Keyframe Controls
    this.btnIngestDualFolder = document.getElementById('btn-ingest-dual-folder');
    this.dualFolderSpinner = document.getElementById('dual-folder-spinner');
    this.dualVideoInput = document.getElementById('dual-video-input');
    this.ingestVideoInput = document.getElementById('ingest-video-input');
    this.companionVideoInput = document.getElementById('companion-video-input');
    this.uploadKeyframesInput = document.getElementById('upload-keyframes-input');
    this.uploadColorFrameInput = document.getElementById('upload-color-frame-input');
    this.btnAddBlankShot = document.getElementById('btn-add-blank-shot');
    this.replaceKeyframeInput = document.getElementById('replace-keyframe-input');
    this.activeReplacingShotId = null;

    // Dual Video Slots Bay
    this.slotSpatialVideo = document.getElementById('slot-spatial-video');
    this.slotSpatialBadge = document.getElementById('slot-spatial-badge');
    this.slotSpatialEmpty = document.getElementById('slot-spatial-empty');
    this.slotSpatialFilled = document.getElementById('slot-spatial-filled');
    this.slotSpatialFilename = document.getElementById('slot-spatial-filename');
    this.slotSpatialMeta = document.getElementById('slot-spatial-meta');
    this.btnClearSpatialSlot = document.getElementById('btn-clear-spatial-slot');
    this.slotSpatialDropzone = document.getElementById('slot-spatial-dropzone');

    this.slotColorVideo = document.getElementById('slot-color-video');
    this.slotColorBadge = document.getElementById('slot-color-badge');
    this.slotColorEmpty = document.getElementById('slot-color-empty');
    this.slotColorFilled = document.getElementById('slot-color-filled');
    this.slotColorFilename = document.getElementById('slot-color-filename');
    this.slotColorMeta = document.getElementById('slot-color-meta');
    this.btnClearColorSlot = document.getElementById('btn-clear-color-slot');
    this.slotColorDropzone = document.getElementById('slot-color-dropzone');

    this.extractModeSelect = document.getElementById('extract-mode-select');
    this.extractCountGroup = document.getElementById('extract-count-group');
    this.extractIntervalGroup = document.getElementById('extract-interval-group');
    this.extractCountInput = document.getElementById('extract-count-input');
    this.extractIntervalInput = document.getElementById('extract-interval-input');
    this.extractStartInput = document.getElementById('extract-start-input');
    this.extractEndInput = document.getElementById('extract-end-input');

    this.btnAnalyzeVideo = document.getElementById('btn-analyze-video');
    this.analyzeSpinner = document.getElementById('analyze-spinner');
    this.btnPopulateApprovedTimeline = document.getElementById('btn-populate-approved-timeline');
    this.btnClearStoryboard = document.getElementById('btn-clear-storyboard');
    this.ingestStatusBanner = document.getElementById('ingest-status-banner');
    this.ingestBannerText = document.getElementById('ingest-banner-text');
    this.userVideoDescInput = document.getElementById('user-video-desc-input');
    this.endToEndSummaryCard = document.getElementById('end-to-end-summary-card');
    this.analysisSummaryText = document.getElementById('analysis-summary-text');
    this.analysisPacingBadge = document.getElementById('analysis-pacing-badge');
    this.storyboardGrid = document.getElementById('storyboard-grid');

    // Cinema Player & Dual-Deck Transitions
    this.cinemaPlayer = document.getElementById('cinema-player');
    this.cinemaPlayerB = document.getElementById('cinema-player-b');
    this.cinemaImagePlayer = document.getElementById('cinema-image-player');
    this.cinemaImagePlayerB = document.getElementById('cinema-image-player-b');
    this.cinemaTransitionFlash = document.getElementById('cinema-transition-flash');
    this.activeDeck = 'a';
    this.isCrossfading = false;
    this.overlayClipTitle = document.getElementById('overlay-clip-title');
    this.overlayModelBadge = document.getElementById('overlay-model-badge');
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.bigPlayBtn = document.getElementById('big-play-btn');
    this.overlayPlayCenter = document.getElementById('overlay-play-center');
    this.btnPrevClip = document.getElementById('btn-prev-clip');
    this.btnNextClip = document.getElementById('btn-next-clip');
    this.btnLoopTimeline = document.getElementById('btn-loop-timeline');
    this.timecodeDisplay = document.getElementById('timecode-display');
    this.playbackSpeedBtn = document.getElementById('playback-speed-btn');
    this.btnMute = document.getElementById('btn-mute');
    this.btnFullscreen = document.getElementById('btn-fullscreen');

    // Timeline Assembly
    this.timelineContainer = document.getElementById('timeline-container');
    this.timelineTrack = document.getElementById('timeline-track');
    this.timelinePlayhead = document.getElementById('timeline-playhead');
    this.emptyTimelineState = document.getElementById('empty-timeline-state');
    this.timelineClipCount = document.getElementById('timeline-clip-count');
    this.timelineTotalDuration = document.getElementById('timeline-total-duration');
    this.btnImportApprovedClips = document.getElementById('btn-import-approved-clips');
    this.btnClearTimeline = document.getElementById('btn-clear-timeline');

    // NLE Studio Controls & Tracks
    this.safeAreaOverlay = document.getElementById('safe-area-overlay');
    this.btnToggleGuides = document.getElementById('btn-toggle-guides');
    this.btnStepBack = document.getElementById('btn-step-back');
    this.btnStepFwd = document.getElementById('btn-step-fwd');
    this.masterVolumeSlider = document.getElementById('master-volume-slider');
    this.vuMeterWrap = document.querySelector('.vu-meter-wrap');
    this.toolSelect = document.getElementById('tool-select');
    this.toolRazor = document.getElementById('tool-razor');
    this.toolSnap = document.getElementById('tool-snap');
    this.timelineZoomSlider = document.getElementById('timeline-zoom-slider');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomFit = document.getElementById('btn-zoom-fit');
    this.btnOpenExportModal = document.getElementById('btn-open-export-modal');
    this.timelineRuler = document.getElementById('timeline-ruler');
    this.timelineTrackWrapper = document.getElementById('timeline-track-wrapper');
    this.timelineAudioLane = document.getElementById('timeline-audio-lane');
    this.btnToggleV1Vis = document.getElementById('btn-toggle-v1-vis');
    this.btnToggleV1Lock = document.getElementById('btn-toggle-v1-lock');
    this.btnToggleA1Mute = document.getElementById('btn-toggle-a1-mute');
    this.btnToggleA1Solo = document.getElementById('btn-toggle-a1-solo');
    this.btnToggleA1Lock = document.getElementById('btn-toggle-a1-lock');

    this.timelineZoom = 95; // pixels per second
    this.currentTool = 'select';
    this.snapEnabled = true;

    // NLE Resizable Layout Elements
    this.nleUpperRow = document.getElementById('nle-upper-row');
    this.nleSplitterCol = document.getElementById('nle-splitter-col');
    this.nleSplitterRow = document.getElementById('nle-splitter-row');
    this.btnExpandInspector = document.getElementById('btn-expand-inspector');
    this.toggleInspectorCollapseBtn = document.getElementById('toggle-inspector-collapse-btn');

    // Clip Inspector / Non-Destructive Trimmer
    this.clipInspectorDrawer = document.getElementById('clip-inspector-drawer');
    this.inspectorClipTitle = document.getElementById('inspector-clip-title');
    this.closeInspectorBtn = document.getElementById('close-inspector-btn');
    this.trimStartInput = document.getElementById('trim-start-input');
    this.trimEndInput = document.getElementById('trim-end-input');
    this.effectiveDurationBadge = document.getElementById('effective-duration-badge');
    this.btnApplyTrim = document.getElementById('btn-apply-trim');
    this.btnRemoveSelectedClip = document.getElementById('btn-remove-selected-clip');
    this.inspectorSelectedContent = document.getElementById('inspector-selected-content');
    this.inspectorEmptyState = document.getElementById('inspector-empty-state');
    this.inspectorThumbImg = document.getElementById('inspector-thumb-img');
    this.inspectorThumbFallback = document.getElementById('inspector-thumb-fallback');
    this.inspectorModelBadge = document.getElementById('inspector-model-badge');
    this.btnMarkInPlayhead = document.getElementById('btn-mark-in-playhead');
    this.btnMarkOutPlayhead = document.getElementById('btn-mark-out-playhead');
    this.btnResetTrim = document.getElementById('btn-reset-trim');
    this.btnSplitAtPlayhead = document.getElementById('btn-split-at-playhead');

    // Preview Modal
    this.previewClipModal = document.getElementById('preview-clip-modal');
    this.previewModalTitle = document.getElementById('preview-modal-title');
    this.modalVideoPlayer = document.getElementById('modal-video-player');
    this.modalVideoDesc = document.getElementById('modal-video-desc');
    this.modalVideoPrompt = document.getElementById('modal-video-prompt');
    this.modalProviderBadge = document.getElementById('modal-provider-badge');
    this.modalKeyframesCompare = document.getElementById('modal-keyframes-compare');
    this.modalOrigKfImg = document.getElementById('modal-orig-kf-img');
    this.modalStyledKfImg = document.getElementById('modal-styled-kf-img');
    this.closePreviewModalBtn = document.getElementById('close-preview-modal-btn');
    this.closePreviewModalFooterBtn = document.getElementById('close-preview-modal-footer-btn');
    this.btnModalAddTimeline = document.getElementById('btn-modal-add-timeline');

    // Keyframe Review & Comparison Lightbox Modal
    this.keyframeLightboxModal = document.getElementById('keyframe-lightbox-modal');
    this.kfModalIcon = document.getElementById('kf-modal-icon');
    this.kfModalTitle = document.getElementById('kf-modal-title');
    this.kfModalSubtitle = document.getElementById('kf-modal-subtitle');
    this.btnKfModeSingle = document.getElementById('btn-kf-mode-single');
    this.btnKfModeCompare = document.getElementById('btn-kf-mode-compare');
    this.btnKfPrevShot = document.getElementById('btn-kf-prev-shot');
    this.btnKfNextShot = document.getElementById('btn-kf-next-shot');
    this.kfShotCounter = document.getElementById('kf-shot-counter');
    this.closeKfModalBtn = document.getElementById('close-kf-modal-btn');
    this.closeKfModalFooterBtn = document.getElementById('close-kf-modal-footer-btn');
    this.kfSingleTabs = document.getElementById('kf-single-tabs');
    this.tabKfSource = document.getElementById('tab-kf-source');
    this.tabKfColor = document.getElementById('tab-kf-color');
    this.tabKfCompOut = document.getElementById('tab-kf-compout');
    this.tabKfRestyle = document.getElementById('tab-kf-restyle');
    this.tabKfRegened = document.getElementById('tab-kf-regened');
    this.kfViewportSingle = document.getElementById('kf-viewport-single');
    this.kfSingleImg = document.getElementById('kf-single-img');
    this.kfSingleEmpty = document.getElementById('kf-single-empty');
    this.kfSingleEmptyText = document.getElementById('kf-single-empty-text');
    this.btnLightboxRestyle = document.getElementById('btn-lightbox-restyle');
    this.kfStageBadge = document.getElementById('kf-stage-badge');
    this.kfMetaRes = document.getElementById('kf-meta-res');
    this.kfOpenRaw = document.getElementById('kf-open-raw');
    this.kfViewportCompare = document.getElementById('kf-viewport-compare');
    this.kfCompareSourceImg = document.getElementById('kf-compare-source-img');
    this.kfCompareColorImg = document.getElementById('kf-compare-color-img');
    this.kfCompareColorEmpty = document.getElementById('kf-compare-color-empty');
    this.btnCompareUploadColor = document.getElementById('btn-compare-upload-color');
    this.kfCompareRegenedImg = document.getElementById('kf-compare-regened-img');
    this.kfCompareRegenedEmpty = document.getElementById('kf-compare-regened-empty');
    this.btnCompareRestyle = document.getElementById('btn-compare-restyle');
    this.kfDescText = document.getElementById('kf-desc-text');
    this.kfStyleText = document.getElementById('kf-style-text');
    this.btnKfReplaceSource = document.getElementById('btn-kf-replace-source');
    this.btnKfReplaceColor = document.getElementById('btn-kf-replace-color');
    this.btnKfTriggerRestyle = document.getElementById('btn-kf-trigger-restyle');

    this.companionVideoInput = document.getElementById('companion-video-input');
    this.uploadColorFrameInput = document.getElementById('upload-color-frame-input');
    this.activeColorShotId = null;

    this.activeLightboxShotIndex = 0;
    this.activeLightboxTarget = 'source'; // 'source', 'color', or 'regened'
    this.activeLightboxMode = 'single';   // 'single' or 'compare'

    // Export Modal
    this.exportModal = document.getElementById('export-modal');
    this.closeExportModalBtn = document.getElementById('close-export-modal-btn');
    this.cancelExportBtn = document.getElementById('cancel-export-btn');
    this.startStitchExportBtn = document.getElementById('start-stitch-export-btn');
    this.modalClipCount = document.getElementById('modal-clip-count');
    this.modalTotalDuration = document.getElementById('modal-total-duration');
    this.exportResSelect = document.getElementById('export-res-select');
    this.exportProgressBox = document.getElementById('export-progress-box');
    this.exportProgressText = document.getElementById('export-progress-text');
    this.exportResultCard = document.getElementById('export-result-card');
    this.exportPreviewPlayer = document.getElementById('export-preview-player');
    this.exportDownloadLink = document.getElementById('export-download-link');
    this.exportModalFooter = document.getElementById('export-modal-footer');

    // Settings Modal
    this.settingsModal = document.getElementById('settings-modal');
    this.closeSettingsModalBtn = document.getElementById('close-settings-modal-btn');
    this.cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    this.saveSettingsBtn = document.getElementById('save-settings-btn');
    this.settingsMeshyKey = document.getElementById('settings-meshy-key');
    this.settingsOpenaiKey = document.getElementById('settings-openai-key');
    this.settingsGeminiKey = document.getElementById('settings-gemini-key');
    this.settingsVideoProvider = document.getElementById('settings-video-provider');
    this.settingsVideoKey = document.getElementById('settings-video-key');
    this.settingsKlingAccessKey = document.getElementById('settings-kling-access-key');
    this.settingsKlingSecretKey = document.getElementById('settings-kling-secret-key');
    this.settingsFalKey = document.getElementById('settings-fal-key');
    this.settingsRestyleModel = document.getElementById('settings-restyle-model');
    this.settingsAssetGenModel = document.getElementById('settings-asset-gen-model');
    this.settingsHarmonizeModel = document.getElementById('settings-harmonize-model');
    this.settingsFalModel = document.getElementById('settings-fal-model');
    this.settingsElevenLabsKey = document.getElementById('settings-elevenlabs-key');
    this.klingKeysGroup = document.getElementById('kling-keys-group');
    this.falKeyGroup = document.getElementById('fal-key-group');
    this.settingsCustomEndpoint = document.getElementById('settings-custom-endpoint');
    this.settingsFeedback = document.getElementById('settings-feedback');
    this.falKeyStatusBadge = document.getElementById('fal-key-status-badge');
    this.klingKeyStatusBadge = document.getElementById('kling-key-status-badge');
    this.elevenLabsKeyStatusBadge = document.getElementById('elevenlabs-key-status-badge');
    this.btnToggleFalKeyVis = document.getElementById('btn-toggle-fal-key-vis');

    // Spatial Continuity Ledger Modal Elements
    this.modalSpatialContinuity = document.getElementById('modal-spatial-continuity');
    this.spatialModalTitle = document.getElementById('spatial-modal-title');
    this.spatialModalSubtitle = document.getElementById('spatial-modal-subtitle');
    this.spatialMotionVectorInput = document.getElementById('spatial-motion-vector-input');
    this.spatialCameraTrajSelect = document.getElementById('spatial-camera-traj-select');
    this.spatialPosSelect = document.getElementById('spatial-pos-select');
    this.spatialFacingSelect = document.getElementById('spatial-facing-select');
    this.spatialEyelineInput = document.getElementById('spatial-eyeline-input');
    this.spatialAngleInput = document.getElementById('spatial-angle-input');
    this.spatialLightingInput = document.getElementById('spatial-lighting-input');
    this.spatialAxisInput = document.getElementById('spatial-axis-input');
    this.closeSpatialModalBtn = document.getElementById('close-spatial-modal-btn');
    this.cancelSpatialModalBtn = document.getElementById('cancel-spatial-modal-btn');
    this.saveSpatialModalBtn = document.getElementById('save-spatial-modal-btn');
    this.spatialModalBackdrop = document.getElementById('spatial-modal-backdrop');
    this.activeSpatialShotId = null;

    // ElevenLabs Cinematic Audio Studio Modal Elements
    this.modalAudioEngine = document.getElementById('modal-audio-engine');
    this.audioModalTitle = document.getElementById('audio-modal-title');
    this.audioModalSubtitle = document.getElementById('audio-modal-subtitle');
    this.closeAudioModalBtn = document.getElementById('close-audio-modal-btn');
    this.cancelAudioModalBtn = document.getElementById('cancel-audio-modal-btn');
    this.audioModalBackdrop = document.getElementById('audio-modal-backdrop');
    this.btnGenerateAudio = document.getElementById('btn-generate-audio');
    this.audioModeRadios = document.querySelectorAll('input[name="audio-mode"]');
    this.audioSfxSection = document.getElementById('audio-sfx-section');
    this.audioDialogueSection = document.getElementById('audio-dialogue-section');
    this.audioSfxPrompt = document.getElementById('audio-sfx-prompt');
    this.audioSfxDuration = document.getElementById('audio-sfx-duration');
    this.audioSfxInfluence = document.getElementById('audio-sfx-influence');
    this.audioVoiceSelect = document.getElementById('audio-voice-select');
    this.audioDialogueText = document.getElementById('audio-dialogue-text');
    this.audioTracksList = document.getElementById('audio-tracks-list');
    this.audioFeedbackMsg = document.getElementById('audio-feedback-msg');
    this.activeAudioShotId = null;

    this.togglePlayblastMode = document.getElementById('toggle-playblast-mode');
    this.restyleStrengthSlider = document.getElementById('restyle-strength-slider');
    this.restyleStrengthValue = document.getElementById('restyle-strength-value');
    this.badgeIpAdapterStatus = document.getElementById('badge-ip-adapter-status');

    // Footage Library & Manual Take Assignment Modal
    this.modalFootageLibrary = document.getElementById('modal-footage-library');
    this.footageModalTitle = document.getElementById('footage-modal-title');
    this.footageModalSubtitle = document.getElementById('footage-modal-subtitle');
    this.closeFootageModalBtn = document.getElementById('close-footage-modal-btn');
    this.cancelFootageModalBtn = document.getElementById('cancel-footage-modal-btn');
    this.footageFileInput = document.getElementById('footage-file-input');
    this.btnBrowseFootage = document.getElementById('btn-browse-footage');
    this.footageUploadDropzone = document.getElementById('footage-upload-dropzone');
    this.footageUploadSpinner = document.getElementById('footage-upload-spinner');
    this.footageSearchInput = document.getElementById('footage-search-input');
    this.footageCountLabel = document.getElementById('footage-count-label');
    this.footageLibraryGrid = document.getElementById('footage-library-grid');
    this.btnRefreshFootage = document.getElementById('btn-refresh-footage');
    this.activeFootageShotId = null;
    this.libraryClipsCache = [];

    // Layered Restyle Studio
    this.initLayerStudioElements();
  }

  bindEvents() {
    // Project title
    this.projectTitleInput.addEventListener('change', () => {
      this.project.name = this.projectTitleInput.value.trim();
      this.saveProject();
    });

    // Workspace Switcher (4-Stage Linear Flow)
    this.tabStyleAnchor?.addEventListener('click', () => this.switchWorkspace('style-anchor'));
    this.tabReferences?.addEventListener('click', () => this.switchWorkspace('references'));
    this.tabStoryboard?.addEventListener('click', () => this.switchWorkspace('storyboard'));
    this.tabTimeline?.addEventListener('click', () => this.switchWorkspace('timeline'));
    this.btnJumpToStyleStudio?.addEventListener('click', () => this.switchWorkspace('style-anchor'));

    // Layered Restyle Studio Events
    this.initLayerStudioEvents();
    this.initRangeModalEvents();

    // Stage 1: Style Anchor Image Dropzone
    this.stage1Dropzone?.addEventListener('click', (e) => {
      if (e.target !== this.stage1RemoveImgBtn) {
        this.stage1FileInput?.click();
      }
    });

    this.stage1FileInput?.addEventListener('change', () => this.handleStage1ImageUpload());
    this.stage1RemoveImgBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleRemoveStyleAnchor();
    });

    this.stage1Dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.stage1Dropzone.style.borderColor = 'var(--accent-cyan)';
    });

    this.stage1Dropzone?.addEventListener('dragleave', () => {
      this.stage1Dropzone.style.borderColor = '';
    });

    this.stage1Dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.stage1Dropzone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.stage1FileInput.files = e.dataTransfer.files;
        this.handleStage1ImageUpload();
      }
    });

    // Stage 1 Actions
    this.btnStage1AiDeconstruct?.addEventListener('click', () => this.handleStage1Deconstruct());
    this.btnStage1SaveBible?.addEventListener('click', () => this.handleStage1SaveBible());
    this.btnStage1ResetAnchor?.addEventListener('click', () => this.handleRemoveStyleAnchor());

    // Color Swatch pickers in Stage 1
    this.stage1PaletteGrid?.querySelectorAll('.swatch-picker').forEach(picker => {
      picker.addEventListener('input', () => {
        const hexSpan = picker.parentElement?.querySelector('.swatch-hex');
        if (hexSpan) hexSpan.textContent = picker.value.toUpperCase();
      });
    });

    // Timeline Transition Modal Events
    this.closeTransitionModalBtn?.addEventListener('click', () => this.closeTransitionModal());
    this.cancelTransitionModalBtn?.addEventListener('click', () => this.closeTransitionModal());
    this.saveTransitionModalBtn?.addEventListener('click', () => this.saveTransition());
    this.transTypeSelect?.addEventListener('change', () => {
      document.getElementById('trans-duration-group')?.classList.toggle('hidden', this.transTypeSelect.value === 'cut');
    });

    // Close @mention autocomplete on outside click
    document.addEventListener('click', (e) => {
      if (this.atMentionDropdown && !this.atMentionDropdown.contains(e.target) && e.target !== this.activeMentionTextarea) {
        this.hideMentionDropdown();
      }
    });

    // Playblast Overhaul Mode & Denoise Freedom Slider
    this.togglePlayblastMode?.addEventListener('change', () => {
      const isPlayblast = this.togglePlayblastMode.checked;
      const targetVal = isPlayblast ? 0.82 : 0.65;
      if (this.restyleStrengthSlider) {
        this.restyleStrengthSlider.value = targetVal;
        if (this.restyleStrengthValue) {
          this.restyleStrengthValue.textContent = `${Math.round(targetVal * 100)}%`;
        }
      }
      this.saveRestyleSettings(isPlayblast, targetVal);
    });

    this.restyleStrengthSlider?.addEventListener('input', () => {
      const val = parseFloat(this.restyleStrengthSlider.value);
      if (this.restyleStrengthValue) {
        this.restyleStrengthValue.textContent = `${Math.round(val * 100)}%`;
      }
    });

    this.restyleStrengthSlider?.addEventListener('change', () => {
      const isPlayblast = this.togglePlayblastMode ? this.togglePlayblastMode.checked : true;
      const val = parseFloat(this.restyleStrengthSlider.value);
      this.saveRestyleSettings(isPlayblast, val);
    });

    // Reference Construction Workspace Content Group Tabs & Scrolling
    this.initReferencesGroupTabs();
    this.initReferencesScrollSpy();

    this.btnOpenCreateRefModal?.addEventListener('click', () => this.openCreateReferenceModal('characters'));
    this.closeRefModalBtn?.addEventListener('click', () => this.closeReferenceModal());
    this.cancelRefModalBtn?.addEventListener('click', () => this.closeReferenceModal());
    this.saveRefBtn?.addEventListener('click', () => this.saveReferenceAsset());

    this.refColorPicker?.addEventListener('input', () => {
      this.syncRefColorKeyUI(this.refColorPicker.value);
    });
    this.refColorKeyInput?.addEventListener('input', () => {
      this.syncRefColorKeyUI(this.refColorKeyInput.value);
    });
    document.querySelectorAll('.btn-color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.syncRefColorKeyUI(btn.dataset.color || '');
      });
    });

    document.querySelectorAll('input[name="ref-category"]').forEach(radio => {
      radio.addEventListener('change', () => this.updateRefCategoryFields());
    });

    // Reference Image Upload Dropzone
    this.refUploadDropzone?.addEventListener('click', (e) => {
      if (e.target !== this.btnRemoveRefImg) {
        this.refImageFileInput.click();
      }
    });

    this.refUploadDropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.refUploadDropzone.style.borderColor = 'var(--accent-cyan)';
    });

    this.refUploadDropzone?.addEventListener('dragleave', () => {
      this.refUploadDropzone.style.borderColor = '';
    });

    this.refUploadDropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.refUploadDropzone.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleReferenceImageSelected(e.dataTransfer.files[0]);
      }
    });

    this.refImageFileInput?.addEventListener('change', () => {
      if (this.refImageFileInput.files && this.refImageFileInput.files[0]) {
        this.handleReferenceImageSelected(this.refImageFileInput.files[0]);
      }
    });

    this.btnRemoveRefImg?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.refSelectedFile = null;
      this.refImageFileInput.value = '';
      this.refDropzoneEmpty.classList.remove('hidden');
      this.refDropzonePreview.classList.add('hidden');
      this.refPreviewImg.src = '';
    });

    // Assign References to Shot Modal
    this.closeAssignModalBtn?.addEventListener('click', () => this.closeAssignModal());
    this.cancelAssignModalBtn?.addEventListener('click', () => this.closeAssignModal());
    this.saveAssignRefsBtn?.addEventListener('click', () => this.saveShotReferenceAssignments());

    // Meshy Points
    this.btnCheckPoints?.addEventListener('click', () => this.checkMeshyPoints());

    // Visual Reference Image Upload (Legacy sidebar - safely attach if present)
    this.referenceDropzone?.addEventListener('click', (e) => {
      if (e.target !== this.removeReferenceImgBtn) {
        this.styleImageFileInput?.click();
      }
    });

    this.styleImageFileInput?.addEventListener('change', () => this.handleStyleImageUpload());

    this.removeReferenceImgBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.project.visualReference = { imageUrl: null, filename: null, styleBrief: '' };
      this.updateVisualReferenceUI(null);
      if (this.styleBriefTextarea) this.styleBriefTextarea.value = '';
      this.saveProject();
    });

    this.btnUpdateStyleBrief?.addEventListener('click', () => this.handleUpdateStyleBrief());
    this.styleBriefTextarea?.addEventListener('change', () => {
      if (this.project.visualReference) {
        this.project.visualReference.styleBrief = this.styleBriefTextarea.value;
        this.saveProject();
      }
    });

    // Video Ingestion & Breakdown
    this.btnIngestDualFolder?.addEventListener('click', () => this.handleIngestDualFolder());
    this.dualVideoInput?.addEventListener('change', () => this.handleIngestDualVideos());
    this.ingestVideoInput?.addEventListener('change', () => this.handleIngestVideo());
    this.btnAnalyzeVideo?.addEventListener('click', () => this.handleAnalyzeVideo());
    this.btnPopulateApprovedTimeline?.addEventListener('click', () => this.populateApprovedToTimeline());
    this.btnClearStoryboard?.addEventListener('click', () => this.clearStoryboard());
    this.btnClearSpatialSlot?.addEventListener('click', () => this.clearSpatialVideoSlot());
    this.btnClearColorSlot?.addEventListener('click', () => this.clearColorVideoSlot());

    // Drag-and-drop support for Spatial and Color Video Slots
    if (this.slotSpatialDropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        this.slotSpatialDropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.slotSpatialDropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        this.slotSpatialDropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.slotSpatialDropzone.classList.remove('dragover');
        });
      });
      this.slotSpatialDropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && (file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i))) {
          this.uploadDirectSpatialVideo(file);
        }
      });
    }

    if (this.slotColorDropzone) {
      ['dragenter', 'dragover'].forEach(name => {
        this.slotColorDropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.slotColorDropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        this.slotColorDropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.slotColorDropzone.classList.remove('dragover');
        });
      });
      this.slotColorDropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file && (file.type.startsWith('video/') || file.name.match(/\.(mp4|mov|webm)$/i))) {
          this.uploadDirectCompanionVideo(file);
        }
      });
    }

    // User manual video description sync
    this.userVideoDescInput?.addEventListener('input', () => {
      if (!this.project.ingestedVideo) this.project.ingestedVideo = {};
      this.project.ingestedVideo.userDescription = this.userVideoDescInput.value;
      this.saveProject();
    });

    // Extraction Mode & Controls
    this.extractModeSelect?.addEventListener('change', () => {
      const isCount = this.extractModeSelect.value === 'count';
      if (this.extractCountGroup) this.extractCountGroup.classList.toggle('hidden', !isCount);
      if (this.extractIntervalGroup) this.extractIntervalGroup.classList.toggle('hidden', isCount);
    });

    // Manual Keyframe Ingestion & Custom Shots
    this.uploadKeyframesInput?.addEventListener('change', () => this.handleUploadKeyframes());
    this.btnAddBlankShot?.addEventListener('click', () => this.handleAddBlankShot());
    this.replaceKeyframeInput?.addEventListener('change', () => this.handleReplaceKeyframe());

    // Cinema Player
    this.btnPlayPause?.addEventListener('click', () => this.togglePlayPause());
    this.bigPlayBtn?.addEventListener('click', () => this.togglePlayPause());
    this.cinemaPlayer?.addEventListener('play', () => this.onPlayerPlay());
    this.cinemaPlayer?.addEventListener('pause', () => this.onPlayerPause());
    this.cinemaPlayer?.addEventListener('timeupdate', () => this.onPlayerTimeUpdate());
    this.cinemaPlayer?.addEventListener('ended', () => this.onPlayerEnded());

    this.cinemaPlayerB?.addEventListener('play', () => this.onPlayerPlay());
    this.cinemaPlayerB?.addEventListener('pause', () => this.onPlayerPause());
    this.cinemaPlayerB?.addEventListener('timeupdate', () => this.onPlayerTimeUpdate());
    this.cinemaPlayerB?.addEventListener('ended', () => this.onPlayerEnded());

    this.btnPrevClip?.addEventListener('click', () => this.stepClip(-1));
    this.btnNextClip?.addEventListener('click', () => this.stepClip(1));
    this.btnLoopTimeline?.addEventListener('click', () => {
      if (!this.cinemaPlayer) return;
      this.cinemaPlayer.loop = !this.cinemaPlayer.loop;
      this.btnLoopTimeline.classList.toggle('active', this.cinemaPlayer.loop);
    });

    this.playbackSpeedBtn?.addEventListener('click', () => {
      if (!this.cinemaPlayer) return;
      const speeds = [1.0, 1.25, 1.5, 2.0, 0.5];
      const cur = this.cinemaPlayer.playbackRate;
      const next = speeds[(speeds.indexOf(cur) + 1) % speeds.length];
      this.cinemaPlayer.playbackRate = next;
      this.playbackSpeedBtn.textContent = `${next}x`;
    });

    this.btnMute?.addEventListener('click', () => {
      if (!this.cinemaPlayer) return;
      this.cinemaPlayer.muted = !this.cinemaPlayer.muted;
      this.btnMute.style.opacity = this.cinemaPlayer.muted ? '0.4' : '1';
    });

    this.btnFullscreen?.addEventListener('click', () => {
      if (!this.cinemaPlayer) return;
      if (!document.fullscreenElement) {
        this.cinemaPlayer.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // NLE Transport & Monitor Controls
    this.btnToggleGuides?.addEventListener('click', () => {
      this.safeAreaOverlay?.classList.toggle('hidden');
      this.btnToggleGuides.classList.toggle('active');
    });

    this.btnStepBack?.addEventListener('click', () => {
      if (this.cinemaPlayer) {
        this.cinemaPlayer.currentTime = Math.max(0, this.cinemaPlayer.currentTime - 1.0);
      }
    });

    this.btnStepFwd?.addEventListener('click', () => {
      if (this.cinemaPlayer) {
        const dur = this.cinemaPlayer.duration || 10;
        this.cinemaPlayer.currentTime = Math.min(dur, this.cinemaPlayer.currentTime + 1.0);
      }
    });

    this.masterVolumeSlider?.addEventListener('input', () => {
      if (this.cinemaPlayer) {
        this.cinemaPlayer.volume = parseFloat(this.masterVolumeSlider.value);
      }
    });

    // NLE Toolset Selection
    this.toolSelect?.addEventListener('click', () => {
      this.currentTool = 'select';
      this.toolSelect.classList.add('active');
      this.toolRazor?.classList.remove('active');
    });

    this.toolRazor?.addEventListener('click', () => {
      this.currentTool = 'razor';
      this.toolRazor.classList.add('active');
      this.toolSelect?.classList.remove('active');
      this.splitClipAtPlayhead();
    });

    this.toolSnap?.addEventListener('click', () => {
      this.snapEnabled = !this.snapEnabled;
      this.toolSnap.classList.toggle('active', this.snapEnabled);
    });

    // NLE Zoom Controls
    this.timelineZoomSlider?.addEventListener('input', () => {
      this.timelineZoom = parseInt(this.timelineZoomSlider.value, 10) || 95;
      this.renderTimeline();
    });

    this.btnZoomOut?.addEventListener('click', () => {
      if (this.timelineZoomSlider) {
        this.timelineZoomSlider.value = Math.max(50, parseInt(this.timelineZoomSlider.value, 10) - 20);
        this.timelineZoom = parseInt(this.timelineZoomSlider.value, 10);
        this.renderTimeline();
      }
    });

    this.btnZoomIn?.addEventListener('click', () => {
      if (this.timelineZoomSlider) {
        this.timelineZoomSlider.value = Math.min(220, parseInt(this.timelineZoomSlider.value, 10) + 20);
        this.timelineZoom = parseInt(this.timelineZoomSlider.value, 10);
        this.renderTimeline();
      }
    });

    this.btnZoomFit?.addEventListener('click', () => this.fitTimelineZoom());
    this.btnOpenExportModal?.addEventListener('click', () => this.openExportModal());

    // NLE Quick In/Out and Split Trimming
    this.btnMarkInPlayhead?.addEventListener('click', () => this.markInAtPlayhead());
    this.btnMarkOutPlayhead?.addEventListener('click', () => this.markOutAtPlayhead());
    this.btnResetTrim?.addEventListener('click', () => this.resetClipTrim());
    this.btnSplitAtPlayhead?.addEventListener('click', () => this.splitClipAtPlayhead());

    // Track Controls (V1/A1)
    this.btnToggleV1Vis?.addEventListener('click', () => {
      this.btnToggleV1Vis.classList.toggle('active');
      const hidden = this.btnToggleV1Vis.classList.contains('active');
      this.btnToggleV1Vis.textContent = hidden ? '🚫' : '👁️';
      if (this.cinemaPlayer) this.cinemaPlayer.style.opacity = hidden ? '0' : '1';
    });

    this.btnToggleA1Mute?.addEventListener('click', () => {
      this.btnToggleA1Mute.classList.toggle('active');
      const muted = this.btnToggleA1Mute.classList.contains('active');
      if (this.cinemaPlayer) this.cinemaPlayer.muted = muted;
    });

    // Timeline Scrubbing on Ruler & Tracks
    this.setupTimelineScrubbing();

    // NLE Global Hotkeys
    this.setupNleHotkeys();

    // NLE Resizable Layout Splitters
    this.setupNleResizers();

    // NLE Audio Master & Equalizer Controls
    this.initAudioEqualizer();

    // Timeline actions
    this.btnImportApprovedClips?.addEventListener('click', () => this.populateApprovedToTimeline());
    this.btnClearTimeline?.addEventListener('click', () => this.clearTimeline());

    // Inspector
    this.closeInspectorBtn?.addEventListener('click', () => {
      this.selectedTimelineClipId = null;
      if (this.inspectorSelectedContent) this.inspectorSelectedContent.classList.add('hidden');
      if (this.inspectorEmptyState) this.inspectorEmptyState.classList.remove('hidden');
      this.inspectorClipTitle.textContent = 'No Clip Selected';
      this.renderTimeline();
    });

    this.btnApplyTrim?.addEventListener('click', () => this.applyTrim());
    this.btnRemoveSelectedClip?.addEventListener('click', () => this.removeSelectedTimelineClip());
    this.trimStartInput?.addEventListener('input', () => this.updateEffectiveDuration());
    this.trimEndInput?.addEventListener('input', () => this.updateEffectiveDuration());

    // Preview Modal
    this.closePreviewModalBtn?.addEventListener('click', () => this.closePreviewModal());
    this.closePreviewModalFooterBtn?.addEventListener('click', () => this.closePreviewModal());

    // Export Modal
    this.openExportModalBtn?.addEventListener('click', () => this.openExportModal());
    this.closeExportModalBtn?.addEventListener('click', () => this.closeExportModal());
    this.cancelExportBtn?.addEventListener('click', () => this.closeExportModal());
    this.startStitchExportBtn?.addEventListener('click', () => this.startStitchExport());

    // Settings Modal
    this.openSettingsBtn?.addEventListener('click', () => this.openSettingsModal());
    this.closeSettingsModalBtn?.addEventListener('click', () => this.closeSettingsModal());
    this.cancelSettingsBtn?.addEventListener('click', () => this.closeSettingsModal());
    this.saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
    this.settingsVideoProvider?.addEventListener('change', () => {
      this.customEndpointGroup?.classList.toggle('hidden', this.settingsVideoProvider.value !== 'custom');
    });
    this.btnToggleFalKeyVis?.addEventListener('click', () => {
      if (this.settingsFalKey) {
        this.settingsFalKey.type = this.settingsFalKey.type === 'password' ? 'text' : 'password';
      }
    });

    // Single-Click App & Services Shutdown
    this.btnAppShutdown?.addEventListener('click', () => this.handleSingleClickShutdown());

    // Spatial Continuity Ledger Modal
    this.closeSpatialModalBtn?.addEventListener('click', () => this.closeSpatialModal());
    this.cancelSpatialModalBtn?.addEventListener('click', () => this.closeSpatialModal());
    this.modalSpatialContinuity?.addEventListener('click', (e) => {
      if (e.target === this.modalSpatialContinuity) this.closeSpatialModal();
    });
    this.saveSpatialModalBtn?.addEventListener('click', () => this.saveSpatialModal());

    // ElevenLabs Cinematic Audio Studio Modal
    this.closeAudioModalBtn?.addEventListener('click', () => this.closeAudioModal());
    this.cancelAudioModalBtn?.addEventListener('click', () => this.closeAudioModal());
    this.audioModalBackdrop?.addEventListener('click', () => this.closeAudioModal());
    this.btnGenerateAudio?.addEventListener('click', () => this.handleGenerateAudio());
    this.audioModeRadios?.forEach(radio => {
      radio.addEventListener('change', () => {
        const mode = document.querySelector('input[name="audio-mode"]:checked')?.value || 'sfx';
        this.audioSfxSection?.classList.toggle('hidden', mode !== 'sfx');
        this.audioDialogueSection?.classList.toggle('hidden', mode !== 'dialogue');
      });
    });

    // Footage Library & Manual Take Assignment Modal
    this.closeFootageModalBtn?.addEventListener('click', () => this.closeFootageLibraryModal());
    this.cancelFootageModalBtn?.addEventListener('click', () => this.closeFootageLibraryModal());
    this.modalFootageLibrary?.addEventListener('click', (e) => {
      if (e.target === this.modalFootageLibrary) this.closeFootageLibraryModal();
    });
    this.btnBrowseFootage?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.footageFileInput?.click();
    });
    this.footageUploadDropzone?.addEventListener('click', (e) => {
      if (e.target !== this.btnBrowseFootage) this.footageFileInput?.click();
    });
    this.footageFileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file && this.activeFootageShotId) {
        this.uploadVideoAsTake(file, this.activeFootageShotId);
      }
      e.target.value = '';
    });
    this.footageUploadDropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.footageUploadDropzone.classList.add('drag-active');
    });
    this.footageUploadDropzone?.addEventListener('dragleave', () => {
      this.footageUploadDropzone.classList.remove('drag-active');
    });
    this.footageUploadDropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.footageUploadDropzone.classList.remove('drag-active');
      const file = e.dataTransfer?.files?.[0];
      if (file && this.activeFootageShotId) {
        this.uploadVideoAsTake(file, this.activeFootageShotId);
      }
    });
    this.footageSearchInput?.addEventListener('input', () => {
      this.filterFootageLibraryGrid(this.footageSearchInput.value);
    });
    this.btnRefreshFootage?.addEventListener('click', () => {
      this.loadFootageLibrary();
    });

    // Keyframe Review & Lightbox Comparison Modal
    this.closeKfModalBtn?.addEventListener('click', () => this.closeKeyframeReviewModal());
    this.closeKfModalFooterBtn?.addEventListener('click', () => this.closeKeyframeReviewModal());
    this.keyframeLightboxModal?.addEventListener('click', (e) => {
      if (e.target === this.keyframeLightboxModal) this.closeKeyframeReviewModal();
    });

    this.btnKfModeSingle?.addEventListener('click', () => this.setKeyframeLightboxMode('single'));
    this.btnKfModeCompare?.addEventListener('click', () => this.setKeyframeLightboxMode('compare'));

    this.tabKfSource?.addEventListener('click', () => this.setKeyframeLightboxTarget('source'));
    this.tabKfColor?.addEventListener('click', () => this.setKeyframeLightboxTarget('color'));
    this.tabKfCompOut?.addEventListener('click', () => this.setKeyframeLightboxTarget('compout'));
    this.tabKfRestyle?.addEventListener('click', () => this.setKeyframeLightboxTarget('restyle'));
    this.tabKfRegened?.addEventListener('click', () => this.setKeyframeLightboxTarget('restyle'));

    this.btnKfPrevShot?.addEventListener('click', () => this.stepLightboxShot(-1));
    this.btnKfNextShot?.addEventListener('click', () => this.stepLightboxShot(1));

    this.btnLightboxRestyle?.addEventListener('click', () => this.restyleCurrentLightboxShot());
    this.btnCompareRestyle?.addEventListener('click', () => this.restyleCurrentLightboxShot());
    this.btnKfTriggerRestyle?.addEventListener('click', () => this.restyleCurrentLightboxShot());

    this.btnKfReplaceSource?.addEventListener('click', () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (shot && this.replaceKeyframeInput) {
        this.activeReplacingShotId = shot.id;
        this.replaceKeyframeInput.click();
      }
    });

    this.btnKfReplaceColor?.addEventListener('click', () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (shot && this.uploadColorFrameInput) {
        this.activeColorShotId = shot.id;
        this.uploadColorFrameInput.click();
      }
    });

    this.btnCompareUploadColor?.addEventListener('click', () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (shot && this.uploadColorFrameInput) {
        this.activeColorShotId = shot.id;
        this.uploadColorFrameInput.click();
      }
    });

    this.companionVideoInput?.addEventListener('change', () => this.handleCompanionVideoUpload());
    this.uploadColorFrameInput?.addEventListener('change', () => this.handleUploadColorFrame());

    // Lightbox Global Key Shortcuts
    window.addEventListener('keydown', (e) => {
      if (!this.keyframeLightboxModal || this.keyframeLightboxModal.classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeKeyframeReviewModal();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stepLightboxShot(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.stepLightboxShot(1);
      } else if (e.key === '1') {
        e.preventDefault();
        this.setKeyframeLightboxMode('single');
        this.setKeyframeLightboxTarget('source');
      } else if (e.key === '2') {
        e.preventDefault();
        this.setKeyframeLightboxMode('single');
        this.setKeyframeLightboxTarget('regened');
      } else if (e.key === '3' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.setKeyframeLightboxMode('compare');
      }
    });
  }

  async loadInitialData() {
    try {
      // Load Settings
      const settingsRes = await fetch('/api/settings');
      const settings = await settingsRes.json();
      this.applySettingsUI(settings);

      // Load Project
      const projRes = await fetch('/api/project');
      const project = await projRes.json();
      this.project = project;

      // Populate UI
      this.projectTitleInput.value = this.project.name || 'Cinematic Storyboard Project';
      
      // Visual Reference & Style Brief
      if (this.project.visualReference?.imageUrl) {
        this.updateVisualReferenceUI(this.project.visualReference.imageUrl, this.project.visualReference.filename);
        if (this.styleBriefTextarea && this.project.visualReference.styleBrief) {
          this.styleBriefTextarea.value = this.project.visualReference.styleBrief;
        }
      } else {
        this.updateVisualReferenceUI(null);
        if (this.styleBriefTextarea) this.styleBriefTextarea.value = '';
      }

      // Check points balance
      this.checkMeshyPoints(true);

      // Ingested Video & Context
      if (this.project.ingestedVideo) {
        if (this.userVideoDescInput && this.project.ingestedVideo.userDescription) {
          this.userVideoDescInput.value = this.project.ingestedVideo.userDescription;
        }
        if (this.project.ingestedVideo.filePath || this.project.ingestedVideo.filename) {
          this.btnAnalyzeVideo.disabled = false;
        }
        this.renderEndToEndSummary();
      } else if (this.userVideoDescInput && !this.userVideoDescInput.value) {
        this.userVideoDescInput.value = 'A fleet of 3 pirate raiding vessels hold in orbit over the small moon Frontiers Reach as they drop rickety improvised landing craft made of heat shields with some thrusters and seats attached to them. The camera chasing the landing craft as they descend through the atmosphere through a storm of flak fire.';
      }

      // Ensure visualReference structure
      this.project.visualReference = this.project.visualReference || {};
      this.project.visualReference.styleBible = this.project.visualReference.styleBible || {
        palette: ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'],
        lighting: 'Volumetric neon rim lighting, high-contrast chiaroscuro',
        medium: 'Stylized Digital Painting & Cyberpunk Photorealism',
        grain: '35mm Anamorphic Film Grain',
        cameraFeel: 'Cinematic Widescreen 2.39:1, anamorphic horizontal flares'
      };

      // Ensure references structure
      if (!this.project.references) {
        this.project.references = { characters: [], props: [], places: [] };
      }

      // Apply restyle settings
      if (this.project.settings) {
        if (this.togglePlayblastMode && this.project.settings.playblastMode !== undefined) {
          this.togglePlayblastMode.checked = Boolean(this.project.settings.playblastMode);
        }
        if (this.restyleStrengthSlider && this.project.settings.restyleStrength) {
          this.restyleStrengthSlider.value = this.project.settings.restyleStrength;
          if (this.restyleStrengthValue) {
            this.restyleStrengthValue.textContent = `${Math.round(this.project.settings.restyleStrength * 100)}%`;
          }
        }
      }

      // Render Workspaces
      this.updateStage1UI();
      this.renderReferences(this.activeRefCategory || 'all');
      this.switchWorkspace(this.project.activeWorkspace || 'storyboard');
      this.renderStoryboard();
      this.renderTimeline();

      if (this.project.timeline && this.project.timeline.length > 0) {
        this.cueTimelineClip(0, false);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  }

  applySettingsUI(settings) {
    if (settings.hasFalKey || settings.hasKlingKey) {
      document.getElementById('meshy-status-pill')?.querySelector('.status-dot')?.classList.add('dot-active');
    }
    const prov = settings.videoProvider || 'fal';
    const names = {
      fal: 'Fal.ai (Wan 2.1 / Flux)',
      kling: 'Direct Kling AI',
      simulator: 'Studio Simulator',
      custom: 'Custom API'
    };
    const label = document.getElementById('active-model-label');
    if (label) label.textContent = names[prov] || 'Fal.ai (Wan 2.1)';
    if (this.settingsVideoProvider) this.settingsVideoProvider.value = prov;
    if (this.settingsRestyleModel && settings.falRestyleModel) this.settingsRestyleModel.value = settings.falRestyleModel;
    if (this.settingsFalModel && settings.falModel) this.settingsFalModel.value = settings.falModel;
    if (this.customEndpointGroup) this.customEndpointGroup.classList.toggle('hidden', prov !== 'custom');
  }

  switchWorkspace(workspace) {
    this.project.activeWorkspace = workspace;
    this.tabStyleAnchor?.classList.toggle('active', workspace === 'style-anchor');
    this.tabReferences?.classList.toggle('active', workspace === 'references');
    this.tabStoryboard?.classList.toggle('active', workspace === 'storyboard');
    this.tabTimeline?.classList.toggle('active', workspace === 'timeline');

    this.workspaceStyleAnchor?.classList.toggle('hidden', workspace !== 'style-anchor');
    this.workspaceReferences?.classList.toggle('hidden', workspace !== 'references');
    this.workspaceStoryboard?.classList.toggle('hidden', workspace !== 'storyboard');
    this.workspaceTimeline?.classList.toggle('hidden', workspace !== 'timeline');

    if (workspace === 'style-anchor') {
      this.updateStage1UI();
    } else if (workspace === 'references') {
      this.renderReferences(this.activeRefCategory || 'all');
    }
    this.saveProject();
  }

  // --- Stage 1: Visual Style Anchor Studio Methods ---
  updateStage1UI() {
    const vr = this.project.visualReference || {};
    const bible = vr.styleBible || {};
    const palette = bible.palette || ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'];

    // Update Image Preview & Badges
    if (vr.imageUrl) {
      if (this.stage1StyleImg) this.stage1StyleImg.src = vr.imageUrl;
      this.stage1PreviewContainer?.classList.remove('hidden');
      this.stage1DropzonePrompt?.classList.add('hidden');
      if (this.stage1AnchorBadge) {
        this.stage1AnchorBadge.textContent = '✓ Active Anchor';
        this.stage1AnchorBadge.className = 'badge badge-accent';
      }
      if (this.styleAnchorStatusBadge) {
        this.styleAnchorStatusBadge.textContent = '✓ Active';
        this.styleAnchorStatusBadge.style.color = 'var(--accent-emerald)';
      }
      const anchorPill = document.getElementById('storyboard-anchor-pill-text');
      if (anchorPill) anchorPill.textContent = '🎨 Style Anchor: Active';
    } else {
      this.stage1PreviewContainer?.classList.add('hidden');
      this.stage1DropzonePrompt?.classList.remove('hidden');
      if (this.stage1AnchorBadge) {
        this.stage1AnchorBadge.textContent = 'No Image';
        this.stage1AnchorBadge.className = 'badge';
      }
      if (this.styleAnchorStatusBadge) {
        this.styleAnchorStatusBadge.textContent = 'Set Anchor';
        this.styleAnchorStatusBadge.style.color = '';
      }
      const anchorPill = document.getElementById('storyboard-anchor-pill-text');
      if (anchorPill) anchorPill.textContent = '🎨 Style Anchor: Not Set';
    }

    // Populate Color Swatches
    if (this.stage1PaletteGrid) {
      const pickers = this.stage1PaletteGrid.querySelectorAll('.swatch-picker');
      const hexLabels = this.stage1PaletteGrid.querySelectorAll('.swatch-hex');
      pickers.forEach((p, idx) => {
        if (palette[idx]) {
          p.value = palette[idx];
          if (hexLabels[idx]) hexLabels[idx].textContent = palette[idx].toUpperCase();
        }
      });
    }

    // Populate Matrix Inputs
    if (this.stage1LightingInput) this.stage1LightingInput.value = bible.lighting || '';
    if (this.stage1MediumSelect) this.stage1MediumSelect.value = bible.medium || 'Stylized Digital Painting & Cyberpunk Photorealism';
    if (this.stage1CadenceSelect) this.stage1CadenceSelect.value = bible.animationCadence || bible.cadence || '24';
    if (this.stage1LoraInput) this.stage1LoraInput.value = bible.loraStack || '';
    if (this.stage1GrainInput) this.stage1GrainInput.value = bible.grain || '35mm Anamorphic Film Grain';
    if (this.stage1CameraInput) this.stage1CameraInput.value = bible.cameraFeel || 'Cinematic Widescreen 2.39:1, anamorphic horizontal flares';
    if (this.stage1BriefTextarea) this.stage1BriefTextarea.value = vr.styleBrief || '';

    // Also sync the sidebar visual reference widgets
    this.updateVisualReferenceUI(vr.imageUrl, vr.filename);
  }

  async handleStage1ImageUpload() {
    const file = this.stage1FileInput?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('styleImage', file);

    if (this.stage1AnchorBadge) {
      this.stage1AnchorBadge.textContent = '🤖 Deconstructing...';
      this.stage1AnchorBadge.className = 'badge badge-warning';
    }
    if (this.styleAnchorStatusBadge) {
      this.styleAnchorStatusBadge.textContent = '⚡ Deconstructing...';
    }
    if (this.styleDeconstructSpinner) {
      this.styleDeconstructSpinner.classList.remove('hidden');
    }

    try {
      const res = await fetch('/api/upload-style-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        this.project.visualReference = {
          imageUrl: data.imageUrl,
          filename: data.filename,
          styleBrief: data.styleBrief || '',
          styleBible: data.styleBible || this.project.visualReference?.styleBible,
          updatedAt: Date.now()
        };
        this.updateStage1UI();
        this.saveProject();
        this.renderStoryboard();
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Failed to upload Style Anchor image: ' + err.message);
      this.updateStage1UI();
    } finally {
      if (this.styleDeconstructSpinner) {
        this.styleDeconstructSpinner.classList.add('hidden');
      }
    }
  }

  handleRemoveStyleAnchor() {
    this.project.visualReference = {
      imageUrl: null,
      filename: null,
      styleBrief: '',
      styleBible: {
        palette: ['#0b0f19', '#ff007f', '#00f0ff', '#ffe600', '#1c2438'],
        lighting: '',
        medium: 'Stylized Digital Painting & Cyberpunk Photorealism',
        grain: '35mm Anamorphic Film Grain',
        cameraFeel: 'Cinematic Widescreen 2.39:1'
      },
      updatedAt: Date.now()
    };
    this.updateStage1UI();
    this.saveProject();
    this.renderStoryboard();
  }

  async handleStage1Deconstruct() {
    if (!this.project.visualReference?.imageUrl) {
      alert('Please upload a Master Visual Anchor image first to deconstruct its artistic style.');
      return;
    }

    this.btnStage1AiDeconstruct.disabled = true;
    this.styleDeconstructSpinner?.classList.remove('hidden');

    try {
      const res = await fetch('/api/generate-style-brief', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.project.visualReference.styleBrief = data.styleBrief;
        if (data.styleBible) {
          this.project.visualReference.styleBible = data.styleBible;
        }
        this.project.visualReference.updatedAt = Date.now();
        this.updateStage1UI();
        this.saveProject();
        this.renderStoryboard();
      } else {
        throw new Error(data.error || 'Style deconstruction failed');
      }
    } catch (err) {
      alert('Style Deconstruct Notice: ' + err.message);
    } finally {
      this.btnStage1AiDeconstruct.disabled = false;
      this.styleDeconstructSpinner?.classList.add('hidden');
    }
  }

  async handleStage1SaveBible() {
    const pickers = this.stage1PaletteGrid ? this.stage1PaletteGrid.querySelectorAll('.swatch-picker') : [];
    const palette = Array.from(pickers).map(p => p.value);
    const lighting = this.stage1LightingInput?.value.trim() || '';
    const medium = this.stage1MediumSelect?.value || '';
    const animationCadence = this.stage1CadenceSelect?.value || '24';
    const loraStack = this.stage1LoraInput?.value.trim() || '';
    const grain = this.stage1GrainInput?.value.trim() || '';
    const cameraFeel = this.stage1CameraInput?.value.trim() || '';
    const styleBrief = this.stage1BriefTextarea?.value.trim() || '';

    const styleBible = { palette, lighting, medium, animationCadence, loraStack, grain, cameraFeel };

    try {
      const res = await fetch('/api/style-anchor/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styleBrief, styleBible })
      });
      const data = await res.json();
      if (data.success) {
        this.project.visualReference = data.visualReference;
        this.updateStage1UI();
        this.saveProject();
        this.renderStoryboard();
        
        // Brief visual success indicator
        const origText = this.btnStage1SaveBible.innerHTML;
        this.btnStage1SaveBible.innerHTML = `<span>✓ Bible Saved!</span>`;
        setTimeout(() => { this.btnStage1SaveBible.innerHTML = origText; }, 2000);
      }
    } catch (err) {
      alert('Failed to save Style Bible: ' + err.message);
    }
  }


  async handleSingleClickShutdown() {
    if (this.btnAppShutdown) {
      this.btnAppShutdown.disabled = true;
      this.btnAppShutdown.innerHTML = `<span class="btn-spinner"></span> <span>Shutting down...</span>`;
    }

    if (this.shutdownOverlay) {
      this.shutdownOverlay.classList.remove('hidden');
    }

    try {
      await fetch('/api/shutdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.log('Shutdown initiated:', err.message);
    }

    if (this.shutdownStatusMessage) {
      this.shutdownStatusMessage.textContent = 'PointBlank Studio server and all background services have terminated cleanly.';
    }
  }

  async saveProject() {
    try {
      await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.project)
      });
    } catch (err) {
      console.error('Error saving project:', err);
    }
  }

  async saveRestyleSettings(playblastMode, restyleStrength) {
    try {
      this.project.settings = this.project.settings || {};
      this.project.settings.playblastMode = playblastMode;
      this.project.settings.restyleStrength = restyleStrength;
      await fetch('/api/settings/restyle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playblastMode, restyleStrength })
      });
    } catch (err) {
      console.warn('Could not save restyle settings:', err);
    }
  }

  // --- Visual Reference (Sole Source of Truth) ---
  updateVisualReferenceUI(url, filename) {
    if (!this.refStatusIndicator) return;
    const dot = this.refStatusIndicator.querySelector('.dot-indicator');
    if (url) {
      if (this.styleReferenceImg) this.styleReferenceImg.src = url;
      this.imagePreviewContainer?.classList.remove('hidden');
      this.dropzonePrompt?.classList.add('hidden');
      if (dot) dot.classList.add('active');
      if (this.refStatusText) this.refStatusText.textContent = `✓ Active Anchor: ${filename || 'Style Image'}`;
    } else {
      this.imagePreviewContainer?.classList.add('hidden');
      this.dropzonePrompt?.classList.remove('hidden');
      if (dot) dot.classList.remove('active');
      if (this.refStatusText) this.refStatusText.textContent = 'No reference image set (Drag image above)';
    }
  }

  async handleStyleImageUpload() {
    const file = this.styleImageFileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('styleImage', file);

    try {
      const res = await fetch('/api/upload-style-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        this.project.visualReference = {
          imageUrl: data.imageUrl,
          filename: data.filename,
          styleBrief: data.styleBrief || '',
          styleBible: data.styleBible || this.project.visualReference?.styleBible,
          updatedAt: Date.now()
        };
        this.updateStage1UI();
        this.updateVisualReferenceUI(data.imageUrl, data.filename);
        if (this.styleBriefTextarea && data.styleBrief) {
          this.styleBriefTextarea.value = data.styleBrief;
        }
        this.saveProject();
        this.renderStoryboard();
      }
    } catch (err) {
      alert('Failed to upload visual reference: ' + err.message);
    }
  }

  async handleUpdateStyleBrief() {
    if (!this.project.visualReference?.imageUrl) {
      alert('Please upload a Visual Style Anchor image first.');
      return;
    }
    this.btnUpdateStyleBrief.disabled = true;
    this.btnUpdateStyleBrief.innerHTML = `<span class="btn-spinner"></span> Analyzing...`;
    try {
      const res = await fetch('/api/generate-style-brief', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.styleBrief) {
        this.styleBriefTextarea.value = data.styleBrief;
        this.project.visualReference = this.project.visualReference || {};
        this.project.visualReference.styleBrief = data.styleBrief;
        if (data.styleBible) {
          this.project.visualReference.styleBible = data.styleBible;
        }
        this.updateStage1UI();
        this.saveProject();
        this.renderStoryboard();
      } else {
        throw new Error(data.error || 'Failed to generate style brief');
      }
    } catch (err) {
      alert('Style brief error: ' + err.message);
    } finally {
      this.btnUpdateStyleBrief.disabled = false;
      this.btnUpdateStyleBrief.innerHTML = `<span>🔄 Update Brief</span>`;
    }
  }

  // --- Fal.ai Credits Balance ---
  async checkMeshyPoints(silent = false) {
    return this.checkFalCredits(silent);
  }

  async checkFalCredits(silent = false) {
    try {
      const res = await fetch('/api/fal/balance');
      const data = await res.json();
      if (data.configured && data.balance !== null && data.balance !== undefined) {
        if (this.meshyPointsLabel) {
          this.meshyPointsLabel.textContent = `$${data.balance.toFixed(2)} Fal`;
        }
      } else if (data.configured && data.balance === null) {
        if (this.meshyPointsLabel) {
          this.meshyPointsLabel.textContent = 'Fal Active';
        }
      } else {
        if (this.meshyPointsLabel) {
          this.meshyPointsLabel.textContent = 'Fal Credits';
        }
        if (!silent && data.error) {
          alert('Fal.ai notice: ' + data.error);
        }
      }
    } catch (err) {
      if (this.meshyPointsLabel) {
        this.meshyPointsLabel.textContent = 'Fal Credits';
      }
    }
  }

  renderEndToEndSummary() {
    const summary = this.project.ingestedVideo?.analysisSummary;
    const pacing = this.project.ingestedVideo?.detectedPacing || 'Cinematic Pace';
    if (summary && this.endToEndSummaryCard) {
      this.endToEndSummaryCard.classList.remove('hidden');
      if (this.analysisSummaryText) this.analysisSummaryText.textContent = summary;
      if (this.analysisPacingBadge) this.analysisPacingBadge.textContent = pacing;
    } else if (this.endToEndSummaryCard) {
      this.endToEndSummaryCard.classList.add('hidden');
    }
  }

  // --- Video Ingestion & Storyboard Breakdown ---
  async handleIngestDualFolder() {
    const folderPath = 'C:\\_PersonalProjects\\FR_B\\trunk\\Unity6\\FrontiersReach_CBG\\Recordings';
    const userDescription = this.userVideoDescInput ? this.userVideoDescInput.value.trim() : '';

    if (this.btnIngestDualFolder) this.btnIngestDualFolder.disabled = true;
    if (this.dualFolderSpinner) this.dualFolderSpinner.classList.remove('hidden');
    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Scanning "${folderPath}" for companion recordings (Spatial Previs + True Color)...`;

    const extractionOptions = {
      mode: this.extractModeSelect?.value || 'count',
      maxFrames: parseInt(this.extractCountInput?.value || '8', 10),
      interval: parseFloat(this.extractIntervalInput?.value || '3'),
      startTime: this.extractStartInput?.value !== '' ? parseFloat(this.extractStartInput.value) : undefined,
      endTime: this.extractEndInput?.value !== '' ? parseFloat(this.extractEndInput.value) : undefined
    };

    try {
      const res = await fetch('/api/ingest-dual-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderPath,
          userDescription,
          extractionOptions
        })
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        this.project.ingestedVideo = data.spatialVideo;
        this.project.companionVideo = data.companionVideo;
        this.btnAnalyzeVideo.disabled = false;
        this.renderEndToEndSummary();
        this.renderStoryboard();
        this.ingestBannerText.textContent = `✓ ${data.message}`;
        this.saveProject();
      } else {
        throw new Error(data.error || 'Dual folder ingestion failed');
      }
    } catch (err) {
      alert('Dual recordings ingestion error: ' + err.message);
      this.ingestStatusBanner.classList.add('hidden');
    } finally {
      if (this.btnIngestDualFolder) this.btnIngestDualFolder.disabled = false;
      if (this.dualFolderSpinner) this.dualFolderSpinner.classList.add('hidden');
    }
  }

  async handleIngestDualVideos() {
    const files = this.dualVideoInput?.files;
    if (!files || files.length < 2) {
      alert('Please select both video recordings (Spatial Previs and True Color).');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('dualVideos', files[i]);
    }
    const userDescription = this.userVideoDescInput ? this.userVideoDescInput.value.trim() : '';
    formData.append('userDescription', userDescription);

    const extractionOptions = {
      mode: this.extractModeSelect?.value || 'count',
      maxFrames: parseInt(this.extractCountInput?.value || '8', 10),
      interval: parseFloat(this.extractIntervalInput?.value || '3'),
      startTime: this.extractStartInput?.value !== '' ? parseFloat(this.extractStartInput.value) : undefined,
      endTime: this.extractEndInput?.value !== '' ? parseFloat(this.extractEndInput.value) : undefined
    };
    formData.append('extractionOptions', JSON.stringify(extractionOptions));

    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Uploading both recordings (${files[0].name} & ${files[1].name}) and constructing storyboard...`;

    try {
      const res = await fetch('/api/ingest-dual-videos', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        this.project.ingestedVideo = data.spatialVideo;
        this.project.companionVideo = data.companionVideo;
        this.btnAnalyzeVideo.disabled = false;
        this.renderEndToEndSummary();
        this.renderStoryboard();
        this.ingestBannerText.textContent = `✓ ${data.message}`;
        this.saveProject();
      } else {
        throw new Error(data.error || 'Dual video ingestion failed');
      }
    } catch (err) {
      alert('Dual video upload error: ' + err.message);
      this.ingestStatusBanner.classList.add('hidden');
    } finally {
      if (this.dualVideoInput) this.dualVideoInput.value = '';
    }
  }

  async handleIngestVideo() {
    const file = this.ingestVideoInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('inputVideo', file);

    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Ingesting "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB)...`;

    try {
      const res = await fetch('/api/ingest-video', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        this.project.ingestedVideo = {
          filename: data.filename,
          filePath: data.filePath,
          url: data.url,
          duration: data.duration,
          userDescription: this.userVideoDescInput?.value.trim() || ''
        };
        this.btnAnalyzeVideo.disabled = false;
        this.ingestBannerText.textContent = `✓ Ingested: "${file.name}" (${data.duration.toFixed(1)}s). Add your manual video description & run End-to-End Analysis!`;
        this.saveProject();
      }
    } catch (err) {
      alert('Failed to ingest video: ' + err.message);
      this.ingestStatusBanner.classList.add('hidden');
    }
  }

  async handleAnalyzeVideo() {
    if (!this.project.ingestedVideo?.filePath || !this.project.companionVideo?.filePath) {
      alert('End-to-End Analysis requires BOTH Spatial Previs Video and True Color Video. Please ensure both recordings are loaded in their respective slots above.');
      return;
    }

    this.btnAnalyzeVideo.disabled = true;
    this.analyzeSpinner.classList.remove('hidden');
    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = 'Running End-to-End video analysis with user context & extracting optimal keyframes...';

    const userDescription = this.userVideoDescInput ? this.userVideoDescInput.value.trim() : '';

    const extractionOptions = {
      mode: this.extractModeSelect?.value || 'count',
      maxFrames: parseInt(this.extractCountInput?.value || '8', 10),
      interval: parseFloat(this.extractIntervalInput?.value || '3'),
      startTime: this.extractStartInput?.value !== '' ? parseFloat(this.extractStartInput.value) : undefined,
      endTime: this.extractEndInput?.value !== '' ? parseFloat(this.extractEndInput.value) : undefined
    };

    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: this.project.ingestedVideo.filePath,
          filename: this.project.ingestedVideo.filename,
          colorVideoPath: this.project.companionVideo.filePath,
          userDescription,
          extractionOptions
        })
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        if (!this.project.ingestedVideo) this.project.ingestedVideo = {};
        this.project.ingestedVideo.userDescription = userDescription;
        this.project.ingestedVideo.analysisSummary = data.analysisSummary || null;
        this.project.ingestedVideo.detectedPacing = data.detectedPacing || null;
        this.renderEndToEndSummary();
        this.renderStoryboard();
        this.ingestBannerText.textContent = `✓ End-to-end analysis complete: ${data.storyboard.length} shots generated with optimal keyframes aligned to your narrative!`;
        this.saveProject();
      } else {
        throw new Error(data.error || 'End-to-End analysis failed');
      }
    } catch (err) {
      alert('Analysis error: ' + err.message);
    } finally {
      this.btnAnalyzeVideo.disabled = false;
      this.analyzeSpinner.classList.add('hidden');
    }
  }

  // --- Manual Keyframe & Custom Shot Ingestion ---
  async handleUploadKeyframes() {
    const files = this.uploadKeyframesInput.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('keyframeImages', files[i]);
    }

    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Ingesting ${files.length} custom keyframe image(s)...`;

    try {
      const res = await fetch('/api/upload-keyframes', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        this.renderStoryboard();
        this.ingestBannerText.textContent = `✓ Added ${data.newShots.length} custom keyframe shot(s) to Storyboard!`;
        this.saveProject();
      } else {
        throw new Error(data.error || 'Failed to upload keyframe images');
      }
    } catch (err) {
      alert('Keyframe upload failed: ' + err.message);
    } finally {
      this.uploadKeyframesInput.value = '';
    }
  }

  async handleAddBlankShot() {
    try {
      const res = await fetch('/api/storyboard/add-custom-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Custom Shot ${(this.project.storyboard?.length || 0) + 1}`,
          duration: 4
        })
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        this.renderStoryboard();
        this.saveProject();
      } else {
        throw new Error(data.error || 'Failed to add custom shot');
      }
    } catch (err) {
      alert('Add shot error: ' + err.message);
    }
  }

  async handleReplaceKeyframe() {
    const file = this.replaceKeyframeInput.files?.[0];
    if (!file || !this.activeReplacingShotId) return;

    const formData = new FormData();
    formData.append('keyframeImage', file);
    formData.append('targetFrame', this.activeReplacingTargetFrame || 'start');

    try {
      const res = await fetch(`/api/storyboard/${this.activeReplacingShotId}/replace-keyframe`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.shot) {
        const shotIndex = (this.project.storyboard || []).findIndex((s) => s.id === this.activeReplacingShotId);
        if (shotIndex !== -1) {
          Object.assign(this.project.storyboard[shotIndex], data.shot);
          this.renderStoryboard();
          this.saveProject();
        }
      } else {
        throw new Error(data.error || 'Failed to replace keyframe');
      }
    } catch (err) {
      alert('Replace keyframe error: ' + err.message);
    } finally {
      this.replaceKeyframeInput.value = '';
      this.activeReplacingShotId = null;
    }
  }

  async handleUploadColorFrame() {
    const file = this.uploadColorFrameInput?.files?.[0];
    if (!file || !this.activeColorShotId) return;

    const formData = new FormData();
    formData.append('colorFrame', file);
    formData.append('targetFrame', this.activeColorTargetFrame || 'start');

    try {
      const res = await fetch(`/api/storyboard/${this.activeColorShotId}/upload-color-frame`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.shot) {
        const shotIndex = (this.project.storyboard || []).findIndex((s) => s.id === this.activeColorShotId);
        if (shotIndex !== -1) {
          Object.assign(this.project.storyboard[shotIndex], data.shot);
          this.renderStoryboard();
          this.saveProject();
          if (this.keyframeLightboxModal && !this.keyframeLightboxModal.classList.contains('hidden')) {
            this.updateKeyframeLightboxUi();
          }
        }
      } else {
        throw new Error(data.error || 'Failed to upload True Color frame');
      }
    } catch (err) {
      alert('Color frame upload error: ' + err.message);
    } finally {
      if (this.uploadColorFrameInput) this.uploadColorFrameInput.value = '';
      this.activeColorShotId = null;
    }
  }

  async handleCompanionVideoUpload() {
    const file = this.companionVideoInput?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('companionVideo', file);

    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Extracting True Color frames from "${file.name}" across all shots...`;

    try {
      const res = await fetch('/api/storyboard/upload-companion-video', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        this.project.companionVideo = data.companionVideo;
        this.renderStoryboard();
        this.saveProject();
        this.ingestBannerText.textContent = `✓ ${data.message || 'True Color frames extracted successfully!'}`;
      } else {
        throw new Error(data.error || 'Companion video ingestion failed');
      }
    } catch (err) {
      alert('Companion video error: ' + err.message);
      this.ingestStatusBanner.classList.add('hidden');
    } finally {
      if (this.companionVideoInput) this.companionVideoInput.value = '';
    }
  }

  renderVideoSlots() {
    const hasSpatial = Boolean(this.project.ingestedVideo?.filePath || this.project.ingestedVideo?.filename);
    const hasColor = Boolean(this.project.companionVideo?.filePath || this.project.companionVideo?.filename);

    // Slot 1: Spatial Previs
    if (this.slotSpatialVideo) {
      if (hasSpatial) {
        this.slotSpatialVideo.classList.add('slot-ready');
        if (this.slotSpatialBadge) {
          this.slotSpatialBadge.className = 'slot-status-pill badge-ready';
          this.slotSpatialBadge.textContent = '✓ Ready';
        }
        this.slotSpatialEmpty?.classList.add('hidden');
        this.slotSpatialFilled?.classList.remove('hidden');
        if (this.slotSpatialFilename) {
          this.slotSpatialFilename.textContent = this.project.ingestedVideo.originalFilename || this.project.ingestedVideo.filename || 'spatial_video.mp4';
        }
        if (this.slotSpatialMeta) {
          const dur = this.project.ingestedVideo.duration ? `${this.project.ingestedVideo.duration.toFixed(1)}s` : 'Loaded';
          this.slotSpatialMeta.textContent = `${dur} · Spatial Previs`;
        }
      } else {
        this.slotSpatialVideo.classList.remove('slot-ready');
        if (this.slotSpatialBadge) {
          this.slotSpatialBadge.className = 'slot-status-pill badge-required';
          this.slotSpatialBadge.textContent = 'Required';
        }
        this.slotSpatialEmpty?.classList.remove('hidden');
        this.slotSpatialFilled?.classList.add('hidden');
      }
    }

    // Slot 2: True Color
    if (this.slotColorVideo) {
      if (hasColor) {
        this.slotColorVideo.classList.add('slot-ready');
        if (this.slotColorBadge) {
          this.slotColorBadge.className = 'slot-status-pill badge-ready';
          this.slotColorBadge.textContent = '✓ Ready';
        }
        this.slotColorEmpty?.classList.add('hidden');
        this.slotColorFilled?.classList.remove('hidden');
        if (this.slotColorFilename) {
          this.slotColorFilename.textContent = this.project.companionVideo.originalFilename || this.project.companionVideo.filename || 'color_video.mp4';
        }
        if (this.slotColorMeta) {
          const dur = this.project.companionVideo.duration ? `${this.project.companionVideo.duration.toFixed(1)}s` : 'Loaded';
          this.slotColorMeta.textContent = `${dur} · True Color Pass`;
        }
      } else {
        this.slotColorVideo.classList.remove('slot-ready');
        if (this.slotColorBadge) {
          this.slotColorBadge.className = 'slot-status-pill badge-required';
          this.slotColorBadge.textContent = 'Required';
        }
        this.slotColorEmpty?.classList.remove('hidden');
        this.slotColorFilled?.classList.add('hidden');
      }
    }

    // End-to-End Analysis requirement enforcement: BOTH videos required
    const bothReady = hasSpatial && hasColor;
    if (this.btnAnalyzeVideo) {
      this.btnAnalyzeVideo.disabled = !bothReady;
      if (bothReady) {
        this.btnAnalyzeVideo.title = 'Run End-to-End Analysis with both Spatial Previs and True Color recordings';
        this.btnAnalyzeVideo.classList.add('btn-glow');
      } else {
        this.btnAnalyzeVideo.title = 'Both Spatial Previs and True Color recordings are required for End-to-End Analysis. Or create shots manually below.';
        this.btnAnalyzeVideo.classList.remove('btn-glow');
      }
    }
  }

  clearSpatialVideoSlot() {
    if (this.project.ingestedVideo) {
      delete this.project.ingestedVideo;
      this.saveProject();
      this.renderVideoSlots();
    }
  }

  clearColorVideoSlot() {
    if (this.project.companionVideo) {
      delete this.project.companionVideo;
      this.saveProject();
      this.renderVideoSlots();
    }
  }

  async uploadDirectSpatialVideo(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append('inputVideo', file);

    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Ingesting Spatial Previs "${file.name}"...`;

    try {
      const res = await fetch('/api/ingest-video', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        this.project.ingestedVideo = {
          filename: data.filename,
          filePath: data.filePath,
          url: data.url,
          duration: data.duration,
          originalFilename: file.name,
          userDescription: this.userVideoDescInput?.value.trim() || ''
        };
        this.renderVideoSlots();
        this.saveProject();
        this.ingestBannerText.textContent = `✓ Ingested Spatial Previs: "${file.name}".`;
      }
    } catch (err) {
      alert('Failed to upload Spatial Previs: ' + err.message);
    }
  }

  async uploadDirectCompanionVideo(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append('companionVideo', file);

    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = `Uploading True Color recording "${file.name}"...`;

    try {
      const res = await fetch('/api/storyboard/upload-companion-video', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.companionVideo) {
        this.project.companionVideo = data.companionVideo;
        if (data.storyboard) this.project.storyboard = data.storyboard;
        this.renderVideoSlots();
        this.renderStoryboard();
        this.saveProject();
        this.ingestBannerText.textContent = `✓ True Color recording loaded: "${file.name}".`;
      }
    } catch (err) {
      alert('Failed to upload True Color recording: ' + err.message);
    }
  }

  // --- Storyboard Rendering & Per-Frame Generation ---

  renderKeyframePipelineRow(shot, index, targetFrame = 'start') {
    const isEnd = targetFrame === 'end';
    const label = isEnd ? 'END FRAME' : 'START FRAME';
    const spatialUrl = isEnd ? shot.endKeyframeUrl : shot.keyframeUrl;
    const colorUrl = isEnd ? shot.endColorFrameUrl : shot.colorFrameUrl;
    const layers = isEnd ? (shot.endLayers || shot.layers || []) : (shot.layers || []);
    const compOutUrl = isEnd ? (shot.compositeEndKeyframeUrl || shot.stage2EndImageUrl) : (shot.compositeKeyframeUrl || shot.stage2ImageUrl);
    const restyleUrl = isEnd ? shot.styledEndKeyframeUrl : shot.styledKeyframeUrl;
    const isOutdated = !isEnd && Boolean(shot.styledAt && (
      ((this.project.visualReference?.updatedAt || 0) > shot.styledAt) ||
      ((this.project.lastReferenceUpdatedAt || 0) > shot.styledAt)
    ));

    return `
      <div class="shot-pipeline-row" data-target-frame="${targetFrame}">
        <div class="shot-pipeline-label">${label}</div>
        <div class="shot-pipeline-thumbs">
          <!-- Stage 1: Spatial Previs -->
          <div class="visual-thumb-box clickable-keyframe ${spatialUrl ? '' : 'empty-stage-box'}" data-stage="1" data-target-frame="${targetFrame}" title="${label} Stage 1: Spatial Previs (3D playblast / camera blocking)">
            <span class="thumb-header-badge">1. Spatial Previs</span>
            ${(spatialUrl && (spatialUrl.endsWith('.mp4') || spatialUrl.endsWith('.webm'))) ? `
              <video src="${spatialUrl}" muted playsinline></video>
            ` : spatialUrl ? `
              <img src="${spatialUrl}" alt="${label} Spatial Frame">
            ` : `
              <div class="empty-thumb-placeholder">
                <span style="font-size:1.1rem;">📐</span>
                <span>No Spatial Previs</span>
              </div>
            `}
            ${spatialUrl ? `<span class="thumb-zoom-badge" title="Click to view large">🔍 View</span>` : ''}
            <div class="thumb-hover-actions">
              ${(!isEnd && index > 0) ? `<button class="btn-xs btn-secondary btn-chain-tail" data-action="chain-tail" title="Chain last frame of Shot #${index}">🔗 Chain</button>` : ''}
              <button class="btn-xs btn-secondary btn-replace-keyframe" data-action="replace-kf" data-target-frame="${targetFrame}" title="Load custom image for ${label}">📷 Replace</button>
            </div>
          </div>

          <!-- Stage 2: True Color Reference Pass -->
          <div class="visual-thumb-box clickable-keyframe ${colorUrl ? '' : 'empty-stage-box'}" data-stage="color" data-target-frame="${targetFrame}" title="${label} Stage 2: True Color Reference (Textured engine capture for palette & atmospheric glow)">
            <span class="thumb-header-badge" style="background: rgba(245,158,11,0.85); color:#fff;">2. True Color</span>
            ${colorUrl ? `
              <img src="${colorUrl}" alt="${label} True Color Reference">
              <span class="thumb-zoom-badge" title="Click to view large">🔍 View</span>
            ` : `
              <div class="empty-stage-content">
                <span style="font-size:1.1rem;">🎨</span>
                <span style="font-size:0.62rem; color:var(--text-dim);">No Color Pass</span>
                <button class="btn-xs btn-secondary" data-action="upload-color" data-target-frame="${targetFrame}" style="font-size:0.65rem; padding:2px 8px; margin-top:2px;" title="Provide textured color reference">🎨 Add Color</button>
              </div>
            `}
          </div>

          <!-- Stage 3: Interactive Open Compositor Action Tile -->
          <div class="visual-thumb-box compositor-action-tile" data-action="restyle-kf" data-target-frame="${targetFrame}" title="${label} Stage 3: Open Layered Restyle Studio (Perspective Pin Warping & Asset Replacement)">
            <span class="thumb-header-badge" style="background: rgba(59,130,246,0.85); color:#fff;">3. 📐 Open Compositor</span>
            <div class="compositor-tile-body">
              <div class="compositor-tile-icon">📐</div>
              <span class="compositor-tile-title">Open Compositor</span>
              <span class="compositor-tile-subtext">${(layers && layers.length > 0) ? `${layers.length} Layers Ready` : 'Decompose & Pin'}</span>
            </div>
          </div>

          <!-- Stage 4: Comp Out -->
          <div class="visual-thumb-box clickable-keyframe ${compOutUrl ? '' : 'empty-stage-box'}" data-stage="compout" data-target-frame="${targetFrame}" title="${label} Stage 4: Baked Composite Output (Warped Cutouts + Clean Background)">
            <span class="thumb-header-badge" style="background: rgba(225,29,72,0.85); color:#fff;">4. Comp Out</span>
            ${compOutUrl ? `
              <img src="${compOutUrl}" alt="${label} Composite Output">
              <span class="thumb-zoom-badge" title="Click to view large">🔍 View</span>
            ` : `
              <div class="empty-stage-content">
                <span style="font-size:1.1rem;">🧩</span>
                <span style="font-size:0.62rem; color:var(--text-dim);">Pending Comp</span>
              </div>
            `}
          </div>

          <!-- Stage 5: Restyle -->
          <div class="visual-thumb-box clickable-keyframe ${restyleUrl ? '' : 'empty-stage-box'}" data-stage="restyle" data-target-frame="${targetFrame}" title="${label} Stage 5: Final Restyled Keyframe (Neural Style Anchor Translation)">
            <span class="thumb-header-badge" style="background: rgba(16,185,129,0.85); color:#fff;">5. Restyle</span>
            ${isOutdated ? '<span class="outdated-indicator-dot" title="Style Anchor or Reference Assets updated"></span>' : ''}
            ${restyleUrl ? `
              <img src="${restyleUrl}" alt="${label} Restyled Keyframe">
              <span class="thumb-zoom-badge" title="Click to view large">🔍 View</span>
            ` : `
              <div class="empty-stage-content">
                <span style="font-size:1.1rem;">✨</span>
                <span style="font-size:0.62rem; color:var(--text-dim);">No Restyle</span>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  renderStoryboard() {
    this.renderVideoSlots();
    this.storyboardGrid.innerHTML = '';
    const shots = this.project.storyboard || [];
    this.storyboardCountBadge.textContent = `${shots.length} Shot${shots.length === 1 ? '' : 's'}`;

    if (shots.length === 0) {
      this.storyboardGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-dim); border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px;">
          <p style="font-size: 0.9rem; margin-bottom: 8px;">No video deconstructed yet.</p>
          <p style="font-size: 0.78rem;">Upload an input video above to automatically extract keyframes and generate an editable storyboard!</p>
        </div>
      `;
      return;
    }

    shots.forEach((shot, index) => {
      const card = document.createElement('div');
      card.className = `storyboard-shot-card ${shot.approved ? 'approved' : ''}`;
      card.dataset.id = shot.id;

      const hasOutput = Boolean(shot.generatedClip?.url);
      const isOutdated = Boolean(shot.styledAt && (
        ((this.project.visualReference?.updatedAt || 0) > shot.styledAt) ||
        ((this.project.lastReferenceUpdatedAt || 0) > shot.styledAt)
      ));

      card.innerHTML = `
        <!-- Column 1: Identification & Core Shot Actions -->
        <div class="shot-row-index-col">
          <div class="shot-index-badge">
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
              <span class="shot-num">#${shot.shotNumber || index + 1}</span>
              <button class="btn-icon btn-delete-shot" data-action="delete-shot" title="Delete this shot from Storyboard">✕</button>
            </div>
            <span class="shot-title-text">${this.escapeHtml(shot.title || `Shot ${index + 1}`)}</span>
            <span class="shot-timecode">${shot.startTime || 0}s – ${shot.endTime || shot.duration || 4}s (${shot.duration || 4}s)</span>
          </div>

          <div class="shot-row-actions">
            <button class="btn-approved-toggle ${shot.approved ? 'is-approved' : ''}" data-action="approve" title="Mark as approved">
              <span>${shot.approved ? '✓ Approved' : 'Mark Approved'}</span>
            </button>
            ${(hasOutput || shot.styledKeyframeUrl || shot.keyframeUrl) ? `
              <button class="btn btn-secondary btn-xs" data-action="send-tl" title="${hasOutput ? 'Send active video take to timeline' : 'Send animatic keyframe to timeline'}">
                ➕ Timeline
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Column 2: Dual-Keyframe Visual Progression Pipeline (Start Frame & End Frame) -->
        <div class="shot-dual-pipeline-container">
          ${this.renderKeyframePipelineRow(shot, index, 'start')}
          <div class="shot-pipeline-divider"></div>
          ${this.renderKeyframePipelineRow(shot, index, 'end')}
        </div>

        <!-- Column 3: Narrative & Motion Controls -->
        <div class="shot-row-narrative-col">
          <div class="narrative-col-header">
            <label>Shot Description & Action</label>
            <button class="btn-xs btn-ai-describe" data-action="ai-describe" title="Use ChatGPT to synthesize keyframe action with Visual Reference style">
              <span>🪄 AI Style Prompt</span>
            </button>
          </div>

          <textarea class="shot-desc-input" rows="3" placeholder="Describe action, or type @ to mention Characters, Props, and Places...">${shot.description || ''}</textarea>
          ${shot.styleNotes ? `<div style="font-size:0.68rem; color:var(--accent-teal);">🎨 Style: ${shot.styleNotes}</div>` : ''}

          <div class="narrative-meta-bar">
            <div class="motion-ctrl-wrap">
              <span class="meta-label">Camera:</span>
              <select class="motion-select">
                <option value="Dolly Forward" ${shot.cameraMotion === 'Dolly Forward' ? 'selected' : ''}>Dolly Forward</option>
                <option value="Pan Right" ${shot.cameraMotion === 'Pan Right' ? 'selected' : ''}>Pan Right</option>
                <option value="Pan Left" ${shot.cameraMotion === 'Pan Left' ? 'selected' : ''}>Pan Left</option>
                <option value="Slow Zoom In" ${shot.cameraMotion === 'Slow Zoom In' ? 'selected' : ''}>Slow Zoom In</option>
                <option value="Crane Down" ${shot.cameraMotion === 'Crane Down' ? 'selected' : ''}>Crane Down</option>
                <option value="Orbit 360" ${shot.cameraMotion === 'Orbit 360' ? 'selected' : ''}>Orbit 360°</option>
                <option value="Static Cinematic" ${shot.cameraMotion === 'Static Cinematic' ? 'selected' : ''}>Static Cinematic</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Column 4: Stage 6 - Generated Video Take & Takes Switcher Grid -->
        <div class="shot-row-video-col">
          <div class="video-take-main-wrap">
            <div class="visual-thumb-box ${hasOutput ? '' : 'empty-stage-box'}" id="output-box-${shot.id}" title="Stage 6: Generated Video Take (Pass 2) — Drag and drop video file here to add as take">
              <span class="thumb-header-badge" style="background: rgba(99,102,241,0.85); color:#fff;">
                ${shot.takes && shot.takes.length > 1 ? `6. TAKE ${(shot.takes.findIndex(t => t.id === shot.activeTakeId) + 1) || 1}/${shot.takes.length}` : (hasOutput ? '6. TAKE 1/1' : '6. VIDEO TAKE')}
              </span>
              ${hasOutput ? `
                <video src="${shot.generatedClip.url}" muted playsinline loop onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video>
                <span class="video-duration-tag">${shot.duration || 4}s</span>
                <div class="thumb-hover-actions">
                  <button class="btn-xs btn-secondary" data-action="preview" title="Preview full clip">▶ Play</button>
                  <button class="btn-xs btn-secondary" data-action="open-footage-modal" title="Assign Take from older footage or upload video">📁</button>
                  <button class="btn-xs btn-secondary" data-action="delete-clip" title="Delete current take" style="color:var(--accent-rose);">✕</button>
                </div>
              ` : `
                <div class="empty-stage-content" style="cursor:pointer;" data-action="open-footage-modal" title="Click to assign take from footage library or upload">
                  <span style="font-size:1.1rem;">🎬</span>
                  <span style="font-size:0.62rem; color:var(--text-dim);">Pending Video</span>
                  <span style="font-size:0.58rem; color:var(--accent-cyan); margin-top:2px;">+ Assign Footage</span>
                </div>
              `}
            </div>

            <div class="video-action-btn-group">
              <button class="btn btn-sm btn-primary btn-glow btn-video-animate-action" data-action="generate" title="Pass 2: Neural Video Animation">
                <span>✨ ${hasOutput ? '+ New Take' : 'Animate'}</span>
              </button>
              <button class="btn btn-sm btn-secondary btn-upload-take-action" data-action="open-footage-modal" title="Assign new take from older footage or upload video">
                <span>Upload Take</span> <span>📁</span>
              </button>
            </div>
          </div>

          <!-- Takes Switcher Grid -->
          <div class="takes-grid-panel">
            <div class="takes-grid-container">
              ${(() => {
                const takesList = (Array.isArray(shot.takes) && shot.takes.length > 0)
                  ? shot.takes
                  : (hasOutput && shot.generatedClip ? [{ id: 'active', takeNumber: 1, clip: shot.generatedClip }] : []);

                const totalSlots = Math.max(12, Math.ceil(takesList.length / 3) * 3);
                const items = [];

                takesList.forEach((t, tIdx) => {
                  const isActive = t.id === shot.activeTakeId || (!shot.activeTakeId && tIdx === takesList.length - 1);
                  const modelLabel = t.clip?.model ? ` (${t.clip.model})` : '';
                  items.push(`
                    <button class="take-grid-btn ${isActive ? 'active' : ''} btn-switch-take" data-take-id="${t.id}" title="Switch to Take ${tIdx + 1}${modelLabel}">
                      T${tIdx + 1}
                    </button>
                  `);
                });

                const remaining = totalSlots - takesList.length;
                for (let i = 0; i < remaining; i++) {
                  items.push(`
                    <div class="take-grid-slot empty" data-action="open-footage-modal" title="Empty Take Slot — Click to upload or assign take"></div>
                  `);
                }

                return items.join('');
              })()}
            </div>
          </div>
        </div>

        <!-- Column 4: Continuity & Asset Tracking -->
        <div class="shot-row-continuity-col">
          <!-- 180° Spatial Rules -->
          <div class="continuity-section-item">
            <div class="continuity-header">
              <span class="continuity-title">📐 Spatial Rules</span>
              <button class="btn-link-xs" data-action="edit-spatial" onclick="window.studioApp?.openSpatialModal('${shot.id}')" title="Configure 180° rule, eyeline matching, and spatial ledger">Edit</button>
            </div>
            <div class="shot-spatial-tags" id="shot-spatial-tags-${shot.id}" onclick="window.studioApp?.openSpatialModal('${shot.id}')" style="cursor:pointer;" title="Click to configure spatial rules">
              ${this.renderShotSpatialChips(shot)}
            </div>
          </div>

          <!-- Consistent Assets -->
          <div class="continuity-section-item">
            <div class="continuity-header">
              <span class="continuity-title">🏷️ Consistent Assets</span>
              <button class="btn-link-xs" data-action="assign-refs" title="Tag Characters, Props, and Places for consistency">Assign</button>
            </div>
            <div class="shot-ref-chips-container" id="shot-ref-chips-${shot.id}">
              ${this.renderShotReferenceChips(shot)}
            </div>
          </div>

          <!-- ElevenLabs Audio Stems -->
          <div class="continuity-section-item">
            <div class="continuity-header">
              <span class="continuity-title">🔊 Audio Stems</span>
              <button class="btn-link-xs" data-action="open-audio" title="Generate SFX & Dialogue via ElevenLabs">+ Add</button>
            </div>
            <div class="shot-audio-chips-container" style="display:flex; flex-wrap:wrap; gap:4px;">
              ${(shot.audioTracks && shot.audioTracks.length > 0) ? shot.audioTracks.map(a => `
                <span class="shot-ref-chip chip-props" title="${this.escapeHtml(a.prompt || a.text || 'Audio')}">
                  <span>${a.type === 'dialogue' ? '🎙️' : '💥'}</span>
                  <span>${this.escapeHtml(a.type === 'dialogue' ? 'Voice' : 'SFX')} (${a.duration || 4}s)</span>
                  <button class="btn-del-audio-stem" data-shot-id="${shot.id}" data-filename="${a.filename}" title="Remove audio stem" style="background:none; border:none; color:inherit; cursor:pointer; padding:0 2px;">✕</button>
                </span>
              `).join('') : '<span class="empty-hint-text">No stems attached</span>'}
            </div>
          </div>
        </div>
      `;

      // Event Listeners for Shot Card
      const descInput = card.querySelector('.shot-desc-input');
      descInput.addEventListener('change', () => {
        shot.description = descInput.value;
        this.saveProject();
      });

      // Wire @mention autocomplete dropdown
      this.setupMentionAutocomplete(descInput, shot);

      // Wire unassign reference buttons
      card.querySelectorAll('.btn-unassign-ref').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const refId = btn.dataset.refId;
          shot.assignedReferences = (shot.assignedReferences || []).filter(id => id !== refId);
          this.saveProject();
          this.renderStoryboard();
        });
      });

      const motionSelect = card.querySelector('.motion-select');
      motionSelect.addEventListener('change', () => {
        shot.cameraMotion = motionSelect.value;
        this.saveProject();
      });

      // AI Image-to-Description Prompt Synthesizer
      const btnAiDescribe = card.querySelector('[data-action="ai-describe"]');
      if (btnAiDescribe) {
        btnAiDescribe.addEventListener('click', async () => {
          btnAiDescribe.disabled = true;
          btnAiDescribe.innerHTML = `<span class="btn-spinner"></span> Synthesizing...`;
          try {
            const res = await fetch(`/api/storyboard/${shot.id}/ai-describe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentDescription: descInput.value })
            });
            const data = await res.json();
            if (data.success && data.shot) {
              Object.assign(shot, data.shot);
              this.renderStoryboard();
              this.saveProject();
            } else {
              throw new Error(data.error || 'AI describe failed');
            }
          } catch (err) {
            alert('Image-to-Description error: ' + err.message);
            btnAiDescribe.disabled = false;
            btnAiDescribe.innerHTML = `<span>🪄 AI Style Prompt</span>`;
          }
        });
      }

      // Replace Keyframe Image
      card.querySelectorAll('[data-action="replace-kf"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeReplacingShotId = shot.id;
          this.replaceKeyframeInput.click();
        });
      });

      // Upload / Replace True Color Reference Frame
      card.querySelectorAll('[data-action="upload-color"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeColorShotId = shot.id;
          this.uploadColorFrameInput?.click();
        });
      });

      // Remove True Color Reference Frame
      card.querySelectorAll('[data-action="remove-color"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            const res = await fetch(`/api/storyboard/${shot.id}/color-frame`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success && data.shot) {
              Object.assign(shot, data.shot);
              this.renderStoryboard();
              this.saveProject();
            }
          } catch (err) {
            console.warn('Failed to delete color frame:', err);
          }
        });
      });

      // Chain Tail Frame from preceding shot
      card.querySelectorAll('[data-action="chain-tail"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          btn.disabled = true;
          btn.innerHTML = `<span class="btn-spinner"></span>`;
          try {
            const res = await fetch(`/api/storyboard/${shot.id}/chain-tail-frame`, { method: 'POST' });
            const data = await res.json();
            if (data.success && data.shot) {
              Object.assign(shot, data.shot);
              this.renderStoryboard();
              this.saveProject();
            } else {
              throw new Error(data.error || 'Failed to chain tail frame');
            }
          } catch (err) {
            alert('Tail Chaining Notice: ' + err.message);
            btn.disabled = false;
            btn.innerHTML = `🔗 Chain`;
          }
        });
      });

      // Open ElevenLabs Audio Studio
      card.querySelectorAll('[data-action="open-audio"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openAudioModal(shot.id);
        });
      });

      // Delete audio stem
      card.querySelectorAll('.btn-del-audio-stem').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const shotId = btn.dataset.shotId;
          const filename = btn.dataset.filename;
          this.deleteShotAudio(shotId, filename);
        });
      });

      // Pass 1: Restyle Keyframe / Compositor Action
      const restyleBtns = card.querySelectorAll('[data-action="restyle-kf"]');
      restyleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.openLayeredRestyleStudio(shot, btn.dataset.targetFrame || 'start');
        });
      });

      // Switch active take
      card.querySelectorAll('.btn-switch-take').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const takeId = btn.dataset.takeId;
          try {
            const res = await fetch(`/api/storyboard/${shot.id}/select-take`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ takeId })
            });
            const data = await res.json();
            if (data.success && data.shot) {
              Object.assign(shot, data.shot);
              this.renderStoryboard();
              this.saveProject();
            }
          } catch (err) {
            alert('Failed to switch take: ' + err.message);
          }
        });
      });

      // Generate in Style / New Take (Pass 2)
      card.querySelectorAll('[data-action="generate"]').forEach(btnGen => {
        btnGen.addEventListener('click', () => {
          this.generateStoryboardShot(shot, descInput.value, motionSelect.value, btnGen);
        });
      });

      // Preview generated video
      card.querySelectorAll('[data-action="preview"]').forEach(btnPrev => {
        btnPrev.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openPreviewModal(shot);
        });
      });

      // Dual-Keyframe Stage Clicks for Lightbox / Action
      card.querySelectorAll('.visual-thumb-box[data-stage]').forEach(box => {
        box.addEventListener('click', (e) => {
          if (e.target.closest('button')) return;
          const stage = box.dataset.stage;
          const targetFrame = box.dataset.targetFrame || 'start';
          const isEnd = targetFrame === 'end';

          if (stage === '1') {
            const hasKf = isEnd ? Boolean(shot.endKeyframeUrl) : Boolean(shot.keyframeUrl);
            if (hasKf) {
              this.openKeyframeReviewModal(shot, 'source', 'single', targetFrame);
            }
          } else if (stage === 'color') {
            const hasColor = isEnd ? Boolean(shot.endColorFrameUrl) : Boolean(shot.colorFrameUrl);
            if (hasColor) {
              this.openKeyframeReviewModal(shot, 'color', 'single', targetFrame);
            } else {
              this.activeColorShotId = shot.id;
              this.activeColorTargetFrame = targetFrame;
              this.uploadColorFrameInput?.click();
            }
          } else if (stage === 'compout') {
            const compUrl = isEnd ? (shot.compositeEndKeyframeUrl || shot.stage2EndImageUrl) : (shot.compositeKeyframeUrl || shot.stage2ImageUrl);
            if (compUrl) {
              this.openKeyframeReviewModal(shot, 'compout', 'single', targetFrame);
            } else {
              this.openLayeredRestyleStudio(shot, targetFrame);
            }
          } else if (stage === 'restyle') {
            const restyleUrl = isEnd ? shot.styledEndKeyframeUrl : shot.styledKeyframeUrl;
            if (restyleUrl) {
              this.openKeyframeReviewModal(shot, 'restyle', 'single', targetFrame);
            }
          }
        });
      });

      // Custom replacement keyframe upload for specific target frame
      card.querySelectorAll('[data-action="replace-kf"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeReplacingShotId = shot.id;
          this.activeReplacingTargetFrame = btn.dataset.targetFrame || 'start';
          this.replaceKeyframeInput?.click();
        });
      });

      // True color frame upload for specific target frame
      card.querySelectorAll('[data-action="upload-color"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeColorShotId = shot.id;
          this.activeColorTargetFrame = btn.dataset.targetFrame || 'start';
          this.uploadColorFrameInput?.click();
        });
      });

      // Output thumbnail click to play or open footage library if empty
      const outputBox = card.querySelector(`#output-box-${shot.id}`);
      if (outputBox) {
        outputBox.style.cursor = 'pointer';
        outputBox.addEventListener('click', (e) => {
          if (e.target.closest('[data-action="open-footage-modal"]')) {
            e.stopPropagation();
            this.openFootageLibraryModal(shot.id);
            return;
          }
          if (e.target.closest('[data-action="delete-clip"]') || e.target.closest('.btn-switch-take') || e.target.closest('[data-action="generate"]')) {
            return;
          }
          if (hasOutput) {
            this.openPreviewModal(shot);
          } else {
            this.openFootageLibraryModal(shot.id);
          }
        });

        // Direct Drag-and-Drop Video File onto Shot Output Box
        outputBox.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          outputBox.style.borderColor = 'var(--accent-cyan)';
          outputBox.style.boxShadow = '0 0 12px rgba(6, 182, 212, 0.4)';
        });
        outputBox.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          outputBox.style.borderColor = '';
          outputBox.style.boxShadow = '';
        });
        outputBox.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          outputBox.style.borderColor = '';
          outputBox.style.boxShadow = '';
          const file = e.dataTransfer?.files?.[0];
          if (file && (file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name))) {
            this.uploadVideoAsTake(file, shot.id);
          }
        });
      }

      // Assign Footage Take Modal trigger
      card.querySelectorAll('[data-action="open-footage-modal"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openFootageLibraryModal(shot.id);
        });
      });

      // Delete generated clip
      card.querySelectorAll('[data-action="delete-clip"]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteStoryboardClip(shot);
        });
      });

      // Spatial Continuity Ledger trigger (both button and tags container)
      card.querySelectorAll('[data-action="edit-spatial"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openSpatialModal(shot.id);
        });
      });
      const spatialTagsEl = card.querySelector(`#shot-spatial-tags-${shot.id}`);
      if (spatialTagsEl) {
        spatialTagsEl.style.cursor = 'pointer';
        spatialTagsEl.addEventListener('click', () => {
          this.openSpatialModal(shot.id);
        });
      }

      // Assign references to this shot
      card.querySelectorAll('[data-action="assign-refs"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openAssignReferencesModal(shot.id);
        });
      });

      // Delete entire shot
      card.querySelectorAll('[data-action="delete-shot"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteStoryboardShot(shot);
        });
      });

      // Send to Timeline
      card.querySelectorAll('[data-action="send-tl"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.addShotToTimeline(shot);
        });
      });

      // Mark Approved Toggle
      card.querySelectorAll('[data-action="approve"]').forEach(btnApprove => {
        btnApprove.addEventListener('click', (e) => {
          e.stopPropagation();
          shot.approved = !shot.approved;
          card.classList.toggle('approved', shot.approved);
          card.querySelectorAll('[data-action="approve"]').forEach(b => {
            b.classList.toggle('is-approved', shot.approved);
            const span = b.querySelector('span');
            if (span) span.textContent = shot.approved ? '✓ Approved' : 'Mark Approved';
          });
          this.saveProject();
        });
      });

      this.storyboardGrid.appendChild(card);
    });
  }

  async clearStoryboard() {
    if (!confirm('Are you sure you want to clear all shots and the ingested video from the Storyboard?')) return;
    try {
      const res = await fetch('/api/storyboard', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        this.project.storyboard = [];
        this.project.ingestedVideo = null;
        if (this.userVideoDescInput) this.userVideoDescInput.value = '';
        if (this.endToEndSummaryCard) this.endToEndSummaryCard.classList.add('hidden');
        this.renderStoryboard();
        this.ingestStatusBanner?.classList.add('hidden');
        if (this.btnAnalyzeVideo) this.btnAnalyzeVideo.disabled = true;
        this.saveProject();
      }
    } catch (err) {
      alert('Error clearing storyboard: ' + err.message);
    }
  }

  async deleteStoryboardShot(shot) {
    try {
      const res = await fetch(`/api/storyboard/${shot.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        this.project.storyboard = this.project.storyboard.filter((s) => s.id !== shot.id);
        this.renderStoryboard();
      }
    } catch (err) {
      alert('Error deleting shot: ' + err.message);
    }
  }

  async deleteStoryboardClip(shot) {
    try {
      let res;
      if (shot.activeTakeId) {
        res = await fetch(`/api/storyboard/${shot.id}/takes/${shot.activeTakeId}`, { method: 'DELETE' });
      } else {
        res = await fetch(`/api/storyboard/${shot.id}/clip`, { method: 'DELETE' });
      }
      const data = await res.json();
      if (data.success && data.shot) {
        Object.assign(shot, data.shot);
        this.renderStoryboard();
      }
    } catch (err) {
      alert('Error deleting video clip: ' + err.message);
    }
  }

  async generateStoryboardShot(shot, description, cameraMotion, buttonEl) {
    buttonEl.disabled = true;
    const startTime = Date.now();
    buttonEl.innerHTML = `<span class="btn-spinner"></span> Animating (0s)...`;

    const timer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const min = Math.floor(elapsedSec / 60);
      const sec = elapsedSec % 60;
      const timeStr = min > 0 ? `${min}m ${sec}s` : `${sec}s`;
      buttonEl.innerHTML = `<span class="btn-spinner"></span> Animating (${timeStr})...`;
    }, 1000);

    try {
      const res = await fetch('/api/generate-storyboard-clip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shotId: shot.id,
          description,
          cameraMotion,
          duration: shot.duration || 4,
          model: this.settingsFalModel ? this.settingsFalModel.value : 'Wan 2.1 (Fal.ai)',
          keyframePreference: 'regened'
        })
      });
      const data = await res.json();
      clearInterval(timer);
      if (data.success && data.shot) {
        // Update local shot object
        Object.assign(shot, data.shot);
        this.renderStoryboard();
        this.saveProject();
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err) {
      clearInterval(timer);
      alert('Shot generation error: ' + err.message);
      buttonEl.disabled = false;
      buttonEl.innerHTML = `<span>✨ ${shot.generatedClip ? '+ New Take' : 'Animate Video'}</span>`;
    }
  }

  // --- Non-Destructive Send to Timeline ---
  addShotToTimeline(shot) {
    const visualUrl = shot.generatedClip?.url || shot.styledKeyframeUrl || shot.keyframeUrl;
    if (!visualUrl) {
      alert('Please provide or generate a keyframe for this shot before sending to timeline.');
      return;
    }
    const isAnimatic = !shot.generatedClip?.url;
    const clipDuration = shot.generatedClip?.duration || shot.duration || 4.0;
    const clipModel = isAnimatic ? 'Animatic (Keyframe)' : (shot.generatedClip.model || 'Wan 2.1 (Fal.ai)');

    this.project.timeline = this.project.timeline || [];
    const existing = this.project.timeline.find((c) => c.shotId === shot.id);

    if (existing) {
      // Update existing clip without duplicating
      existing.id = shot.generatedClip?.id || `animatic_${shot.id}`;
      existing.title = shot.title;
      existing.filename = shot.generatedClip?.filename || `animatic_${shot.id}.png`;
      existing.filePath = shot.generatedClip?.filePath || '';
      existing.url = visualUrl;
      existing.thumbnailUrl = shot.styledKeyframeUrl || shot.keyframeUrl || '';
      existing.duration = clipDuration;
      if (!existing.trimEnd || existing.trimEnd > clipDuration) {
        existing.trimEnd = clipDuration;
      }
      existing.model = clipModel;
      existing.isAnimatic = isAnimatic;
      existing.audioTracks = shot.audioTracks || [];
    } else {
      this.project.timeline.push({
        timelineId: `tl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        id: shot.generatedClip?.id || `animatic_${shot.id}`,
        shotId: shot.id,
        title: shot.title,
        filename: shot.generatedClip?.filename || `animatic_${shot.id}.png`,
        filePath: shot.generatedClip?.filePath || '',
        url: visualUrl,
        thumbnailUrl: shot.styledKeyframeUrl || shot.keyframeUrl || '',
        duration: clipDuration,
        trimStart: 0,
        trimEnd: clipDuration,
        model: clipModel,
        isAnimatic: isAnimatic,
        audioTracks: shot.audioTracks || []
      });
    }

    this.renderTimeline();
    this.saveProject();
  }

  async populateApprovedToTimeline() {
    const approvedShots = (this.project.storyboard || []).filter((s) => s.approved && (s.generatedClip || s.styledKeyframeUrl || s.keyframeUrl));
    if (approvedShots.length === 0) {
      alert('No approved shots found. Mark your favorite storyboard shots as "✓ Approved" first!');
      return;
    }

    try {
      const res = await fetch('/api/populate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importAllApproved: true })
      });
      const data = await res.json();
      if (data.success) {
        this.project.timeline = data.timeline;
        this.renderTimeline();
        this.switchWorkspace('timeline');
      }
    } catch (err) {
      alert('Error importing to timeline: ' + err.message);
    }
  }

  clearTimeline() {
    if (this.project.timeline && this.project.timeline.length > 0) {
      if (!confirm('Clear all clips from the timeline? (Non-destructive: storyboard clips remain intact)')) {
        return;
      }
    }

    this.project.timeline = [];
    this.project.timelineTransitions = [];
    this.selectedTimelineClipId = null;
    this.currentTimelineIndex = 0;
    this.isPlayingTimeline = false;
    this.isCrossfading = false;
    this.activeDeck = 'a';

    this.stopAnimaticPlayback();

    if (this.cinemaPlayer) {
      this.cinemaPlayer.pause();
      this.cinemaPlayer.removeAttribute('src');
      this.cinemaPlayer.load();
      this.cinemaPlayer.style.opacity = '1';
      this.cinemaPlayer.style.zIndex = '2';
    }
    if (this.cinemaPlayerB) {
      this.cinemaPlayerB.pause();
      this.cinemaPlayerB.removeAttribute('src');
      this.cinemaPlayerB.load();
      this.cinemaPlayerB.style.opacity = '0';
      this.cinemaPlayerB.style.zIndex = '1';
    }
    if (this.cinemaImagePlayer) {
      this.cinemaImagePlayer.style.display = 'none';
      this.cinemaImagePlayer.src = '';
    }
    if (this.cinemaImagePlayerB) {
      this.cinemaImagePlayerB.style.display = 'none';
      this.cinemaImagePlayerB.src = '';
    }
    if (this.cinemaTransitionFlash) {
      this.cinemaTransitionFlash.style.opacity = '0';
    }

    if (this.iconPlay) this.iconPlay.classList.remove('hidden');
    if (this.iconPause) this.iconPause.classList.add('hidden');
    if (this.overlayPlayCenter) this.overlayPlayCenter.classList.remove('hidden');
    if (this.overlayClipTitle) this.overlayClipTitle.textContent = 'Timeline Empty';
    if (this.overlayModelBadge) this.overlayModelBadge.textContent = 'No Clips';
    if (this.timecodeDisplay) this.timecodeDisplay.textContent = '00:00:00:00 / 00:00:00:00';
    if (this.timelineTotalDuration) this.timelineTotalDuration.textContent = '00:00.0';
    if (this.timelineClipCount) this.timelineClipCount.textContent = '0 Clips';
    if (this.timelinePlayhead) this.timelinePlayhead.style.left = '0px';

    if (this.inspectorSelectedContent) this.inspectorSelectedContent.classList.add('hidden');
    if (this.inspectorEmptyState) this.inspectorEmptyState.classList.remove('hidden');
    if (this.inspectorClipTitle) this.inspectorClipTitle.textContent = 'No Clip Selected';

    this.renderTimeline();
    this.saveProject();
  }

  // --- Professional NLE Timeline Assembly ---
  renderTimeline() {
    if (!this.timelineTrack) return;
    this.timelineTrack.innerHTML = '';
    if (this.timelineAudioLane) this.timelineAudioLane.innerHTML = '';
    if (this.timelineRuler) this.timelineRuler.innerHTML = '';

    const tl = this.project.timeline || [];
    if (this.timelineClipCount) {
      this.timelineClipCount.textContent = `${tl.length} Clip${tl.length === 1 ? '' : 's'}`;
    }
    if (this.timelineCountBadge) {
      this.timelineCountBadge.textContent = `${tl.length} Clips`;
    }

    if (tl.length === 0) {
      this.timelineTrack.appendChild(this.emptyTimelineState);
      if (this.timelineTotalDuration) this.timelineTotalDuration.textContent = '00:00.0';
      if (this.timecodeDisplay) this.timecodeDisplay.textContent = '00:00:00:00 / 00:00:00:00';
      if (this.timelinePlayhead) this.timelinePlayhead.style.left = '10px';
      if (this.inspectorSelectedContent) this.inspectorSelectedContent.classList.add('hidden');
      if (this.inspectorEmptyState) this.inspectorEmptyState.classList.remove('hidden');
      if (this.inspectorClipTitle) this.inspectorClipTitle.textContent = 'No Clip Selected';
      return;
    }

    const transList = this.project.timelineTransitions || [];
    let accumulatedTime = 0;

    // Calculate cumulative time boundaries accounting for transition overlaps
    tl.forEach((item, index) => {
      item.globalStart = accumulatedTime;
      const dur = Math.max(0.1, (item.trimEnd || item.duration) - (item.trimStart || 0));
      item.effectiveDuration = dur;

      let transDur = 0;
      if (index < tl.length - 1) {
        const trans = transList[index] || { type: 'dissolve', duration: 0.8 };
        if (trans.type !== 'cut') {
          const nextClip = tl[index + 1];
          const nextDur = Math.max(0.1, (nextClip.trimEnd || nextClip.duration || 4) - (nextClip.trimStart || 0));
          transDur = Math.min(Number(trans.duration !== undefined ? trans.duration : 0.8), dur * 0.48, nextDur * 0.48);
        }
      }
      accumulatedTime += (dur - transDur);
    });

    const totalDuration = Math.max(0.1, accumulatedTime);

    // 1. Render Video Track (V1) & Audio Track (A1) Clips
    tl.forEach((item, index) => {
      const dur = item.effectiveDuration;
      const widthPx = Math.max(65, Math.round(dur * this.timelineZoom));
      const shot = (this.project.storyboard || []).find((s) => s.id === item.shotId);
      const thumbUrl = item.thumbnailUrl || shot?.styledKeyframeUrl || shot?.keyframeUrl || '';

      // --- V1 Video Clip Block ---
      const vEl = document.createElement('div');
      vEl.className = `nle-clip-v1 ${this.selectedTimelineClipId === item.timelineId ? 'active' : ''}`;
      vEl.dataset.id = item.timelineId;
      vEl.style.width = `${widthPx}px`;

      vEl.innerHTML = `
        <div class="nle-clip-filmstrip-thumb">
          ${thumbUrl ? `<img src="${thumbUrl}" alt="Filmstrip" loading="lazy">` : ''}
        </div>
        <div class="clip-item-header">
          <span class="clip-item-title">${index + 1}. ${this.escapeHtml(item.title || `Shot ${index + 1}`)}</span>
          <span class="clip-duration-chip">${dur.toFixed(1)}s</span>
        </div>
        <div class="trim-handle trim-left" data-action="trim-left" title="Drag to adjust In-Point"></div>
        <div class="trim-handle trim-right" data-action="trim-right" title="Drag to adjust Out-Point"></div>
      `;

      vEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('trim-handle')) {
          this.selectTimelineClip(item);
          this.cueTimelineClip(index, false);
        }
      });

      this.setupClipTrimDrag(vEl, item);
      this.timelineTrack.appendChild(vEl);

      // --- A1 Audio Clip Block ---
      if (this.timelineAudioLane) {
        const aEl = document.createElement('div');
        aEl.className = `nle-clip-a1 ${this.selectedTimelineClipId === item.timelineId ? 'active' : ''}`;
        aEl.dataset.id = item.timelineId;
        aEl.style.width = `${widthPx}px`;

        // Simulated sound waves based on duration
        const barCount = Math.max(6, Math.floor(widthPx / 5));
        let waveHtml = '';
        for (let b = 0; b < barCount; b++) {
          const heightPct = Math.floor(25 + Math.abs(Math.sin((b + index * 4) * 0.7)) * 70);
          waveHtml += `<div class="nle-audio-wave-bar" style="height:${heightPct}%;"></div>`;
        }

        const stemLabel = (item.audioTracks && item.audioTracks.length > 0)
          ? (item.audioTracks[0].type === 'dialogue' ? '🎙️ Dialogue' : '💥 SFX Stem')
          : '🔊 Audio Stem';

        aEl.innerHTML = `
          <span class="nle-audio-stem-title">${stemLabel}</span>
          <div class="nle-audio-waveform-bars">${waveHtml}</div>
        `;

        aEl.addEventListener('click', () => {
          this.selectTimelineClip(item);
          this.cueTimelineClip(index, false);
        });

        this.timelineAudioLane.appendChild(aEl);
      }

      // Transition node between clip i and clip i+1
      if (index < tl.length - 1) {
        const transList = this.project.timelineTransitions || [];
        const trans = transList[index] || { type: 'dissolve', duration: 0.8 };
        const transNode = document.createElement('div');
        transNode.className = 'timeline-transition-node';
        transNode.innerHTML = `
          <button class="transition-pill ${trans.type !== 'cut' ? 'has-transition' : ''}" data-trans-idx="${index}" title="Click to configure transition">
            <span class="trans-icon">${this.getTransitionIcon(trans.type)}</span>
            <span class="trans-label">${trans.type !== 'cut' ? `${trans.duration !== undefined ? trans.duration : 0.8}s ` : ''}${this.getTransitionLabel(trans.type)}</span>
          </button>
        `;
        const transBtn = transNode.querySelector('.transition-pill');
        transBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openTransitionModal(index, trans);
        });
        this.timelineTrack.appendChild(transNode);

        // Mirror spacer in audio lane
        if (this.timelineAudioLane) {
          const aSpacer = document.createElement('div');
          aSpacer.style.width = '24px';
          aSpacer.style.flexShrink = '0';
          this.timelineAudioLane.appendChild(aSpacer);
        }
      }
    });

    // 2. Render Ruler Ticks
    this.renderRulerTicks(totalDuration);

    // 3. Update Metrics
    if (this.timelineTotalDuration) {
      this.timelineTotalDuration.textContent = this.formatTime(totalDuration);
    }

    // 4. Update Inspector if clip is active
    if (this.selectedTimelineClipId) {
      const activeClip = tl.find((c) => c.timelineId === this.selectedTimelineClipId);
      if (activeClip) {
        this.selectTimelineClip(activeClip);
      } else {
        this.selectedTimelineClipId = null;
      }
    }
  }

  renderRulerTicks(totalDuration) {
    if (!this.timelineRuler) return;
    this.timelineRuler.innerHTML = '';

    const rulerDuration = Math.max(totalDuration + 4, 15);
    const intervalSec = this.timelineZoom >= 130 ? 1 : this.timelineZoom >= 80 ? 2 : 5;

    for (let sec = 0; sec <= rulerDuration; sec += intervalSec) {
      const tick = document.createElement('div');
      tick.className = `ruler-tick-mark ${sec % 5 === 0 ? 'major' : ''}`;
      tick.style.left = `${sec * this.timelineZoom}px`;
      tick.innerHTML = `
        <span class="ruler-tick-label">${this.formatRulerTime(sec)}</span>
        <div class="ruler-tick-line"></div>
      `;
      this.timelineRuler.appendChild(tick);
    }
  }

  formatRulerTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}s`;
  }

  fitTimelineZoom() {
    const tl = this.project.timeline;
    if (!tl || tl.length === 0 || !this.timelineTrackWrapper) return;
    let total = 0;
    tl.forEach((c) => total += Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0)));
    const wrapperWidth = this.timelineTrackWrapper.clientWidth - 160;
    if (total > 0 && wrapperWidth > 100) {
      const newZoom = Math.max(50, Math.min(220, Math.floor(wrapperWidth / total)));
      this.timelineZoom = newZoom;
      if (this.timelineZoomSlider) this.timelineZoomSlider.value = newZoom;
      this.renderTimeline();
    }
  }

  setupClipTrimDrag(clipEl, item) {
    const leftHandle = clipEl.querySelector('.trim-left');
    const rightHandle = clipEl.querySelector('.trim-right');

    const handleTrimDrag = (handleType, e) => {
      e.stopPropagation();
      const startX = e.clientX;
      const initialStart = item.trimStart || 0;
      const initialEnd = item.trimEnd || item.duration;

      const onMouseMove = (moveEvent) => {
        const deltaSec = (moveEvent.clientX - startX) / this.timelineZoom;
        if (handleType === 'left') {
          item.trimStart = Math.max(0, Math.min(initialEnd - 0.2, initialStart + deltaSec));
        } else {
          item.trimEnd = Math.min(item.duration, Math.max(initialStart + 0.2, initialEnd + deltaSec));
        }
        item.effectiveDuration = Math.max(0.1, item.trimEnd - item.trimStart);
        const newWidth = Math.max(65, Math.round(item.effectiveDuration * this.timelineZoom));
        clipEl.style.width = `${newWidth}px`;
        const chip = clipEl.querySelector('.clip-duration-chip');
        if (chip) chip.textContent = `${item.effectiveDuration.toFixed(1)}s`;
        if (this.selectedTimelineClipId === item.timelineId) {
          this.trimStartInput.value = item.trimStart.toFixed(1);
          this.trimEndInput.value = item.trimEnd.toFixed(1);
          this.updateEffectiveDuration();
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        this.renderTimeline();
        this.saveProject();
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    leftHandle?.addEventListener('mousedown', (e) => handleTrimDrag('left', e));
    rightHandle?.addEventListener('mousedown', (e) => handleTrimDrag('right', e));
  }

  selectTimelineClip(clip) {
    this.selectedTimelineClipId = clip.timelineId;
    if (this.inspectorClipTitle) {
      this.inspectorClipTitle.textContent = clip.title || 'Timeline Clip';
    }
    if (this.trimStartInput) {
      this.trimStartInput.value = (clip.trimStart || 0).toFixed(1);
    }
    if (this.trimEndInput) {
      this.trimEndInput.value = (clip.trimEnd || clip.duration).toFixed(1);
    }
    this.updateEffectiveDuration();

    if (this.inspectorSelectedContent && this.inspectorEmptyState) {
      this.inspectorSelectedContent.classList.remove('hidden');
      this.inspectorEmptyState.classList.add('hidden');
    }

    if (this.inspectorModelBadge) {
      this.inspectorModelBadge.textContent = clip.model || 'Wan 2.1 (Fal.ai)';
    }

    // Set preview thumbnail
    const shot = (this.project.storyboard || []).find((s) => s.id === clip.shotId);
    const thumbUrl = clip.thumbnailUrl || shot?.styledKeyframeUrl || shot?.keyframeUrl;
    if (this.inspectorThumbImg && this.inspectorThumbFallback) {
      if (thumbUrl) {
        this.inspectorThumbImg.src = thumbUrl;
        this.inspectorThumbImg.style.display = 'block';
        this.inspectorThumbFallback.style.display = 'none';
      } else {
        this.inspectorThumbImg.style.display = 'none';
        this.inspectorThumbFallback.style.display = 'flex';
      }
    }

    document.querySelectorAll('.nle-clip-v1, .nle-clip-a1').forEach((el) => {
      el.classList.toggle('active', el.dataset.id === clip.timelineId);
    });
  }

  updateEffectiveDuration() {
    const start = parseFloat(this.trimStartInput?.value) || 0;
    const end = parseFloat(this.trimEndInput?.value) || 0;
    const effective = Math.max(0.1, end - start);
    if (this.effectiveDurationBadge) {
      this.effectiveDurationBadge.textContent = `${effective.toFixed(1)}s`;
    }
  }

  applyTrim() {
    if (!this.selectedTimelineClipId) return;
    const clip = this.project.timeline.find((c) => c.timelineId === this.selectedTimelineClipId);
    if (clip) {
      clip.trimStart = parseFloat(this.trimStartInput.value) || 0;
      clip.trimEnd = parseFloat(this.trimEndInput.value) || clip.duration;
      this.renderTimeline();
      this.saveProject();
    }
  }

  markInAtPlayhead() {
    if (!this.selectedTimelineClipId) return;
    const clip = this.project.timeline.find((c) => c.timelineId === this.selectedTimelineClipId);
    if (!clip) return;
    const isAnimatic = this.isCurrentClipAnimatic();
    const cur = Number((isAnimatic ? (this.animaticCurrentTime || 0) : (this.cinemaPlayer.currentTime || 0)).toFixed(2));
    if (cur < (clip.trimEnd || clip.duration)) {
      clip.trimStart = cur;
      if (this.trimStartInput) this.trimStartInput.value = cur.toFixed(1);
      this.updateEffectiveDuration();
      this.renderTimeline();
      this.saveProject();
    }
  }

  markOutAtPlayhead() {
    if (!this.selectedTimelineClipId) return;
    const clip = this.project.timeline.find((c) => c.timelineId === this.selectedTimelineClipId);
    if (!clip) return;
    const isAnimatic = this.isCurrentClipAnimatic();
    const cur = Number((isAnimatic ? (this.animaticCurrentTime || 0) : (this.cinemaPlayer.currentTime || 0)).toFixed(2));
    if (cur > (clip.trimStart || 0)) {
      clip.trimEnd = cur;
      if (this.trimEndInput) this.trimEndInput.value = cur.toFixed(1);
      this.updateEffectiveDuration();
      this.renderTimeline();
      this.saveProject();
    }
  }

  resetClipTrim() {
    if (!this.selectedTimelineClipId) return;
    const clip = this.project.timeline.find((c) => c.timelineId === this.selectedTimelineClipId);
    if (!clip) return;
    clip.trimStart = 0;
    clip.trimEnd = clip.duration;
    if (this.trimStartInput) this.trimStartInput.value = '0.0';
    if (this.trimEndInput) this.trimEndInput.value = clip.duration.toFixed(1);
    this.updateEffectiveDuration();
    this.renderTimeline();
    this.saveProject();
  }

  splitClipAtPlayhead() {
    const tl = this.project.timeline;
    if (!tl || tl.length === 0) return;

    if (!this.selectedTimelineClipId) {
      if (tl[this.currentTimelineIndex]) {
        this.selectedTimelineClipId = tl[this.currentTimelineIndex].timelineId;
      } else {
        alert('Please select a clip on the timeline to split.');
        return;
      }
    }

    const clipIdx = tl.findIndex((c) => c.timelineId === this.selectedTimelineClipId);
    if (clipIdx === -1) return;

    const clip = tl[clipIdx];
    const isAnimatic = this.isCurrentClipAnimatic();
    const curTime = isAnimatic ? (this.animaticCurrentTime || 0) : (this.cinemaPlayer.currentTime || 0);
    const trimStart = clip.trimStart || 0;
    const trimEnd = clip.trimEnd || clip.duration;

    let splitPoint = curTime;
    if (splitPoint <= trimStart + 0.3 || splitPoint >= trimEnd - 0.3) {
      splitPoint = trimStart + (trimEnd - trimStart) / 2;
    }

    const origTrimEnd = trimEnd;
    clip.trimEnd = Number(splitPoint.toFixed(2));

    const newClip = {
      ...clip,
      timelineId: `tl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: `${clip.title} (Part 2)`,
      trimStart: Number(splitPoint.toFixed(2)),
      trimEnd: origTrimEnd
    };

    tl.splice(clipIdx + 1, 0, newClip);
    this.selectedTimelineClipId = newClip.timelineId;
    this.renderTimeline();
    this.saveProject();
  }

  removeSelectedTimelineClip() {
    if (!this.selectedTimelineClipId) return;
    this.project.timeline = this.project.timeline.filter((c) => c.timelineId !== this.selectedTimelineClipId);
    this.selectedTimelineClipId = null;
    if (this.inspectorSelectedContent) this.inspectorSelectedContent.classList.add('hidden');
    if (this.inspectorEmptyState) this.inspectorEmptyState.classList.remove('hidden');
    if (this.inspectorClipTitle) this.inspectorClipTitle.textContent = 'No Clip Selected';
    this.renderTimeline();
    this.saveProject();
  }

  // --- Cinema Player Playback & Playhead Navigation (Dual-Deck Transition Engine) ---
  getActiveVideoDeck() {
    return this.activeDeck === 'b' ? (this.cinemaPlayerB || this.cinemaPlayer) : this.cinemaPlayer;
  }

  getActiveImageDeck() {
    return this.activeDeck === 'b' ? (this.cinemaImagePlayerB || this.cinemaImagePlayer) : this.cinemaImagePlayer;
  }

  getInactiveVideoDeck() {
    return this.activeDeck === 'b' ? this.cinemaPlayer : (this.cinemaPlayerB || this.cinemaPlayer);
  }

  getInactiveImageDeck() {
    return this.activeDeck === 'b' ? this.cinemaImagePlayer : (this.cinemaImagePlayerB || this.cinemaImagePlayer);
  }

  isCurrentClipAnimatic() {
    const tl = this.project.timeline;
    if (!tl || !tl[this.currentTimelineIndex]) return false;
    const clip = tl[this.currentTimelineIndex];
    if (clip.isAnimatic) return true;
    if (!clip.url) return true;
    return !clip.url.match(/\.(mp4|webm)$/i);
  }

  cueTimelineClip(index, autoPlay = false) {
    const tl = this.project.timeline;
    if (!tl || tl.length === 0 || index < 0 || index >= tl.length) return;

    this.currentTimelineIndex = index;
    this.isPlayingTimeline = true;
    this.isCrossfading = false;
    const clip = tl[index];

    // Clear any running animatic timer
    this.stopAnimaticPlayback();

    // Reset Deck B (inactive deck)
    if (this.cinemaPlayerB) {
      this.cinemaPlayerB.pause();
      this.cinemaPlayerB.style.opacity = '0';
      this.cinemaPlayerB.style.zIndex = '1';
    }
    if (this.cinemaImagePlayerB) {
      this.cinemaImagePlayerB.style.display = 'none';
      this.cinemaImagePlayerB.style.opacity = '0';
      this.cinemaImagePlayerB.style.zIndex = '1';
    }
    if (this.cinemaTransitionFlash) {
      this.cinemaTransitionFlash.style.opacity = '0';
    }

    // Reset Deck A (active deck)
    this.activeDeck = 'a';
    if (this.cinemaPlayer) {
      this.cinemaPlayer.style.opacity = '1';
      this.cinemaPlayer.style.zIndex = '2';
    }

    const isAnimatic = clip.isAnimatic || !clip.url || !clip.url.match(/\.(mp4|webm)$/i);

    if (isAnimatic) {
      if (this.cinemaPlayer) {
        this.cinemaPlayer.pause();
        this.cinemaPlayer.style.display = 'none';
      }
      if (this.cinemaImagePlayer) {
        this.cinemaImagePlayer.style.display = 'block';
        this.cinemaImagePlayer.style.opacity = '1';
        this.cinemaImagePlayer.style.zIndex = '2';
        this.cinemaImagePlayer.src = clip.url || clip.thumbnailUrl || '';
      }
      this.animaticCurrentTime = clip.trimStart || 0;
    } else {
      if (this.cinemaImagePlayer) {
        this.cinemaImagePlayer.style.display = 'none';
      }
      if (this.cinemaPlayer) {
        this.cinemaPlayer.style.display = 'block';
        if (this.cinemaPlayer.src !== clip.url) {
          this.cinemaPlayer.src = clip.url;
        }
        this.cinemaPlayer.currentTime = clip.trimStart || 0;
      }
    }

    if (this.overlayClipTitle) {
      this.overlayClipTitle.textContent = `${index + 1}/${tl.length} — ${clip.title || 'Timeline Clip'}`;
    }
    if (this.overlayModelBadge) {
      this.overlayModelBadge.textContent = clip.model || (isAnimatic ? 'Animatic' : 'Timeline');
    }

    document.querySelectorAll('.nle-clip-v1, .nle-clip-a1').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });

    this.onPlayerTimeUpdate();

    if (autoPlay) {
      if (isAnimatic) {
        this.startAnimaticPlayback();
      } else {
        this.cinemaPlayer?.play().catch(() => {});
      }
    }
  }

  startAnimaticPlayback() {
    if (this.animaticInterval) clearInterval(this.animaticInterval);
    this.isAnimaticPlaying = true;
    this.onPlayerPlay();

    this.animaticInterval = setInterval(() => {
      const tl = this.project.timeline;
      if (!tl || !tl[this.currentTimelineIndex]) {
        this.stopAnimaticPlayback();
        return;
      }
      this.animaticCurrentTime = (this.animaticCurrentTime || 0) + 0.05;
      this.onPlayerTimeUpdate();
    }, 50);
  }

  stopAnimaticPlayback() {
    if (this.animaticInterval) {
      clearInterval(this.animaticInterval);
      this.animaticInterval = null;
    }
    this.isAnimaticPlaying = false;
    this.onPlayerPause();
  }

  stepClip(delta) {
    const tl = this.project.timeline;
    if (!tl || tl.length === 0) return;
    let next = this.currentTimelineIndex + delta;
    if (next < 0) next = 0;
    if (next >= tl.length) next = tl.length - 1;
    this.cueTimelineClip(next, true);
  }

  togglePlayPause() {
    const isAnimatic = this.isCurrentClipAnimatic();
    const activeVideo = this.getActiveVideoDeck();
    const inactiveVideo = this.getInactiveVideoDeck();

    if (isAnimatic) {
      if (this.isAnimaticPlaying) {
        this.stopAnimaticPlayback();
      } else {
        if (this.project.timeline && this.project.timeline.length > 0 && !this.isPlayingTimeline) {
          this.cueTimelineClip(0, true);
        } else {
          this.startAnimaticPlayback();
        }
      }
    } else {
      if (activeVideo && activeVideo.paused) {
        if (this.project.timeline && this.project.timeline.length > 0 && !this.isPlayingTimeline) {
          this.cueTimelineClip(0, true);
        } else {
          activeVideo.play().catch(() => {});
          if (this.isCrossfading && inactiveVideo && !inactiveVideo.paused) {
            inactiveVideo.play().catch(() => {});
          }
        }
      } else if (activeVideo) {
        activeVideo.pause();
        if (inactiveVideo) inactiveVideo.pause();
      }
    }
  }

  onPlayerPlay() {
    this.iconPlay.classList.add('hidden');
    this.iconPause.classList.remove('hidden');
    this.overlayPlayCenter.classList.add('hidden');
    this.vuMeterWrap?.classList.add('active');
  }

  onPlayerPause() {
    this.iconPlay.classList.remove('hidden');
    this.iconPause.classList.add('hidden');
    this.overlayPlayCenter.classList.remove('hidden');
    this.vuMeterWrap?.classList.remove('active');
  }

  onPlayerTimeUpdate() {
    const isAnimatic = this.isCurrentClipAnimatic();
    const activeVideo = this.getActiveVideoDeck();
    const cur = isAnimatic ? (this.animaticCurrentTime || 0) : (activeVideo?.currentTime || 0);
    const tl = this.project.timeline;

    if (!tl || tl.length === 0 || !tl[this.currentTimelineIndex]) {
      const dur = activeVideo?.duration || 0;
      if (this.timecodeDisplay) {
        this.timecodeDisplay.textContent = `${this.formatSmpte(cur)} / ${this.formatSmpte(dur)}`;
      }
      return;
    }

    const clip = tl[this.currentTimelineIndex];
    const trimStart = clip.trimStart || 0;
    const trimEnd = clip.trimEnd || clip.duration;
    const clipOffset = Math.max(0, cur - trimStart);
    const globalTime = (clip.globalStart || 0) + clipOffset;

    let totalDuration = 0;
    const transList = this.project.timelineTransitions || [];
    let acc = 0;
    tl.forEach((c, idx) => {
      const cDur = Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
      let tD = 0;
      if (idx < tl.length - 1) {
        const tr = transList[idx] || { type: 'dissolve', duration: 0.8 };
        if (tr.type !== 'cut') {
          const next = tl[idx + 1];
          const nD = Math.max(0.1, (next.trimEnd || next.duration || 4) - (next.trimStart || 0));
          tD = Math.min(Number(tr.duration !== undefined ? tr.duration : 0.8), cDur * 0.48, nD * 0.48);
        }
      }
      acc += (cDur - tD);
    });
    totalDuration = Math.max(0.1, acc);

    if (this.timecodeDisplay) {
      this.timecodeDisplay.textContent = `${this.formatSmpte(globalTime)} / ${this.formatSmpte(totalDuration)}`;
    }
    this.updatePlayheadUi(globalTime);

    // --- Transition & Cross Dissolve Playback Engine ---
    const nextClip = tl[this.currentTimelineIndex + 1];
    if (nextClip) {
      const trans = transList[this.currentTimelineIndex] || { type: 'dissolve', duration: 0.8 };
      const cDur = Math.max(0.1, trimEnd - trimStart);
      const nextTrimStart = nextClip.trimStart || 0;
      const nextTrimEnd = nextClip.trimEnd || nextClip.duration || 4;
      const nDur = Math.max(0.1, nextTrimEnd - nextTrimStart);

      let transDur = trans.type === 'cut' ? 0 : Math.max(0.1, Number(trans.duration !== undefined ? trans.duration : 0.8));
      transDur = Math.min(transDur, cDur * 0.48, nDur * 0.48);
      const transStartTime = trimEnd - transDur;

      if (trans.type !== 'cut' && transDur >= 0.1 && cur >= transStartTime) {
        // In Active Transition Window
        const progress = Math.min(1, Math.max(0, (cur - transStartTime) / transDur));
        const inactiveVideo = this.getInactiveVideoDeck();
        const inactiveImage = this.getInactiveImageDeck();
        const activeImage = this.getActiveImageDeck();
        const nextIsAnimatic = nextClip.isAnimatic || !nextClip.url || !nextClip.url.match(/\.(mp4|webm)$/i);

        if (!this.isCrossfading) {
          this.isCrossfading = true;
          if (nextIsAnimatic) {
            if (inactiveVideo) inactiveVideo.style.display = 'none';
            if (inactiveImage) {
              inactiveImage.style.display = 'block';
              inactiveImage.src = nextClip.url || nextClip.thumbnailUrl || '';
              inactiveImage.style.opacity = '0';
              inactiveImage.style.zIndex = '3';
            }
          } else {
            if (inactiveImage) inactiveImage.style.display = 'none';
            if (inactiveVideo) {
              inactiveVideo.style.display = 'block';
              if (inactiveVideo.src !== nextClip.url) inactiveVideo.src = nextClip.url;
              inactiveVideo.currentTime = nextTrimStart;
              inactiveVideo.style.opacity = '0';
              inactiveVideo.style.zIndex = '3';
              inactiveVideo.play().catch(() => {});
            }
          }
        }

        const incomingEl = nextIsAnimatic ? inactiveImage : inactiveVideo;
        const outgoingEl = isAnimatic ? activeImage : activeVideo;

        if (trans.type === 'dissolve' || trans.type === 'crossfade') {
          if (incomingEl) incomingEl.style.opacity = progress.toFixed(3);
          if (outgoingEl) outgoingEl.style.opacity = (1 - (progress * 0.15)).toFixed(3);
        } else if (trans.type === 'fadeblack') {
          if (progress < 0.5) {
            if (outgoingEl) outgoingEl.style.opacity = (1 - progress * 2).toFixed(3);
            if (incomingEl) incomingEl.style.opacity = '0';
          } else {
            if (outgoingEl) outgoingEl.style.opacity = '0';
            if (incomingEl) incomingEl.style.opacity = ((progress - 0.5) * 2).toFixed(3);
          }
        } else if (trans.type === 'fadewhite') {
          const flash = Math.sin(progress * Math.PI) * 0.95;
          if (this.cinemaTransitionFlash) this.cinemaTransitionFlash.style.opacity = flash.toFixed(3);
          if (incomingEl) incomingEl.style.opacity = progress.toFixed(3);
        }

        // When transition completes
        if (cur >= trimEnd || progress >= 0.99) {
          this.finishTransitionToNextClip();
          return;
        }
      } else if (cur >= trimEnd) {
        this.advanceTimeline();
        return;
      }
    } else {
      if (cur >= trimEnd) {
        this.advanceTimeline();
      }
    }
  }

  finishTransitionToNextClip() {
    const tl = this.project.timeline;
    if (!tl || this.currentTimelineIndex >= tl.length - 1) {
      this.advanceTimeline();
      return;
    }

    const prevVideo = this.getActiveVideoDeck();
    const prevImage = this.getActiveImageDeck();
    const nextVideo = this.getInactiveVideoDeck();
    const nextImage = this.getInactiveImageDeck();

    if (prevVideo) {
      prevVideo.pause();
      prevVideo.style.opacity = '0';
      prevVideo.style.zIndex = '1';
    }
    if (prevImage) {
      prevImage.style.display = 'none';
      prevImage.style.opacity = '0';
      prevImage.style.zIndex = '1';
    }
    if (this.cinemaTransitionFlash) {
      this.cinemaTransitionFlash.style.opacity = '0';
    }

    if (nextVideo) {
      nextVideo.style.opacity = '1';
      nextVideo.style.zIndex = '2';
    }
    if (nextImage) {
      nextImage.style.opacity = '1';
      nextImage.style.zIndex = '2';
    }

    this.activeDeck = this.activeDeck === 'a' ? 'b' : 'a';
    this.isCrossfading = false;
    this.currentTimelineIndex++;

    const newClip = tl[this.currentTimelineIndex];
    const isAnimatic = newClip.isAnimatic || !newClip.url || !newClip.url.match(/\.(mp4|webm)$/i);

    if (this.overlayClipTitle) {
      this.overlayClipTitle.textContent = `${this.currentTimelineIndex + 1}/${tl.length} — ${newClip.title || 'Timeline Clip'}`;
    }
    if (this.overlayModelBadge) {
      this.overlayModelBadge.textContent = newClip.model || (isAnimatic ? 'Animatic' : 'Timeline');
    }

    document.querySelectorAll('.nle-clip-v1, .nle-clip-a1').forEach((el, i) => {
      el.classList.toggle('active', i === this.currentTimelineIndex);
    });

    if (isAnimatic) {
      this.animaticCurrentTime = newClip.trimStart || 0;
      this.startAnimaticPlayback();
    }
  }

  updatePlayheadUi(globalTimeSeconds) {
    if (!this.timelinePlayhead) return;
    const posPx = Math.round(globalTimeSeconds * this.timelineZoom);
    this.timelinePlayhead.style.left = `${posPx}px`;
  }

  seekTimelineTo(globalSec) {
    const tl = this.project.timeline;
    if (!tl || tl.length === 0) return;

    this.isCrossfading = false;
    if (this.cinemaTransitionFlash) this.cinemaTransitionFlash.style.opacity = '0';

    const transList = this.project.timelineTransitions || [];
    let targetIndex = 0;
    let targetClipOffset = 0;

    for (let i = 0; i < tl.length; i++) {
      const clip = tl[i];
      const dur = Math.max(0.1, (clip.trimEnd || clip.duration) - (clip.trimStart || 0));
      const start = clip.globalStart !== undefined ? clip.globalStart : 0;
      const end = start + dur;

      if ((globalSec >= start && globalSec <= end) || i === tl.length - 1) {
        targetIndex = i;
        targetClipOffset = Math.max(0, globalSec - start);
        break;
      }
    }

    const clip = tl[targetIndex];
    const isAnimatic = clip.isAnimatic || !clip.url || !clip.url.match(/\.(mp4|webm)$/i);
    const activeVid = this.getActiveVideoDeck();
    const wasPlaying = this.isAnimaticPlaying || (activeVid && !activeVid.paused);

    this.cueTimelineClip(targetIndex, false);
    const seekTime = (clip.trimStart || 0) + targetClipOffset;

    if (isAnimatic) {
      this.animaticCurrentTime = seekTime;
    } else {
      const vid = this.getActiveVideoDeck();
      if (vid) vid.currentTime = seekTime;
    }

    this.selectTimelineClip(clip);
    this.onPlayerTimeUpdate();

    if (wasPlaying) {
      if (isAnimatic) this.startAnimaticPlayback();
      else this.getActiveVideoDeck()?.play().catch(() => {});
    }
  }

  setupTimelineScrubbing() {
    let isDragging = false;

    const handleScrub = (e) => {
      if (!this.timelineTrackWrapper) return;
      const rect = this.timelineTrackWrapper.getBoundingClientRect();
      const scrollLeft = this.timelineTrackWrapper.scrollLeft;
      const x = e.clientX - rect.left + scrollLeft;
      const clickedSec = Math.max(0, x / this.timelineZoom);
      this.seekTimelineTo(clickedSec);
    };

    this.timelineRuler?.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleScrub(e);
    });

    this.timelinePlayhead?.querySelector('.nle-needle-head')?.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        handleScrub(e);
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  setupNleHotkeys() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (this.currentWorkspace !== 'timeline') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (this.isCurrentClipAnimatic()) {
          this.animaticCurrentTime = Math.max(0, (this.animaticCurrentTime || 0) - 0.5);
          this.onPlayerTimeUpdate();
        } else if (this.cinemaPlayer) {
          this.cinemaPlayer.currentTime = Math.max(0, this.cinemaPlayer.currentTime - 0.5);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (this.isCurrentClipAnimatic()) {
          const maxDur = (this.project.timeline && this.project.timeline[this.currentTimelineIndex]?.duration) || 10;
          this.animaticCurrentTime = Math.min(maxDur, (this.animaticCurrentTime || 0) + 0.5);
          this.onPlayerTimeUpdate();
        } else if (this.cinemaPlayer) {
          this.cinemaPlayer.currentTime = Math.min(this.cinemaPlayer.duration || 10, this.cinemaPlayer.currentTime + 0.5);
        }
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        this.splitClipAtPlayhead();
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        this.markInAtPlayhead();
      } else if (e.code === 'KeyO') {
        e.preventDefault();
        this.markOutAtPlayhead();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        this.removeSelectedTimelineClip();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        if (this.cinemaPlayer) this.cinemaPlayer.muted = !this.cinemaPlayer.muted;
      } else if (e.code === 'Home') {
        e.preventDefault();
        this.seekTimelineTo(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        let total = 0;
        (this.project.timeline || []).forEach((c) => total += Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0)));
        this.seekTimelineTo(total);
      }
    });
  }

  setupNleResizers() {
    const root = document.documentElement;
    const workspaceLayout = document.querySelector('.timeline-workspace-content.nle-workspace-layout');
    const upperRow = this.nleUpperRow || document.getElementById('nle-upper-row');
    const splitterCol = this.nleSplitterCol || document.getElementById('nle-splitter-col');
    const splitterRow = this.nleSplitterRow || document.getElementById('nle-splitter-row');
    const sideDock = document.getElementById('nle-side-dock') || this.clipInspectorDrawer || document.getElementById('clip-inspector-drawer');
    const btnExpand = this.btnExpandInspector || document.getElementById('btn-expand-inspector');
    const btnCollapse = this.toggleInspectorCollapseBtn || document.getElementById('toggle-inspector-collapse-btn');

    // Restore saved dimensions
    const savedUpperHeight = localStorage.getItem('pb_nle_upper_height');
    if (savedUpperHeight) {
      root.style.setProperty('--nle-upper-height', `${savedUpperHeight}px`);
    }

    const savedInspectorWidth = localStorage.getItem('pb_nle_inspector_width');
    if (savedInspectorWidth) {
      root.style.setProperty('--nle-inspector-width', `${savedInspectorWidth}px`);
    }

    const savedInspectorCollapsed = localStorage.getItem('pb_nle_inspector_collapsed') === 'true';
    if (savedInspectorCollapsed && sideDock) {
      sideDock.classList.add('collapsed');
      btnExpand?.classList.remove('hidden');
    }

    // Toggle collapse handlers
    const toggleInspectorCollapse = (force) => {
      if (!sideDock) return;
      const isNowCollapsed = typeof force === 'boolean' ? force : !sideDock.classList.contains('collapsed');
      sideDock.classList.toggle('collapsed', isNowCollapsed);
      if (btnExpand) btnExpand.classList.toggle('hidden', !isNowCollapsed);
      localStorage.setItem('pb_nle_inspector_collapsed', isNowCollapsed ? 'true' : 'false');
    };

    btnCollapse?.addEventListener('click', () => toggleInspectorCollapse(true));
    btnExpand?.addEventListener('click', () => toggleInspectorCollapse(false));

    // 1. Column Splitter (Horizontal resize: Monitor vs Side Dock)
    if (splitterCol && upperRow) {
      let isResizingCol = false;
      let startX = 0;
      let startWidth = 340;

      splitterCol.addEventListener('mousedown', (e) => {
        isResizingCol = true;
        startX = e.clientX;
        const currentW = sideDock?.offsetWidth || 340;
        startWidth = currentW > 0 ? currentW : 340;
        splitterCol.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        if (this.cinemaPlayer) this.cinemaPlayer.style.pointerEvents = 'none';
        e.preventDefault();
      });

      splitterCol.addEventListener('dblclick', () => {
        // Double-click resets side dock to 340px or toggles
        if (sideDock?.classList.contains('collapsed')) {
          toggleInspectorCollapse(false);
        }
        root.style.setProperty('--nle-inspector-width', '340px');
        localStorage.setItem('pb_nle_inspector_width', '340');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingCol) return;
        const deltaX = startX - e.clientX; // moving left makes dock wider
        const upperRowWidth = upperRow.clientWidth;
        const minWidth = 240;
        const maxWidth = Math.max(minWidth, upperRowWidth - 320);
        let newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + deltaX));

        if (sideDock?.classList.contains('collapsed')) {
          toggleInspectorCollapse(false);
        }

        root.style.setProperty('--nle-inspector-width', `${newWidth}px`);
        localStorage.setItem('pb_nle_inspector_width', `${Math.round(newWidth)}`);
      });

      window.addEventListener('mouseup', () => {
        if (isResizingCol) {
          isResizingCol = false;
          splitterCol.classList.remove('resizing');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          if (this.cinemaPlayer) this.cinemaPlayer.style.pointerEvents = '';
        }
      });
    }

    // 2. Row Splitter (Vertical resize: Upper Row vs Multi-Track Timeline)
    if (splitterRow && workspaceLayout) {
      let isResizingRow = false;
      let startY = 0;
      let startHeight = 380;

      splitterRow.addEventListener('mousedown', (e) => {
        isResizingRow = true;
        startY = e.clientY;
        startHeight = upperRow?.offsetHeight || 380;
        splitterRow.classList.add('resizing');
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
        if (this.cinemaPlayer) this.cinemaPlayer.style.pointerEvents = 'none';
        e.preventDefault();
      });

      splitterRow.addEventListener('dblclick', () => {
        // Reset to default 380px or 48% of available height
        const defaultHeight = Math.min(420, Math.max(260, Math.round(workspaceLayout.clientHeight * 0.48)));
        root.style.setProperty('--nle-upper-height', `${defaultHeight}px`);
        localStorage.setItem('pb_nle_upper_height', `${defaultHeight}`);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingRow) return;
        const deltaY = e.clientY - startY; // moving down makes upper row taller
        const layoutHeight = workspaceLayout.clientHeight;
        const minHeight = 180;
        const maxHeight = Math.max(minHeight, layoutHeight - 160);
        let newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight + deltaY));

        root.style.setProperty('--nle-upper-height', `${newHeight}px`);
        localStorage.setItem('pb_nle_upper_height', `${Math.round(newHeight)}`);
      });

      window.addEventListener('mouseup', () => {
        if (isResizingRow) {
          isResizingRow = false;
          splitterRow.classList.remove('resizing');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          if (this.cinemaPlayer) this.cinemaPlayer.style.pointerEvents = '';
        }
      });
    }
  }

  initAudioEqualizer() {
    const volumeSlider = this.masterVolumeSlider || document.getElementById('master-volume-slider');
    const volumeLabel = document.getElementById('volume-val-label');
    const btnMute = this.btnMute || document.getElementById('btn-mute');
    const iconVolOn = document.getElementById('icon-volume-on');
    const iconVolMuted = document.getElementById('icon-volume-muted');
    const presetIndicator = document.getElementById('eq-preset-indicator');

    const lowSlider = document.getElementById('eq-low-slider');
    const lowBadge = document.getElementById('eq-low-badge');
    const midSlider = document.getElementById('eq-mid-slider');
    const midBadge = document.getElementById('eq-mid-badge');
    const highSlider = document.getElementById('eq-high-slider');
    const highBadge = document.getElementById('eq-high-badge');

    const presetButtons = document.querySelectorAll('.eq-preset-btn');

    // Update volume UI
    const updateVolumeUi = (vol, isMuted) => {
      if (volumeLabel) {
        volumeLabel.textContent = isMuted ? 'Muted' : `${Math.round(vol * 100)}%`;
      }
      if (btnMute) {
        btnMute.classList.toggle('active', isMuted);
      }
      if (iconVolOn && iconVolMuted) {
        iconVolOn.classList.toggle('hidden', isMuted);
        iconVolMuted.classList.toggle('hidden', !isMuted);
      }
    };

    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        const val = parseFloat(volumeSlider.value);
        if (this.cinemaPlayer) {
          this.cinemaPlayer.volume = val;
          if (this.cinemaPlayer.muted && val > 0) {
            this.cinemaPlayer.muted = false;
          }
        }
        if (this.cinemaPlayerB) {
          this.cinemaPlayerB.volume = val;
          if (this.cinemaPlayerB.muted && val > 0) {
            this.cinemaPlayerB.muted = false;
          }
        }
        const isMuted = this.cinemaPlayer ? this.cinemaPlayer.muted : false;
        updateVolumeUi(val, isMuted);
        if (this.webAudioGain) {
          this.webAudioGain.gain.value = val;
        }
      });
    }

    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const newMuted = this.cinemaPlayer ? !this.cinemaPlayer.muted : true;
        if (this.cinemaPlayer) this.cinemaPlayer.muted = newMuted;
        if (this.cinemaPlayerB) this.cinemaPlayerB.muted = newMuted;
        const currentVol = parseFloat(volumeSlider?.value || 1);
        updateVolumeUi(currentVol, newMuted);
      });
    }

    // Web Audio Equalizer Filter Nodes Setup
    const ensureAudioGraph = () => {
      if (this.audioCtxInitialized || !this.cinemaPlayer) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.audioCtx = new AudioContext();

        this.eqLowFilter = this.audioCtx.createBiquadFilter();
        this.eqLowFilter.type = 'lowshelf';
        this.eqLowFilter.frequency.value = 250;
        this.eqLowFilter.gain.value = parseFloat(lowSlider?.value || 0);

        this.eqMidFilter = this.audioCtx.createBiquadFilter();
        this.eqMidFilter.type = 'peaking';
        this.eqMidFilter.frequency.value = 1000;
        this.eqMidFilter.Q.value = 1;
        this.eqMidFilter.gain.value = parseFloat(midSlider?.value || 0);

        this.eqHighFilter = this.audioCtx.createBiquadFilter();
        this.eqHighFilter.type = 'highshelf';
        this.eqHighFilter.frequency.value = 4000;
        this.eqHighFilter.gain.value = parseFloat(highSlider?.value || 0);

        this.webAudioGain = this.audioCtx.createGain();
        this.webAudioGain.gain.value = parseFloat(volumeSlider?.value || 1);

        const sourceA = this.audioCtx.createMediaElementSource(this.cinemaPlayer);
        sourceA.connect(this.eqLowFilter);

        if (this.cinemaPlayerB) {
          try {
            const sourceB = this.audioCtx.createMediaElementSource(this.cinemaPlayerB);
            sourceB.connect(this.eqLowFilter);
          } catch (e) {}
        }

        this.eqLowFilter.connect(this.eqMidFilter);
        this.eqMidFilter.connect(this.eqHighFilter);
        this.eqHighFilter.connect(this.webAudioGain);
        this.webAudioGain.connect(this.audioCtx.destination);

        this.audioCtxInitialized = true;
      } catch (e) {
        console.warn('Web Audio graph setup deferred or unsupported:', e.message);
      }
    };

    const activateAudioCtx = () => {
      ensureAudioGraph();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    };

    this.cinemaPlayer?.addEventListener('play', activateAudioCtx);
    this.cinemaPlayerB?.addEventListener('play', activateAudioCtx);
    window.addEventListener('click', activateAudioCtx, { once: true });

    // Slider inputs
    const handleEqChange = () => {
      ensureAudioGraph();
      const lowVal = parseFloat(lowSlider?.value || 0);
      const midVal = parseFloat(midSlider?.value || 0);
      const highVal = parseFloat(highSlider?.value || 0);

      if (lowBadge) lowBadge.textContent = `${lowVal > 0 ? '+' : ''}${lowVal} dB`;
      if (midBadge) midBadge.textContent = `${midVal > 0 ? '+' : ''}${midVal} dB`;
      if (highBadge) highBadge.textContent = `${highVal > 0 ? '+' : ''}${highVal} dB`;

      if (this.eqLowFilter) this.eqLowFilter.gain.value = lowVal;
      if (this.eqMidFilter) this.eqMidFilter.gain.value = midVal;
      if (this.eqHighFilter) this.eqHighFilter.gain.value = highVal;
    };

    lowSlider?.addEventListener('input', () => {
      handleEqChange();
      presetButtons.forEach(b => b.classList.remove('active'));
      if (presetIndicator) presetIndicator.textContent = 'Custom';
    });
    midSlider?.addEventListener('input', () => {
      handleEqChange();
      presetButtons.forEach(b => b.classList.remove('active'));
      if (presetIndicator) presetIndicator.textContent = 'Custom';
    });
    highSlider?.addEventListener('input', () => {
      handleEqChange();
      presetButtons.forEach(b => b.classList.remove('active'));
      if (presetIndicator) presetIndicator.textContent = 'Custom';
    });

    // Preset handlers
    const presets = {
      flat: { low: 0, mid: 0, high: 0, label: 'Flat' },
      dialogue: { low: -2, mid: 4, high: 1, label: 'Voice' },
      bass: { low: 6, mid: 0, high: -2, label: 'Bass' },
      cinema: { low: 3, mid: -1, high: 4, label: 'Cinema' }
    };

    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const pKey = btn.dataset.preset;
        const config = presets[pKey] || presets.flat;

        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (lowSlider) lowSlider.value = config.low;
        if (midSlider) midSlider.value = config.mid;
        if (highSlider) highSlider.value = config.high;

        if (presetIndicator) presetIndicator.textContent = config.label;
      });
    });
  }

  formatSmpte(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const f = Math.floor((seconds % 1) * 30);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  }

  onPlayerEnded() {
    if (this.isPlayingTimeline) {
      this.advanceTimeline();
    }
  }

  advanceTimeline() {
    this.isCrossfading = false;
    const tl = this.project.timeline;
    if (!tl || tl.length === 0) return;

    if (this.currentTimelineIndex < tl.length - 1) {
      this.cueTimelineClip(this.currentTimelineIndex + 1, true);
    } else {
      if (this.cinemaPlayer?.loop) {
        this.cueTimelineClip(0, true);
      } else {
        this.isPlayingTimeline = false;
        this.stopAnimaticPlayback();
        if (this.cinemaPlayer) this.cinemaPlayer.pause();
        if (this.cinemaPlayerB) this.cinemaPlayerB.pause();
        this.cueTimelineClip(0, false);
        this.onPlayerPause();
      }
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '00:00.0';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  }

  // --- Storyboard Shot Preview Modal ---
  openPreviewModal(shot) {
    if (!shot.generatedClip?.url) return;
    this.previewModalTitle.textContent = `${shot.title || 'Shot'}`;
    this.modalVideoPlayer.src = shot.generatedClip.url;
    this.modalVideoDesc.textContent = shot.description || 'No description provided.';

    // Display the exact prompt dispatched for video generation
    const activePrompt = shot.generatedClip.videoPrompt || `${shot.description || shot.title}. Dynamic camera motion: ${shot.cameraMotion || 'Dolly Forward'}.`;
    if (this.modalVideoPrompt) {
      this.modalVideoPrompt.textContent = activePrompt;
    }
    if (this.modalProviderBadge) {
      this.modalProviderBadge.textContent = shot.generatedClip.provider || shot.generatedClip.model || 'Fal.ai';
    }

    // Compare original keyframe vs styled keyframe (Step 1)
    if (this.modalKeyframesCompare) {
      if (shot.styledKeyframeUrl || shot.keyframeUrl) {
        this.modalKeyframesCompare.classList.remove('hidden');
        if (this.modalOrigKfImg) this.modalOrigKfImg.src = shot.keyframeUrl || '';
        const modalColorCol = document.getElementById('modal-color-kf-col');
        const modalColorImg = document.getElementById('modal-color-kf-img');
        if (shot.colorFrameUrl) {
          if (modalColorCol) modalColorCol.classList.remove('hidden');
          if (modalColorImg) modalColorImg.src = shot.colorFrameUrl;
        } else {
          if (modalColorCol) modalColorCol.classList.add('hidden');
        }
        if (this.modalStyledKfImg) this.modalStyledKfImg.src = shot.styledKeyframeUrl || shot.keyframeUrl || '';

        const origLabel = document.getElementById('modal-orig-kf-label');
        const styledLabel = document.getElementById('modal-styled-kf-label');
        const animatedFromRegened = shot.generatedClip?.keyframeType === 'regened' || Boolean(shot.styledKeyframeUrl);

        if (styledLabel) {
          styledLabel.innerHTML = animatedFromRegened
            ? '✨ Regened Keyframe <span style="background:rgba(16,185,129,0.25); color:#34d399; padding:1px 6px; border-radius:3px; font-size:0.6rem; font-weight:700;">✓ Animated Source</span>'
            : '✨ Regened Keyframe (Not Generated)';
        }
        if (origLabel) {
          origLabel.innerHTML = animatedFromRegened
            ? 'Spatial Previs Frame'
            : 'Spatial Previs Frame <span style="background:rgba(99,102,241,0.25); color:#818cf8; padding:1px 6px; border-radius:3px; font-size:0.6rem; font-weight:700;">✓ Animated Source</span>';
        }
      } else {
        this.modalKeyframesCompare.classList.add('hidden');
      }
    }

    this.btnModalAddTimeline.onclick = () => {
      this.addShotToTimeline(shot);
      this.closePreviewModal();
    };
    this.previewClipModal.classList.remove('hidden');
    this.modalVideoPlayer.play().catch(() => {});
  }

  closePreviewModal() {
    this.modalVideoPlayer.pause();
    this.previewClipModal.classList.add('hidden');
  }

  // --- Keyframe Review & Lightbox Comparison Modal ---
  openKeyframeReviewModal(shot, target = 'source', mode = 'single', targetFrame = 'start') {
    this.activeLightboxTargetFrame = targetFrame;
    const shots = this.project.storyboard || [];
    let idx = shots.findIndex(s => s.id === shot.id);
    if (idx === -1) idx = 0;
    this.activeLightboxShotIndex = idx;
    this.activeLightboxTarget = target;
    this.activeLightboxMode = mode;
    this.updateKeyframeLightboxUi();
    this.keyframeLightboxModal?.classList.remove('hidden');
  }

  closeKeyframeReviewModal() {
    this.keyframeLightboxModal?.classList.add('hidden');
  }

  setKeyframeLightboxMode(mode) {
    this.activeLightboxMode = mode;
    this.updateKeyframeLightboxUi();
  }

  setKeyframeLightboxTarget(target) {
    this.activeLightboxTarget = target;
    this.updateKeyframeLightboxUi();
  }

  stepLightboxShot(delta) {
    const shots = this.project.storyboard || [];
    if (shots.length === 0) return;
    let next = this.activeLightboxShotIndex + delta;
    if (next < 0) next = shots.length - 1;
    if (next >= shots.length) next = 0;
    this.activeLightboxShotIndex = next;
    this.updateKeyframeLightboxUi();
  }

  updateKeyframeLightboxUi() {
    const shots = this.project.storyboard || [];
    const shot = shots[this.activeLightboxShotIndex];
    if (!shot) return;

    if (this.kfModalSubtitle) {
      const isEndFrame = this.activeLightboxTargetFrame === 'end';
      const frameLabel = isEndFrame ? '[END FRAME] ' : '[START FRAME] ';
      this.kfModalSubtitle.textContent = shot.title ? `${frameLabel}${shot.title} (Shot #${this.activeLightboxShotIndex + 1})` : `${frameLabel}Shot #${this.activeLightboxShotIndex + 1}`;
    }
    if (this.kfShotCounter) {
      this.kfShotCounter.textContent = `${this.activeLightboxShotIndex + 1} / ${shots.length}`;
    }
    if (this.kfDescText) {
      this.kfDescText.textContent = shot.description || 'No description provided.';
    }
    if (this.kfStyleText) {
      this.kfStyleText.textContent = this.project.visualReference?.styleBrief || 'Follows project visual style anchor.';
    }

    // View mode switchers
    if (this.btnKfModeSingle) {
      this.btnKfModeSingle.classList.toggle('active', this.activeLightboxMode === 'single');
    }
    if (this.btnKfModeCompare) {
      this.btnKfModeCompare.classList.toggle('active', this.activeLightboxMode === 'compare');
    }

    if (this.activeLightboxMode === 'single') {
      if (this.kfSingleTabs) this.kfSingleTabs.classList.remove('hidden');
      if (this.kfViewportSingle) this.kfViewportSingle.classList.remove('hidden');
      if (this.kfViewportCompare) this.kfViewportCompare.classList.add('hidden');

      if (this.tabKfSource) this.tabKfSource.classList.toggle('active', this.activeLightboxTarget === 'source');
      if (this.tabKfColor) this.tabKfColor.classList.toggle('active', this.activeLightboxTarget === 'color');
      if (this.tabKfCompOut) this.tabKfCompOut.classList.toggle('active', this.activeLightboxTarget === 'compout');
      if (this.tabKfRestyle) this.tabKfRestyle.classList.toggle('active', this.activeLightboxTarget === 'restyle' || this.activeLightboxTarget === 'regened');

      let imgUrl = null;
      let stageName = '';
      let badgeBg = '';
      let badgeColor = '';
      let badgeBorder = '';
      let emptyMsg = '';

      if (this.activeLightboxTarget === 'color') {
        imgUrl = (this.activeLightboxTargetFrame === 'end') ? (shot.endColorFrameUrl || shot.colorFrameUrl) : shot.colorFrameUrl;
        stageName = '2. True Color Reference Frame (Textured Engine Frame)';
        badgeBg = 'rgba(245, 158, 11, 0.2)';
        badgeColor = '#fbbf24';
        badgeBorder = 'rgba(245, 158, 11, 0.4)';
        emptyMsg = 'No True Color reference frame loaded yet for this shot.';
      } else if (this.activeLightboxTarget === 'compout') {
        imgUrl = (this.activeLightboxTargetFrame === 'end') ? (shot.compositeEndKeyframeUrl || shot.stage2EndImageUrl || shot.compositeKeyframeUrl) : (shot.compositeKeyframeUrl || shot.stage2ImageUrl);
        stageName = '4. Compositor Output (Perspective Warped Layers)';
        badgeBg = 'rgba(225, 29, 72, 0.2)';
        badgeColor = '#fb7185';
        badgeBorder = 'rgba(225, 29, 72, 0.4)';
        emptyMsg = 'No composite baked yet. Click "3. 📐 Open Compositor" on the shot card to composite layers!';
      } else if (this.activeLightboxTarget === 'restyle' || this.activeLightboxTarget === 'regened') {
        imgUrl = (this.activeLightboxTargetFrame === 'end') ? (shot.styledEndKeyframeUrl || shot.styledKeyframeUrl) : shot.styledKeyframeUrl;
        stageName = '5. Restyled Keyframe (Neural Style Anchor Translation)';
        badgeBg = 'rgba(16, 185, 129, 0.2)';
        badgeColor = '#34d399';
        badgeBorder = 'rgba(16, 185, 129, 0.4)';
        emptyMsg = 'No restyled keyframe exists yet for this shot. Bake with harmonization in the Compositor!';
      } else {
        imgUrl = (this.activeLightboxTargetFrame === 'end') ? (shot.endKeyframeUrl || shot.keyframeUrl) : shot.keyframeUrl;
        stageName = '1. Spatial Previs Frame (3D Playblast / Proxy Matting)';
        badgeBg = 'rgba(99, 102, 241, 0.2)';
        badgeColor = '#818cf8';
        badgeBorder = 'rgba(99, 102, 241, 0.4)';
        emptyMsg = 'No spatial previs image loaded for this shot.';
      }

      if (this.kfStageBadge) {
        this.kfStageBadge.textContent = stageName;
        this.kfStageBadge.style.background = badgeBg;
        this.kfStageBadge.style.color = badgeColor;
        this.kfStageBadge.style.borderColor = badgeBorder;
      }

      if (imgUrl) {
        if (this.kfSingleImg) {
          this.kfSingleImg.style.display = 'block';
          this.kfSingleImg.src = imgUrl;
          this.kfSingleImg.onload = () => {
            if (this.kfMetaRes) {
              this.kfMetaRes.textContent = `${this.kfSingleImg.naturalWidth} × ${this.kfSingleImg.naturalHeight}`;
            }
          };
        }
        if (this.kfSingleEmpty) this.kfSingleEmpty.classList.add('hidden');
        if (this.kfOpenRaw) {
          this.kfOpenRaw.href = imgUrl;
          this.kfOpenRaw.style.display = 'inline-flex';
        }
      } else {
        if (this.kfSingleImg) this.kfSingleImg.style.display = 'none';
        if (this.kfSingleEmpty) this.kfSingleEmpty.classList.remove('hidden');
        if (this.kfSingleEmptyText) this.kfSingleEmptyText.textContent = emptyMsg;
        if (this.kfOpenRaw) this.kfOpenRaw.style.display = 'none';
        if (this.kfMetaRes) this.kfMetaRes.textContent = 'No Image';
      }
    } else {
      // Tri-Split Comparison Viewport (Spatial vs True Color vs Regened)
      if (this.kfSingleTabs) this.kfSingleTabs.classList.add('hidden');
      if (this.kfViewportSingle) this.kfViewportSingle.classList.add('hidden');
      if (this.kfViewportCompare) this.kfViewportCompare.classList.remove('hidden');

      if (this.kfCompareSourceImg) {
        this.kfCompareSourceImg.src = shot.keyframeUrl || '';
      }

      if (shot.colorFrameUrl) {
        if (this.kfCompareColorImg) {
          this.kfCompareColorImg.style.display = 'block';
          this.kfCompareColorImg.src = shot.colorFrameUrl;
        }
        if (this.kfCompareColorEmpty) this.kfCompareColorEmpty.classList.add('hidden');
      } else {
        if (this.kfCompareColorImg) this.kfCompareColorImg.style.display = 'none';
        if (this.kfCompareColorEmpty) this.kfCompareColorEmpty.classList.remove('hidden');
      }

      if (shot.styledKeyframeUrl) {
        if (this.kfCompareRegenedImg) {
          this.kfCompareRegenedImg.style.display = 'block';
          this.kfCompareRegenedImg.src = shot.styledKeyframeUrl;
        }
        if (this.kfCompareRegenedEmpty) this.kfCompareRegenedEmpty.classList.add('hidden');
      } else {
        if (this.kfCompareRegenedImg) this.kfCompareRegenedImg.style.display = 'none';
        if (this.kfCompareRegenedEmpty) this.kfCompareRegenedEmpty.classList.remove('hidden');
      }
    }

    if (this.btnKfTriggerRestyle) {
      this.btnKfTriggerRestyle.textContent = shot.styledKeyframeUrl ? '🎨 Restyle Keyframe' : '🎨 Generate Restyled Keyframe';
    }
  }

  restyleCurrentLightboxShot() {
    const shots = this.project.storyboard || [];
    const shot = shots[this.activeLightboxShotIndex];
    if (!shot) return;

    // Open the Layered Restyle Studio directly
    this.closeKeyframeLightbox();
    this.openLayeredRestyleStudio(shot, this.activeLightboxTargetFrame || 'start');
  }

  // --- Master Video Export Modal (FFmpeg) ---
  openExportModal() {
    const tl = this.project.timeline || [];
    if (tl.length === 0) {
      alert('Please add at least one clip to the timeline before exporting.');
      return;
    }

    let total = 0;
    tl.forEach((c) => total += Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0)));

    this.modalClipCount.textContent = tl.length;
    this.modalTotalDuration.textContent = this.formatTime(total);

    this.exportProgressBox.classList.add('hidden');
    this.exportResultCard.classList.add('hidden');
    this.exportModalFooter.classList.remove('hidden');
    this.exportModal.classList.remove('hidden');
  }

  closeExportModal() {
    this.exportModal.classList.add('hidden');
  }

  async startStitchExport() {
    const tl = this.project.timeline || [];
    if (tl.length === 0) return;

    this.exportProgressBox.classList.remove('hidden');
    this.startStitchExportBtn.disabled = true;
    this.exportProgressText.textContent = 'Calling local FFmpeg: trimming, conforming resolution, and stitching clips...';

    try {
      const res = await fetch('/api/export-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timelineClips: tl,
          transitions: this.project.timelineTransitions || [],
          projectName: this.project.name,
          targetResolution: this.exportResSelect.value
        })
      });
      const data = await res.json();

      if (data.success && data.export) {
        this.exportProgressText.textContent = 'Rendering complete!';
        this.exportProgressBox.classList.add('hidden');
        this.exportResultCard.classList.remove('hidden');
        this.exportModalFooter.classList.add('hidden');

        this.exportPreviewPlayer.src = data.export.url;
        this.exportDownloadLink.href = data.export.url;
        this.exportDownloadLink.download = `${this.project.name.toLowerCase().replace(/\s+/g, '_')}_master.mp4`;

        this.project.exports = this.project.exports || [];
        this.project.exports.unshift(data.export);
        this.saveProject();
      } else {
        throw new Error(data.error || 'Failed to export video');
      }
    } catch (err) {
      alert('Video export error: ' + err.message);
      this.exportProgressBox.classList.add('hidden');
    } finally {
      this.startStitchExportBtn.disabled = false;
    }
  }

  // --- Settings Modal ---
  async openSettingsModal() {
    this.settingsModal.classList.remove('hidden');
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();

      if (this.settingsFalKey) {
        if (data.hasFalKey) {
          this.settingsFalKey.placeholder = `Active key: ${data.falApiKey || '••••••••'}`;
          if (this.falKeyStatusBadge) {
            this.falKeyStatusBadge.textContent = `✓ Key Configured (${data.falApiKey || 'Active'})`;
            this.falKeyStatusBadge.className = 'badge badge-accent';
            this.falKeyStatusBadge.classList.remove('hidden');
          }
        } else {
          this.settingsFalKey.placeholder = 'Enter FAL_KEY (e.g. fal_key_...)';
          if (this.falKeyStatusBadge) {
            this.falKeyStatusBadge.textContent = 'Key Not Set';
            this.falKeyStatusBadge.className = 'badge';
            this.falKeyStatusBadge.classList.remove('hidden');
          }
        }
      }

      if (this.settingsKlingAccessKey && data.klingAccessKey) {
        this.settingsKlingAccessKey.placeholder = data.klingAccessKey;
      }
      if (this.settingsKlingSecretKey && data.klingSecretKey) {
        this.settingsKlingSecretKey.placeholder = data.klingSecretKey;
      }
      if (this.klingKeyStatusBadge) {
        if (data.hasKlingKey) {
          this.klingKeyStatusBadge.textContent = '✓ Configured';
          this.klingKeyStatusBadge.className = 'badge badge-accent';
          this.klingKeyStatusBadge.classList.remove('hidden');
        } else {
          this.klingKeyStatusBadge.classList.add('hidden');
        }
      }

      if (this.settingsElevenLabsKey) {
        if (data.hasElevenLabsKey) {
          this.settingsElevenLabsKey.placeholder = `Active key: ${data.elevenLabsApiKey || '••••••••'}`;
          if (this.elevenLabsKeyStatusBadge) {
            this.elevenLabsKeyStatusBadge.textContent = '✓ Configured';
            this.elevenLabsKeyStatusBadge.className = 'badge badge-accent';
            this.elevenLabsKeyStatusBadge.classList.remove('hidden');
          }
        } else {
          this.settingsElevenLabsKey.placeholder = 'xi_...';
          if (this.elevenLabsKeyStatusBadge) this.elevenLabsKeyStatusBadge.classList.add('hidden');
        }
      }

      if (this.settingsRestyleModel && data.falRestyleModel) {
        this.settingsRestyleModel.value = data.falRestyleModel;
      }
      if (this.settingsAssetGenModel && data.assetGenModel) {
        this.settingsAssetGenModel.value = data.assetGenModel;
      }
      if (this.settingsHarmonizeModel && data.harmonizeModel) {
        this.settingsHarmonizeModel.value = data.harmonizeModel;
      }
      if (this.settingsFalModel && data.falModel) {
        this.settingsFalModel.value = data.falModel;
      }
      if (this.settingsVideoProvider && data.videoProvider) {
        this.settingsVideoProvider.value = data.videoProvider;
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
  }

  closeSettingsModal() {
    this.settingsModal.classList.add('hidden');
    this.settingsFeedback.classList.add('hidden');
  }

  async saveSettings() {
    const payload = {
      videoProvider: this.settingsVideoProvider?.value || 'fal',
      videoApiKey: this.settingsVideoKey ? this.settingsVideoKey.value.trim() : '',
      klingAccessKey: this.settingsKlingAccessKey ? this.settingsKlingAccessKey.value.trim() : '',
      klingSecretKey: this.settingsKlingSecretKey ? this.settingsKlingSecretKey.value.trim() : '',
      falApiKey: this.settingsFalKey ? this.settingsFalKey.value.trim() : '',
      falRestyleModel: this.settingsRestyleModel ? this.settingsRestyleModel.value : 'fal-ai/nano-banana-pro/edit',
      assetGenModel: this.settingsAssetGenModel ? this.settingsAssetGenModel.value : 'openai/gpt-image-2.5/flare/edit',
      harmonizeModel: this.settingsHarmonizeModel ? this.settingsHarmonizeModel.value : 'fal-ai/nano-banana-pro/edit',
      falModel: this.settingsFalModel ? this.settingsFalModel.value : 'fal-ai/wan-i2v',
      elevenLabsApiKey: this.settingsElevenLabsKey ? this.settingsElevenLabsKey.value.trim() : '',
      customEndpoint: this.settingsCustomEndpoint ? this.settingsCustomEndpoint.value.trim() : '',
      openaiApiKey: this.settingsOpenaiKey ? this.settingsOpenaiKey.value.trim() : '',
      geminiApiKey: this.settingsGeminiKey ? this.settingsGeminiKey.value.trim() : ''
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        this.settingsFeedback.textContent = '✓ Settings saved successfully!';
        this.settingsFeedback.className = 'feedback-msg success';
        this.settingsFeedback.classList.remove('hidden');

        // Clear password fields so raw keys don't linger in DOM
        if (this.settingsFalKey && payload.falApiKey) this.settingsFalKey.value = '';
        if (this.settingsKlingAccessKey && payload.klingAccessKey) this.settingsKlingAccessKey.value = '';
        if (this.settingsKlingSecretKey && payload.klingSecretKey) this.settingsKlingSecretKey.value = '';
        if (this.settingsElevenLabsKey && payload.elevenLabsApiKey) this.settingsElevenLabsKey.value = '';

        const settingsRes = await fetch('/api/settings');
        const settings = await settingsRes.json();
        this.applySettingsUI(settings);
        this.checkFalCredits();

        setTimeout(() => this.closeSettingsModal(), 1200);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      this.settingsFeedback.textContent = 'Failed to save settings: ' + err.message;
      this.settingsFeedback.className = 'feedback-msg error';
      this.settingsFeedback.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // Reference Construction Workspace & Asset Consistency Methods
  // ==========================================================================
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getAllProjectReferences() {
    const refs = this.project?.references || { characters: [], props: [], places: [] };
    return [
      ...(refs.characters || []),
      ...(refs.props || []),
      ...(refs.places || [])
    ];
  }

  initReferencesGroupTabs() {
    this.refGroupTabs = document.querySelectorAll('.ref-group-tab');
    this.refGroupTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.dataset.target || 'all';
        this.scrollToRefGroup(target);
      });
    });
  }

  scrollToRefGroup(target) {
    if (!this.workspaceReferences) return;
    this.isProgrammaticScrolling = true;
    this.setActiveRefTab(target);

    if (target === 'all') {
      this.workspaceReferences.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => { this.isProgrammaticScrolling = false; }, 600);
      return;
    }

    const groupEl = document.getElementById(`ref-group-${target}`);
    if (groupEl) {
      const containerRect = this.workspaceReferences.getBoundingClientRect();
      const groupRect = groupEl.getBoundingClientRect();
      const stickyNav = document.getElementById('ref-sticky-tab-bar');
      const stickyHeight = stickyNav ? stickyNav.offsetHeight : 60;
      const targetScrollTop = this.workspaceReferences.scrollTop + (groupRect.top - containerRect.top) - stickyHeight - 12;

      this.workspaceReferences.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    }
    setTimeout(() => { this.isProgrammaticScrolling = false; }, 600);
  }

  setActiveRefTab(target) {
    const tabs = document.querySelectorAll('.ref-group-tab');
    tabs.forEach(tab => {
      if (tab.dataset.target === target) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  initReferencesScrollSpy() {
    if (!this.workspaceReferences) return;
    let scrollTicking = false;
    this.workspaceReferences.addEventListener('scroll', () => {
      if (this.isProgrammaticScrolling) return;
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          this.updateActiveRefGroupTabOnScroll();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  updateActiveRefGroupTabOnScroll() {
    if (!this.workspaceReferences) return;
    const scrollContainer = this.workspaceReferences;
    const containerTop = scrollContainer.getBoundingClientRect().top;

    if (scrollContainer.scrollTop < 120) {
      this.setActiveRefTab('all');
      return;
    }

    const groups = ['characters', 'props', 'places'];
    let currentGroup = 'all';

    for (const cat of groups) {
      const el = document.getElementById(`ref-group-${cat}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top - containerTop <= 180) {
          currentGroup = cat;
        }
      }
    }
    this.setActiveRefTab(currentGroup);
  }

  updateReferenceCounts() {
    const refs = this.project?.references || { characters: [], props: [], places: [] };
    const charCount = (refs.characters || []).length;
    const propCount = (refs.props || []).length;
    const placeCount = (refs.places || []).length;
    const totalCount = charCount + propCount + placeCount;

    if (this.referencesCountBadge) {
      this.referencesCountBadge.textContent = `${totalCount} Asset${totalCount === 1 ? '' : 's'}`;
    }
    if (this.countAllRefs) this.countAllRefs.textContent = totalCount;
    if (this.countCharRefs) this.countCharRefs.textContent = charCount;
    if (this.countPropRefs) this.countPropRefs.textContent = propCount;
    if (this.countPlaceRefs) this.countPlaceRefs.textContent = placeCount;

    const groupCountChar = document.getElementById('group-count-characters');
    if (groupCountChar) groupCountChar.textContent = `${charCount} Asset${charCount === 1 ? '' : 's'}`;
    const groupCountProp = document.getElementById('group-count-props');
    if (groupCountProp) groupCountProp.textContent = `${propCount} Asset${propCount === 1 ? '' : 's'}`;
    const groupCountPlace = document.getElementById('group-count-places');
    if (groupCountPlace) groupCountPlace.textContent = `${placeCount} Asset${placeCount === 1 ? '' : 's'}`;
  }

  renderReferences() {
    this.updateReferenceCounts();
    const container = document.getElementById('ref-groups-container') || this.referencesGrid;
    if (!container) return;

    const refs = this.project?.references || { characters: [], props: [], places: [] };
    const charList = refs.characters || [];
    const propList = refs.props || [];
    const placeList = refs.places || [];

    const groupConfigs = [
      {
        id: 'characters',
        title: 'Characters',
        subtitle: 'Protagonists, antagonists, NPCs, and character variations',
        icon: '👤',
        items: charList,
        addLabel: '➕ Add Character',
        emptyTitle: 'No Characters Defined',
        emptyDesc: 'Upload a character reference image and describe distinctive costumes, armor, facial features, or hairstyles to maintain visual continuity.'
      },
      {
        id: 'props',
        title: 'Props & Vehicles',
        subtitle: 'Weapons, capital ships, landing craft, vehicles, and key technology',
        icon: '📦',
        items: propList,
        addLabel: '➕ Add Prop / Vehicle',
        emptyTitle: 'No Props or Vehicles Defined',
        emptyDesc: 'Upload reference images of ships, blasters, gadgets, or vehicles with color accents and hull markings.'
      },
      {
        id: 'places',
        title: 'Places & Environments',
        subtitle: 'Planetary surfaces, low orbits, space vistas, and architecture',
        icon: '📍',
        items: placeList,
        addLabel: '➕ Add Place / Environment',
        emptyTitle: 'No Places or Environments Defined',
        emptyDesc: 'Define key world-building locales, terrain textures, gas giant rings, and atmospheric palettes.'
      }
    ];

    container.innerHTML = groupConfigs.map(grp => `
      <div class="ref-content-group ref-group-${grp.id}" id="ref-group-${grp.id}" data-category="${grp.id}">
        <div class="ref-group-header">
          <div class="ref-group-header-left">
            <span class="ref-group-badge-icon">${grp.icon}</span>
            <div class="ref-group-heading-text">
              <h3 class="ref-group-title">${grp.title}</h3>
              <span class="ref-group-subtitle">${grp.subtitle}</span>
            </div>
            <span class="ref-group-count-badge" id="group-count-${grp.id}">${grp.items.length} Asset${grp.items.length === 1 ? '' : 's'}</span>
          </div>
          <div class="ref-group-header-right">
            <button class="btn btn-secondary btn-xs btn-add-category-asset" data-category="${grp.id}">
              ${grp.addLabel}
            </button>
          </div>
        </div>

        <div class="references-grid" id="ref-grid-${grp.id}">
          ${grp.items.length > 0 ? grp.items.map(item => this.renderReferenceCardHtml(item)).join('') : `
            <div class="ref-empty-group-card">
              <div class="empty-left">
                <span class="empty-icon">${grp.icon}</span>
                <div class="empty-text">
                  <h4>${grp.emptyTitle}</h4>
                  <p>${grp.emptyDesc}</p>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm btn-add-category-asset" data-category="${grp.id}">
                ${grp.addLabel}
              </button>
            </div>
          `}
        </div>
      </div>
    `).join('');

    // Attach card action listeners across all groups
    container.querySelectorAll('.btn-edit-ref').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const refId = btn.dataset.refId;
        const ref = this.getAllProjectReferences().find(r => r.id === refId);
        if (ref) this.openEditReferenceModal(ref);
      });
    });

    container.querySelectorAll('[data-action="delete-ref"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const refId = btn.dataset.refId;
        this.deleteReference(refId);
      });
    });

    container.querySelectorAll('.btn-add-category-asset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cat = btn.dataset.category || 'characters';
        this.openCreateReferenceModal(cat);
      });
    });

    this.initReferencesGroupTabs();
  }

  renderReferenceCardHtml(ref) {
    const catEmoji = { characters: '👤 Character', props: '📦 Prop', places: '📍 Place' };
    return `
      <div class="reference-card" data-ref-id="${ref.id}">
        <div class="ref-card-thumb-wrap">
          ${ref.imageUrl ? `
            <img src="${ref.imageUrl}" alt="${this.escapeHtml(ref.name)}" loading="lazy">
          ` : `
            <div class="ref-card-thumb-placeholder">
              <span style="font-size: 2.2rem;">${ref.category === 'characters' ? '👤' : (ref.category === 'props' ? '📦' : '📍')}</span>
              <span style="font-size: 0.72rem;">No Image Loaded</span>
            </div>
          `}
          <span class="ref-cat-pill ref-cat-${ref.category}">${catEmoji[ref.category] || ref.category}</span>
        </div>

        <div class="ref-card-body">
          <div class="ref-card-title-row">
            <h3 class="ref-card-title">${this.escapeHtml(ref.name)}</h3>
            <span class="ref-card-tag">${this.escapeHtml(ref.tag || '@' + ref.name.replace(/\s+/g, ''))}</span>
          </div>
          ${ref.colorKey ? `
            <div style="margin: 3px 0 6px 0;">
              <span class="badge" style="background:${ref.colorKey}22; border:1px solid ${ref.colorKey}; color:${ref.colorKey}; font-family:var(--font-mono); font-size:0.68rem; padding:2px 8px; border-radius:4px; display:inline-flex; align-items:center; gap:5px;" title="Spatial Previs Color Key">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${ref.colorKey}; box-shadow:0 0 6px ${ref.colorKey};"></span>
                <span>Previs Key: ${ref.colorKey}</span>
              </span>
            </div>
          ` : ''}

          <div class="ref-card-desc">
            ${ref.description ? this.escapeHtml(ref.description) : '<em style="color:var(--text-dim);">No consistency description provided. Click edit to describe physical characteristics.</em>'}
          </div>

          <div class="ref-card-footer">
            <div style="display:flex; gap:6px;">
              <button class="btn-xs btn-secondary btn-edit-ref" data-ref-id="${ref.id}">
                ✏️ Edit
              </button>
              <button class="btn-xs btn-secondary" style="color:var(--accent-rose);" data-action="delete-ref" data-ref-id="${ref.id}" title="Delete asset">
                🗑️
              </button>
            </div>
            <span style="font-size:0.65rem; color:var(--text-dim); font-family:var(--font-mono);">
              ${ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  renderShotReferenceChips(shot) {
    const allRefs = this.getAllProjectReferences();
    const assignedIds = shot.assignedReferences || [];
    if (!assignedIds || assignedIds.length === 0) {
      return '<span class="shot-ref-empty">No canonical references assigned (type @ to tag)</span>';
    }

    const catEmoji = { characters: '👤', props: '📦', places: '📍' };
    return assignedIds.map(id => {
      const ref = allRefs.find(r => r.id === id);
      if (!ref) return '';
      return `
        <span class="shot-ref-chip chip-${ref.category}" title="${this.escapeHtml(ref.description || ref.name)}">
          <span>${catEmoji[ref.category] || ''}</span>
          <span>${this.escapeHtml(ref.name)}</span>
          <button class="btn-unassign-ref" data-ref-id="${ref.id}" title="Remove reference from shot" style="background:none; border:none; color:inherit; cursor:pointer; padding:0 2px; font-size:0.75rem; margin-left:2px;">✕</button>
        </span>
      `;
    }).join('');
  }

  updateRefCategoryFields() {
    const cat = document.querySelector('input[name="ref-category"]:checked')?.value || 'characters';
    if (this.refCharacterFields) {
      this.refCharacterFields.classList.toggle('hidden', cat !== 'characters');
    }
    if (this.refPlaceFields) {
      this.refPlaceFields.classList.toggle('hidden', cat !== 'places');
    }
  }

  syncRefColorKeyUI(color) {
    const val = (color || '').trim().toUpperCase();
    if (this.refColorKeyInput) this.refColorKeyInput.value = val;
    if (this.refColorPicker && /^#[0-9A-F]{6}$/i.test(val)) {
      this.refColorPicker.value = val;
    }
    if (this.refColorPreviewDot && this.refColorPreviewText) {
      if (val) {
        this.refColorPreviewDot.style.background = val;
        this.refColorPreviewDot.style.borderColor = 'transparent';
        this.refColorPreviewText.textContent = val;
        this.refColorPreviewText.style.color = 'var(--text-main)';
      } else {
        this.refColorPreviewDot.style.background = 'transparent';
        this.refColorPreviewDot.style.borderColor = 'rgba(255,255,255,0.3)';
        this.refColorPreviewText.textContent = 'None';
        this.refColorPreviewText.style.color = 'var(--text-dim)';
      }
    }
  }

  openCreateReferenceModal(category = 'characters') {
    this.refEditId.value = '';
    const catTitles = { characters: 'Character', props: 'Prop / Vehicle', places: 'Place / Environment' };
    this.refModalTitle.textContent = `New ${catTitles[category] || 'Reference Asset'}`;
    this.refNameInput.value = '';
    this.refTagInput.value = '';
    this.refDescInput.value = '';
    this.syncRefColorKeyUI('');
    if (this.refWardrobeInput) this.refWardrobeInput.value = '';
    if (this.refHairInput) this.refHairInput.value = '';
    if (this.refArchitectureInput) this.refArchitectureInput.value = '';
    if (this.refAtmosphereInput) this.refAtmosphereInput.value = '';
    this.refSelectedFile = null;
    this.refImageFileInput.value = '';
    this.refDropzoneEmpty.classList.remove('hidden');
    this.refDropzonePreview.classList.add('hidden');
    this.refPreviewImg.src = '';
    const catRadio = document.querySelector(`input[name="ref-category"][value="${category}"]`);
    if (catRadio) catRadio.checked = true;
    this.updateRefCategoryFields();
    this.referenceAssetModal.classList.remove('hidden');
  }

  openEditReferenceModal(ref) {
    this.refEditId.value = ref.id;
    this.refModalTitle.textContent = `Edit Reference: ${ref.name}`;
    this.refNameInput.value = ref.name || '';
    this.refTagInput.value = ref.tag || '';
    this.refDescInput.value = ref.description || '';
    this.syncRefColorKeyUI(ref.colorKey || '');
    if (this.refWardrobeInput) this.refWardrobeInput.value = ref.wardrobe || '';
    if (this.refHairInput) this.refHairInput.value = ref.hair || '';
    if (this.refArchitectureInput) this.refArchitectureInput.value = ref.architecture || '';
    if (this.refAtmosphereInput) this.refAtmosphereInput.value = ref.atmosphere || '';
    this.refSelectedFile = null;
    this.refImageFileInput.value = '';

    const catRadio = document.querySelector(`input[name="ref-category"][value="${ref.category}"]`);
    if (catRadio) catRadio.checked = true;
    this.updateRefCategoryFields();

    if (ref.imageUrl) {
      this.refPreviewImg.src = ref.imageUrl;
      this.refDropzoneEmpty.classList.add('hidden');
      this.refDropzonePreview.classList.remove('hidden');
    } else {
      this.refDropzoneEmpty.classList.remove('hidden');
      this.refDropzonePreview.classList.add('hidden');
      this.refPreviewImg.src = '';
    }

    this.referenceAssetModal.classList.remove('hidden');
  }

  closeReferenceModal() {
    this.referenceAssetModal.classList.add('hidden');
    this.refSelectedFile = null;
    this.refImageFileInput.value = '';
  }

  handleReferenceImageSelected(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    this.refSelectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.refPreviewImg.src = e.target.result;
      this.refDropzoneEmpty.classList.add('hidden');
      this.refDropzonePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }

  async saveReferenceAsset() {
    const editId = this.refEditId.value;
    const name = this.refNameInput.value.trim();
    if (!name) {
      alert('Please enter an asset name.');
      this.refNameInput.focus();
      return;
    }

    const cat = document.querySelector('input[name="ref-category"]:checked')?.value || 'characters';
    const tag = this.refTagInput.value.trim() || `@${name.replace(/\s+/g, '')}`;
    const description = this.refDescInput.value.trim();
    const colorKey = this.refColorKeyInput?.value.trim() || '';
    const wardrobe = this.refWardrobeInput?.value.trim() || '';
    const hair = this.refHairInput?.value.trim() || '';
    const architecture = this.refArchitectureInput?.value.trim() || '';
    const atmosphere = this.refAtmosphereInput?.value.trim() || '';

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', cat);
    formData.append('tag', tag);
    formData.append('description', description);
    formData.append('colorKey', colorKey);
    formData.append('wardrobe', wardrobe);
    formData.append('hair', hair);
    formData.append('architecture', architecture);
    formData.append('atmosphere', atmosphere);
    if (this.refSelectedFile) {
      formData.append('image', this.refSelectedFile);
    }

    this.saveRefBtn.disabled = true;
    this.saveRefBtn.innerHTML = `<span class="btn-spinner"></span> Saving...`;

    try {
      const url = editId ? `/api/references/${editId}` : '/api/references';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (data.success) {
        this.project.references = data.references;
        this.closeReferenceModal();
        this.renderReferences(this.activeRefCategory || 'all');
        this.renderStoryboard();
      } else {
        throw new Error(data.error || 'Failed to save reference asset');
      }
    } catch (err) {
      alert('Error saving reference asset: ' + err.message);
    } finally {
      this.saveRefBtn.disabled = false;
      this.saveRefBtn.innerHTML = `Save Reference Asset`;
    }
  }

  async deleteReference(refId) {
    const allRefs = this.getAllProjectReferences();
    const target = allRefs.find(r => r.id === refId);
    const assetName = target?.name || 'this asset';

    if (!confirm(`Are you sure you want to delete "${assetName}"? It will also be unassigned from any storyboard shots.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/references/${refId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        this.project.references = data.references;
        // Clean from local storyboard in memory
        (this.project.storyboard || []).forEach(shot => {
          if (Array.isArray(shot.assignedReferences)) {
            shot.assignedReferences = shot.assignedReferences.filter(id => id !== refId);
          }
        });
        this.renderReferences(this.activeRefCategory || 'all');
        this.renderStoryboard();
      } else {
        throw new Error(data.error || 'Failed to delete asset');
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  }

  openAssignReferencesModal(shotId) {
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;
    this.activeAssigningShotId = shotId;
    this.assignModalTitle.textContent = `Assign Reference Assets to Shot #${shot.shotNumber || ''}`;

    const allRefs = this.getAllProjectReferences();
    const assignedIds = new Set(shot.assignedReferences || []);

    if (allRefs.length === 0) {
      this.assignRefsChecklist.innerHTML = `
        <div style="text-align:center; padding: 24px; color: var(--text-dim); background: rgba(0,0,0,0.2); border-radius: var(--radius-sm);">
          <span style="font-size:1.8rem; display:block; margin-bottom:8px;">🎨</span>
          <p style="margin-bottom:10px; font-size:0.85rem; color:var(--text-main);">No reference assets created yet.</p>
          <p style="font-size:0.75rem; margin-bottom:14px; color:var(--text-muted);">Create Characters, Props, or Places in the Reference Construction Workspace first.</p>
          <button class="btn btn-secondary btn-sm" id="btn-quick-create-ref">
            ➕ Go to Reference Construction Workspace
          </button>
        </div>
      `;
      document.getElementById('btn-quick-create-ref')?.addEventListener('click', () => {
        this.closeAssignModal();
        this.switchWorkspace('references');
      });
    } else {
      const catEmoji = { characters: '👤', props: '📦', places: '📍' };
      this.assignRefsChecklist.innerHTML = allRefs.map(ref => `
        <label class="assign-ref-item" data-ref-id="${ref.id}">
          <input type="checkbox" value="${ref.id}" ${assignedIds.has(ref.id) ? 'checked' : ''}>
          ${ref.imageUrl ? `
            <img class="assign-ref-thumb" src="${ref.imageUrl}" alt="${this.escapeHtml(ref.name)}">
          ` : `
            <div class="assign-ref-thumb" style="display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
              ${catEmoji[ref.category] || '🎨'}
            </div>
          `}
          <div class="assign-ref-info">
            <span class="assign-ref-name">
              <span>${catEmoji[ref.category] || ''}</span>
              <span>${this.escapeHtml(ref.name)}</span>
              <span style="font-size:0.7rem; color:var(--accent-cyan); font-family:var(--font-mono);">${this.escapeHtml(ref.tag || '')}</span>
            </span>
            <span class="assign-ref-desc">${this.escapeHtml(ref.description || 'No consistency description')}</span>
          </div>
        </label>
      `).join('');
    }

    this.assignReferencesModal.classList.remove('hidden');
  }

  closeAssignModal() {
    this.assignReferencesModal.classList.add('hidden');
    this.activeAssigningShotId = null;
  }

  async saveShotReferenceAssignments() {
    if (!this.activeAssigningShotId) return;
    const shot = (this.project.storyboard || []).find(s => s.id === this.activeAssigningShotId);
    if (!shot) return;

    const checkboxes = this.assignRefsChecklist.querySelectorAll('input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);

    this.saveAssignRefsBtn.disabled = true;
    this.saveAssignRefsBtn.innerHTML = `<span class="btn-spinner"></span> Saving...`;

    try {
      const res = await fetch(`/api/storyboard/${shot.id}/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceIds: selectedIds })
      });
      const data = await res.json();
      if (data.success && data.shot) {
        shot.assignedReferences = data.shot.assignedReferences;
        this.closeAssignModal();
        this.renderStoryboard();
      } else {
        throw new Error(data.error || 'Failed to save assignments');
      }
    } catch (err) {
      alert('Assign error: ' + err.message);
    } finally {
      this.saveAssignRefsBtn.disabled = false;
      this.saveAssignRefsBtn.innerHTML = `Apply to Shot`;
    }
  }

  // --- Timeline Transition Engine ---
  openTransitionModal(index, trans) {
    this.activeTransitionIndex = index;
    const current = trans || { type: 'dissolve', duration: 0.8 };
    if (this.transTypeSelect) this.transTypeSelect.value = current.type || 'dissolve';
    if (this.transDurationInput) this.transDurationInput.value = current.duration !== undefined ? current.duration : 0.8;
    document.getElementById('trans-duration-group')?.classList.toggle('hidden', current.type === 'cut');
    this.transitionModal?.classList.remove('hidden');
  }

  closeTransitionModal() {
    this.transitionModal?.classList.add('hidden');
    this.activeTransitionIndex = null;
  }

  saveTransition() {
    if (this.activeTransitionIndex === null) return;
    this.project.timelineTransitions = this.project.timelineTransitions || [];
    const type = this.transTypeSelect ? this.transTypeSelect.value : 'dissolve';
    const duration = type === 'cut' ? 0 : (parseFloat(this.transDurationInput?.value) || 0.8);

    this.project.timelineTransitions[this.activeTransitionIndex] = { type, duration };
    this.closeTransitionModal();
    this.renderTimeline();
    this.saveProject();
  }

  getTransitionIcon(type) {
    const icons = {
      cut: '✂️',
      dissolve: '🔀',
      crossfade: '🔀',
      fadeblack: '🌓',
      fadewhite: '☀️',
      wipeleft: '⬅️',
      wiperight: '➡️',
      circleopen: '⭕'
    };
    return icons[type] || '🔀';
  }

  getTransitionLabel(type) {
    const labels = {
      cut: 'Cut',
      dissolve: 'Dissolve',
      crossfade: 'Dissolve',
      fadeblack: 'Fade Black',
      fadewhite: 'Fade White',
      wipeleft: 'Wipe Left',
      wiperight: 'Wipe Right',
      circleopen: 'Circle'
    };
    return labels[type] || 'Dissolve';
  }

  // --- Floating @mention Autocomplete Engine ---
  setupMentionAutocomplete(textarea, shot) {
    textarea.addEventListener('input', () => this.handleMentionInput(textarea, shot));
    textarea.addEventListener('keydown', (e) => this.handleMentionKeydown(e, textarea, shot));
  }

  handleMentionInput(textarea, shot) {
    const cursor = textarea.selectionStart;
    const textBefore = textarea.value.slice(0, cursor);
    const lastAt = textBefore.lastIndexOf('@');

    if (lastAt !== -1) {
      const query = textBefore.slice(lastAt + 1);
      // Ensure no spaces or newlines in the query
      if (!/\s/.test(query)) {
        const allRefs = this.getAllProjectReferences();
        const matches = allRefs.filter(r => 
          r.name.toLowerCase().includes(query.toLowerCase()) || 
          (r.tag && r.tag.toLowerCase().includes(query.toLowerCase()))
        );

        if (matches.length > 0) {
          this.showMentionDropdown(textarea, shot, lastAt, cursor, matches);
          return;
        }
      }
    }
    this.hideMentionDropdown();
  }

  handleMentionKeydown(e, textarea, shot) {
    if (!this.activeMentionState || this.atMentionDropdown.classList.contains('hidden')) {
      return;
    }

    const items = this.atMentionDropdown.querySelectorAll('.at-mention-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeMentionMatchIndex = (this.activeMentionMatchIndex + 1) % items.length;
      this.updateActiveMentionItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeMentionMatchIndex = (this.activeMentionMatchIndex - 1 + items.length) % items.length;
      this.updateActiveMentionItem();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const selectedRef = this.activeMentionState.matches[this.activeMentionMatchIndex];
      if (selectedRef) {
        this.selectMention(selectedRef);
      }
    } else if (e.key === 'Escape') {
      this.hideMentionDropdown();
    }
  }

  updateActiveMentionItem() {
    const items = this.atMentionDropdown.querySelectorAll('.at-mention-item');
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === this.activeMentionMatchIndex);
    });
  }

  showMentionDropdown(textarea, shot, lastAt, cursor, matches) {
    const rect = textarea.getBoundingClientRect();
    this.atMentionDropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
    this.atMentionDropdown.style.left = `${rect.left + window.scrollX}px`;

    const catEmoji = { characters: '👤', props: '📦', places: '📍' };
    this.atMentionDropdown.innerHTML = matches.map((ref, idx) => `
      <div class="at-mention-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
        ${ref.imageUrl ? `
          <img src="${ref.imageUrl}" class="at-mention-avatar" alt="${this.escapeHtml(ref.name)}">
        ` : `
          <div class="at-mention-avatar">${catEmoji[ref.category] || '🎨'}</div>
        `}
        <div class="at-mention-meta">
          <span class="at-mention-name">
            <span>${catEmoji[ref.category] || ''}</span>
            <span>${this.escapeHtml(ref.name)}</span>
            <span style="font-size:0.65rem; color:var(--text-dim); text-transform:capitalize;">(${ref.category})</span>
          </span>
          <span class="at-mention-tag">${this.escapeHtml(ref.tag || '@' + ref.name.replace(/\s+/g, ''))}</span>
        </div>
      </div>
    `).join('');

    this.activeMentionState = { textarea, shot, lastAt, cursor, matches };
    this.activeMentionMatchIndex = 0;
    this.activeMentionTextarea = textarea;

    this.atMentionDropdown.querySelectorAll('.at-mention-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx, 10);
        const ref = matches[idx];
        if (ref) this.selectMention(ref);
      });
    });

    this.atMentionDropdown.classList.remove('hidden');
  }

  hideMentionDropdown() {
    if (this.atMentionDropdown) {
      this.atMentionDropdown.classList.add('hidden');
    }
    this.activeMentionState = null;
    this.activeMentionTextarea = null;
  }

  selectMention(ref) {
    if (!this.activeMentionState) return;
    const { textarea, shot, lastAt } = this.activeMentionState;
    const cursor = textarea.selectionStart;

    const before = textarea.value.slice(0, lastAt);
    const after = textarea.value.slice(cursor);
    const tagToInsert = (ref.tag || `@${ref.name.replace(/\s+/g, '')}`) + ' ';

    textarea.value = before + tagToInsert + after;
    shot.description = textarea.value;

    shot.assignedReferences = shot.assignedReferences || [];
    if (!shot.assignedReferences.includes(ref.id)) {
      shot.assignedReferences.push(ref.id);
    }

    this.hideMentionDropdown();
    this.saveProject();
    this.renderStoryboard();

    // Re-focus and set cursor position after inserted tag
    const newCursor = lastAt + tagToInsert.length;
    setTimeout(() => {
      const updatedCard = document.querySelector(`.storyboard-shot-card[data-id="${shot.id}"]`);
      if (updatedCard) {
        const updatedTextarea = updatedCard.querySelector('.shot-desc-input');
        if (updatedTextarea) {
          updatedTextarea.focus();
          updatedTextarea.setSelectionRange(newCursor, newCursor);
        }
      }
    }, 50);
  }

  // --- Spatial Continuity Ledger System ---
  renderShotSpatialChips(shot) {
    const s = shot.spatialContinuity || {};
    const chips = [];

    // Motion Vector / Action
    if (s.motionVector) {
      chips.push(`<span class="spatial-chip motion" title="Subject Motion Vector & Action">🏃‍♂️ ${this.escapeHtml(s.motionVector)}</span>`);
    }

    // Camera Trajectory
    const camMotion = s.cameraTrajectory || shot.cameraMotion;
    if (camMotion) {
      chips.push(`<span class="spatial-chip camera" title="Camera Tracking Trajectory">🎥 ${this.escapeHtml(camMotion)}</span>`);
    }

    // Subject Position
    chips.push(`<span class="spatial-chip" title="Subject Screen Position">📍 ${this.escapeHtml(s.subjectScreenPosition || 'Center')}</span>`);

    // Facing & Eyeline
    const facingStr = s.facingDirection ? `${this.escapeHtml(s.facingDirection)} · ` : '';
    chips.push(`<span class="spatial-chip eyeline" title="Eyeline Direction & Facing">🧭 ${facingStr}${this.escapeHtml(s.eyelineMatch || 'Direct')}</span>`);

    // Framing & Optics
    chips.push(`<span class="spatial-chip optics" title="Camera Optics & Framing">📐 ${this.escapeHtml(s.cameraAngle || 'Medium 50mm')}</span>`);

    // Lighting Origin
    if (s.lightingOrigin) {
      chips.push(`<span class="spatial-chip light" title="Key Light Vector">💡 ${this.escapeHtml(s.lightingOrigin)}</span>`);
    }

    return chips.join('\n');
  }

  openSpatialModal(shotId) {
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;
    this.activeSpatialShotId = shotId;
    const s = shot.spatialContinuity || {};

    if (!this.modalSpatialContinuity) this.modalSpatialContinuity = document.getElementById('modal-spatial-continuity');
    if (!this.spatialModalTitle) this.spatialModalTitle = document.getElementById('spatial-modal-title');
    if (!this.spatialModalSubtitle) this.spatialModalSubtitle = document.getElementById('spatial-modal-subtitle');
    if (!this.spatialMotionVectorInput) this.spatialMotionVectorInput = document.getElementById('spatial-motion-vector-input');
    if (!this.spatialCameraTrajSelect) this.spatialCameraTrajSelect = document.getElementById('spatial-camera-traj-select');
    if (!this.spatialPosSelect) this.spatialPosSelect = document.getElementById('spatial-pos-select');
    if (!this.spatialFacingSelect) this.spatialFacingSelect = document.getElementById('spatial-facing-select');
    if (!this.spatialEyelineInput) this.spatialEyelineInput = document.getElementById('spatial-eyeline-input');
    if (!this.spatialAngleInput) this.spatialAngleInput = document.getElementById('spatial-angle-input');
    if (!this.spatialLightingInput) this.spatialLightingInput = document.getElementById('spatial-lighting-input');
    if (!this.spatialAxisInput) this.spatialAxisInput = document.getElementById('spatial-axis-input');

    if (this.spatialModalTitle) {
      this.spatialModalTitle.textContent = `Spatial Continuity — Shot #${shot.shotNumber || ''}`;
    }
    if (this.spatialModalSubtitle) {
      this.spatialModalSubtitle.textContent = `Configure motion vectors, 180° rule, and camera tracking for "${shot.title || 'Shot'}"`;
    }

    if (this.spatialMotionVectorInput) this.spatialMotionVectorInput.value = s.motionVector || '';
    if (this.spatialCameraTrajSelect) this.spatialCameraTrajSelect.value = s.cameraTrajectory || shot.cameraMotion || 'Dolly Forward';
    if (this.spatialPosSelect) this.spatialPosSelect.value = s.subjectScreenPosition || 'Center';
    if (this.spatialFacingSelect) this.spatialFacingSelect.value = s.facingDirection || '3/4 Profile Right';
    if (this.spatialEyelineInput) this.spatialEyelineInput.value = s.eyelineMatch || 'Looking Screen-Right';
    if (this.spatialAngleInput) this.spatialAngleInput.value = s.cameraAngle || 'Medium 50mm';
    if (this.spatialLightingInput) this.spatialLightingInput.value = s.lightingOrigin || 'Screen-Left Key Light (5600K)';
    if (this.spatialAxisInput) this.spatialAxisInput.value = s.rule180Vector || 'Maintain Continuity Axis';

    if (this.modalSpatialContinuity) {
      this.modalSpatialContinuity.classList.remove('hidden');
    }
  }

  closeSpatialModal() {
    if (!this.modalSpatialContinuity) this.modalSpatialContinuity = document.getElementById('modal-spatial-continuity');
    this.modalSpatialContinuity?.classList.add('hidden');
    this.activeSpatialShotId = null;
  }

  async saveSpatialModal() {
    if (!this.activeSpatialShotId) return;
    const shot = (this.project.storyboard || []).find(s => s.id === this.activeSpatialShotId);
    if (!shot) return;

    const spatialContinuity = {
      motionVector: this.spatialMotionVectorInput?.value.trim() || '',
      cameraTrajectory: this.spatialCameraTrajSelect?.value || 'Dolly Forward',
      subjectScreenPosition: this.spatialPosSelect?.value || 'Center',
      facingDirection: this.spatialFacingSelect?.value || '3/4 Profile Right',
      eyelineMatch: this.spatialEyelineInput?.value.trim() || 'Direct to Lens',
      cameraAngle: this.spatialAngleInput?.value.trim() || 'Medium 50mm',
      lightingOrigin: this.spatialLightingInput?.value.trim() || 'Balanced Key Light (5600K)',
      rule180Vector: this.spatialAxisInput?.value.trim() || 'Maintain Continuity Axis'
    };

    // Keep shot.cameraMotion synchronized with cameraTrajectory
    if (spatialContinuity.cameraTrajectory) {
      shot.cameraMotion = spatialContinuity.cameraTrajectory;
    }

    if (!this.saveSpatialModalBtn) this.saveSpatialModalBtn = document.getElementById('save-spatial-modal-btn');
    if (this.saveSpatialModalBtn) {
      this.saveSpatialModalBtn.disabled = true;
      this.saveSpatialModalBtn.innerHTML = `<span class="btn-spinner"></span> Saving...`;
    }

    try {
      const res = await fetch(`/api/storyboard/${shot.id}/spatial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spatialContinuity })
      });
      const data = await res.json();
      if (data.success && data.shot) {
        Object.assign(shot, data.shot);
        this.renderStoryboard();
        this.saveProject();
        this.closeSpatialModal();
      } else {
        throw new Error(data.error || 'Failed to save spatial continuity');
      }
    } catch (err) {
      alert('Error saving spatial continuity: ' + err.message);
    } finally {
      if (this.saveSpatialModalBtn) {
        this.saveSpatialModalBtn.disabled = false;
        this.saveSpatialModalBtn.innerHTML = `Save Spatial Ledger`;
      }
    }
  }

  // --- ElevenLabs Cinematic Audio Studio Methods ---
  async openAudioModal(shotId) {
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;
    this.activeAudioShotId = shotId;

    if (this.audioModalTitle) {
      this.audioModalTitle.textContent = `Cinematic Audio Studio — Shot #${shot.shotNumber || ''}`;
    }
    if (this.audioModalSubtitle) {
      this.audioModalSubtitle.textContent = `Generate Sound Effects & Character Dialogue for "${shot.title || 'Shot'}"`;
    }

    if (this.audioSfxPrompt) {
      this.audioSfxPrompt.value = shot.description || '';
    }

    if (this.audioFeedbackMsg) {
      this.audioFeedbackMsg.classList.add('hidden');
    }

    this.renderAudioTracksList(shot);
    this.modalAudioEngine?.classList.remove('hidden');

    // Fetch latest voices dynamically
    this.loadAudioVoices();
  }

  closeAudioModal() {
    this.modalAudioEngine?.classList.add('hidden');
    this.activeAudioShotId = null;
  }

  async loadAudioVoices() {
    try {
      const res = await fetch('/api/audio/voices');
      const data = await res.json();
      if (data.success && data.voices && this.audioVoiceSelect) {
        const curVal = this.audioVoiceSelect.value;
        this.audioVoiceSelect.innerHTML = data.voices.map(v => `
          <option value="${v.voice_id}" ${v.voice_id === curVal ? 'selected' : ''}>${this.escapeHtml(v.name)}</option>
        `).join('');
      }
    } catch (e) {}
  }

  renderAudioTracksList(shot) {
    if (!this.audioTracksList) return;
    const tracks = shot.audioTracks || [];
    if (tracks.length === 0) {
      this.audioTracksList.innerHTML = `<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">No audio tracks attached yet.</div>`;
      return;
    }

    this.audioTracksList.innerHTML = tracks.map((t, idx) => `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; background:rgba(0,0,0,0.3); padding:6px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${t.type === 'dialogue' ? '🎙️' : '💥'}</span>
          <div style="display:flex; flex-direction:column;">
            <span style="font-size:0.75rem; font-weight:600; color:var(--text-main);">${this.escapeHtml(t.type === 'dialogue' ? 'Dialogue / Voiceover' : 'Sound Effect')}</span>
            <span style="font-size:0.65rem; color:var(--text-dim); max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this.escapeHtml(t.prompt || t.text || t.filename)}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <audio controls src="${t.url}" style="height:28px; width:170px;"></audio>
          <button class="btn-xs btn-secondary btn-del-audio-stem" data-shot-id="${shot.id}" data-filename="${t.filename}" title="Remove stem" style="color:var(--accent-rose); border-color:rgba(244,63,94,0.3);">🗑️</button>
        </div>
      </div>
    `).join('');

    this.audioTracksList.querySelectorAll('.btn-del-audio-stem').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteShotAudio(btn.dataset.shotId, btn.dataset.filename);
      });
    });
  }

  async handleGenerateAudio() {
    if (!this.activeAudioShotId) return;
    const shot = (this.project.storyboard || []).find(s => s.id === this.activeAudioShotId);
    if (!shot) return;

    const mode = document.querySelector('input[name="audio-mode"]:checked')?.value || 'sfx';

    this.btnGenerateAudio.disabled = true;
    this.btnGenerateAudio.innerHTML = `<span class="btn-spinner"></span> Generating Audio...`;
    if (this.audioFeedbackMsg) this.audioFeedbackMsg.classList.add('hidden');

    try {
      let endpoint = '/api/audio/generate-sfx';
      let payload = {};

      if (mode === 'sfx') {
        const text = this.audioSfxPrompt?.value.trim();
        if (!text) throw new Error('Please enter a sound effect description.');
        payload = {
          shotId: shot.id,
          text,
          durationSeconds: parseFloat(this.audioSfxDuration?.value || '4'),
          promptInfluence: parseFloat(this.audioSfxInfluence?.value || '0.3')
        };
      } else {
        endpoint = '/api/audio/generate-voice';
        const text = this.audioDialogueText?.value.trim();
        if (!text) throw new Error('Please enter dialogue or voiceover text.');
        payload = {
          shotId: shot.id,
          text,
          voiceId: this.audioVoiceSelect?.value
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.audio) {
        shot.audioTracks = shot.audioTracks || [];
        shot.audioTracks.push(data.audio);
        this.renderAudioTracksList(shot);
        this.renderStoryboard();
        this.saveProject();

        if (this.audioFeedbackMsg) {
          this.audioFeedbackMsg.textContent = `✓ Generated & attached ${data.audio.type === 'dialogue' ? 'dialogue' : 'SFX'} track!`;
          this.audioFeedbackMsg.className = 'feedback-msg success';
          this.audioFeedbackMsg.classList.remove('hidden');
        }
      } else {
        throw new Error(data.error || 'Audio generation failed');
      }
    } catch (err) {
      if (this.audioFeedbackMsg) {
        this.audioFeedbackMsg.textContent = 'Audio Notice: ' + err.message;
        this.audioFeedbackMsg.className = 'feedback-msg error';
        this.audioFeedbackMsg.classList.remove('hidden');
      } else {
        alert('Audio Notice: ' + err.message);
      }
    } finally {
      this.btnGenerateAudio.disabled = false;
      this.btnGenerateAudio.innerHTML = `<span>🔊 Generate & Attach to Shot</span>`;
    }
  }

  async deleteShotAudio(shotId, filename) {
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;

    try {
      const res = await fetch(`/api/storyboard/${shotId}/audio/${filename}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        shot.audioTracks = data.audioTracks;
        if (this.activeAudioShotId === shotId) {
          this.renderAudioTracksList(shot);
        }
        this.renderStoryboard();
        this.saveProject();
      }
    } catch (err) {
      console.warn('Failed to delete audio stem:', err);
    }
  }

  // --- Footage Library & Manual Take Assignment Methods ---
  openFootageLibraryModal(shotId) {
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;
    this.activeFootageShotId = shotId;

    if (!this.modalFootageLibrary) this.modalFootageLibrary = document.getElementById('modal-footage-library');
    if (!this.footageModalTitle) this.footageModalTitle = document.getElementById('footage-modal-title');
    if (!this.footageModalSubtitle) this.footageModalSubtitle = document.getElementById('footage-modal-subtitle');
    if (!this.footageSearchInput) this.footageSearchInput = document.getElementById('footage-search-input');
    if (!this.footageCountLabel) this.footageCountLabel = document.getElementById('footage-count-label');
    if (!this.footageLibraryGrid) this.footageLibraryGrid = document.getElementById('footage-library-grid');
    if (!this.footageUploadSpinner) this.footageUploadSpinner = document.getElementById('footage-upload-spinner');

    if (this.footageModalTitle) {
      this.footageModalTitle.textContent = `Assign Take from Footage Library — Shot #${shot.shotNumber || ''}`;
    }
    if (this.footageModalSubtitle) {
      this.footageModalSubtitle.textContent = `Assign an existing generation from your library or upload an external video file as Take ${(shot.takes || []).length + 1} for "${shot.title || 'Shot'}"`;
    }
    if (this.footageSearchInput) this.footageSearchInput.value = '';

    this.modalFootageLibrary?.classList.remove('hidden');
    this.loadFootageLibrary();
  }

  closeFootageLibraryModal() {
    if (!this.modalFootageLibrary) this.modalFootageLibrary = document.getElementById('modal-footage-library');
    this.modalFootageLibrary?.classList.add('hidden');
    this.activeFootageShotId = null;
  }

  async loadFootageLibrary() {
    if (!this.footageLibraryGrid) this.footageLibraryGrid = document.getElementById('footage-library-grid');
    if (this.footageLibraryGrid) {
      this.footageLibraryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--text-dim); font-size:0.85rem;">
          <span class="btn-spinner"></span> Scanning storage/clips footage...
        </div>
      `;
    }

    try {
      const res = await fetch('/api/footage-library');
      const data = await res.json();
      if (data.success && data.clips) {
        this.libraryClipsCache = data.clips;
        this.renderFootageLibrary(this.libraryClipsCache);
      } else {
        throw new Error(data.error || 'Failed to load library clips');
      }
    } catch (err) {
      if (this.footageLibraryGrid) {
        this.footageLibraryGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:30px; color:var(--accent-rose); font-size:0.85rem;">
            Failed to load footage library: ${this.escapeHtml(err.message)}
          </div>
        `;
      }
    }
  }

  filterFootageLibraryGrid(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this.renderFootageLibrary(this.libraryClipsCache);
      return;
    }
    const filtered = (this.libraryClipsCache || []).filter(c => {
      return (c.filename && c.filename.toLowerCase().includes(q)) ||
             (c.label && c.label.toLowerCase().includes(q)) ||
             (c.providerBadge && c.providerBadge.toLowerCase().includes(q)) ||
             (c.usedIn && `${c.usedIn.shotNumber} ${c.usedIn.shotTitle}`.toLowerCase().includes(q));
    });
    this.renderFootageLibrary(filtered);
  }

  renderFootageLibrary(clips) {
    if (!this.footageLibraryGrid) this.footageLibraryGrid = document.getElementById('footage-library-grid');
    if (!this.footageCountLabel) this.footageCountLabel = document.getElementById('footage-count-label');

    if (this.footageCountLabel) {
      this.footageCountLabel.textContent = `${clips.length} clip${clips.length === 1 ? '' : 's'} available`;
    }

    if (!clips || clips.length === 0) {
      if (this.footageLibraryGrid) {
        this.footageLibraryGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-dim); font-size:0.85rem;">
            No video clips found matching query. Drop or upload an MP4/MOV above!
          </div>
        `;
      }
      return;
    }

    const shot = (this.project.storyboard || []).find(s => s.id === this.activeFootageShotId);
    const nextTakeNum = (shot?.takes?.length || 0) + 1;

    this.footageLibraryGrid.innerHTML = clips.map(c => {
      const isAlreadyInActiveShot = shot && (shot.takes || []).some(t => t.clip?.filename === c.filename);
      const isCurrentTake = shot && shot.generatedClip?.filename === c.filename;
      
      let badgeClass = 'badge';
      const badgeLower = (c.providerBadge || '').toLowerCase();
      if (badgeLower.includes('seedance')) badgeClass = 'seedance';
      else if (badgeLower.includes('wan')) badgeClass = 'wan';
      else if (badgeLower.includes('kling')) badgeClass = 'kling';
      else if (badgeLower.includes('manual')) badgeClass = 'manual';

      const timeAgo = this.formatRelativeTime(c.mtimeMs);
      const sizeMB = (c.sizeBytes / (1024 * 1024)).toFixed(1);

      return `
        <div class="footage-card ${isCurrentTake ? 'is-active-in-shot' : ''}">
          <div class="footage-thumb-wrap">
            <video src="${c.url}" muted playsinline loop onmouseenter="this.play()" onmouseleave="this.pause();this.currentTime=0;"></video>
            ${isCurrentTake ? `<span class="thumb-header-badge" style="background:var(--accent-emerald); color:#fff; top:6px; left:6px;">✓ Active Take</span>` : ''}
            <span class="footage-duration-tag">${sizeMB} MB</span>
          </div>
          <div class="footage-card-meta">
            <div class="footage-card-filename" title="${this.escapeHtml(c.filename)}">${this.escapeHtml(c.filename)}</div>
            <div class="footage-card-tags">
              <span class="footage-badge ${badgeClass}">${this.escapeHtml(c.providerBadge || 'Video')}</span>
              <span style="font-size:0.62rem; color:var(--text-dim); margin-left:auto;">${timeAgo}</span>
            </div>
            ${c.usedIn ? `
              <div style="font-size:0.62rem; color:var(--text-dim); line-height:1.2;">
                ${c.usedIn.shotId === shot?.id ? `Already attached (Take ${c.usedIn.takeNumber || 1})` : `Used in Shot #${c.usedIn.shotNumber}: ${this.escapeHtml(c.usedIn.shotTitle || '')}`}
              </div>
            ` : `
              <div style="font-size:0.62rem; color:var(--accent-cyan); line-height:1.2;">
                Unassigned Library Footage
              </div>
            `}
            <button class="btn btn-xs ${isCurrentTake ? 'btn-secondary' : 'btn-primary'} btn-assign-footage-action" 
              onclick="window.studioApp?.assignFootageAsTake('${this.escapeHtml(c.filename)}', '${this.escapeHtml(c.label || 'Assigned Footage')}')">
              ${isCurrentTake ? '✓ Re-select Take' : `+ Assign as Take T${nextTakeNum}`}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  formatRelativeTime(ms) {
    if (!ms) return '';
    const diffSec = Math.floor((Date.now() - ms) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  async assignFootageAsTake(filename, modelLabel) {
    if (!this.activeFootageShotId) return;
    const shotId = this.activeFootageShotId;
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;

    try {
      const res = await fetch(`/api/storyboard/${shotId}/assign-take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, modelLabel })
      });
      const data = await res.json();
      if (data.success && data.shot) {
        Object.assign(shot, data.shot);
        this.renderStoryboard();
        this.saveProject();
        this.closeFootageLibraryModal();
      } else {
        throw new Error(data.error || 'Failed to assign footage take');
      }
    } catch (err) {
      alert('Assign Footage Error: ' + err.message);
    }
  }

  async uploadVideoAsTake(file, shotId) {
    if (!file || !shotId) return;
    const shot = (this.project.storyboard || []).find(s => s.id === shotId);
    if (!shot) return;

    if (!this.footageUploadSpinner) this.footageUploadSpinner = document.getElementById('footage-upload-spinner');
    this.footageUploadSpinner?.classList.remove('hidden');

    const formData = new FormData();
    formData.append('videoClip', file);

    try {
      const res = await fetch(`/api/storyboard/${shotId}/upload-take`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.shot) {
        Object.assign(shot, data.shot);
        this.renderStoryboard();
        this.saveProject();
        this.closeFootageLibraryModal();
      } else {
        throw new Error(data.error || 'Failed to upload video clip');
      }
    } catch (err) {
      alert('Upload Take Error: ' + err.message);
    } finally {
      this.footageUploadSpinner?.classList.add('hidden');
    }
  }

  // =========================================================================
  // LAYERED RESTYLE STUDIO (Decomposition, 4-Corner Pin Warping & AI Regen)
  // =========================================================================

  initLayerStudioElements() {
    this.layeredRestyleModal = document.getElementById('layered-restyle-modal');
    this.closeLayerModalBtn = document.getElementById('close-layer-modal-btn');
    this.layerStudioTitle = document.getElementById('layer-studio-title');
    this.layerStudioSubtitle = document.getElementById('layer-studio-subtitle');
    this.layerCompositeCanvas = document.getElementById('layer-composite-canvas');
    this.layerInteractionCanvas = document.getElementById('layer-interaction-canvas');
    this.layerLoadingOverlay = document.getElementById('layer-loading-overlay');
    this.layerLoadingText = document.getElementById('layer-loading-text');
    this.layerStackList = document.getElementById('layer-stack-list');
    this.layerCountBadge = document.getElementById('layer-count-badge');
    
    this.btnLayerReExtract = document.getElementById('btn-layer-re-extract');
    this.btnLayerResetAll = document.getElementById('btn-layer-reset-all');
    this.btnLayerBake = document.getElementById('btn-layer-bake');
    this.btnLayerCommitFooter = document.getElementById('btn-layer-commit-footer');
    this.harmonyStrengthSlider = document.getElementById('harmony-strength-slider');
    this.harmonyStrengthVal = document.getElementById('harmony-strength-val');

    this.selectedLayerCard = document.getElementById('layer-selected-card');
    this.selectedLayerKeyBadge = document.getElementById('selected-layer-key-badge');
    this.selectedAssetThumb = document.getElementById('selected-asset-thumb');
    this.selectedAssetName = document.getElementById('selected-asset-name');
    this.selectedAssetCategory = document.getElementById('selected-asset-category');
    this.selLayerAssignedAsset = document.getElementById('sel-layer-assigned-asset');
    this.selLayerOrientation = document.getElementById('sel-layer-orientation');
    this.txtLayerOrientationExtra = document.getElementById('txt-layer-orientation-extra');
    this.selCanonicalView = document.getElementById('sel-canonical-view');
    this.btnFlipSprite = document.getElementById('btn-flip-sprite');
    this.btnApplyCanonicalSprite = document.getElementById('btn-apply-canonical-sprite');
    this.isSpriteFlippedH = false;
    this.selectedLayerOpacity = document.getElementById('selected-layer-opacity');
    this.selectedLayerOpacityVal = document.getElementById('selected-layer-opacity-val');
    this.btnSelectedResetPins = document.getElementById('btn-selected-reset-pins');
    this.btnSelectedCenter = document.getElementById('btn-selected-center');
    this.btnRegenerateLayerAsset = document.getElementById('btn-regenerate-layer-asset');
    this.btnExportLayerPng = document.getElementById('btn-export-layer-png');
    this.btnDuplicateLayer = document.getElementById('btn-duplicate-layer');
    this.btnDeleteLayer = document.getElementById('btn-delete-layer');
    this.btnImportLayerPng = document.getElementById('btn-import-layer-png');
    this.fileImportLayerPng = document.getElementById('file-import-layer-png');
    this.noLayerSelectedNotice = document.getElementById('no-layer-selected-notice');
    this.selectedLayerBody = document.getElementById('selected-layer-body');
    this.selectedLayerNameInput = document.getElementById('selected-layer-name-input');
    this.btnLayerBringTop = document.getElementById('btn-layer-bring-top');
    this.btnLayerMoveUp = document.getElementById('btn-layer-move-up');
    this.btnLayerMoveDown = document.getElementById('btn-layer-move-down');
    this.btnLayerSendBottom = document.getElementById('btn-layer-send-bottom');

    this.btnLayerModePin = document.getElementById('btn-layer-mode-pin');
    this.btnLayerModeMove = document.getElementById('btn-layer-mode-move');
    this.chkLayerShowGhost = document.getElementById('chk-layer-show-ghost');
    this.chkLayerShowGrid = document.getElementById('chk-layer-show-grid');

    // Studio state
    this.activeStudioShot = null;
    this.studioLayers = [];
    this.selectedLayerId = null;
    this.draggedStudioLayerId = null;
    this.studioImageCache = {};
    this.studioGhostImage = null;
    this.studioTransformMode = 'pin';
    this.studioActiveDrag = null;
  }

  initLayerStudioEvents() {
    this.closeLayerModalBtn?.addEventListener('click', () => this.closeLayeredRestyleStudio());
    
    this.layeredRestyleModal?.addEventListener('click', (e) => {
      if (e.target === this.layeredRestyleModal) this.closeLayeredRestyleStudio();
    });

    this.btnLayerReExtract?.addEventListener('click', () => {
      if (this.activeStudioShot) this.extractShotLayers(this.activeStudioShot, true);
    });

    this.btnLayerResetAll?.addEventListener('click', () => {
      this.resetAllLayerPins();
    });

    this.btnLayerBake?.addEventListener('click', () => this.bakeAndCommitStudioComposite());
    this.btnLayerCommitFooter?.addEventListener('click', () => this.bakeAndCommitStudioComposite());

    this.harmonyStrengthSlider?.addEventListener('input', () => {
      const val = parseFloat(this.harmonyStrengthSlider.value);
      if (this.harmonyStrengthVal) {
        if (val === 0) this.harmonyStrengthVal.textContent = '0% (Raw Composite)';
        else if (val <= 0.25) this.harmonyStrengthVal.textContent = `${Math.round(val * 100)}% (Subtle Polish)`;
        else this.harmonyStrengthVal.textContent = `${Math.round(val * 100)}% (Painterly Blend)`;
      }
    });

    this.selectedLayerOpacity?.addEventListener('input', () => {
      const val = parseFloat(this.selectedLayerOpacity.value);
      if (this.selectedLayerOpacityVal) this.selectedLayerOpacityVal.textContent = `${Math.round(val * 100)}%`;
      const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
      if (layer) {
        layer.opacity = val;
        this.renderCompositeCanvas();
      }
    });

    // Layer renaming from inspector
    this.selectedLayerNameInput?.addEventListener('input', (e) => {
      const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
      if (layer && !layer.isBackground) {
        layer.assetName = e.target.value;
        if (this.selectedAssetName) this.selectedAssetName.textContent = e.target.value;
        const activeItemName = this.layerStackList?.querySelector(`.layer-item.active .layer-item-name`);
        if (activeItemName) activeItemName.textContent = e.target.value || 'Layer';
        if (this.activeStudioShot) {
          this.activeStudioShot.layers = this.studioLayers;
          this.saveProject();
        }
      }
    });

    this.selectedLayerNameInput?.addEventListener('change', () => {
      this.renderLayerStack();
    });

    // Layer stacking depth quick controls
    this.btnLayerBringTop?.addEventListener('click', () => {
      if (this.selectedLayerId) this.moveLayerZOrder(this.selectedLayerId, 'top');
    });

    this.btnLayerMoveUp?.addEventListener('click', () => {
      if (this.selectedLayerId) this.moveLayerZOrder(this.selectedLayerId, 'up');
    });

    this.btnLayerMoveDown?.addEventListener('click', () => {
      if (this.selectedLayerId) this.moveLayerZOrder(this.selectedLayerId, 'down');
    });

    this.btnLayerSendBottom?.addEventListener('click', () => {
      if (this.selectedLayerId) this.moveLayerZOrder(this.selectedLayerId, 'bottom');
    });

    this.btnSelectedResetPins?.addEventListener('click', () => this.resetSelectedLayerPins());
    this.btnSelectedCenter?.addEventListener('click', () => this.centerSelectedLayer());
    this.btnRegenerateLayerAsset?.addEventListener('click', () => this.regenerateSelectedLayerAsset());
    this.btnExportLayerPng?.addEventListener('click', () => this.exportSelectedLayerPng());
    this.btnDuplicateLayer?.addEventListener('click', () => this.duplicateLayer(this.selectedLayerId));
    this.btnDeleteLayer?.addEventListener('click', () => this.deleteLayer(this.selectedLayerId));

    this.btnImportLayerPng?.addEventListener('click', () => {
      this.fileImportLayerPng?.click();
    });

    this.fileImportLayerPng?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.importLayerPngFile(file);
        e.target.value = '';
      }
    });

    this.selLayerAssignedAsset?.addEventListener('change', (e) => {
      const assetId = e.target.value;
      if (assetId) this.swapLayerAssignedAsset(assetId);
    });

    this.btnFlipSprite?.addEventListener('click', () => {
      this.isSpriteFlippedH = !this.isSpriteFlippedH;
      if (this.btnFlipSprite) {
        if (this.isSpriteFlippedH) {
          this.btnFlipSprite.classList.add('active');
          this.btnFlipSprite.textContent = '⇄ Flipped';
        } else {
          this.btnFlipSprite.classList.remove('active');
          this.btnFlipSprite.textContent = '⇄ Flip';
        }
      }
    });

    this.btnApplyCanonicalSprite?.addEventListener('click', () => {
      this.applyCanonicalSpriteToSelectedLayer();
    });

    this.btnLayerModePin?.addEventListener('click', () => {
      this.studioTransformMode = 'pin';
      this.btnLayerModePin?.classList.add('active');
      this.btnLayerModeMove?.classList.remove('active');
      this.renderInteractionCanvas();
    });

    this.btnLayerModeMove?.addEventListener('click', () => {
      this.studioTransformMode = 'move';
      this.btnLayerModeMove?.classList.add('active');
      this.btnLayerModePin?.classList.remove('active');
      this.renderInteractionCanvas();
    });

    this.chkLayerShowGhost?.addEventListener('change', () => this.renderCompositeCanvas());
    this.chkLayerShowGrid?.addEventListener('change', () => this.renderInteractionCanvas());

    if (this.layerInteractionCanvas) {
      this.layerInteractionCanvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
      window.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
      window.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
    }
  }

  async openLayeredRestyleStudio(shot, targetFrame = 'start') {
    if (!shot) return;
    this.activeStudioShot = shot;
    this.activeStudioTargetFrame = targetFrame;
    this.selectedLayerId = null;
    this.studioTransformMode = 'pin';

    const isEndStudio = targetFrame === 'end';
    const frameStudioLabel = isEndStudio ? 'END FRAME' : 'START FRAME';

    if (this.layerStudioTitle) {
      this.layerStudioTitle.textContent = `${frameStudioLabel} Layer Studio — Shot #${shot.shotNumber || shot.id}: ${shot.title || 'Shot'}`;
    }
    if (this.layerStudioSubtitle) {
      this.layerStudioSubtitle.textContent = shot.description || `Decomposed Consistent Asset Layers with 4-Corner Perspective Pin (${frameStudioLabel})`;
    }

    const ghostUrl = isEndStudio ? (shot.endKeyframeUrl || shot.keyframeUrl) : shot.keyframeUrl;
    if (ghostUrl) {
      const ghostImg = new Image();
      ghostImg.crossOrigin = 'anonymous';
      ghostImg.src = ghostUrl;
      ghostImg.onload = () => {
        this.studioGhostImage = ghostImg;
        this.renderCompositeCanvas();
      };
    } else {
      this.studioGhostImage = null;
    }

    this.layeredRestyleModal?.classList.remove('hidden');

    const studioLayersSource = isEndStudio ? shot.endLayers : shot.layers;
    if (studioLayersSource && Array.isArray(studioLayersSource) && studioLayersSource.length > 0) {
      this.studioLayers = JSON.parse(JSON.stringify(studioLayersSource));
      await this.preloadStudioImages();
      this.renderLayerStudio();
    } else {
      await this.extractShotLayers(shot, false);
    }
    return;
  }

  closeLayeredRestyleStudio() {
    this.layeredRestyleModal?.classList.add('hidden');
    this.activeStudioShot = null;
    this.studioLayers = [];
    this.selectedLayerId = null;
  }

  async extractShotLayers(shot, force = false) {
    if (this.layerLoadingOverlay) {
      this.layerLoadingOverlay.classList.remove('hidden');
      if (this.layerLoadingText) {
        this.layerLoadingText.textContent = force ? 'Re-extracting Layers...' : 'Decomposing Shot into Layers...';
      }
    }

    try {
      const targetFrame = this.activeStudioTargetFrame || 'start';
      const res = await fetch(`/api/storyboard/${shot.id}/layers/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetFrame })
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.layers)) {
        throw new Error(data.error || 'Failed to decompose shot layers');
      }

      this.studioLayers = data.layers;
      if (targetFrame === 'end') {
        shot.endLayers = data.layers;
      } else {
        shot.layers = data.layers;
      }
      this.saveProject();

      await this.preloadStudioImages();
      this.renderLayerStudio();
    } catch (err) {
      alert('Layer extraction error: ' + err.message);
    } finally {
      if (this.layerLoadingOverlay) {
        this.layerLoadingOverlay.classList.add('hidden');
      }
    }
  }

  async preloadStudioImages() {
    const promises = this.studioLayers.map(layer => {
      return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.studioImageCache[layer.imageUrl] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn('Failed to load layer image:', layer.imageUrl);
          resolve();
        };
        img.src = layer.imageUrl;
      });
    });
    await Promise.all(promises);
  }

  renderLayerStudio() {
    const fgLayers = this.studioLayers.filter(l => !l.isBackground);
    if (!this.selectedLayerId && fgLayers.length > 0) {
      this.selectedLayerId = fgLayers[0].id;
    }

    this.renderLayerStack();
    this.updateSelectedLayerInspector();
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
  }

  renderLayerStack() {
    if (!this.layerStackList) return;
    this.layerStackList.innerHTML = '';

    if (this.layerCountBadge) {
      this.layerCountBadge.textContent = `${this.studioLayers.length} Layers`;
    }

    const sorted = [...this.studioLayers].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    const fgLayers = sorted.filter(l => !l.isBackground);

    sorted.forEach(layer => {
      const item = document.createElement('div');
      item.className = `layer-item ${layer.id === this.selectedLayerId ? 'active' : ''}`;
      item.dataset.layerId = layer.id;
      
      const dotColor = layer.colorKey || (layer.isBackground ? '#3b82f6' : '#9ca3af');
      const badgeText = layer.colorKey ? layer.colorKey : (layer.isBackground ? 'BG' : 'Asset');

      const fgIndex = fgLayers.findIndex(l => l.id === layer.id);
      const isTopFg = fgIndex === 0;
      const isBottomFg = fgIndex === fgLayers.length - 1;

      item.innerHTML = `
        ${!layer.isBackground ? `
          <div class="layer-drag-handle" title="Drag to reorder layer stack">⠿</div>
        ` : `
          <div style="width:14px; font-size:0.72rem; text-align:center; color:var(--text-dim);" title="Base background canvas">🔒</div>
        `}
        <img src="${layer.imageUrl}" class="layer-item-thumb" alt="Layer Preview">
        <div class="layer-item-info">
          <div style="display:flex; align-items:center; gap:4px; max-width:100%;">
            <span class="layer-item-name" title="Double-click to rename">${layer.assetName || 'Layer'}</span>
            ${!layer.isBackground ? `
              <button class="layer-btn-icon btn-rename-layer-item" title="Rename Layer" data-layer-id="${layer.id}" style="font-size:0.65rem; padding:0 2px; opacity:0.65;">✏️</button>
            ` : ''}
          </div>
          <span class="layer-item-meta">
            <span class="layer-color-dot" style="background:${dotColor};"></span>
            <span>${badgeText}</span> • ${Math.round((layer.opacity ?? 1) * 100)}%
          </span>
        </div>
        <div class="layer-item-actions" style="display:flex; align-items:center; gap:2px;">
          ${!layer.isBackground ? `
            <button class="layer-btn-icon btn-move-layer-up" title="Bring Forward (Move Up in stack)" data-layer-id="${layer.id}" ${isTopFg ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''}>
              ▲
            </button>
            <button class="layer-btn-icon btn-move-layer-down" title="Send Backward (Move Down in stack)" data-layer-id="${layer.id}" ${isBottomFg ? 'disabled style="opacity:0.25; cursor:not-allowed;"' : ''}>
              ▼
            </button>
            <button class="layer-btn-icon btn-duplicate-layer-item" title="Duplicate Layer" data-layer-id="${layer.id}">
              ❐
            </button>
          ` : ''}
          <button class="layer-btn-icon btn-toggle-vis" title="${layer.visible !== false ? 'Hide Layer' : 'Show Layer'}">
            ${layer.visible !== false ? '👁️' : '🚫'}
          </button>
          ${!layer.isBackground ? `
            <button class="layer-btn-icon btn-delete-layer-item" title="Delete Layer" data-layer-id="${layer.id}" style="color:var(--accent-rose);">
              ✕
            </button>
          ` : ''}
        </div>
      `;

      // HTML5 Drag and drop
      if (!layer.isBackground) {
        item.setAttribute('draggable', 'true');

        item.addEventListener('dragstart', (e) => {
          this.draggedStudioLayerId = layer.id;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', layer.id);
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          this.draggedStudioLayerId = null;
          item.classList.remove('dragging');
          this.layerStackList?.querySelectorAll('.layer-item').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
          });
        });
      }

      item.addEventListener('dragover', (e) => {
        if (!this.draggedStudioLayerId || this.draggedStudioLayerId === layer.id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const rect = item.getBoundingClientRect();
        const isAfter = (e.clientY - rect.top) > (rect.height / 2);
        if (isAfter) {
          item.classList.add('drag-over-bottom');
          item.classList.remove('drag-over-top');
        } else {
          item.classList.add('drag-over-top');
          item.classList.remove('drag-over-bottom');
        }
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      item.addEventListener('drop', (e) => {
        if (!this.draggedStudioLayerId || this.draggedStudioLayerId === layer.id) return;
        e.preventDefault();
        const rect = item.getBoundingClientRect();
        const placeAfter = (e.clientY - rect.top) > (rect.height / 2);
        const draggedId = this.draggedStudioLayerId;
        this.draggedStudioLayerId = null;
        item.classList.remove('drag-over-top', 'drag-over-bottom');
        this.reorderLayerDrop(draggedId, layer.id, placeAfter);
      });

      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-move-layer-up')) {
          e.stopPropagation();
          this.moveLayerZOrder(layer.id, 'up');
          return;
        }
        if (e.target.closest('.btn-move-layer-down')) {
          e.stopPropagation();
          this.moveLayerZOrder(layer.id, 'down');
          return;
        }
        if (e.target.closest('.btn-rename-layer-item')) {
          e.stopPropagation();
          const nameSpan = item.querySelector('.layer-item-name');
          if (nameSpan) this.startInlineLayerRename(nameSpan, layer);
          return;
        }
        if (e.target.closest('.btn-duplicate-layer-item')) {
          e.stopPropagation();
          this.duplicateLayer(layer.id);
          return;
        }
        if (e.target.closest('.btn-delete-layer-item')) {
          e.stopPropagation();
          this.deleteLayer(layer.id);
          return;
        }
        if (e.target.closest('.btn-toggle-vis')) {
          e.stopPropagation();
          layer.visible = layer.visible === false ? true : false;
          this.renderLayerStack();
          this.renderCompositeCanvas();
          this.renderInteractionCanvas();
          return;
        }
        this.selectStudioLayer(layer.id);
      });

      // Double-click inline rename
      const nameEl = item.querySelector('.layer-item-name');
      if (nameEl && !layer.isBackground) {
        nameEl.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          this.startInlineLayerRename(nameEl, layer);
        });
      }

      this.layerStackList.appendChild(item);
    });
  }

  selectStudioLayer(layerId) {
    this.selectedLayerId = layerId;
    this.renderLayerStack();
    this.updateSelectedLayerInspector();
    this.renderInteractionCanvas();
  }

  updateSelectedLayerInspector() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || layer.isBackground) {
      if (this.selectedLayerBody) this.selectedLayerBody.classList.add('hidden');
      if (this.noLayerSelectedNotice) {
        this.noLayerSelectedNotice.classList.remove('hidden');
        this.noLayerSelectedNotice.textContent = layer && layer.isBackground 
          ? 'Clean Background selected. Background is locked as the base canvas.'
          : 'Select an asset layer to adjust its 4-corner perspective or regenerate it with AI.';
      }
      return;
    }

    if (this.selectedLayerBody) this.selectedLayerBody.classList.remove('hidden');
    if (this.noLayerSelectedNotice) this.noLayerSelectedNotice.classList.add('hidden');

    if (this.selectedAssetName) this.selectedAssetName.textContent = layer.assetName || 'Asset Layer';
    if (this.selectedLayerNameInput && document.activeElement !== this.selectedLayerNameInput) {
      this.selectedLayerNameInput.value = layer.assetName || 'Asset Layer';
    }

    // Update depth ordering buttons enabled states
    const fg = this.studioLayers.filter(l => !l.isBackground).sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    const fgIdx = fg.findIndex(l => l.id === layer.id);
    const isTop = fgIdx === 0;
    const isBottom = fgIdx === fg.length - 1;

    if (this.btnLayerBringTop) this.btnLayerBringTop.disabled = isTop;
    if (this.btnLayerMoveUp) this.btnLayerMoveUp.disabled = isTop;
    if (this.btnLayerMoveDown) this.btnLayerMoveDown.disabled = isBottom;
    if (this.btnLayerSendBottom) this.btnLayerSendBottom.disabled = isBottom;

    if (this.selectedAssetCategory) this.selectedAssetCategory.textContent = `${layer.category || 'Prop'} • Color Key: ${layer.colorKey || 'None'}`;
    if (this.selectedLayerKeyBadge) {
      this.selectedLayerKeyBadge.textContent = layer.colorKey || 'Keyed';
      if (layer.colorKey) this.selectedLayerKeyBadge.style.color = layer.colorKey;
    }
    if (this.selectedAssetThumb) {
      this.selectedAssetThumb.src = layer.referenceImageUrl || layer.imageUrl;
    }
    if (this.selectedLayerOpacity) {
      this.selectedLayerOpacity.value = layer.opacity ?? 1.0;
    }
    if (this.selectedLayerOpacityVal) {
      this.selectedLayerOpacityVal.textContent = `${Math.round((layer.opacity ?? 1.0) * 100)}%`;
    }

    // Populate Consistent Asset switcher dropdown
    if (this.selLayerAssignedAsset) {
      const allRefs = [];
      if (this.project.references) {
        if (Array.isArray(this.project.references)) {
          allRefs.push(...this.project.references);
        } else {
          ['characters', 'props', 'places'].forEach(cat => {
            if (Array.isArray(this.project.references[cat])) allRefs.push(...this.project.references[cat]);
          });
        }
      }

      this.selLayerAssignedAsset.innerHTML = '';
      allRefs.forEach(ref => {
        const opt = document.createElement('option');
        opt.value = ref.id;
        opt.textContent = `[${ref.category || 'Prop'}] ${ref.name}`;
        if (ref.id === layer.assetId) opt.selected = true;
        this.selLayerAssignedAsset.appendChild(opt);
      });

      if (!layer.assetId && allRefs.length > 0) {
        const unassignedOpt = document.createElement('option');
        unassignedOpt.value = '';
        unassignedOpt.textContent = '-- Choose Consistent Asset --';
        unassignedOpt.selected = true;
        this.selLayerAssignedAsset.prepend(unassignedOpt);
      }
    }
  }

  normalizeLayerZIndices() {
    const bg = this.studioLayers.find(l => l.isBackground);
    const fg = this.studioLayers.filter(l => !l.isBackground)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    const totalFg = fg.length;
    fg.forEach((l, i) => {
      l.zIndex = totalFg - i;
    });
    if (bg) bg.zIndex = 0;

    this.studioLayers = bg ? [bg, ...fg] : fg;
    if (this.activeStudioShot) {
      this.activeStudioShot.layers = this.studioLayers;
      this.saveProject();
    }
  }

  moveLayerZOrder(layerId, direction) {
    const layer = this.studioLayers.find(l => l.id === layerId);
    if (!layer || layer.isBackground) return;

    const fg = this.studioLayers.filter(l => !l.isBackground)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    const idx = fg.findIndex(l => l.id === layerId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = fg[idx - 1];
      fg[idx - 1] = fg[idx];
      fg[idx] = temp;
    } else if (direction === 'down' && idx < fg.length - 1) {
      const temp = fg[idx + 1];
      fg[idx + 1] = fg[idx];
      fg[idx] = temp;
    } else if (direction === 'top' && idx > 0) {
      const [removed] = fg.splice(idx, 1);
      fg.unshift(removed);
    } else if (direction === 'bottom' && idx < fg.length - 1) {
      const [removed] = fg.splice(idx, 1);
      fg.push(removed);
    }

    const totalFg = fg.length;
    fg.forEach((l, i) => {
      l.zIndex = totalFg - i;
    });

    const bg = this.studioLayers.find(l => l.isBackground);
    if (bg) bg.zIndex = 0;

    this.studioLayers = bg ? [bg, ...fg] : fg;
    if (this.activeStudioShot) {
      this.activeStudioShot.layers = this.studioLayers;
      this.saveProject();
    }

    this.renderLayerStack();
    this.updateSelectedLayerInspector();
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
  }

  reorderLayerDrop(draggedId, targetId, placeAfter = false) {
    if (!draggedId || draggedId === targetId) return;

    const dragged = this.studioLayers.find(l => l.id === draggedId);
    if (!dragged || dragged.isBackground) return;

    const fg = this.studioLayers.filter(l => !l.isBackground)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    const draggedIdx = fg.findIndex(l => l.id === draggedId);
    if (draggedIdx === -1) return;

    const [removed] = fg.splice(draggedIdx, 1);

    const target = this.studioLayers.find(l => l.id === targetId);
    if (target && target.isBackground) {
      fg.push(removed);
    } else {
      let targetIdx = fg.findIndex(l => l.id === targetId);
      if (targetIdx === -1) {
        fg.push(removed);
      } else {
        const insertIdx = placeAfter ? targetIdx + 1 : targetIdx;
        fg.splice(insertIdx, 0, removed);
      }
    }

    const totalFg = fg.length;
    fg.forEach((l, i) => {
      l.zIndex = totalFg - i;
    });

    const bg = this.studioLayers.find(l => l.isBackground);
    if (bg) bg.zIndex = 0;

    this.studioLayers = bg ? [bg, ...fg] : fg;
    if (this.activeStudioShot) {
      this.activeStudioShot.layers = this.studioLayers;
      this.saveProject();
    }

    this.renderLayerStack();
    this.updateSelectedLayerInspector();
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
  }

  renameLayer(layerId, newName) {
    const layer = this.studioLayers.find(l => l.id === layerId);
    if (!layer || layer.isBackground) return;

    const trimmed = (newName || '').trim();
    layer.assetName = trimmed || 'Layer';

    if (this.activeStudioShot) {
      this.activeStudioShot.layers = this.studioLayers;
      this.saveProject();
    }

    if (this.selectedLayerId === layerId) {
      if (this.selectedAssetName) this.selectedAssetName.textContent = layer.assetName;
      if (this.selectedLayerNameInput && this.selectedLayerNameInput.value !== layer.assetName) {
        this.selectedLayerNameInput.value = layer.assetName;
      }
    }

    this.renderLayerStack();
  }

  startInlineLayerRename(nameSpan, layer) {
    if (!nameSpan || !layer || layer.isBackground) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'layer-inline-name-input';
    input.value = layer.assetName || 'Layer';
    nameSpan.replaceWith(input);
    input.focus();
    input.select();

    let committed = false;
    const commit = () => {
      if (committed) return;
      committed = true;
      const newName = input.value.trim() || 'Layer';
      this.renameLayer(layer.id, newName);
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        committed = true;
        this.renderLayerStack();
      }
    });
  }

  async swapLayerAssignedAsset(assetId) {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || !this.activeStudioShot) return;

    try {
      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/${layer.id}/assign-asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      });
      const data = await res.json();
      if (!data.success || !data.layer) throw new Error(data.error || 'Failed to assign asset');

      Object.assign(layer, data.layer);
      this.renderLayerStack();
      this.updateSelectedLayerInspector();
      this.saveProject();
    } catch (err) {
      alert('Asset assign error: ' + err.message);
    }
  }

  exportSelectedLayerPng() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || !layer.imageUrl) return;

    const safeName = (layer.assetName || 'layer').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const a = document.createElement('a');
    a.href = layer.imageUrl;
    a.download = `${safeName}_transparent.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async importLayerPngFile(file) {
    if (!this.activeStudioShot || !file) return;

    if (this.layerLoadingOverlay) {
      this.layerLoadingOverlay.classList.remove('hidden');
      if (this.layerLoadingText) this.layerLoadingText.textContent = 'Importing PNG Layer...';
    }

    try {
      const formData = new FormData();
      formData.append('layerFile', file);

      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/import`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!data.success || !data.layer) throw new Error(data.error || 'Failed to import layer');

      const newLayer = data.layer;
      
      // Ensure we don't insert duplicate layers
      const existingIdx = this.studioLayers.findIndex(l => l.id === newLayer.id);
      if (existingIdx === -1) {
        this.studioLayers.push(newLayer);
      } else {
        this.studioLayers[existingIdx] = newLayer;
      }
      this.normalizeLayerZIndices();

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = newLayer.imageUrl;
      await new Promise(r => { img.onload = r; img.onerror = r; });
      this.studioImageCache[newLayer.imageUrl] = img;

      this.selectStudioLayer(newLayer.id);
      this.renderLayerStack();
      this.renderCompositeCanvas();
      this.renderInteractionCanvas();
      this.saveProject();
    } catch (err) {
      alert('Import layer error: ' + err.message);
    } finally {
      if (this.layerLoadingOverlay) this.layerLoadingOverlay.classList.add('hidden');
    }
  }

  duplicateLayer(layerId) {
    const layer = this.studioLayers.find(l => l.id === layerId);
    if (!layer || layer.isBackground) {
      alert('The background canvas cannot be duplicated.');
      return;
    }

    const ts = Date.now();
    const cloned = JSON.parse(JSON.stringify(layer));
    cloned.id = `layer_copy_${ts}_${Math.floor(Math.random() * 1000)}`;
    cloned.assetName = `${layer.assetName || 'Layer'} (Copy)`;
    cloned.zIndex = this.studioLayers.length + 1;
    cloned.visible = true;

    // Shift perspective pins slightly (+45px) so the duplicated asset is immediately visible and distinguishable
    if (Array.isArray(cloned.quad)) {
      const offsetX = 45;
      const offsetY = 45;
      cloned.quad = cloned.quad.map(pt => ({
        x: Math.min(Math.max(pt.x + offsetX, 0), 1920),
        y: Math.min(Math.max(pt.y + offsetY, 0), 1080)
      }));
    }

    // Reuse existing loaded Image in cache so it renders immediately
    if (layer.imageUrl && this.studioImageCache[layer.imageUrl]) {
      this.studioImageCache[cloned.imageUrl] = this.studioImageCache[layer.imageUrl];
    }

    this.studioLayers.push(cloned);
    this.normalizeLayerZIndices();

    this.selectStudioLayer(cloned.id);
    this.renderLayerStack();
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
    this.saveProject();
  }

  deleteLayer(layerId) {
    const layer = this.studioLayers.find(l => l.id === layerId);
    if (layer && layer.isBackground) {
      alert('The background canvas cannot be deleted.');
      return;
    }

    const idx = this.studioLayers.findIndex(l => l.id === layerId);
    if (idx !== -1) {
      this.studioLayers.splice(idx, 1);
      this.normalizeLayerZIndices();
    }
    this.activeStudioShot.layers = this.studioLayers;

    if (this.selectedLayerId === layerId) {
      const nextLayer = this.studioLayers.find(l => !l.isBackground) || this.studioLayers[0];
      this.selectedLayerId = nextLayer ? nextLayer.id : null;
    }

    this.renderLayerStack();
    this.updateSelectedLayerInspector();
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
    this.saveProject();
  }

  renderCompositeCanvas() {
    if (!this.layerCompositeCanvas) return;
    const ctx = this.layerCompositeCanvas.getContext('2d');
    const w = this.layerCompositeCanvas.width;
    const h = this.layerCompositeCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const sorted = [...this.studioLayers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sorted.forEach(layer => {
      if (layer.visible === false || (layer.opacity ?? 1) <= 0) return;
      const img = this.studioImageCache[layer.imageUrl];
      if (!img) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1.0;
      ctx.globalCompositeOperation = layer.blendMode || 'source-over';

      if (layer.isBackground || !layer.quad) {
        ctx.drawImage(img, 0, 0, w, h);
      } else {
        this.drawSubdividedQuad(ctx, img, layer.quad, 4);
      }
      ctx.restore();
    });

    if (this.chkLayerShowGhost?.checked && this.studioGhostImage) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.drawImage(this.studioGhostImage, 0, 0, w, h);
      ctx.restore();
    }
  }

  drawSubdividedQuad(ctx, img, quad, div = 4) {
    if (!quad || quad.length !== 4) return;
    const [p0, p1, p2, p3] = quad;
    const iw = img.width || 1920;
    const ih = img.height || 1080;

    const lerpPoint = (u, v) => {
      const x = (1 - u) * (1 - v) * p0.x + u * (1 - v) * p1.x + u * v * p2.x + (1 - u) * v * p3.x;
      const y = (1 - u) * (1 - v) * p0.y + u * (1 - v) * p1.y + u * v * p2.y + (1 - u) * v * p3.y;
      return { x, y };
    };

    for (let j = 0; j < div; j++) {
      const v0 = j / div;
      const v1 = (j + 1) / div;
      for (let i = 0; i < div; i++) {
        const u0 = i / div;
        const u1 = (i + 1) / div;

        const pt00 = lerpPoint(u0, v0);
        const pt10 = lerpPoint(u1, v0);
        const pt11 = lerpPoint(u1, v1);
        const pt01 = lerpPoint(u0, v1);

        const tx0 = u0 * iw;
        const ty0 = v0 * ih;
        const tx1 = u1 * iw;
        const ty1 = v1 * ih;

        this.drawTexturedTriangle(ctx, img,
          pt00.x, pt00.y, pt10.x, pt10.y, pt11.x, pt11.y,
          tx0, ty0, tx1, ty0, tx1, ty1
        );

        this.drawTexturedTriangle(ctx, img,
          pt00.x, pt00.y, pt11.x, pt11.y, pt01.x, pt01.y,
          tx0, ty0, tx1, ty1, tx0, ty1
        );
      }
    }
  }

  drawTexturedTriangle(ctx, img, x0, y0, x1, y1, x2, y2, u0, v0, u1, v1, u2, v2) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.clip();

    // Exact Cramer's rule solution for 2D affine mapping: (u,v) -> (x,y)
    const delta = u0 * (v1 - v2) + u1 * (v2 - v0) + u2 * (v0 - v1);
    if (Math.abs(delta) > 0.0001) {
      const a = (x0 * (v1 - v2) + x1 * (v2 - v0) + x2 * (v0 - v1)) / delta;
      const b = (y0 * (v1 - v2) + y1 * (v2 - v0) + y2 * (v0 - v1)) / delta;
      const c = (x0 * (u2 - u1) + x1 * (u0 - u2) + x2 * (u1 - u0)) / delta;
      const d = (y0 * (u2 - u1) + y1 * (u0 - u2) + y2 * (u1 - u0)) / delta;
      const e = (x0 * (u1 * v2 - u2 * v1) + x1 * (u2 * v0 - u0 * v2) + x2 * (u0 * v1 - u1 * v0)) / delta;
      const f = (y0 * (u1 * v2 - u2 * v1) + y1 * (u2 * v0 - u0 * v2) + y2 * (u0 * v1 - u1 * v0)) / delta;

      ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(img, 0, 0);
    }
    ctx.restore();
  }

  renderInteractionCanvas() {
    if (!this.layerInteractionCanvas) return;
    const ctx = this.layerInteractionCanvas.getContext('2d');
    const w = this.layerInteractionCanvas.width;
    const h = this.layerInteractionCanvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.chkLayerShowGrid?.checked) return;

    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || layer.isBackground || !layer.quad || layer.quad.length !== 4) return;

    const [p0, p1, p2, p3] = layer.quad;
    const isMoveMode = this.studioTransformMode === 'move';

    ctx.save();

    // Quad wireframe
    ctx.strokeStyle = isMoveMode ? '#f59e0b' : '#00F0FF';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.stroke();

    // Center handle
    const cx = (p0.x + p1.x + p2.x + p3.x) / 4;
    const cy = (p0.y + p1.y + p2.y + p3.y) / 4;

    ctx.setLineDash([]);
    ctx.strokeStyle = isMoveMode ? '#fbbf24' : '#38bdf8';
    ctx.fillStyle = isMoveMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Move crosshair
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy); ctx.lineTo(cx + 9, cy);
    ctx.moveTo(cx, cy - 9); ctx.lineTo(cx, cy + 9);
    // 4 arrows
    ctx.moveTo(cx - 9, cy); ctx.lineTo(cx - 5, cy - 4);
    ctx.moveTo(cx - 9, cy); ctx.lineTo(cx - 5, cy + 4);
    ctx.moveTo(cx + 9, cy); ctx.lineTo(cx + 5, cy - 4);
    ctx.moveTo(cx + 9, cy); ctx.lineTo(cx + 5, cy + 4);
    ctx.moveTo(cx, cy - 9); ctx.lineTo(cx - 4, cy - 5);
    ctx.moveTo(cx, cy - 9); ctx.lineTo(cx + 4, cy - 5);
    ctx.moveTo(cx, cy + 9); ctx.lineTo(cx - 4, cy + 5);
    ctx.moveTo(cx, cy + 9); ctx.lineTo(cx + 4, cy + 5);
    ctx.stroke();

    // Corner handles
    const labels = ['TL', 'TR', 'BR', 'BL'];
    layer.quad.forEach((pt, i) => {
      if (isMoveMode) {
        // Square Scale handles in Move & Scale mode
        const size = 18;
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.fillRect(pt.x - size / 2, pt.y - size / 2, size, size);
        ctx.strokeRect(pt.x - size / 2, pt.y - size / 2, size, size);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(labels[i], pt.x + 14, pt.y - 10);
      } else {
        // Circular Pins in 4-Corner Pin mode
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00F0FF';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(labels[i], pt.x + 14, pt.y - 10);
      }
    });

    ctx.restore();
  }

  getCanvasCoords(e) {
    const rect = this.layerInteractionCanvas.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handleCanvasMouseDown(e) {
    if (e.button !== 0) return;
    const pos = this.getCanvasCoords(e);
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);

    if (layer && !layer.isBackground && layer.quad && layer.quad.length === 4) {
      const isMoveMode = this.studioTransformMode === 'move';

      // Check corner handles
      for (let i = 0; i < 4; i++) {
        const pt = layer.quad[i];
        const dist = Math.hypot(pt.x - pos.x, pt.y - pos.y);
        if (dist <= 26) {
          if (isMoveMode) {
            const cx = (layer.quad[0].x + layer.quad[1].x + layer.quad[2].x + layer.quad[3].x) / 4;
            const cy = (layer.quad[0].y + layer.quad[1].y + layer.quad[2].y + layer.quad[3].y) / 4;
            this.studioActiveDrag = {
              type: 'scale',
              cornerIndex: i,
              startX: pos.x,
              startY: pos.y,
              center: { cx, cy },
              initDist: Math.hypot(pt.x - cx, pt.y - cy),
              layerId: layer.id,
              initialQuad: JSON.parse(JSON.stringify(layer.quad))
            };
          } else {
            this.studioActiveDrag = {
              type: 'pin',
              cornerIndex: i,
              startX: pos.x,
              startY: pos.y,
              layerId: layer.id,
              initialQuad: JSON.parse(JSON.stringify(layer.quad))
            };
          }
          return;
        }
      }

      // Check center handle or quad body
      const cx = (layer.quad[0].x + layer.quad[1].x + layer.quad[2].x + layer.quad[3].x) / 4;
      const cy = (layer.quad[0].y + layer.quad[1].y + layer.quad[2].y + layer.quad[3].y) / 4;
      if (Math.hypot(cx - pos.x, cy - pos.y) <= 32 || isMoveMode) {
        this.studioActiveDrag = {
          type: 'move',
          startX: pos.x,
          startY: pos.y,
          layerId: layer.id,
          initialQuad: JSON.parse(JSON.stringify(layer.quad))
        };
        return;
      }
    }

    // Layer selection by clicking near center of another layer
    for (const l of this.studioLayers) {
      if (l.isBackground || !l.quad) continue;
      const cx = (l.quad[0].x + l.quad[1].x + l.quad[2].x + l.quad[3].x) / 4;
      const cy = (l.quad[0].y + l.quad[1].y + l.quad[2].y + l.quad[3].y) / 4;
      if (Math.hypot(cx - pos.x, cy - pos.y) <= 80) {
        this.selectStudioLayer(l.id);
        return;
      }
    }
  }

  handleCanvasMouseMove(e) {
    const pos = this.getCanvasCoords(e);

    if (this.studioActiveDrag) {
      const layer = this.studioLayers.find(l => l.id === this.studioActiveDrag.layerId);
      if (!layer || !layer.quad) return;

      if (this.studioActiveDrag.type === 'pin') {
        const idx = this.studioActiveDrag.cornerIndex;
        layer.quad[idx] = {
          x: Math.round(pos.x),
          y: Math.round(pos.y)
        };
      } else if (this.studioActiveDrag.type === 'move') {
        const dx = pos.x - this.studioActiveDrag.startX;
        const dy = pos.y - this.studioActiveDrag.startY;
        const init = this.studioActiveDrag.initialQuad;
        layer.quad = init.map(pt => ({
          x: Math.round(pt.x + dx),
          y: Math.round(pt.y + dy)
        }));
      } else if (this.studioActiveDrag.type === 'scale') {
        const { cx, cy } = this.studioActiveDrag.center;
        const initDist = this.studioActiveDrag.initDist;
        const curDist = Math.hypot(pos.x - cx, pos.y - cy);
        const scale = curDist / Math.max(initDist, 1);
        const init = this.studioActiveDrag.initialQuad;
        layer.quad = init.map(pt => ({
          x: Math.round(cx + (pt.x - cx) * scale),
          y: Math.round(cy + (pt.y - cy) * scale)
        }));
      }

      this.renderCompositeCanvas();
      this.renderInteractionCanvas();
      return;
    }

    // Dynamic cursor feedback when hovering over handles
    if (this.layerInteractionCanvas) {
      const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
      if (layer && !layer.isBackground && layer.quad && layer.quad.length === 4) {
        let hoverHandle = false;
        for (let i = 0; i < 4; i++) {
          const pt = layer.quad[i];
          if (Math.hypot(pt.x - pos.x, pt.y - pos.y) <= 26) {
            this.layerInteractionCanvas.style.cursor = this.studioTransformMode === 'move' ? 'nwse-resize' : 'crosshair';
            hoverHandle = true;
            break;
          }
        }
        if (!hoverHandle) {
          const cx = (layer.quad[0].x + layer.quad[1].x + layer.quad[2].x + layer.quad[3].x) / 4;
          const cy = (layer.quad[0].y + layer.quad[1].y + layer.quad[2].y + layer.quad[3].y) / 4;
          if (Math.hypot(cx - pos.x, cy - pos.y) <= 32 || this.studioTransformMode === 'move') {
            this.layerInteractionCanvas.style.cursor = 'move';
          } else {
            this.layerInteractionCanvas.style.cursor = 'default';
          }
        }
      } else {
        this.layerInteractionCanvas.style.cursor = 'default';
      }
    }
  }

  handleCanvasMouseUp(e) {
    if (this.studioActiveDrag) {
      this.studioActiveDrag = null;
      if (this.activeStudioShot) {
        this.activeStudioShot.layers = this.studioLayers;
        this.saveProject();
      }
    }
  }

  resetSelectedLayerPins() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer) return;
    layer.quad = [
      { x: 0, y: 0 },
      { x: 1920, y: 0 },
      { x: 1920, y: 1080 },
      { x: 0, y: 1080 }
    ];
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
    this.saveProject();
  }

  resetAllLayerPins() {
    this.studioLayers.forEach(l => {
      if (!l.isBackground) {
        l.quad = [
          { x: 0, y: 0 },
          { x: 1920, y: 0 },
          { x: 1920, y: 1080 },
          { x: 0, y: 1080 }
        ];
      }
    });
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
    this.saveProject();
  }

  centerSelectedLayer() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || !layer.quad) return;
    const curCx = (layer.quad[0].x + layer.quad[1].x + layer.quad[2].x + layer.quad[3].x) / 4;
    const curCy = (layer.quad[0].y + layer.quad[1].y + layer.quad[2].y + layer.quad[3].y) / 4;
    const dx = 960 - curCx;
    const dy = 540 - curCy;
    layer.quad = layer.quad.map(pt => ({
      x: Math.round(pt.x + dx),
      y: Math.round(pt.y + dy)
    }));
    this.renderCompositeCanvas();
    this.renderInteractionCanvas();
    this.saveProject();
  }

  async regenerateSelectedLayerAsset() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || !this.activeStudioShot) return;

    if (this.btnRegenerateLayerAsset) {
      this.btnRegenerateLayerAsset.disabled = true;
      this.btnRegenerateLayerAsset.innerHTML = `<span class="btn-spinner"></span> Generating with GPT Flare...`;
    }

    try {
      const basePrompt = this.selLayerOrientation?.value || '';
      const extraPrompt = this.txtLayerOrientationExtra?.value?.trim() || '';
      const userPrompt = extraPrompt ? `${basePrompt}, ${extraPrompt}` : basePrompt;

      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/${layer.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt })
      });
      const data = await res.json();
      if (!data.success || !data.layer) throw new Error(data.error || 'Failed to regenerate asset');

      layer.imageUrl = data.layer.imageUrl;
      layer.imagePath = data.layer.imagePath;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = layer.imageUrl;
      await new Promise(r => { img.onload = r; img.onerror = r; });
      this.studioImageCache[layer.imageUrl] = img;

      this.renderLayerStack();
      this.updateSelectedLayerInspector();
      this.renderCompositeCanvas();
      this.renderInteractionCanvas();
      this.saveProject();
    } catch (err) {
      alert('Asset generation error: ' + err.message);
    } finally {
      if (this.btnRegenerateLayerAsset) {
        this.btnRegenerateLayerAsset.disabled = false;
        this.btnRegenerateLayerAsset.innerHTML = `✨ Generate 3D Consistent Asset`;
      }
    }
  }

  async applyCanonicalSpriteToSelectedLayer() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || !this.activeStudioShot) return;

    const view = this.selCanonicalView ? this.selCanonicalView.value : 'side';
    const flipH = !!this.isSpriteFlippedH;

    if (this.btnApplyCanonicalSprite) {
      this.btnApplyCanonicalSprite.disabled = true;
      this.btnApplyCanonicalSprite.innerHTML = `<span class="btn-spinner"></span> Extracting Canonical Sprite...`;
    }

    try {
      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/${layer.id}/apply-sprite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view, flipH })
      });
      const data = await res.json();
      if (!data.success || !data.layer) throw new Error(data.error || 'Failed to apply canonical sprite');

      layer.imageUrl = data.layer.imageUrl;
      layer.imagePath = data.layer.imagePath;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = layer.imageUrl;
      await new Promise(r => { img.onload = r; img.onerror = r; });
      this.studioImageCache[layer.imageUrl] = img;

      this.renderLayerStack();
      this.updateSelectedLayerInspector();
      this.renderCompositeCanvas();
      this.renderInteractionCanvas();
      this.saveProject();
    } catch (err) {
      alert('Canonical sprite error: ' + err.message);
    } finally {
      if (this.btnApplyCanonicalSprite) {
        this.btnApplyCanonicalSprite.disabled = false;
        this.btnApplyCanonicalSprite.innerHTML = `✂️ Use Canonical Sprite on Layer`;
      }
    }
  }

  async bakeAndCommitStudioComposite() {
    if (!this.activeStudioShot || !this.layerCompositeCanvas) return;

    const actionBtns = [this.btnLayerBake, this.btnLayerCommitFooter].filter(Boolean);
    actionBtns.forEach(b => {
      b.disabled = true;
      b.innerHTML = `<span class="btn-spinner"></span> Harmonizing & Baking...`;
    });

    try {
      const compositeBase64 = this.layerCompositeCanvas.toDataURL('image/png');
      const harmonyStrength = this.harmonyStrengthSlider ? parseFloat(this.harmonyStrengthSlider.value) : 0.20;

      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/bake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositeBase64,
          harmonyStrength,
          layers: this.studioLayers,
          targetFrame: this.activeStudioTargetFrame || 'start'
        })
      });

      const data = await res.json();
      if (!data.success || !data.shot) throw new Error(data.error || 'Failed to bake composite');

      Object.assign(this.activeStudioShot, data.shot);
      this.renderStoryboard();
      this.saveProject();
      this.closeLayeredRestyleStudio();
    } catch (err) {
      alert('Bake Keyframe error: ' + err.message);
    } finally {
      actionBtns.forEach(b => {
        b.disabled = false;
        b.innerHTML = `✨ Harmonize & Save Keyframe`;
      });
    }
  }


  // =========================================================================
  // SHOT IN / OUT RANGE MARKER & MOTION ANALYSIS METHODS
  // =========================================================================
  openShotRangeModal() {
    const videoUrl = this.project.ingestedVideo?.url || this.project.companionVideo?.url;
    if (!videoUrl) {
      alert('Please load a video (Spatial Previs or True Color) in the Ingest section first.');
      return;
    }

    this.rangeActiveTrack = this.project.ingestedVideo?.url ? 'spatial' : 'color';
    this.updateRangeVideoSource();

    const shots = this.project.storyboard || [];
    const nextShotNum = shots.length + 1;
    if (this.rangeShotTitle) {
      this.rangeShotTitle.value = `Shot ${nextShotNum}`;
    }
    if (this.rangeShotDesc) {
      this.rangeShotDesc.value = '';
    }

    let lastEnd = 0;
    if (shots.length > 0 && typeof shots[shots.length - 1].endTime === 'number') {
      lastEnd = shots[shots.length - 1].endTime;
    }
    this.rangeInTime = lastEnd;
    this.rangeOutTime = lastEnd + 4;

    this.shotRangeModal?.classList.remove('hidden');

    const onLoaded = () => {
      const dur = this.rangeModalVideo.duration || 100;
      if (this.rangeVideoScrubber) {
        this.rangeVideoScrubber.max = dur;
      }
      if (this.rangeInTime >= dur) this.rangeInTime = 0;
      if (this.rangeOutTime > dur) this.rangeOutTime = Math.min(dur, this.rangeInTime + 4);
      this.seekRangeVideo(this.rangeInTime);
      this.updateRangeTimeUi();
      this.captureRangeFrame('in');
      setTimeout(() => this.captureRangeFrame('out'), 250);
      this.rangeModalVideo.removeEventListener('loadedmetadata', onLoaded);
    };

    if (this.rangeModalVideo.readyState >= 1) {
      onLoaded();
    } else {
      this.rangeModalVideo.addEventListener('loadedmetadata', onLoaded);
    }
  }

  closeShotRangeModal() {
    if (this.rangeModalVideo) {
      this.rangeModalVideo.pause();
    }
    this.shotRangeModal?.classList.add('hidden');
  }

  updateRangeVideoSource() {
    if (!this.rangeModalVideo) return;
    const curTime = this.rangeModalVideo.currentTime || this.rangeInTime || 0;
    const isSpatial = this.rangeActiveTrack === 'spatial';
    const targetUrl = isSpatial
      ? (this.project.ingestedVideo?.url || this.project.companionVideo?.url)
      : (this.project.companionVideo?.url || this.project.ingestedVideo?.url);

    if (this.rangeTrackLabel) {
      this.rangeTrackLabel.textContent = isSpatial ? '📐 Spatial Previs Track' : '🎨 True Color Track';
    }
    if (this.btnRangeToggleTrack) {
      const canToggle = Boolean(this.project.ingestedVideo?.url && this.project.companionVideo?.url);
      this.btnRangeToggleTrack.style.display = canToggle ? 'inline-block' : 'none';
      this.btnRangeToggleTrack.textContent = isSpatial ? '🔄 Switch to True Color' : '🔄 Switch to Spatial Previs';
    }

    if (targetUrl && !this.rangeModalVideo.src.endsWith(targetUrl)) {
      this.rangeModalVideo.src = targetUrl;
      this.rangeModalVideo.currentTime = curTime;
    }
  }

  toggleRangeTrack() {
    this.rangeActiveTrack = this.rangeActiveTrack === 'spatial' ? 'color' : 'spatial';
    this.updateRangeVideoSource();
  }

  seekRangeVideo(time) {
    if (!this.rangeModalVideo) return;
    const dur = this.rangeModalVideo.duration || 100;
    const clamped = Math.max(0, Math.min(dur, time));
    this.rangeModalVideo.currentTime = clamped;
    if (this.rangeVideoScrubber) this.rangeVideoScrubber.value = clamped;
    this.updateRangeTimeUi();
  }

  markRangeIn() {
    if (!this.rangeModalVideo) return;
    this.rangeInTime = +this.rangeModalVideo.currentTime.toFixed(2);
    if (this.rangeOutTime <= this.rangeInTime) {
      const dur = this.rangeModalVideo.duration || 100;
      this.rangeOutTime = Math.min(dur, +(this.rangeInTime + 3).toFixed(2));
    }
    this.captureRangeFrame('in');
    this.updateRangeTimeUi();
  }

  markRangeOut() {
    if (!this.rangeModalVideo) return;
    const cur = +this.rangeModalVideo.currentTime.toFixed(2);
    this.rangeOutTime = Math.max(+(this.rangeInTime + 0.5).toFixed(2), cur);
    this.captureRangeFrame('out');
    this.updateRangeTimeUi();
  }

  captureRangeFrame(type) {
    const canvas = type === 'in' ? this.rangePreviewStartCanvas : this.rangePreviewEndCanvas;
    if (!canvas || !this.rangeModalVideo) return;

    if (type === 'out') {
      const savedTime = this.rangeModalVideo.currentTime;
      const onSeeked = () => {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.rangeModalVideo, 0, 0, canvas.width, canvas.height);
        this.rangeModalVideo.removeEventListener('seeked', onSeeked);
        this.rangeModalVideo.currentTime = savedTime;
      };
      this.rangeModalVideo.addEventListener('seeked', onSeeked);
      this.rangeModalVideo.currentTime = this.rangeOutTime;
    } else {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.rangeModalVideo, 0, 0, canvas.width, canvas.height);
    }
  }

  updateRangeTimeUi() {
    const cur = this.rangeModalVideo?.currentTime || 0;
    const fps = 30;
    const curFrame = Math.round(cur * fps);
    const mins = Math.floor(cur / 60).toString().padStart(2, '0');
    const secs = (cur % 60).toFixed(2).padStart(5, '0');

    if (this.rangeCurrentTimecode) {
      this.rangeCurrentTimecode.textContent = `${mins}:${secs} (F: ${curFrame})`;
    }
    if (this.rangeInTimeText) {
      this.rangeInTimeText.textContent = `${this.rangeInTime.toFixed(2)}s`;
    }
    if (this.rangeOutTimeText) {
      this.rangeOutTimeText.textContent = `${this.rangeOutTime.toFixed(2)}s`;
    }

    const duration = Math.max(0.1, +(this.rangeOutTime - this.rangeInTime).toFixed(2));
    if (this.rangeDurationBadge) {
      this.rangeDurationBadge.textContent = `${duration.toFixed(2)}s`;
    }

    if (this.rangeSliderHighlight && this.rangeModalVideo?.duration) {
      const totalDur = this.rangeModalVideo.duration;
      const leftPct = (this.rangeInTime / totalDur) * 100;
      const widthPct = ((this.rangeOutTime - this.rangeInTime) / totalDur) * 100;
      this.rangeSliderHighlight.style.left = `${Math.max(0, leftPct)}%`;
      this.rangeSliderHighlight.style.width = `${Math.min(100 - leftPct, widthPct)}%`;
    }
  }

  async addRangeShotToStoryboard() {
    const startTime = this.rangeInTime;
    const endTime = this.rangeOutTime;
    const title = this.rangeShotTitle?.value?.trim() || '';
    const description = this.rangeShotDesc?.value?.trim() || '';
    const cameraMotion = this.rangeCameraMotion?.value || 'Dolly Forward';

    if (this.rangeAddSpinner) this.rangeAddSpinner.classList.remove('hidden');
    if (this.btnRangeAddShot) this.btnRangeAddShot.disabled = true;

    try {
      const res = await fetch('/api/storyboard/add-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime,
          endTime,
          title,
          description,
          cameraMotion
        })
      });

      const data = await res.json();
      if (!data.success || !data.shot) throw new Error(data.error || 'Failed to add shot range');

      this.project.storyboard = data.storyboard || this.project.storyboard || [];
      this.renderStoryboard();
      this.saveProject();

      const totalDur = this.rangeModalVideo?.duration || 100;
      this.rangeInTime = Math.min(totalDur, endTime);
      this.rangeOutTime = Math.min(totalDur, this.rangeInTime + 4);
      this.seekRangeVideo(this.rangeInTime);
      this.captureRangeFrame('in');
      setTimeout(() => this.captureRangeFrame('out'), 250);

      const nextShotNum = (this.project.storyboard || []).length + 1;
      if (this.rangeShotTitle) this.rangeShotTitle.value = `Shot ${nextShotNum}`;
      if (this.rangeShotDesc) this.rangeShotDesc.value = '';

      alert(`Shot #${data.shot.shotNumber || nextShotNum - 1} added! Start & End keyframes successfully extracted.`);
    } catch (err) {
      alert('Error adding shot range: ' + err.message);
    } finally {
      if (this.rangeAddSpinner) this.rangeAddSpinner.classList.add('hidden');
      if (this.btnRangeAddShot) this.btnRangeAddShot.disabled = false;
    }
  }

  initRangeModalEvents() {
    this.btnOpenShotMarker?.addEventListener('click', () => this.openShotRangeModal());
    document.getElementById('btn-open-shot-marker-sm')?.addEventListener('click', () => this.openShotRangeModal());
    this.closeRangeModalBtn?.addEventListener('click', () => this.closeShotRangeModal());
    this.cancelRangeModalBtn?.addEventListener('click', () => this.closeShotRangeModal());

    this.btnRangeToggleTrack?.addEventListener('click', () => this.toggleRangeTrack());

    this.btnRangePlayPause?.addEventListener('click', () => {
      if (!this.rangeModalVideo) return;
      if (this.rangeModalVideo.paused) {
        this.rangeModalVideo.play();
        if (this.btnRangePlayPause) this.btnRangePlayPause.textContent = '⏸ Pause';
      } else {
        this.rangeModalVideo.pause();
        if (this.btnRangePlayPause) this.btnRangePlayPause.textContent = '▶ Play';
      }
    });

    this.rangeModalVideo?.addEventListener('timeupdate', () => {
      if (this.rangeVideoScrubber) this.rangeVideoScrubber.value = this.rangeModalVideo.currentTime;
      this.updateRangeTimeUi();
    });

    this.rangeModalVideo?.addEventListener('ended', () => {
      if (this.btnRangePlayPause) this.btnRangePlayPause.textContent = '▶ Play';
    });

    this.rangeVideoScrubber?.addEventListener('input', () => {
      this.seekRangeVideo(parseFloat(this.rangeVideoScrubber.value));
    });

    this.btnRangeStepBackSec?.addEventListener('click', () => {
      this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) - 1);
    });
    this.btnRangeStepFwdSec?.addEventListener('click', () => {
      this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) + 1);
    });
    this.btnRangeStepBackFrame?.addEventListener('click', () => {
      this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) - (1 / 30));
    });
    this.btnRangeStepFwdFrame?.addEventListener('click', () => {
      this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) + (1 / 30));
    });

    this.btnRangeMarkIn?.addEventListener('click', () => this.markRangeIn());
    this.btnRangeMarkOut?.addEventListener('click', () => this.markRangeOut());

    this.btnRangeJumpIn?.addEventListener('click', () => this.seekRangeVideo(this.rangeInTime));
    this.btnRangeJumpOut?.addEventListener('click', () => this.seekRangeVideo(this.rangeOutTime));

    this.btnRangeAddShot?.addEventListener('click', () => this.addRangeShotToStoryboard());

    window.addEventListener('keydown', (e) => {
      if (!this.shotRangeModal || this.shotRangeModal.classList.contains('hidden')) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.btnRangePlayPause?.click();
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        this.markRangeIn();
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        this.markRangeOut();
      } else if (e.key === '[') {
        e.preventDefault();
        this.seekRangeVideo(this.rangeInTime);
      } else if (e.key === ']') {
        e.preventDefault();
        this.seekRangeVideo(this.rangeOutTime);
      } else if (e.key === ',' || e.key === '<') {
        e.preventDefault();
        this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) - (1 / 30));
      } else if (e.key === '.' || e.key === '>') {
        e.preventDefault();
        this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) + (1 / 30));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) - (e.shiftKey ? 5 : 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.seekRangeVideo((this.rangeModalVideo?.currentTime || 0) + (e.shiftKey ? 5 : 1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeShotRangeModal();
      }
    });
  }

}

document.addEventListener('DOMContentLoaded', () => {
  window.studioApp = new StudioApp();
});
