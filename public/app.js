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
    this.highLevelContextInput = document.getElementById('high-level-context-input');
    this.hlcStatusBadge = document.getElementById('hlc-status-badge');
    this.btnAddEmptyShot = document.getElementById('btn-add-empty-shot');
    this.btnRunAiShotAnalysis = document.getElementById('btn-run-ai-shot-analysis');
    this.aiShotSpinner = document.getElementById('ai-shot-spinner');
    this.btnOpenShotMarker = document.getElementById('btn-open-shot-marker');
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
    if (this.cinemaPlayer) this.cinemaPlayer.loop = false;
    if (this.cinemaPlayerB) this.cinemaPlayerB.loop = false;
    this.cinemaImagePlayer = document.getElementById('cinema-image-player');
    this.cinemaImagePlayerB = document.getElementById('cinema-image-player-b');
    this.cinemaTransitionFlash = document.getElementById('cinema-transition-flash');
    this.activeDeck = 'a';
    this.isCrossfading = false;
    this.isTimelineLooping = false;
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

    // Clear Timeline Confirmation Modal
    this.modalClearTimelineConfirm = document.getElementById('modal-clear-timeline-confirm');
    this.btnCloseClearTimelineModal = document.getElementById('btn-close-clear-timeline-modal');
    this.btnCancelClearTimeline = document.getElementById('btn-cancel-clear-timeline');
    this.btnConfirmClearTimeline = document.getElementById('btn-confirm-clear-timeline');

    // NLE Splitter Audio (Bottom Row)
    this.nleSplitterAudio = document.getElementById('nle-splitter-audio');
    this.nleAudioPanelCard = document.getElementById('nle-audio-panel-card');

    // Timeline Audio Track Players (A1 Dialogue, A2 SFX / Music)
    this.audioTrackPlayerA1 = new Audio();
    this.audioTrackPlayerA2 = new Audio();
    this.audioTrackPlayerA1.preload = 'auto';
    this.audioTrackPlayerA2.preload = 'auto';
    this.timelineAudioLane = document.getElementById('timeline-audio-lane');
    this.btnToggleV1Vis = document.getElementById('btn-toggle-v1-vis');
    this.btnToggleV1Lock = document.getElementById('btn-toggle-v1-lock');
    this.btnToggleA1Mute = document.getElementById('btn-toggle-a1-mute');
    this.btnToggleA1Solo = document.getElementById('btn-toggle-a1-solo');
    this.btnToggleA1Lock = document.getElementById('btn-toggle-a1-lock');

    // Media Pool Elements (Left Dock)
    this.nleMediaPoolDock = document.getElementById('nle-media-pool-dock');
    this.nleSplitterMp = document.getElementById('nle-splitter-mp');
    this.mediaPoolCountBadge = document.getElementById('media-pool-count-badge');
    this.btnMediaPoolImport = document.getElementById('btn-media-pool-import');
    this.mediaPoolFileInput = document.getElementById('media-pool-file-input');
    this.btnMediaPoolSyncSb = document.getElementById('btn-media-pool-sync-sb');
    this.mediaPoolSearch = document.getElementById('media-pool-search');
    this.mediaPoolItemsContainer = document.getElementById('media-pool-items-container');
    this.mediaPoolFilter = 'all';

    // Multi-Track NLE Elements (V2, V1, A1, A2)
    this.timelineTrackV2 = document.getElementById('timeline-track-v2');
    this.timelineTrackV1 = document.getElementById('timeline-track');
    this.timelineAudioLaneA1 = document.getElementById('timeline-audio-lane');
    this.timelineAudioLaneA2 = document.getElementById('timeline-track-a2');
    this.btnToggleV2Vis = document.getElementById('btn-toggle-v2-vis');
    this.btnToggleV2Lock = document.getElementById('btn-toggle-v2-lock');
    this.btnToggleA2Mute = document.getElementById('btn-toggle-a2-mute');
    this.btnToggleA2Solo = document.getElementById('btn-toggle-a2-solo');
    this.btnToggleA2Lock = document.getElementById('btn-toggle-a2-lock');

    // Color Grading Graph & Bezier Engine Elements
    this.timelineTrackCg = document.getElementById('timeline-track-colorgrade');
    this.cgGraphCanvas = document.getElementById('colorgrade-graph-canvas');
    this.cgTooltip = document.getElementById('colorgrade-tooltip');
    this.btnToggleCgVis = document.getElementById('btn-toggle-cg-vis');
    this.btnResetCgChannel = document.getElementById('btn-reset-cg-channel');
    this.cgChannelSelect = document.getElementById('cg-channel-select');
    this.btnCgPresets = document.getElementById('btn-cg-presets');
    this.cgValueDisplay = document.getElementById('cg-value-display');
    this.btnCgPrevKey = document.getElementById('btn-cg-prev-key');
    this.btnCgAddKey = document.getElementById('btn-cg-add-key');
    this.btnCgNextKey = document.getElementById('btn-cg-next-key');
    this.btnCgDelKey = document.getElementById('btn-cg-del-key');
    this.pbCgMatrix = document.getElementById('pb-cg-matrix');
    this.selectedCgKeyframe = null;
    this.selectedCgKeyframeIndex = -1;
    this.hoveredCgKeyframe = null;
    this.hoveredCgHandle = null;
    this.isDraggingCg = false;
    this.dragTarget = null;
    this.colorGradingPresetIndex = 0;

    // Layered Audio Channel Mixer Elements
    this.btnAudioModeMixer = document.getElementById('btn-audio-mode-mixer');
    this.btnAudioModeEq = document.getElementById('btn-audio-mode-eq');
    this.audioMixerView = document.getElementById('audio-mixer-view');
    this.audioEqView = document.getElementById('audio-eq-view');
    this.btnMixA1Mute = document.getElementById('btn-mix-a1-mute');
    this.btnMixA1Solo = document.getElementById('btn-mix-a1-solo');
    this.mixA1Slider = document.getElementById('mix-a1-slider');
    this.mixA1Pan = document.getElementById('mix-a1-pan');
    this.mixA1ValBadge = document.getElementById('mix-a1-val-badge');
    this.btnMixA2Mute = document.getElementById('btn-mix-a2-mute');
    this.btnMixA2Solo = document.getElementById('btn-mix-a2-solo');
    this.mixA2Slider = document.getElementById('mix-a2-slider');
    this.mixA2Pan = document.getElementById('mix-a2-pan');
    this.mixA2ValBadge = document.getElementById('mix-a2-val-badge');

    this.timelineZoom = 95; // pixels per second
    this.currentTool = 'select';
    this.snapEnabled = true;

    // NLE Resizable Layout Elements
    this.nleUpperRow = document.getElementById('nle-upper-row') || document.querySelector('.nle-upper-row');
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
    this.btnKfUploadRestyle = document.getElementById('btn-kf-upload-restyle');
    this.btnKfChainPrevRestyle = document.getElementById('btn-kf-chain-prev-restyle');
    this.btnLightboxUploadRestyle = document.getElementById('btn-lightbox-upload-restyle');
    this.btnLightboxChainPrevRestyle = document.getElementById('btn-lightbox-chain-prev-restyle');
    this.btnCompareUploadRestyle = document.getElementById('btn-compare-upload-restyle');
    this.btnKfTriggerRestyle = document.getElementById('btn-kf-trigger-restyle');

    this.companionVideoInput = document.getElementById('companion-video-input');
    this.uploadColorFrameInput = document.getElementById('upload-color-frame-input');
    this.uploadRestyleFrameInput = document.getElementById('upload-restyle-frame-input');
    this.activeColorShotId = null;
    this.activeRestyleShotId = null;
    this.activeRestyleTargetFrame = 'start';

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
    this.initRangeModalElements();
    this.initGreasePenElements();
  }

  initRangeModalElements() {
    this.shotRangeModal = document.getElementById('shot-range-modal') || document.getElementById('modal-shot-range');
    this.btnOpenShotMarker = document.getElementById('btn-open-shot-marker');
    this.closeRangeModalBtn = document.getElementById('close-range-modal-btn');
    this.cancelRangeModalBtn = document.getElementById('cancel-range-modal-btn');
    this.rangeModalVideo = document.getElementById('range-modal-video');
    this.rangeTrackLabel = document.getElementById('range-marker-track-label');
    this.btnRangeToggleTrack = document.getElementById('btn-range-toggle-track');
    this.btnRangePlayPause = document.getElementById('btn-range-play-pause');
    this.rangeVideoScrubber = document.getElementById('range-video-scrubber');
    this.rangeSliderHighlight = document.getElementById('range-slider-highlight');
    this.rangeCurrentTimecode = document.getElementById('range-current-timecode');
    this.rangeDurationBadge = document.getElementById('range-duration-badge');
    this.rangeInTimeText = document.getElementById('range-in-time-text');
    this.rangeOutTimeText = document.getElementById('range-out-time-text');
    this.rangePreviewStartCanvas = document.getElementById('range-preview-start-canvas');
    this.rangePreviewEndCanvas = document.getElementById('range-preview-end-canvas');
    this.btnRangeStepBackSec = document.getElementById('btn-range-step-back-sec');
    this.btnRangeStepFwdSec = document.getElementById('btn-range-step-fwd-sec');
    this.btnRangeStepBackFrame = document.getElementById('btn-range-step-back-frame');
    this.btnRangeStepFwdFrame = document.getElementById('btn-range-step-fwd-frame');
    this.btnRangeMarkIn = document.getElementById('btn-range-mark-in');
    this.btnRangeMarkOut = document.getElementById('btn-range-mark-out');
    this.btnRangeJumpIn = document.getElementById('btn-range-jump-in');
    this.btnRangeJumpOut = document.getElementById('btn-range-jump-out');
    this.rangeShotTitle = document.getElementById('range-shot-title');
    this.rangeShotDesc = document.getElementById('range-shot-desc');
    this.rangeCameraMotion = document.getElementById('range-camera-motion');
    this.btnRangeAddShot = document.getElementById('btn-range-add-shot');
    this.rangeAddSpinner = document.getElementById('range-add-spinner');
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
    this.initGreasePenEvents();

    // Delegated click handlers for Grease Pen and Enhance Markup
    this.storyboardGrid?.addEventListener('click', (e) => {
      const gpBtn = e.target.closest('[data-action="open-grease-pen"], .btn-grease-pen');
      if (gpBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = gpBtn.closest('.storyboard-shot-card');
        const shotId = gpBtn.dataset.shotId || card?.dataset?.id;
        const shot = (this.project.storyboard || []).find(s => s.id === shotId);
        if (shot) {
          const targetFrame = gpBtn.dataset.targetFrame || 'start';
          this.openGreasePenModal(shot, targetFrame);
        }
        return;
      }

      const enhanceBtn = e.target.closest('[data-action="enhance-markup"], .btn-enhance-markup');
      if (enhanceBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = enhanceBtn.closest('.storyboard-shot-card');
        const shotId = card?.dataset?.id;
        const shot = (this.project.storyboard || []).find(s => s.id === shotId);
        if (shot) {
          const descInput = card.querySelector('.shot-desc-input');
          const motionSelect = card.querySelector('.motion-select');
          this.handleEnhanceWithMarkup(shot, enhanceBtn, descInput, motionSelect);
        }
        return;
      }
    });


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
    document.getElementById('apply-all-transitions-btn')?.addEventListener('click', () => this.applyTransitionToAllCuts());

    // Transition Style Cards Click
    document.getElementById('transition-style-grid')?.addEventListener('click', (e) => {
      const card = e.target.closest('.trans-card');
      if (!card) return;
      const type = card.dataset.type;
      this.selectedTransitionType = type;
      if (this.transTypeSelect) this.transTypeSelect.value = type;
      document.querySelectorAll('#transition-style-grid .trans-card').forEach(c => c.classList.toggle('active', c === card));
      document.getElementById('trans-duration-group')?.classList.toggle('hidden', type === 'cut');
    });

    // Duration Range Slider & Number Input Sync
    const rangeInput = document.getElementById('trans-duration-range');
    const numInput = document.getElementById('trans-duration-input');
    const readout = document.getElementById('trans-duration-readout');

    rangeInput?.addEventListener('input', () => {
      const val = parseFloat(rangeInput.value) || 0.8;
      if (numInput) numInput.value = val;
      if (readout) readout.textContent = `${val.toFixed(1)}s`;
      document.querySelectorAll('.trans-dur-preset').forEach(preset => {
        preset.classList.toggle('active', Math.abs(parseFloat(preset.dataset.dur) - val) < 0.05);
      });
    });

    numInput?.addEventListener('input', () => {
      const val = parseFloat(numInput.value) || 0.8;
      if (rangeInput) rangeInput.value = val;
      if (readout) readout.textContent = `${val.toFixed(1)}s`;
      document.querySelectorAll('.trans-dur-preset').forEach(preset => {
        preset.classList.toggle('active', Math.abs(parseFloat(preset.dataset.dur) - val) < 0.05);
      });
    });

    // Duration Preset Chips
    document.querySelectorAll('.trans-dur-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const val = parseFloat(preset.dataset.dur) || 0.8;
        if (rangeInput) rangeInput.value = val;
        if (numInput) numInput.value = val;
        if (readout) readout.textContent = `${val.toFixed(1)}s`;
        document.querySelectorAll('.trans-dur-preset').forEach(p => p.classList.toggle('active', p === preset));
      });
    });

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
    this.btnAddEmptyShot?.addEventListener('click', () => this.handleAddBlankShot());
    this.btnRunAiShotAnalysis?.addEventListener('click', () => this.handleAiShotAnalysis());

    this.highLevelContextInput?.addEventListener('input', () => {
      const val = this.highLevelContextInput.value;
      this.project.highLevelContext = val;
      if (this.project.ingestedVideo) {
        this.project.ingestedVideo.highLevelContext = val;
      }
      if (this.hlcStatusBadge) {
        if (val.trim()) {
          this.hlcStatusBadge.className = 'hlc-badge badge-ready';
          this.hlcStatusBadge.textContent = 'Derived & Active';
        } else {
          this.hlcStatusBadge.className = 'hlc-badge badge-waiting';
          this.hlcStatusBadge.textContent = 'Awaiting Run';
        }
      }
    });

    this.highLevelContextInput?.addEventListener('change', async () => {
      try {
        await fetch('/api/storyboard/high-level-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ highLevelContext: this.highLevelContextInput.value })
        });
        this.saveProject();
      } catch (err) {
        console.warn('Failed to save high-level context:', err);
      }
    });
    this.replaceKeyframeInput?.addEventListener('change', () => this.handleReplaceKeyframe());

    // Cinema Player
    this.btnPlayPause?.addEventListener('click', () => this.togglePlayPause());
    this.bigPlayBtn?.addEventListener('click', () => this.togglePlayPause());
    this.cinemaPlayer?.addEventListener('play', () => this.onPlayerPlay());
    this.cinemaPlayer?.addEventListener('pause', () => this.onPlayerPause());
    this.cinemaPlayer?.addEventListener('timeupdate', () => this.onPlayerTimeUpdate());
    this.cinemaPlayer?.addEventListener('ended', (e) => this.onPlayerEnded(e));

    this.cinemaPlayerB?.addEventListener('play', () => this.onPlayerPlay());
    this.cinemaPlayerB?.addEventListener('pause', () => this.onPlayerPause());
    this.cinemaPlayerB?.addEventListener('timeupdate', () => this.onPlayerTimeUpdate());
    this.cinemaPlayerB?.addEventListener('ended', (e) => this.onPlayerEnded(e));

    this.btnPrevClip?.addEventListener('click', () => this.stepClip(-1));
    this.btnNextClip?.addEventListener('click', () => this.stepClip(1));
    this.btnLoopTimeline?.addEventListener('click', () => {
      this.isTimelineLooping = !this.isTimelineLooping;
      if (this.cinemaPlayer) this.cinemaPlayer.loop = false;
      if (this.cinemaPlayerB) this.cinemaPlayerB.loop = false;
      this.btnLoopTimeline.classList.toggle('active', this.isTimelineLooping);
    });

    this.playbackSpeedBtn?.addEventListener('click', () => {
      const active = this.getActiveVideoDeck();
      if (!active) return;
      const speeds = [1.0, 1.25, 1.5, 2.0, 0.5];
      const cur = active.playbackRate;
      const next = speeds[(speeds.indexOf(cur) + 1) % speeds.length];
      if (this.cinemaPlayer) this.cinemaPlayer.playbackRate = next;
      if (this.cinemaPlayerB) this.cinemaPlayerB.playbackRate = next;
      this.playbackSpeedBtn.textContent = `${next}x`;
    });

    this.btnMute?.addEventListener('click', () => {
      const active = this.getActiveVideoDeck();
      if (!active) return;
      const muted = !active.muted;
      if (this.cinemaPlayer) this.cinemaPlayer.muted = muted;
      if (this.cinemaPlayerB) this.cinemaPlayerB.muted = muted;
      this.btnMute.style.opacity = muted ? '0.4' : '1';
    });

    this.btnFullscreen?.addEventListener('click', () => {
      const active = this.getActiveVideoDeck();
      if (!active) return;
      if (!document.fullscreenElement) {
        active.requestFullscreen().catch(() => {});
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
      const vid = this.getActiveVideoDeck();
      if (vid) {
        vid.currentTime = Math.max(0, vid.currentTime - 1.0);
      }
    });

    this.btnStepFwd?.addEventListener('click', () => {
      const vid = this.getActiveVideoDeck();
      if (vid) {
        const dur = vid.duration || 10;
        vid.currentTime = Math.min(dur, vid.currentTime + 1.0);
      }
    });

    this.masterVolumeSlider?.addEventListener('input', () => {
      const vol = parseFloat(this.masterVolumeSlider.value);
      if (this.cinemaPlayer) this.cinemaPlayer.volume = vol;
      if (this.cinemaPlayerB) this.cinemaPlayerB.volume = vol;
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
      const val = parseInt(this.timelineZoomSlider.value, 10) || 95;
      this.applyTimelineZoom(val);
    });

    this.btnZoomOut?.addEventListener('click', () => {
      this.applyTimelineZoom(this.timelineZoom - 20);
    });

    this.btnZoomIn?.addEventListener('click', () => {
      this.applyTimelineZoom(this.timelineZoom + 20);
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

    // NLE Media Pool Engine
    this.initMediaPool();

    // NLE Color Grading Graph & Real-time Bezier Engine
    this.initColorGrading();

    // Timeline actions
    this.btnImportApprovedClips?.addEventListener('click', () => this.syncStoryboardToMediaPool());
    // Clear Timeline Modal handlers
    this.btnClearTimeline?.addEventListener('click', () => this.openClearTimelineModal());
    this.btnCloseClearTimelineModal?.addEventListener('click', () => this.closeClearTimelineModal());
    this.btnCancelClearTimeline?.addEventListener('click', () => this.closeClearTimelineModal());
    this.btnConfirmClearTimeline?.addEventListener('click', () => this.confirmClearTimeline());
    this.modalClearTimelineConfirm?.addEventListener('click', (e) => {
      if (e.target === this.modalClearTimelineConfirm) this.closeClearTimelineModal();
    });

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
    this.uploadRestyleFrameInput?.addEventListener('change', () => this.handleUploadRestyleFrame());

    this.btnKfUploadRestyle?.addEventListener('click', () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (shot && this.uploadRestyleFrameInput) {
        this.activeRestyleShotId = shot.id;
        this.activeRestyleTargetFrame = this.activeLightboxTargetFrame || 'start';
        this.uploadRestyleFrameInput.click();
      }
    });

    this.btnKfChainPrevRestyle?.addEventListener('click', async () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (!shot) return;
      await this.chainPrevRestyle(shot.id, this.activeLightboxTargetFrame || 'start');
    });

    this.btnLightboxUploadRestyle?.addEventListener('click', () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (shot && this.uploadRestyleFrameInput) {
        this.activeRestyleShotId = shot.id;
        this.activeRestyleTargetFrame = this.activeLightboxTargetFrame || 'start';
        this.uploadRestyleFrameInput.click();
      }
    });

    this.btnLightboxChainPrevRestyle?.addEventListener('click', async () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (!shot) return;
      await this.chainPrevRestyle(shot.id, this.activeLightboxTargetFrame || 'start');
    });

    this.btnCompareUploadRestyle?.addEventListener('click', () => {
      const shots = this.project.storyboard || [];
      const shot = shots[this.activeLightboxShotIndex];
      if (shot && this.uploadRestyleFrameInput) {
        this.activeRestyleShotId = shot.id;
        this.activeRestyleTargetFrame = this.activeLightboxTargetFrame || 'start';
        this.uploadRestyleFrameInput.click();
      }
    });

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

      // Populate High Level Context on UI initialization
      const hlc = (this.project.highLevelContext || this.project.ingestedVideo?.highLevelContext || this.project.ingestedVideo?.analysisSummary || '').trim();
      if (this.highLevelContextInput && hlc) {
        this.highLevelContextInput.value = hlc;
        if (this.hlcStatusBadge) {
          this.hlcStatusBadge.className = 'hlc-badge badge-ready';
          this.hlcStatusBadge.textContent = 'Derived & Active';
        }
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
      this.renderMediaPool();
      this.renderTimeline();

      if (this.project.timeline && this.project.timeline.length > 0) {
        const visualClips = this.getVisualTimelineClips();
        if (visualClips.length > 0) {
          const rawIdx = this.project.timeline.indexOf(visualClips[0]);
          this.cueTimelineClip(rawIdx !== -1 ? rawIdx : 0, false);
        } else {
          this.cueTimelineClip(0, false);
        }
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
    } else if (workspace === 'timeline') {
      this.renderMediaPool();
      this.renderTimeline();
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
    this.ingestBannerText.textContent = 'Running End-to-End analysis across Spatial Previs & True Color videos to derive High Level Context...';

    const userDescription = this.userVideoDescInput ? this.userVideoDescInput.value.trim() : '';

    try {
      const res = await fetch('/api/storyboard/analyze-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: this.project.ingestedVideo.filePath,
          colorVideoPath: this.project.companionVideo.filePath,
          userDescription
        })
      });
      const data = await res.json();
      if (data.success && data.highLevelContext) {
        this.project.highLevelContext = data.highLevelContext;
        if (!this.project.ingestedVideo) this.project.ingestedVideo = {};
        this.project.ingestedVideo.userDescription = userDescription;
        this.project.ingestedVideo.highLevelContext = data.highLevelContext;
        this.project.ingestedVideo.analysisSummary = data.highLevelContext;
        this.project.ingestedVideo.detectedPacing = data.detectedPacing || 'Cinematic Pace';

        if (this.highLevelContextInput) {
          this.highLevelContextInput.value = data.highLevelContext;
        }
        if (this.hlcStatusBadge) {
          this.hlcStatusBadge.className = 'hlc-badge badge-ready';
          this.hlcStatusBadge.textContent = 'Derived & Active';
        }

        this.renderEndToEndSummary();
        this.ingestBannerText.textContent = '✓ High Level Context derived! You can now Add Shots manually, Mark In/Out, or Run AI Shot Analysis.';
        this.saveProject();
      } else {
        throw new Error(data.error || 'End-to-End context analysis failed');
      }
    } catch (err) {
      alert('Context Analysis error: ' + err.message);
    } finally {
      this.btnAnalyzeVideo.disabled = false;
      this.analyzeSpinner.classList.add('hidden');
    }
  }

  async handleAiShotAnalysis() {
    if (!this.project.ingestedVideo?.filePath) {
      alert('AI Shot Analysis requires at least the Spatial Previs Video to be loaded.');
      return;
    }

    if (this.btnRunAiShotAnalysis) this.btnRunAiShotAnalysis.disabled = true;
    if (this.aiShotSpinner) this.aiShotSpinner.classList.remove('hidden');
    this.ingestStatusBanner.classList.remove('hidden');
    this.ingestBannerText.textContent = 'Running AI Shot Analysis using High Level Context and extraction controls...';

    const userDescription = this.userVideoDescInput ? this.userVideoDescInput.value.trim() : '';
    const highLevelContext = this.highLevelContextInput?.value?.trim() || this.project.highLevelContext || '';

    const extractionOptions = {
      mode: this.extractModeSelect?.value || 'count',
      maxFrames: parseInt(this.extractCountInput?.value || '8', 10),
      interval: parseFloat(this.extractIntervalInput?.value || '3'),
      startTime: this.extractStartInput?.value !== '' ? parseFloat(this.extractStartInput.value) : undefined,
      endTime: this.extractEndInput?.value !== '' ? parseFloat(this.extractEndInput.value) : undefined
    };

    try {
      const res = await fetch('/api/storyboard/ai-shot-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath: this.project.ingestedVideo.filePath,
          colorVideoPath: this.project.companionVideo?.filePath,
          highLevelContext,
          userDescription,
          extractionOptions
        })
      });
      const data = await res.json();
      if (data.success && data.storyboard) {
        this.project.storyboard = data.storyboard;
        if (!this.project.ingestedVideo) this.project.ingestedVideo = {};
        this.project.ingestedVideo.analysisSummary = data.analysisSummary || highLevelContext;
        this.project.ingestedVideo.detectedPacing = data.detectedPacing || 'Cinematic Pace';
        this.renderEndToEndSummary();
        this.renderStoryboard();
        this.ingestBannerText.textContent = `✓ AI Shot Analysis complete: ${data.storyboard.length} shots deconstructed with spatial continuity and Start/End frames!`;
        this.saveProject();
      } else {
        throw new Error(data.error || 'AI Shot Analysis failed');
      }
    } catch (err) {
      alert('AI Shot Analysis error: ' + err.message);
    } finally {
      if (this.btnRunAiShotAnalysis) this.btnRunAiShotAnalysis.disabled = false;
      if (this.aiShotSpinner) this.aiShotSpinner.classList.add('hidden');
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

  async uploadRestyleImageFile(shotId, targetFrame, file) {
    if (!file || !shotId) return;

    const formData = new FormData();
    formData.append('restyleFrame', file);
    formData.append('targetFrame', targetFrame || 'start');

    try {
      const res = await fetch(`/api/storyboard/${shotId}/upload-restyle-frame`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const text = await res.text();
        let errMsg = `Server returned ${res.status}`;
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch (_) {
          if (res.status === 404) {
            errMsg = 'Route not found (404). Please restart your PointBlank node server to load the new backend routes.';
          } else {
            errMsg = text.replace(/<[^>]*>/g, '').trim() || errMsg;
          }
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data.success && data.shot) {
        const shotIndex = (this.project.storyboard || []).findIndex((s) => s.id === shotId);
        if (shotIndex !== -1) {
          Object.assign(this.project.storyboard[shotIndex], data.shot);
          this.renderStoryboard();
          this.saveProject();
          if (this.keyframeLightboxModal && !this.keyframeLightboxModal.classList.contains('hidden')) {
            this.updateKeyframeLightboxUi();
          }
        }
      } else {
        throw new Error(data.error || 'Failed to upload restyled keyframe');
      }
    } catch (err) {
      alert('Restyle image upload error: ' + err.message);
    }
  }

  async handleUploadRestyleFrame() {
    const file = this.uploadRestyleFrameInput?.files?.[0];
    if (!file || !this.activeRestyleShotId) return;

    try {
      await this.uploadRestyleImageFile(this.activeRestyleShotId, this.activeRestyleTargetFrame || 'start', file);
    } finally {
      if (this.uploadRestyleFrameInput) this.uploadRestyleFrameInput.value = '';
      this.activeRestyleShotId = null;
    }
  }

  async chainPrevRestyle(shotId, targetFrame = 'start') {
    try {
      const res = await fetch(`/api/storyboard/${shotId}/chain-prev-restyle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetFrame })
      });
      if (!res.ok) {
        const text = await res.text();
        let errMsg = `Server returned ${res.status}`;
        try {
          const parsed = JSON.parse(text);
          errMsg = parsed.error || errMsg;
        } catch (_) {
          if (res.status === 404) {
            errMsg = 'Route not found (404). Please restart your PointBlank node server to load the new backend routes.';
          } else {
            errMsg = text.replace(/<[^>]*>/g, '').trim() || errMsg;
          }
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (data.success && data.shot) {
        const shotIndex = (this.project.storyboard || []).findIndex((s) => s.id === shotId);
        if (shotIndex !== -1) {
          Object.assign(this.project.storyboard[shotIndex], data.shot);
          this.renderStoryboard();
          this.saveProject();
          if (this.keyframeLightboxModal && !this.keyframeLightboxModal.classList.contains('hidden')) {
            this.updateKeyframeLightboxUi();
          }
        }
      } else {
        throw new Error(data.error || 'Failed to chain previous shot End Frame');
      }
    } catch (err) {
      alert('Chain previous end frame error: ' + err.message);
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
    const layers = isEnd ? (shot.endLayers || []) : (shot.layers || []);
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
              <img src="${(isEnd ? shot.endFlattenedMarkupUrl : shot.startFlattenedMarkupUrl) || spatialUrl}" alt="${label} Spatial Frame">
            ` : `
              <div class="empty-thumb-placeholder">
                <span style="font-size:1.1rem;">📐</span>
                <span>No Spatial Previs</span>
              </div>
            `}
            ${spatialUrl ? `<span class="thumb-zoom-badge" title="Click to view large">🔍 View</span>` : ''}
            ${spatialUrl ? `
              <button type="button" class="btn-grease-pen ${((isEnd ? shot.endMarkupUrl : shot.startMarkupUrl) ? 'has-markup' : '')}" data-action="open-grease-pen" data-shot-id="${shot.id}" data-target-frame="${targetFrame}" title="Draw director notes & motion arrows on Spatial Previs">
                <span>✏️</span>${(isEnd ? shot.endMarkupUrl : shot.startMarkupUrl) ? '<span class="gp-tag">MARKUP</span>' : ''}
              </button>
            ` : ''}
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
              <div class="thumb-hover-actions">
                ${(!isEnd && index > 0) ? `<button type="button" class="btn-xs btn-secondary btn-chain-restyle" data-action="chain-prev-restyle" data-target-frame="${targetFrame}" title="Chain End Frame of Shot #${index}">🔗 Prev End</button>` : ''}
                <button type="button" class="btn-xs btn-secondary btn-upload-restyle" data-action="upload-restyle" data-target-frame="${targetFrame}" title="Upload custom image for ${label} Restyle">📷 Replace</button>
                <button type="button" class="btn-xs btn-danger btn-clear-restyle" data-action="clear-restyle" data-target-frame="${targetFrame}" title="Clear restyled keyframe">✕</button>
              </div>
            ` : `
              <div class="empty-stage-content">
                <span style="font-size:1.1rem;">✨</span>
                <span style="font-size:0.62rem; color:var(--text-dim);">No Restyle</span>
                <div class="empty-stage-btn-group">
                  ${(!isEnd && index > 0) ? `<button type="button" class="btn-xs btn-secondary btn-chain-restyle" data-action="chain-prev-restyle" data-target-frame="${targetFrame}" title="Use End Frame of Shot #${index}">🔗 Prev End</button>` : ''}
                  <button type="button" class="btn-xs btn-secondary btn-upload-restyle" data-action="upload-restyle" data-target-frame="${targetFrame}" title="Upload custom image for ${label}">📤 Upload</button>
                </div>
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
              <button class="btn btn-secondary btn-xs" data-action="send-tl" title="${hasOutput ? 'Send active video take to media pool' : 'Send animatic keyframe to media pool'}">
                ➕ Media Pool
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
            <button class="btn btn-enhance-markup" data-action="enhance-markup" title="Ingest existing description and analyze Start & End Spatial Previs with director draw-over markup to generate a unified, choreographed prompt">
              <span class="btn-spinner hidden"></span>
              <span>⚡ ENHANCE WITH SPATIAL PREVIZ MARKUP</span>
            </button>
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
              <div class="video-audio-mode-wrap" title="Animation Audio Synthesis Mode: Select whether to generate sound effects only, full score, or mute audio">
                <select class="video-audio-mode-select" data-action="set-audio-mode" title="Animation Audio Mode">
                  <option value="sfx_only" ${(!shot.audioMode || shot.audioMode === 'sfx_only') ? 'selected' : ''}>💥 SFX Only (No Music)</option>
                  <option value="full_audio" ${shot.audioMode === 'full_audio' ? 'selected' : ''}>🎵 SFX + Music</option>
                  <option value="mute" ${shot.audioMode === 'mute' ? 'selected' : ''}>🔇 Mute (Video Only)</option>
                </select>
              </div>
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
              <div style="display:flex; gap:6px;">
                <button class="btn-link-xs" data-action="auto-assign-refs" data-shot-id="${shot.id}" title="Auto-detect matching Characters, Props, and Places for this shot" style="color:var(--accent-cyan); font-weight:700;">⚡ Auto</button>
                <button class="btn-link-xs" data-action="assign-refs" title="Tag Characters, Props, and Places for consistency">Assign</button>
              </div>
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

      // Wire auto-assign reference button
      card.querySelectorAll('[data-action="auto-assign-refs"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.autoDetectShotReferences(shot);
        });
      });

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

      const audioModeSelect = card.querySelector('.video-audio-mode-select');
      if (audioModeSelect) {
        audioModeSelect.addEventListener('change', async () => {
          shot.audioMode = audioModeSelect.value;
          this.saveProject();
          try {
            await fetch(`/api/storyboard/${shot.id}/audio-mode`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioMode: shot.audioMode })
            });
          } catch (err) {
            console.warn('Failed to save shot audio mode:', err);
          }
        });
      }

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
      // Upload / Replace Restyled Keyframe
      card.querySelectorAll('[data-action="upload-restyle"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.activeRestyleShotId = shot.id;
          this.activeRestyleTargetFrame = btn.dataset.targetFrame || 'start';
          this.uploadRestyleFrameInput?.click();
        });
      });

      // Clear Restyled Keyframe
      card.querySelectorAll('[data-action="clear-restyle"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const targetFrame = btn.dataset.targetFrame || 'start';
          if (!confirm(`Clear restyled ${targetFrame.toUpperCase()} frame for Shot #${shot.shotNumber || index + 1}?`)) return;
          try {
            const res = await fetch(`/api/storyboard/${shot.id}/restyle-frame?targetFrame=${targetFrame}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success && data.shot) {
              Object.assign(shot, data.shot);
              this.renderStoryboard();
              this.saveProject();
            }
          } catch (err) {
            console.warn('Failed to delete restyle frame:', err);
          }
        });
      });

      // Chain / Use Previous Shot End Frame as Restyle
      card.querySelectorAll('[data-action="chain-prev-restyle"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const targetFrame = btn.dataset.targetFrame || 'start';
          btn.disabled = true;
          const origHtml = btn.innerHTML;
          btn.innerHTML = `<span class="btn-spinner"></span>`;
          try {
            await this.chainPrevRestyle(shot.id, targetFrame);
          } finally {
            btn.disabled = false;
            btn.innerHTML = origHtml;
          }
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

      // Open Grease Pen Modal
      card.querySelectorAll('[data-action="open-grease-pen"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetFrame = btn.dataset.targetFrame || 'start';
          this.openGreasePenModal(shot, targetFrame);
        });
      });

      // Enhance with Spatial Previz Markup
      card.querySelectorAll('[data-action="enhance-markup"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleEnhanceWithMarkup(shot, btn, descInput, motionSelect);
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
            } else {
              this.activeRestyleShotId = shot.id;
              this.activeRestyleTargetFrame = targetFrame;
              this.uploadRestyleFrameInput?.click();
            }
          }
        });
      });

      // Drag and drop image upload for Restyle thumb boxes
      card.querySelectorAll('.visual-thumb-box[data-stage="restyle"]').forEach(box => {
        const targetFrame = box.dataset.targetFrame || 'start';
        box.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          box.classList.add('drag-over-slot');
        });
        box.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          box.classList.remove('drag-over-slot');
        });
        box.addEventListener('drop', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          box.classList.remove('drag-over-slot');
          const file = e.dataTransfer?.files?.[0];
          if (file && file.type.startsWith('image/')) {
            await this.uploadRestyleImageFile(shot.id, targetFrame, file);
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

      // Send to Media Pool
      card.querySelectorAll('[data-action="send-tl"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.addShotToMediaPool(shot);
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
          audioMode: shot.audioMode || 'sfx_only',
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

  // --- Cyber Toast Notifications ---
  showToast(msg) {
    let toast = document.getElementById('pb-toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pb-toast-notification';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(14, 20, 32, 0.95);
        border: 1px solid var(--accent-cyan);
        color: #fff;
        padding: 9px 16px;
        border-radius: 6px;
        font-family: var(--font-heading);
        font-size: 0.78rem;
        font-weight: 700;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7), 0 0 12px rgba(6, 182, 212, 0.4);
        z-index: 99999;
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        opacity: 0;
        transform: translateY(10px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 2800);
  }

  // =========================================================================
  // MEDIA POOL ENGINE (Video, Image, Audio)
  // =========================================================================

  initMediaPool() {
    this.project.mediaPool = this.project.mediaPool || [];

    // Import Button
    this.btnMediaPoolImport?.addEventListener('click', () => {
      this.mediaPoolFileInput?.click();
    });

    this.mediaPoolFileInput?.addEventListener('change', () => {
      if (this.mediaPoolFileInput.files && this.mediaPoolFileInput.files.length > 0) {
        this.handleMediaPoolUpload(this.mediaPoolFileInput.files);
        this.mediaPoolFileInput.value = '';
      }
    });

    // Sync Storyboard Button
    this.btnMediaPoolSyncSb?.addEventListener('click', () => {
      this.syncStoryboardToMediaPool();
    });

    // Search filter
    this.mediaPoolSearch?.addEventListener('input', () => {
      this.renderMediaPool();
    });

    // Filter Chips
    const chips = document.querySelectorAll('.mp-filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.mediaPoolFilter = chip.dataset.filter || 'all';
        this.renderMediaPool();
      });
    });

    // OS Drag-and-Drop files onto Media Pool container
    if (this.mediaPoolItemsContainer) {
      this.mediaPoolItemsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.mediaPoolItemsContainer.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'copy';
      });
      this.mediaPoolItemsContainer.addEventListener('dragleave', () => {
        this.mediaPoolItemsContainer.classList.remove('drag-over');
      });
      this.mediaPoolItemsContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        this.mediaPoolItemsContainer.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleMediaPoolUpload(e.dataTransfer.files);
        }
      });
    }

    // Drag-and-Drop from Media Pool items onto Timeline Track Lanes
    const setupTrackDrop = (laneEl, trackId, allowedTypes) => {
      if (!laneEl) return;
      laneEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        laneEl.classList.add('dragover');
        e.dataTransfer.dropEffect = 'copy';
      });
      laneEl.addEventListener('dragleave', () => {
        laneEl.classList.remove('dragover');
      });
      laneEl.addEventListener('drop', (e) => {
        e.preventDefault();
        laneEl.classList.remove('dragover');
        const jsonStr = e.dataTransfer.getData('application/json');
        if (jsonStr) {
          try {
            const item = JSON.parse(jsonStr);
            if (!allowedTypes.includes(item.type)) {
              this.showToast(`Cannot drop ${item.type.toUpperCase()} on track ${trackId.toUpperCase()}`);
              return;
            }
            this.addMediaPoolItemToTimeline(item, trackId);
          } catch (err) {
            console.warn('Track drop parse error:', err);
          }
        }
      });
    };

    setupTrackDrop(this.timelineTrackV2, 'v2', ['video', 'image']);
    setupTrackDrop(this.timelineTrackV1, 'v1', ['video', 'image']);
    setupTrackDrop(this.timelineAudioLaneA1, 'a1', ['audio']);
    setupTrackDrop(this.timelineAudioLaneA2, 'a2', ['audio']);

    this.renderMediaPool();
  }

  renderMediaPool() {
    if (!this.mediaPoolItemsContainer) return;
    const pool = this.project.mediaPool || [];

    if (this.mediaPoolCountBadge) {
      this.mediaPoolCountBadge.textContent = `${pool.length} Item${pool.length === 1 ? '' : 's'}`;
    }

    const filter = this.mediaPoolFilter || 'all';
    const query = (this.mediaPoolSearch?.value || '').trim().toLowerCase();

    let filtered = pool.filter(item => {
      if (filter !== 'all' && item.type !== filter) return false;
      if (query && !item.name.toLowerCase().includes(query)) return false;
      return true;
    });

    this.mediaPoolItemsContainer.innerHTML = '';

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'mp-empty-state';
      emptyDiv.innerHTML = `
        <span style="font-size:1.6rem; opacity:0.6;">📂</span>
        <p style="margin:0; font-weight:600;">Media Pool is empty</p>
        <span style="font-size:0.68rem; color:var(--text-dim); line-height:1.4;">
          Drag & drop video, image, or audio files here,<br>or click "+ Import" or "⚡ Sync SB"!
        </span>
      `;
      this.mediaPoolItemsContainer.appendChild(emptyDiv);
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'mp-item-card';
      card.draggable = true;
      card.dataset.id = item.id;
      card.dataset.type = item.type;

      let thumbHtml = '';
      if (item.type === 'video') {
        thumbHtml = `
          <div class="mp-item-thumb">
            ${item.thumbnailUrl ? `<img src="${item.thumbnailUrl}" alt="${this.escapeHtml(item.name)}">` : `<div style="font-size:1rem;">🎬</div>`}
            <span class="mp-item-thumb-video-icon">▶</span>
          </div>
        `;
      } else if (item.type === 'image') {
        thumbHtml = `
          <div class="mp-item-thumb">
            <img src="${item.url || item.thumbnailUrl}" alt="${this.escapeHtml(item.name)}">
          </div>
        `;
      } else {
        thumbHtml = `
          <div class="mp-item-thumb mp-item-thumb-audio">
            <span>🎵</span>
          </div>
        `;
      }

      const durStr = item.duration ? `${Number(item.duration).toFixed(1)}s` : (item.type === 'image' ? 'Still' : '');

      card.innerHTML = `
        ${thumbHtml}
        <div class="mp-item-info">
          <span class="mp-item-name" title="${this.escapeHtml(item.name)}">${this.escapeHtml(item.name)}</span>
          <div class="mp-item-meta">
            <span class="mp-type-badge ${item.type}">${item.type}</span>
            ${durStr ? `<span class="mp-item-dur">${durStr}</span>` : ''}
          </div>
        </div>
        <div class="mp-item-actions">
          <button class="mp-action-btn add-btn" title="Add to timeline sequence" data-action="add-tl">➕</button>
          <button class="mp-action-btn preview-btn" title="Preview in monitor" data-action="preview">▶</button>
          <button class="mp-action-btn del-btn" title="Remove from media pool" data-action="delete">🗑️</button>
        </div>
      `;

      // Drag start: pass item payload
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('application/json', JSON.stringify(item));
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'copyMove';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      // Quick action: Add to Timeline
      card.querySelector('[data-action="add-tl"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addMediaPoolItemToTimeline(item);
      });

      // Quick action: Preview in Monitor
      card.querySelector('[data-action="preview"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.previewMediaPoolItem(item);
      });

      // Quick action: Delete from pool
      card.querySelector('[data-action="delete"]')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.deleteMediaPoolItem(item.id);
      });

      // Double-click: Add to Timeline
      card.addEventListener('dblclick', () => {
        this.addMediaPoolItemToTimeline(item);
      });

      this.mediaPoolItemsContainer.appendChild(card);
    });
  }

  async handleMediaPoolUpload(files) {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      this.showToast('Uploading media to Media Pool...');
      const res = await fetch('/api/media-pool/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        this.project.mediaPool = data.mediaPool;
        this.renderMediaPool();
        this.showToast(`Imported ${data.items.length} item${data.items.length === 1 ? '' : 's'} into Media Pool!`);
      } else {
        alert(data.error || 'Failed to upload media.');
      }
    } catch (err) {
      alert('Error uploading to media pool: ' + err.message);
    }
  }

  async deleteMediaPoolItem(id) {
    try {
      const res = await fetch(`/api/media-pool/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        this.project.mediaPool = data.mediaPool;
        this.renderMediaPool();
        this.showToast('Item removed from Media Pool');
      }
    } catch (err) {
      alert('Error removing item: ' + err.message);
    }
  }

  previewMediaPoolItem(item) {
    if (!item || !item.url) return;
    if (this.overlayClipTitle) this.overlayClipTitle.textContent = item.name;
    if (this.overlayModelBadge) this.overlayModelBadge.textContent = `${item.type.toUpperCase()} Preview`;

    if (item.type === 'image') {
      if (this.cinemaPlayer) this.cinemaPlayer.style.display = 'none';
      if (this.cinemaImagePlayer) {
        this.cinemaImagePlayer.style.display = 'block';
        this.cinemaImagePlayer.style.opacity = '1';
        this.cinemaImagePlayer.src = item.url;
      }
    } else {
      if (this.cinemaImagePlayer) this.cinemaImagePlayer.style.display = 'none';
      if (this.cinemaPlayer) {
        this.cinemaPlayer.style.display = 'block';
        this.cinemaPlayer.src = item.url;
        this.cinemaPlayer.currentTime = 0;
        this.cinemaPlayer.play().catch(() => {});
      }
    }
    this.onPlayerPlay();
    this.showToast(`Previewing "${item.name}"`);
  }

  // Add individual shot's media to Media Pool
  addShotToMediaPool(shot) {
    this.project.mediaPool = this.project.mediaPool || [];
    let addedCount = 0;

    // 1. Video Take
    if (shot.generatedClip && shot.generatedClip.url) {
      const exists = this.project.mediaPool.some(m => m.url === shot.generatedClip.url);
      if (!exists) {
        this.project.mediaPool.push({
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

    // 2. Styled Keyframe / Still
    const imgUrl = shot.styledKeyframeUrl || shot.keyframeUrl;
    if (imgUrl) {
      const exists = this.project.mediaPool.some(m => m.url === imgUrl);
      if (!exists) {
        this.project.mediaPool.push({
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

    // 3. Audio stems
    if (Array.isArray(shot.audioTracks)) {
      shot.audioTracks.forEach(track => {
        if (track && track.url) {
          const exists = this.project.mediaPool.some(m => m.url === track.url);
          if (!exists) {
            this.project.mediaPool.push({
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

    this.renderMediaPool();
    this.saveProject();
    this.showToast(`Added to Media Pool (${addedCount} new item${addedCount === 1 ? '' : 's'})`);
  }

  // Sync all approved Storyboard shots into Media Pool
  async syncStoryboardToMediaPool() {
    try {
      const res = await fetch('/api/media-pool/sync-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        this.project.mediaPool = data.mediaPool;
        this.renderMediaPool();
        this.showToast(`Synced ${data.addedCount} new item${data.addedCount === 1 ? '' : 's'} into Media Pool!`);
      } else {
        alert(data.error || 'Failed to sync storyboard shots.');
      }
    } catch (err) {
      alert('Error syncing storyboard to media pool: ' + err.message);
    }
  }

  // Compatibility bridge: Storyboard items flow through Media Pool
  addShotToTimeline(shot) {
    this.addShotToMediaPool(shot);
  }

  populateApprovedToTimeline() {
    this.syncStoryboardToMediaPool();
  }

  // Add media pool item directly to a designated timeline track
  addMediaPoolItemToTimeline(item, targetTrack) {
    const track = targetTrack || (item.type === 'audio' ? 'a1' : 'v1');
    const dur = Math.max(0.5, Number(item.duration || 4.0));
    const isImage = item.type === 'image';

    const newClip = {
      timelineId: `tl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      mediaPoolId: item.id,
      track: track,
      type: item.type,
      title: item.name,
      filename: item.filename || '',
      filePath: item.filePath || '',
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || (isImage ? item.url : ''),
      duration: dur,
      trimStart: 0,
      trimEnd: dur,
      effectiveDuration: dur,
      isAnimatic: isImage,
      model: item.model || (isImage ? 'Still Image' : (item.type === 'audio' ? 'Audio Stem' : 'Video Clip')),
      audioTracks: item.type === 'audio' ? [{ url: item.url, type: 'stem', duration: dur }] : []
    };

    this.project.timeline = this.project.timeline || [];
    this.project.timeline.push(newClip);
    this.renderTimeline();
    this.saveProject();
    this.showToast(`Placed "${item.name}" on ${track.toUpperCase()}!`);
  }

  openClearTimelineModal() {
    if (!this.project.timeline || this.project.timeline.length === 0) {
      this.showToast('Timeline is already empty.');
      return;
    }
    this.modalClearTimelineConfirm?.classList.remove('hidden');
  }

  closeClearTimelineModal() {
    this.modalClearTimelineConfirm?.classList.add('hidden');
  }

  confirmClearTimeline() {
    this.closeClearTimelineModal();

    this.project.timeline = [];
    this.project.timelineTransitions = [];
    this.selectedTimelineClipId = null;
    this.currentTimelineIndex = 0;
    this.isPlayingTimeline = false;
    this.isCrossfading = false;
    this.activeDeck = 'a';

    this.stopAnimaticPlayback();

    if (this.audioTrackPlayerA1) {
      this.audioTrackPlayerA1.pause();
      this.audioTrackPlayerA1.removeAttribute('src');
    }
    if (this.audioTrackPlayerA2) {
      this.audioTrackPlayerA2.pause();
      this.audioTrackPlayerA2.removeAttribute('src');
    }

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
    this.showToast('Sequence timeline cleared!');
  }

  clearTimeline() {
    this.openClearTimelineModal();
  }

  // --- Professional Multi-Track NLE Timeline Assembly ---
  renderTimeline() {
    const v1Track = this.timelineTrackV1 || this.timelineTrack;
    const v2Track = this.timelineTrackV2 || document.getElementById('timeline-track-v2');
    const a1Track = this.timelineAudioLaneA1 || this.timelineAudioLane;
    const a2Track = this.timelineAudioLaneA2 || document.getElementById('timeline-track-a2');

    if (!v1Track) return;
    if (v2Track) v2Track.innerHTML = '';
    v1Track.innerHTML = '';
    if (a1Track) a1Track.innerHTML = '';
    if (a2Track) a2Track.innerHTML = '';
    if (this.timelineRuler) this.timelineRuler.innerHTML = '';

    const tl = this.project.timeline || [];
    if (this.timelineClipCount) {
      this.timelineClipCount.textContent = `${tl.length} Clip${tl.length === 1 ? '' : 's'}`;
    }
    if (this.timelineCountBadge) {
      this.timelineCountBadge.textContent = `${tl.length} Clips`;
    }

    if (tl.length === 0) {
      if (this.emptyTimelineState) v1Track.appendChild(this.emptyTimelineState);
      if (this.timelineTotalDuration) this.timelineTotalDuration.textContent = '00:00.0';
      if (this.timecodeDisplay) this.timecodeDisplay.textContent = '00:00:00:00 / 00:00:00:00';
      if (this.timelinePlayhead) this.timelinePlayhead.style.left = '10px';
      if (this.inspectorSelectedContent) this.inspectorSelectedContent.classList.add('hidden');
      if (this.inspectorEmptyState) this.inspectorEmptyState.classList.remove('hidden');
      if (this.inspectorClipTitle) this.inspectorClipTitle.textContent = 'No Clip Selected';
      this.renderRulerTicks(15);
      const wrapperWidth = this.timelineTrackWrapper?.clientWidth || 1600;
      this.renderColorGradeGraph(15, wrapperWidth);
      this.applyColorGrading(0);
      return;
    }

    // Separate clips by track
    const tracks = {
      v2: tl.filter(c => c.track === 'v2'),
      v1: tl.filter(c => c.track === 'v1' || !c.track),
      a1: tl.filter(c => c.track === 'a1'),
      a2: tl.filter(c => c.track === 'a2')
    };

    // Calculate track positions and runtimes
    let maxRuntime = 0.1;
    let visualTrackDuration = 0;

    // 1. Visual Sequence (V1)
    let v1TrackAccum = 0;
    tracks.v1.forEach((clip) => {
      const dur = Math.max(0.1, (clip.trimEnd || clip.duration) - (clip.trimStart || 0));
      clip.effectiveDuration = dur;
      clip.trackStart = v1TrackAccum;
      clip.globalStart = v1TrackAccum;
      v1TrackAccum += dur;
    });
    visualTrackDuration = v1TrackAccum;
    if (v1TrackAccum > maxRuntime) maxRuntime = v1TrackAccum;

    // 2. Overlay Track (V2)
    let v2TrackAccum = 0;
    tracks.v2.forEach((clip) => {
      const dur = Math.max(0.1, (clip.trimEnd || clip.duration) - (clip.trimStart || 0));
      clip.effectiveDuration = dur;
      clip.trackStart = v2TrackAccum;
      clip.globalStart = v2TrackAccum;
      v2TrackAccum += dur;
    });
    if (v2TrackAccum > visualTrackDuration) visualTrackDuration = v2TrackAccum;
    if (v2TrackAccum > maxRuntime) maxRuntime = v2TrackAccum;

    // 3. Audio Tracks (A1, A2)
    ['a1', 'a2'].forEach(tKey => {
      let accum = 0;
      tracks[tKey].forEach(clip => {
        const dur = Math.max(0.1, (clip.trimEnd || clip.duration) - (clip.trimStart || 0));
        clip.effectiveDuration = dur;
        clip.trackStart = accum;
        clip.globalStart = accum;
        accum += dur;
      });
      if (accum > maxRuntime) maxRuntime = accum;
    });

    const totalDuration = Math.max(0.1, maxRuntime);

    // Helper to render clip card into a track lane
    const renderClipCard = (clip, index, trackLane, trackType) => {
      const dur = clip.effectiveDuration || 4.0;
      const widthPx = Math.max(60, Math.round(dur * this.timelineZoom));
      const isSelected = this.selectedTimelineClipId === clip.timelineId;
      const isImage = clip.isAnimatic || clip.type === 'image';

      const el = document.createElement('div');
      el.className = `nle-clip-${trackType} ${isSelected ? 'active' : ''} ${isImage ? 'nle-clip-image' : ''}`;
      el.dataset.id = clip.timelineId;
      el.dataset.track = trackType;
      el.style.width = `${widthPx}px`;

      if (trackType.startsWith('v')) {
        // Video / Image clip card
        const thumbUrl = clip.thumbnailUrl || clip.url || '';
        el.innerHTML = `
          <div class="nle-clip-filmstrip-thumb">
            ${thumbUrl ? `<img src="${thumbUrl}" alt="Filmstrip" loading="lazy">` : ''}
          </div>
          <div class="clip-item-header">
            <span class="clip-item-title">${isImage ? '🖼️ ' : ''}${this.escapeHtml(clip.title || `Clip ${index + 1}`)}</span>
            <span class="clip-duration-chip">${dur.toFixed(1)}s</span>
          </div>
          <div class="trim-handle trim-left" data-action="trim-left" title="Drag to adjust In-Point"></div>
          <div class="trim-handle trim-right" data-action="trim-right" title="Drag to adjust Out-Point"></div>
        `;
      } else {
        // Audio clip card with time-anchored canvas waveform
        el.innerHTML = `
          <div class="clip-item-header">
            <span class="clip-item-title">${trackType === 'a1' ? '🎙️ ' : '🎵 '}${this.escapeHtml(clip.title || 'Audio Stem')}</span>
            <span class="clip-duration-chip">${dur.toFixed(1)}s</span>
          </div>
          <canvas class="nle-audio-waveform-canvas" width="${widthPx}" height="24"></canvas>
          <div class="trim-handle trim-left" data-action="trim-left" title="Drag to adjust In-Point"></div>
          <div class="trim-handle trim-right" data-action="trim-right" title="Drag to adjust Out-Point"></div>
        `;
        const canvas = el.querySelector('.nle-audio-waveform-canvas');
        if (canvas) {
          this.drawTimeAnchoredWaveform(canvas, clip, dur, widthPx, trackType);
        }
      }

      el.addEventListener('click', (e) => {
        if (!e.target.classList.contains('trim-handle')) {
          this.selectTimelineClip(clip);
        }
      });

      this.setupClipTrimDrag(el, clip);
      trackLane.appendChild(el);
    };

    // Render each track lane
    if (v2Track) tracks.v2.forEach((c, i) => renderClipCard(c, i, v2Track, 'v2'));
    tracks.v1.forEach((c, i) => renderClipCard(c, i, v1Track, 'v1'));

    // Render Transition Nodes on Track V1 between adjacent visual clips
    if (tracks.v1.length > 1) {
      const transList = this.project.timelineTransitions || [];
      for (let i = 0; i < tracks.v1.length - 1; i++) {
        const clipA = tracks.v1[i];
        const seamTime = (clipA.trackStart || 0) + (clipA.effectiveDuration || 4);
        const seamPx = Math.round(seamTime * this.timelineZoom);
        const trans = transList[i] || { type: 'cut', duration: 0 };
        const isCut = trans.type === 'cut' || !trans.duration;

        const node = document.createElement('div');
        node.className = 'timeline-transition-node';
        node.style.left = `${seamPx}px`;
        node.style.top = '50%';

        const icon = this.getTransitionIcon(trans.type);
        const label = this.getTransitionLabel(trans.type);
        const dur = Number(trans.duration || 0).toFixed(1);

        node.innerHTML = `
          <button class="transition-pill ${!isCut ? 'has-transition' : 'is-cut'}" 
                  title="${isCut ? 'Direct Cut (Click to change transition)' : `Transition: ${label} (${dur}s)`}"
                  data-trans-index="${i}">
            <span class="trans-icon">${icon}</span>
            <span class="trans-name">${isCut ? 'Cut' : label}</span>
            ${!isCut ? `<span class="trans-dur">${dur}s</span>` : ''}
          </button>
        `;

        const btn = node.querySelector('.transition-pill');
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openTransitionModal(i, trans);
        });

        v1Track.appendChild(node);
      }
    }

    if (a1Track) tracks.a1.forEach((c, i) => renderClipCard(c, i, a1Track, 'a1'));
    if (a2Track) tracks.a2.forEach((c, i) => renderClipCard(c, i, a2Track, 'a2'));

    // Visual Sequence End Marker on audio tracks if audio extends beyond visual edit
    if (visualTrackDuration > 0 && maxRuntime > visualTrackDuration + 0.3) {
      const markerPx = Math.round(visualTrackDuration * this.timelineZoom);
      const marker = document.createElement('div');
      marker.className = 'nle-sequence-end-marker';
      marker.style.left = `${markerPx}px`;
      marker.title = `Visual Sequence End (${visualTrackDuration.toFixed(1)}s)`;
      if (a1Track) a1Track.appendChild(marker.cloneNode(true));
      if (a2Track) a2Track.appendChild(marker);
    }

    // 2. Synchronize track & ruler scrollable widths
    const wrapperWidth = this.timelineTrackWrapper?.clientWidth || 1600;
    const totalWidthPx = Math.max(wrapperWidth, Math.round(totalDuration * this.timelineZoom) + 200);
    const lanesContainer = document.querySelector('.nle-lanes-container');
    if (lanesContainer) lanesContainer.style.width = `${totalWidthPx}px`;
    if (this.timelineRuler) this.timelineRuler.style.width = `${totalWidthPx}px`;

    // 3. Render Ruler Ticks
    this.renderRulerTicks(totalDuration);

    // 4. Update Metrics
    if (this.timelineTotalDuration) {
      this.timelineTotalDuration.textContent = this.formatTime(totalDuration);
    }

    // 5. Update Inspector if clip is active
    if (this.selectedTimelineClipId) {
      const activeClip = tl.find((c) => c.timelineId === this.selectedTimelineClipId);
      if (activeClip) {
        this.selectTimelineClip(activeClip);
      } else {
        this.selectedTimelineClipId = null;
      }
    }

    // 6. Synchronize and Render Color Grading Bezier Graph
    this.renderColorGradeGraph(totalDuration, totalWidthPx);
    this.applyColorGrading(this.getCurrentGlobalTimelineTime());
  }

  drawTimeAnchoredWaveform(canvas, clip, dur, widthPx, trackType) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const h = canvas.height;
    const centerY = h / 2;
    ctx.clearRect(0, 0, widthPx, h);

    const stepPx = 3;
    const barWidth = 2;
    const isA1 = trackType === 'a1';

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (isA1) {
      grad.addColorStop(0, '#34d399');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, '#059669');
    } else {
      grad.addColorStop(0, '#fde68a');
      grad.addColorStop(0.5, '#fbbf24');
      grad.addColorStop(1, '#d97706');
    }
    ctx.fillStyle = grad;

    const trimStart = clip.trimStart || 0;
    const zoom = this.timelineZoom;
    const seed = (clip.timelineId ? clip.timelineId.charCodeAt(clip.timelineId.length - 1) : 42) % 17;

    for (let x = 0; x < widthPx; x += stepPx) {
      // Deterministic multi-frequency harmonic synthesis locked to actual timeline seconds (t)
      // When zooming, these peaks and troughs visibly stretch and expand in exact proportion to the zoom level!
      const t = trimStart + (x / zoom);
      const beat = Math.abs(Math.sin(t * Math.PI * 2.0));
      const phrase = Math.abs(Math.sin(t * Math.PI * 0.35 + seed));
      const mid = Math.abs(Math.sin(t * 11.3 + seed * 1.5));
      const transient = Math.abs(Math.sin(t * 37.7 + seed * 3.1));

      const raw = (beat * 0.45 + mid * 0.25 + transient * 0.15 + 0.1) * (0.55 + phrase * 0.45);
      const amp = Math.min(1.0, Math.max(0.12, raw));
      const barH = Math.max(2, Math.round(amp * (centerY - 1)));

      ctx.fillRect(x, centerY - barH, barWidth, barH * 2);
    }
  }

  applyTimelineZoom(newZoom, resetScroll = false) {
    const clampedZoom = Math.max(40, Math.min(220, Math.round(newZoom)));
    const curTime = this.getCurrentGlobalTimelineTime();
    const wrapper = this.timelineTrackWrapper;

    const oldPlayheadPx = Math.round(curTime * this.timelineZoom);
    const viewportOffset = wrapper ? (oldPlayheadPx - wrapper.scrollLeft) : 0;

    this.timelineZoom = clampedZoom;
    if (this.timelineZoomSlider) this.timelineZoomSlider.value = clampedZoom;

    this.renderTimeline();
    this.updatePlayheadUi(curTime);

    if (wrapper) {
      if (resetScroll) {
        wrapper.scrollLeft = 0;
      } else {
        const newPlayheadPx = Math.round(curTime * clampedZoom);
        wrapper.scrollLeft = Math.max(0, newPlayheadPx - viewportOffset);
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

    // Fit to primary visual edit runtime if visual clips exist, otherwise total duration
    const visualClips = this.getVisualTimelineClips();
    let fitDur = 0;
    if (visualClips.length > 0) {
      visualClips.forEach(c => {
        const start = c.globalStart !== undefined ? c.globalStart : (c.trackStart || 0);
        const dur = c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
        if (start + dur > fitDur) fitDur = start + dur;
      });
    } else {
      fitDur = this.getSequenceTotalDuration();
    }

    const wrapperWidth = this.timelineTrackWrapper.clientWidth - 240;
    if (fitDur > 0 && wrapperWidth > 100) {
      const optimalZoom = Math.max(40, Math.min(220, Math.floor(wrapperWidth / fitDur)));
      this.applyTimelineZoom(optimalZoom, true);
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

    document.querySelectorAll('.nle-clip-v1, .nle-clip-v2, .nle-clip-a1, .nle-clip-a2').forEach((el) => {
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
    const clipStart = clip.trackStart !== undefined ? clip.trackStart : (clip.globalStart || 0);
    const clipDur = clip.effectiveDuration || Math.max(0.1, trimEnd - trimStart);
    const globalPlayheadTime = this.getCurrentGlobalTimelineTime();

    let splitPoint;
    if (globalPlayheadTime >= clipStart && globalPlayheadTime <= (clipStart + clipDur)) {
      splitPoint = trimStart + (globalPlayheadTime - clipStart);
    } else {
      splitPoint = curTime;
    }
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
  getVisualTimelineClips() {
    const tl = this.project.timeline || [];
    return tl.filter(c => c.track === 'v1' || c.track === 'v2' || (!c.track && c.type !== 'audio'));
  }

  getSequenceTotalDuration() {
    const tl = this.project.timeline || [];
    if (tl.length === 0) return 0.1;
    let max = 0.1;
    tl.forEach(c => {
      const start = c.globalStart !== undefined ? c.globalStart : (c.trackStart || 0);
      const dur = c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
      if (start + dur > max) max = start + dur;
    });
    return max;
  }

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
    this.isPlayingTimeline = autoPlay;
    this.isCrossfading = false;
    let clip = tl[index];
    if (!clip) return;

    // Clear any running animatic/audio timer
    this.stopAnimaticPlayback();
    if (this.isAudioOnlyPlaying) this.stopAudioOnlyPlayback();

    const visualClips = this.getVisualTimelineClips();

    // If an audio clip was selected or cued, but there are visual clips in the sequence,
    // ensure the active video deck is cued to the appropriate visual clip so the monitor is never empty!
    if ((clip.track === 'a1' || clip.track === 'a2' || clip.type === 'audio') && visualClips.length > 0) {
      const seekSec = clip.trackStart !== undefined ? clip.trackStart : (clip.globalStart || 0);
      let targetVisual = visualClips[0];
      for (let i = 0; i < visualClips.length; i++) {
        const c = visualClips[i];
        const dur = c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
        const start = c.globalStart !== undefined ? c.globalStart : (c.trackStart || 0);
        const end = start + dur;
        if ((seekSec >= start && seekSec <= end) || i === visualClips.length - 1) {
          targetVisual = c;
          break;
        }
      }
      clip = targetVisual;
      this.currentTimelineIndex = tl.indexOf(targetVisual);
    }

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
      this.cinemaPlayer.loop = false;
      this.cinemaPlayer.style.opacity = '1';
      this.cinemaPlayer.style.zIndex = '2';
    }
    if (this.cinemaPlayerB) {
      this.cinemaPlayerB.loop = false;
    }

    // Audio clip handling: do not load audio files into the video or image players
    if (clip.track === 'a1' || clip.track === 'a2' || clip.type === 'audio') {
      if (this.cinemaPlayer) this.cinemaPlayer.style.display = 'none';
      if (this.cinemaImagePlayer) this.cinemaImagePlayer.style.display = 'none';
      if (this.overlayClipTitle) {
        this.overlayClipTitle.textContent = `${clip.title || 'Audio Stem'} (${clip.track ? clip.track.toUpperCase() : 'Audio'})`;
      }
      if (this.overlayModelBadge) {
        this.overlayModelBadge.textContent = 'Audio Track';
      }
      document.querySelectorAll('.nle-clip-v1, .nle-clip-v2, .nle-clip-a1, .nle-clip-a2').forEach((el) => {
        el.classList.toggle('active', el.dataset.id === clip.timelineId);
      });
      const seekSec = clip.trackStart !== undefined ? clip.trackStart : (clip.globalStart || 0);
      this.audioOnlyCurrentTime = seekSec;
      this.updatePlayheadUi(seekSec);
      if (this.timecodeDisplay) {
        this.timecodeDisplay.textContent = `${this.formatSmpte(seekSec)} / ${this.formatSmpte(this.getSequenceTotalDuration())}`;
      }
      if (autoPlay) {
        this.startAudioOnlyPlayback();
      }
      return;
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

    const visIdx = visualClips.indexOf(clip);
    if (this.overlayClipTitle) {
      this.overlayClipTitle.textContent = `${visIdx !== -1 ? (visIdx + 1) : (index + 1)}/${visualClips.length || tl.length} — ${clip.title || 'Timeline Clip'}`;
    }
    if (this.overlayModelBadge) {
      this.overlayModelBadge.textContent = clip.model || (isAnimatic ? 'Animatic' : 'Timeline');
    }

    document.querySelectorAll('.nle-clip-v1, .nle-clip-v2, .nle-clip-a1, .nle-clip-a2').forEach((el) => {
      el.classList.toggle('active', el.dataset.id === clip.timelineId);
    });
    this.selectedTimelineClipId = clip.timelineId;

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

  toggleAudioOnlyPlayPause() {
    if (this.isAudioOnlyPlaying) {
      this.stopAudioOnlyPlayback();
    } else {
      this.startAudioOnlyPlayback();
    }
  }

  startAudioOnlyPlayback() {
    this.isAudioOnlyPlaying = true;
    this.onPlayerPlay();
    if (this.audioPlaybackInterval) clearInterval(this.audioPlaybackInterval);

    const totalDur = this.getSequenceTotalDuration();
    if ((this.audioOnlyCurrentTime || 0) >= totalDur) {
      this.audioOnlyCurrentTime = 0;
    }

    this.audioOnlyLastTimestamp = performance.now();
    this.audioPlaybackInterval = setInterval(() => {
      const now = performance.now();
      const dt = (now - (this.audioOnlyLastTimestamp || now)) / 1000;
      this.audioOnlyLastTimestamp = now;

      this.audioOnlyCurrentTime = (this.audioOnlyCurrentTime || 0) + dt;
      const total = this.getSequenceTotalDuration();

      if (this.audioOnlyCurrentTime >= total) {
        this.audioOnlyCurrentTime = total;
        this.stopAudioOnlyPlayback();
        this.audioOnlyCurrentTime = 0;
        this.seekTimelineTo(0);
        return;
      }

      this.updatePlayheadUi(this.audioOnlyCurrentTime);
      if (this.timecodeDisplay) {
        this.timecodeDisplay.textContent = `${this.formatSmpte(this.audioOnlyCurrentTime)} / ${this.formatSmpte(total)}`;
      }
      this.syncTimelineAudio(this.audioOnlyCurrentTime, true);
    }, 30);
  }

  stopAudioOnlyPlayback() {
    this.isAudioOnlyPlaying = false;
    if (this.audioPlaybackInterval) {
      clearInterval(this.audioPlaybackInterval);
      this.audioPlaybackInterval = null;
    }
    this.onPlayerPause();
  }

  stepClip(delta) {
    const visualClips = this.getVisualTimelineClips();
    const tl = this.project.timeline || [];
    if (visualClips.length === 0) return;
    const currentClip = tl[this.currentTimelineIndex];
    let curVisIdx = visualClips.indexOf(currentClip);
    if (curVisIdx === -1) curVisIdx = 0;
    let nextVis = curVisIdx + delta;
    if (nextVis < 0) nextVis = 0;
    if (nextVis >= visualClips.length) nextVis = visualClips.length - 1;
    const rawIdx = tl.indexOf(visualClips[nextVis]);
    this.cueTimelineClip(rawIdx, true);
  }

  togglePlayPause() {
    const tl = this.project.timeline || [];
    if (tl.length === 0) return;

    const visualClips = this.getVisualTimelineClips();
    if (visualClips.length === 0) {
      this.toggleAudioOnlyPlayPause();
      return;
    }

    const isAnimatic = this.isCurrentClipAnimatic();
    const activeVideo = this.getActiveVideoDeck();
    const inactiveVideo = this.getInactiveVideoDeck();

    if (isAnimatic) {
      if (this.isAnimaticPlaying) {
        this.stopAnimaticPlayback();
      } else {
        this.isPlayingTimeline = true;
        this.startAnimaticPlayback();
      }
    } else {
      if (activeVideo && activeVideo.paused) {
        this.isPlayingTimeline = true;
        if (!activeVideo.src || activeVideo.src === window.location.href) {
          let clip = tl[this.currentTimelineIndex];
          if (!clip || clip.type === 'audio' || clip.track === 'a1' || clip.track === 'a2') {
            clip = visualClips[0];
          }
          const rawIdx = tl.indexOf(clip);
          this.cueTimelineClip(rawIdx !== -1 ? rawIdx : 0, true);
        } else {
          activeVideo.play().catch(() => {});
          if (this.isCrossfading && inactiveVideo) {
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
    this.isPlayingTimeline = true;
    this.iconPlay.classList.add('hidden');
    this.iconPause.classList.remove('hidden');
    this.overlayPlayCenter.classList.add('hidden');
    this.vuMeterWrap?.classList.add('active');
    this.syncTimelineAudio(this.getCurrentGlobalTimelineTime(), true);
  }

  onPlayerPause() {
    this.iconPlay.classList.remove('hidden');
    this.iconPause.classList.add('hidden');
    this.overlayPlayCenter.classList.remove('hidden');
    this.vuMeterWrap?.classList.remove('active');
    this.audioTrackPlayerA1?.pause();
    this.audioTrackPlayerA2?.pause();
  }

  onPlayerTimeUpdate() {
    const isAnimatic = this.isCurrentClipAnimatic();
    const activeVideo = this.getActiveVideoDeck();
    const cur = isAnimatic ? (this.animaticCurrentTime || 0) : (activeVideo?.currentTime || 0);
    const tl = this.project.timeline || [];

    if (tl.length === 0) {
      const dur = activeVideo?.duration || 0;
      if (this.timecodeDisplay) {
        this.timecodeDisplay.textContent = `${this.formatSmpte(cur)} / ${this.formatSmpte(dur)}`;
      }
      return;
    }

    const visualClips = this.getVisualTimelineClips();
    let clip = tl[this.currentTimelineIndex];

    if ((!clip || clip.type === 'audio') && visualClips.length > 0) {
      clip = visualClips[0];
      this.currentTimelineIndex = tl.indexOf(clip);
    }

    let globalTime = 0;
    if (clip && clip.type !== 'audio') {
      const trimStart = clip.trimStart || 0;
      const clipOffset = Math.max(0, cur - trimStart);
      const start = clip.globalStart !== undefined ? clip.globalStart : (clip.trackStart || 0);
      globalTime = start + clipOffset;
    } else {
      globalTime = this.getCurrentGlobalTimelineTime();
    }

    const totalDuration = this.getSequenceTotalDuration();

    if (this.timecodeDisplay) {
      this.timecodeDisplay.textContent = `${this.formatSmpte(globalTime)} / ${this.formatSmpte(totalDuration)}`;
    }
    this.updatePlayheadUi(globalTime);
    const isPlayingCurrent = !this.getActiveVideoDeck()?.paused || this.isAnimaticPlaying || this.isAudioOnlyPlaying;
    this.syncTimelineAudio(globalTime, isPlayingCurrent);
    this.applyColorGrading(globalTime);

    // --- Transition & Cross Dissolve Playback Engine (Visual Clips Only) ---
    if (visualClips.length > 1 && clip && clip.type !== 'audio') {
      const visIdx = visualClips.indexOf(clip);
      if (visIdx !== -1 && visIdx < visualClips.length - 1) {
        const nextClip = visualClips[visIdx + 1];
        const transList = this.project.timelineTransitions || [];
        const trans = transList[visIdx] || { type: 'cut', duration: 0 };
        const trimStart = clip.trimStart || 0;
        const trimEnd = clip.trimEnd || clip.duration;
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
                inactiveImage.style.clipPath = '';
                inactiveImage.style.zIndex = '3';
              }
            } else {
              if (inactiveImage) inactiveImage.style.display = 'none';
              if (inactiveVideo) {
                inactiveVideo.style.display = 'block';
                if (inactiveVideo.src !== nextClip.url) inactiveVideo.src = nextClip.url;
                inactiveVideo.currentTime = nextTrimStart;
                inactiveVideo.loop = false;
                inactiveVideo.muted = this.cinemaPlayer?.muted || false;
                inactiveVideo.volume = this.cinemaPlayer?.volume !== undefined ? this.cinemaPlayer.volume : 1;
                inactiveVideo.playbackRate = this.cinemaPlayer?.playbackRate || 1;
                inactiveVideo.style.opacity = '0';
                inactiveVideo.style.clipPath = '';
                inactiveVideo.style.zIndex = '3';
                inactiveVideo.play().catch(() => {});
              }
            }
          }

          const incomingEl = nextIsAnimatic ? inactiveImage : inactiveVideo;
          const outgoingEl = isAnimatic ? activeImage : activeVideo;

          if (trans.type === 'dissolve' || trans.type === 'crossfade') {
            if (incomingEl) incomingEl.style.opacity = progress.toFixed(3);
            if (outgoingEl) outgoingEl.style.opacity = (1 - progress).toFixed(3);
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
          } else if (trans.type === 'wipeleft') {
            if (incomingEl) {
              incomingEl.style.opacity = '1';
              incomingEl.style.clipPath = `inset(0 0 0 ${(1 - progress) * 100}%)`;
            }
            if (outgoingEl) outgoingEl.style.opacity = '1';
          } else if (trans.type === 'wiperight') {
            if (incomingEl) {
              incomingEl.style.opacity = '1';
              incomingEl.style.clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
            }
            if (outgoingEl) outgoingEl.style.opacity = '1';
          } else if (trans.type === 'circleopen') {
            if (incomingEl) {
              incomingEl.style.opacity = '1';
              incomingEl.style.clipPath = `circle(${progress * 75}% at 50% 50%)`;
            }
            if (outgoingEl) outgoingEl.style.opacity = '1';
          }

          // When transition completes
          if (progress >= 0.95 || cur >= (trimEnd - 0.08)) {
            this.finishTransitionToNextClip();
            return;
          }
        } else if (cur >= trimEnd) {
          this.advanceTimeline();
          return;
        }
      } else if (cur >= (clip.trimEnd || clip.duration)) {
        this.advanceTimeline();
        return;
      }
    } else if (clip && clip.type !== 'audio' && cur >= (clip.trimEnd || clip.duration)) {
      this.advanceTimeline();
    }
  }

  finishTransitionToNextClip() {
    const visualClips = this.getVisualTimelineClips();
    const tl = this.project.timeline || [];
    const currentClip = tl[this.currentTimelineIndex];
    let currentVisIdx = visualClips.indexOf(currentClip);

    if (currentVisIdx === -1 || currentVisIdx >= visualClips.length - 1) {
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
      prevVideo.style.clipPath = '';
      prevVideo.style.zIndex = '1';
      prevVideo.loop = false;
    }
    if (prevImage) {
      prevImage.style.display = 'none';
      prevImage.style.opacity = '0';
      prevImage.style.clipPath = '';
      prevImage.style.zIndex = '1';
    }
    if (this.cinemaTransitionFlash) {
      this.cinemaTransitionFlash.style.opacity = '0';
    }

    if (nextVideo) {
      nextVideo.style.opacity = '1';
      nextVideo.style.clipPath = '';
      nextVideo.style.zIndex = '2';
      nextVideo.loop = false;
    }
    if (nextImage) {
      nextImage.style.opacity = '1';
      nextImage.style.clipPath = '';
      nextImage.style.zIndex = '2';
    }

    this.activeDeck = this.activeDeck === 'a' ? 'b' : 'a';
    this.isCrossfading = false;
    currentVisIdx++;
    const nextVisualClip = visualClips[currentVisIdx];
    this.currentTimelineIndex = tl.indexOf(nextVisualClip);

    const isAnimatic = nextVisualClip.isAnimatic || !nextVisualClip.url || !nextVisualClip.url.match(/\.(mp4|webm)$/i);

    if (this.overlayClipTitle) {
      this.overlayClipTitle.textContent = `${currentVisIdx + 1}/${visualClips.length} — ${nextVisualClip.title || 'Timeline Clip'}`;
    }
    if (this.overlayModelBadge) {
      this.overlayModelBadge.textContent = nextVisualClip.model || (isAnimatic ? 'Animatic' : 'Timeline');
    }

    document.querySelectorAll('.nle-clip-v1, .nle-clip-v2, .nle-clip-a1, .nle-clip-a2').forEach((el) => {
      el.classList.toggle('active', el.dataset.id === nextVisualClip.timelineId);
    });
    this.selectTimelineClip(nextVisualClip);

    if (isAnimatic) {
      this.animaticCurrentTime = nextVisualClip.trimStart || 0;
      this.startAnimaticPlayback();
    } else if (nextVideo && this.isPlayingTimeline && nextVideo.paused) {
      nextVideo.play().catch(() => {});
    }
  }

  updatePlayheadUi(globalTimeSeconds) {
    if (!this.timelinePlayhead) return;
    const posPx = Math.round(globalTimeSeconds * this.timelineZoom);
    this.timelinePlayhead.style.left = `${posPx}px`;
  }

  // --- Multi-Track Timeline Audio Synchronization Engine ---
  syncTimelineAudio(globalTime, isPlaying) {
    const visualClips = this.getVisualTimelineClips();
    const activeVideo = this.getActiveVideoDeck();
    if (visualClips.length > 0 && !this.isAnimaticPlaying) {
      if (!activeVideo || activeVideo.paused) {
        isPlaying = false;
      }
    }

    const tl = this.project.timeline || [];
    const mixer = this.project.audioMixer || {
      a1: { volume: 0, pan: 0, muted: false, solo: false },
      a2: { volume: 0, pan: 0, muted: false, solo: false },
      master: { volume: 1, muted: false }
    };

    const masterVol = mixer.master?.muted ? 0 : (mixer.master?.volume !== undefined ? mixer.master.volume : 1);
    const anySolo = Boolean(mixer.a1?.solo || mixer.a2?.solo);

    // 1. Synchronize Track A1 (Dialogue)
    const a1Clips = tl.filter(c => c.track === 'a1');
    const activeA1 = a1Clips.find(c => {
      const start = c.trackStart !== undefined ? c.trackStart : (c.globalStart || 0);
      const dur = c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
      return globalTime >= start && globalTime < (start + dur);
    });

    if (activeA1 && activeA1.url) {
      if (!this.audioTrackPlayerA1) this.audioTrackPlayerA1 = new Audio();
      const targetUrl = activeA1.url;
      if (!this.audioTrackPlayerA1.src || !this.audioTrackPlayerA1.src.includes(targetUrl)) {
        this.audioTrackPlayerA1.src = targetUrl;
      }

      const start = activeA1.trackStart !== undefined ? activeA1.trackStart : (activeA1.globalStart || 0);
      const trimStart = activeA1.trimStart || 0;
      const targetOffset = Math.max(0, trimStart + (globalTime - start));

      const isA1Muted = Boolean(mixer.a1?.muted || (anySolo && !mixer.a1?.solo));
      const dbA1 = Number(mixer.a1?.volume || 0);
      const linA1 = Math.pow(10, dbA1 / 20);
      const volA1 = isA1Muted ? 0 : Math.min(1, Math.max(0, linA1 * masterVol));
      this.audioTrackPlayerA1.volume = volA1;

      if (Math.abs((this.audioTrackPlayerA1.currentTime || 0) - targetOffset) > 0.25) {
        this.audioTrackPlayerA1.currentTime = targetOffset;
      }

      if (isPlaying) {
        if (this.audioTrackPlayerA1.paused) {
          this.audioTrackPlayerA1.play().catch(() => {});
        }
      } else {
        if (!this.audioTrackPlayerA1.paused) {
          this.audioTrackPlayerA1.pause();
        }
      }
    } else {
      if (this.audioTrackPlayerA1 && !this.audioTrackPlayerA1.paused) {
        this.audioTrackPlayerA1.pause();
      }
    }

    // 2. Synchronize Track A2 (SFX / Music)
    const a2Clips = tl.filter(c => c.track === 'a2');
    const activeA2 = a2Clips.find(c => {
      const start = c.trackStart !== undefined ? c.trackStart : (c.globalStart || 0);
      const dur = c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
      return globalTime >= start && globalTime < (start + dur);
    });

    if (activeA2 && activeA2.url) {
      if (!this.audioTrackPlayerA2) this.audioTrackPlayerA2 = new Audio();
      const targetUrl = activeA2.url;
      if (!this.audioTrackPlayerA2.src || !this.audioTrackPlayerA2.src.includes(targetUrl)) {
        this.audioTrackPlayerA2.src = targetUrl;
      }

      const start = activeA2.trackStart !== undefined ? activeA2.trackStart : (activeA2.globalStart || 0);
      const trimStart = activeA2.trimStart || 0;
      const targetOffset = Math.max(0, trimStart + (globalTime - start));

      const isA2Muted = Boolean(mixer.a2?.muted || (anySolo && !mixer.a2?.solo));
      const dbA2 = Number(mixer.a2?.volume || 0);
      const linA2 = Math.pow(10, dbA2 / 20);
      const volA2 = isA2Muted ? 0 : Math.min(1, Math.max(0, linA2 * masterVol));
      this.audioTrackPlayerA2.volume = volA2;

      if (Math.abs((this.audioTrackPlayerA2.currentTime || 0) - targetOffset) > 0.25) {
        this.audioTrackPlayerA2.currentTime = targetOffset;
      }

      if (isPlaying) {
        if (this.audioTrackPlayerA2.paused) {
          this.audioTrackPlayerA2.play().catch(() => {});
        }
      } else {
        if (!this.audioTrackPlayerA2.paused) {
          this.audioTrackPlayerA2.pause();
        }
      }
    } else {
      if (this.audioTrackPlayerA2 && !this.audioTrackPlayerA2.paused) {
        this.audioTrackPlayerA2.pause();
      }
    }
  }

  getCurrentGlobalTimelineTime() {
    const isAnimatic = this.isCurrentClipAnimatic();
    const activeVideo = this.getActiveVideoDeck();
    const cur = isAnimatic ? (this.animaticCurrentTime || 0) : (activeVideo?.currentTime || 0);
    const tl = this.project.timeline || [];
    const clip = tl[this.currentTimelineIndex];
    if (!clip) return cur;
    const trimStart = clip.trimStart || 0;
    const clipOffset = Math.max(0, cur - trimStart);
    return (clip.trackStart !== undefined ? clip.trackStart : (clip.globalStart || 0)) + clipOffset;
  }

  seekTimelineTo(globalSec) {
    const tl = this.project.timeline;
    if (!tl || tl.length === 0) return;

    this.isCrossfading = false;
    if (this.cinemaTransitionFlash) this.cinemaTransitionFlash.style.opacity = '0';

    const visualClips = this.getVisualTimelineClips();
    const activeVid = this.getActiveVideoDeck();
    const wasPlaying = this.isAnimaticPlaying || (activeVid && !activeVid.paused) || this.isAudioOnlyPlaying;

    if (visualClips.length > 0) {
      let targetVisual = visualClips[0];
      let targetOffset = 0;
      for (let i = 0; i < visualClips.length; i++) {
        const c = visualClips[i];
        const dur = c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0));
        const start = c.globalStart !== undefined ? c.globalStart : (c.trackStart || 0);
        const end = start + dur;
        if ((globalSec >= start && globalSec <= end) || i === visualClips.length - 1) {
          targetVisual = c;
          targetOffset = Math.max(0, globalSec - start);
          break;
        }
      }
      const rawIdx = tl.indexOf(targetVisual);
      this.cueTimelineClip(rawIdx !== -1 ? rawIdx : 0, false);
      const isAnimatic = targetVisual.isAnimatic || targetVisual.type === 'image';
      const seekTime = (targetVisual.trimStart || 0) + targetOffset;
      if (isAnimatic) {
        this.animaticCurrentTime = seekTime;
      } else {
        const vid = this.getActiveVideoDeck();
        if (vid) vid.currentTime = seekTime;
      }
      this.selectTimelineClip(targetVisual);
    } else {
      this.audioOnlyCurrentTime = globalSec;
      const totalDur = this.getSequenceTotalDuration();
      if (this.timecodeDisplay) {
        this.timecodeDisplay.textContent = `${this.formatSmpte(globalSec)} / ${this.formatSmpte(totalDur)}`;
      }
    }

    this.syncTimelineAudio(globalSec, wasPlaying);
    this.updatePlayheadUi(globalSec);
    this.applyColorGrading(globalSec);

    if (wasPlaying) {
      if (visualClips.length === 0) this.startAudioOnlyPlayback();
      else if (this.isCurrentClipAnimatic()) this.startAnimaticPlayback();
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
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        const curTime = this.getCurrentGlobalTimelineTime();
        this.addOrUpdateCgKeyframeAtTime(curTime);
      } else if (e.code === 'BracketLeft') {
        e.preventDefault();
        this.jumpCgKeyframe(-1);
      } else if (e.code === 'BracketRight') {
        e.preventDefault();
        this.jumpCgKeyframe(1);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        if (this.selectedCgKeyframe) {
          this.deleteSelectedCgKeyframe();
        } else {
          this.removeSelectedTimelineClip();
        }
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

  // =========================================================================
  // COLOR GRADING GRAPH & BEZIER CURVE ENGINE
  // =========================================================================

  getDefaultColorGrading() {
    return {
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
    };
  }

  initColorGrading() {
    this.timelineTrackCg = document.getElementById('timeline-track-colorgrade');
    this.cgGraphCanvas = document.getElementById('colorgrade-graph-canvas');
    this.cgTooltip = document.getElementById('colorgrade-tooltip');
    this.btnToggleCgVis = document.getElementById('btn-toggle-cg-vis');
    this.btnResetCgChannel = document.getElementById('btn-reset-cg-channel');
    this.cgChannelSelect = document.getElementById('cg-channel-select');
    this.btnCgPresets = document.getElementById('btn-cg-presets');
    this.cgValueDisplay = document.getElementById('cg-value-display');
    this.btnCgPrevKey = document.getElementById('btn-cg-prev-key');
    this.btnCgAddKey = document.getElementById('btn-cg-add-key');
    this.btnCgNextKey = document.getElementById('btn-cg-next-key');
    this.btnCgDelKey = document.getElementById('btn-cg-del-key');
    this.pbCgMatrix = document.getElementById('pb-cg-matrix');
    this.cgStatusBadge = document.getElementById('cg-status-badge');

    this.selectedCgKeyframe = null;
    this.selectedCgKeyframeIndex = -1;
    this.hoveredCgKeyframe = null;
    this.hoveredCgHandle = null;
    this.isDraggingCg = false;
    this.dragTarget = null;
    this.colorGradingPresetIndex = 0;

    if (!this.project.colorGrading) {
      this.project.colorGrading = this.getDefaultColorGrading();
    }
    this.colorGrading = this.project.colorGrading;

    if (this.cgStatusBadge) {
      this.cgStatusBadge.textContent = this.colorGrading.enabled ? 'Live' : 'Bypassed';
      this.cgStatusBadge.className = this.colorGrading.enabled ? 'cg-status-badge active' : 'cg-status-badge bypassed';
    }

    // Toggle live grading active / bypass
    this.btnToggleCgVis?.addEventListener('click', () => {
      this.colorGrading.enabled = !this.colorGrading.enabled;
      this.btnToggleCgVis.classList.toggle('active', this.colorGrading.enabled);
      this.btnToggleCgVis.textContent = this.colorGrading.enabled ? '👁️' : '🚫';
      this.btnToggleCgVis.title = this.colorGrading.enabled ? 'Live Color Grading Active (Click to bypass)' : 'Color Grading Bypassed (Click to enable)';
      if (this.cgStatusBadge) {
        this.cgStatusBadge.textContent = this.colorGrading.enabled ? 'Live' : 'Bypassed';
        this.cgStatusBadge.className = this.colorGrading.enabled ? 'cg-status-badge active' : 'cg-status-badge bypassed';
      }
      this.applyColorGrading(this.getCurrentGlobalTimelineTime());
      this.renderColorGradeGraph();
      this.saveProject();
    });

    // Reset current channel curve
    this.btnResetCgChannel?.addEventListener('click', () => {
      const activeChKey = this.colorGrading.activeChannel || 'exposure';
      const ch = this.colorGrading.channels[activeChKey];
      if (ch) {
        ch.keyframes = [
          { time: 0.0, value: ch.defaultVal, inHandle: { dt: -0.4, dv: 0.0 }, outHandle: { dt: 0.4, dv: 0.0 }, interpolation: 'bezier' }
        ];
        this.selectedCgKeyframe = null;
        this.selectedCgKeyframeIndex = -1;
        this.applyColorGrading(this.getCurrentGlobalTimelineTime());
        this.renderColorGradeGraph();
        this.saveProject();
      }
    });

    // Channel dropdown switcher
    this.cgChannelSelect?.addEventListener('change', (e) => {
      this.colorGrading.activeChannel = e.target.value;
      this.selectedCgKeyframe = null;
      this.selectedCgKeyframeIndex = -1;
      this.applyColorGrading(this.getCurrentGlobalTimelineTime());
      this.renderColorGradeGraph();
      this.saveProject();
    });

    // Add / Update Keyframe at Playhead button
    this.btnCgAddKey?.addEventListener('click', () => {
      const curTime = this.getCurrentGlobalTimelineTime();
      this.addOrUpdateCgKeyframeAtTime(curTime);
    });

    // Jump to Prev / Next Keyframe
    this.btnCgPrevKey?.addEventListener('click', () => {
      this.jumpCgKeyframe(-1);
    });
    this.btnCgNextKey?.addEventListener('click', () => {
      this.jumpCgKeyframe(1);
    });

    // Delete selected keyframe
    this.btnCgDelKey?.addEventListener('click', () => {
      this.deleteSelectedCgKeyframe();
    });

    // Preset color looks
    this.btnCgPresets?.addEventListener('click', () => {
      this.cycleCgPreset();
    });

    // Canvas Mouse & Interaction Setup
    this.setupColorGradingCanvasInteractions();
  }

  evaluateChannelCurve(channelKey, time) {
    if (!this.colorGrading || !this.colorGrading.channels) return 0;
    const ch = this.colorGrading.channels[channelKey];
    if (!ch || !ch.keyframes || ch.keyframes.length === 0) return ch?.defaultVal || 0;

    const kfs = ch.keyframes;
    if (kfs.length === 1) return kfs[0].value;
    if (time <= kfs[0].time) return kfs[0].value;
    if (time >= kfs[kfs.length - 1].time) return kfs[kfs.length - 1].value;

    // Find segment [Ki, Ki+1]
    let i = 0;
    while (i < kfs.length - 1 && kfs[i + 1].time < time) {
      i++;
    }
    const k0 = kfs[i];
    const k1 = kfs[i + 1];

    if (k0.interpolation === 'hold') return k0.value;
    if (k0.interpolation === 'linear') {
      const span = Math.max(0.0001, k1.time - k0.time);
      const alpha = Math.min(1, Math.max(0, (time - k0.time) / span));
      return k0.value + alpha * (k1.value - k0.value);
    }

    // Cubic Bezier Evaluation
    const p0x = k0.time;
    const p0y = k0.value;
    const p3x = k1.time;
    const p3y = k1.value;

    const outDt = Math.max(0, k0.outHandle ? k0.outHandle.dt : (p3x - p0x) * 0.35);
    const outDv = k0.outHandle ? k0.outHandle.dv : 0;
    const p1x = Math.max(p0x, Math.min(p3x, p0x + outDt));
    const p1y = p0y + outDv;

    const inDt = Math.min(0, k1.inHandle ? k1.inHandle.dt : -(p3x - p0x) * 0.35);
    const inDv = k1.inHandle ? k1.inHandle.dv : 0;
    const p2x = Math.max(p0x, Math.min(p3x, p3x + inDt));
    const p2y = p3y + inDv;

    // Binary search parameter u in [0, 1] where Bx(u) == time
    let lo = 0, hi = 1, u = 0.5;
    for (let iter = 0; iter < 18; iter++) {
      u = (lo + hi) * 0.5;
      const inv = 1 - u;
      const curX = inv * inv * inv * p0x + 3 * inv * inv * u * p1x + 3 * inv * u * u * p2x + u * u * u * p3x;
      if (curX < time) lo = u;
      else hi = u;
    }

    const inv = 1 - u;
    const curY = inv * inv * inv * p0y + 3 * inv * inv * u * p1y + 3 * inv * u * u * p2y + u * u * u * p3y;
    return Math.max(ch.min, Math.min(ch.max, curY));
  }

  applyColorGrading(globalTime) {
    if (!this.colorGrading) return;
    const enabled = this.colorGrading.enabled;

    const exp = enabled ? this.evaluateChannelCurve('exposure', globalTime) : 0;
    const cont = enabled ? this.evaluateChannelCurve('contrast', globalTime) : 0;
    const sat = enabled ? this.evaluateChannelCurve('saturation', globalTime) : 0;
    const temp = enabled ? this.evaluateChannelCurve('temperature', globalTime) : 0;
    const tint = enabled ? this.evaluateChannelCurve('tint', globalTime) : 0;

    // Update header value readout for active channel
    const activeChKey = this.colorGrading.activeChannel || 'exposure';
    const activeCh = this.colorGrading.channels[activeChKey];
    if (this.cgValueDisplay && activeCh) {
      const val = enabled ? this.evaluateChannelCurve(activeChKey, globalTime) : 0;
      let formatted = val.toFixed(2);
      if (val > 0) formatted = '+' + formatted;
      if (activeCh.unit) formatted += ' ' + activeCh.unit;
      this.cgValueDisplay.textContent = formatted;
      this.cgValueDisplay.style.color = activeCh.color;
      this.cgValueDisplay.style.borderColor = activeCh.color + '55';
    }

    // CSS Multipliers
    const brightnessFactor = Math.max(0.05, Math.min(3.5, Math.pow(2, exp)));
    const contrastFactor = Math.max(0.1, Math.min(3.0, 1.0 + cont));
    const saturationFactor = Math.max(0.0, Math.min(3.0, 1.0 + sat));

    // Update SVG feColorMatrix for Temperature & Tint
    if (this.pbCgMatrix) {
      const tNorm = temp / 100; // -1 to +1
      const tintNorm = tint / 100; // -1 to +1

      let rR = 1.0, rG = 0.0, rB = 0.0;
      let gR = 0.0, gG = 1.0, gB = 0.0;
      let bR = 0.0, bG = 0.0, bB = 1.0;

      if (tNorm > 0) {
        rR += tNorm * 0.28;
        gG += tNorm * 0.06;
        bB -= tNorm * 0.24;
      } else if (tNorm < 0) {
        const c = Math.abs(tNorm);
        rR -= c * 0.22;
        bB += c * 0.32;
      }

      if (tintNorm > 0) {
        rR += tintNorm * 0.12;
        gG -= tintNorm * 0.16;
        bB += tintNorm * 0.12;
      } else if (tintNorm < 0) {
        const g = Math.abs(tintNorm);
        rR -= g * 0.12;
        gG += g * 0.22;
        bB -= g * 0.12;
      }

      this.pbCgMatrix.setAttribute('values', `
        ${rR.toFixed(3)} ${rG.toFixed(3)} ${rB.toFixed(3)} 0 0
        ${gR.toFixed(3)} ${gG.toFixed(3)} ${gB.toFixed(3)} 0 0
        ${bR.toFixed(3)} ${bG.toFixed(3)} ${bB.toFixed(3)} 0 0
        0 0 0 1 0
      `);
    }

    let filterStr = 'none';
    if (enabled && (Math.abs(exp) > 0.001 || Math.abs(cont) > 0.001 || Math.abs(sat) > 0.001 || Math.abs(temp) > 0.001 || Math.abs(tint) > 0.001)) {
      filterStr = `url(#pb-cg-filter) brightness(${brightnessFactor.toFixed(3)}) contrast(${contrastFactor.toFixed(3)}) saturate(${saturationFactor.toFixed(3)})`;
    }

    const targets = [this.cinemaPlayer, this.cinemaPlayerB, this.cinemaImagePlayer, this.cinemaImagePlayerB];
    targets.forEach(el => {
      if (el) el.style.filter = filterStr;
    });

    this.drawCgPlayheadCursor(globalTime);
  }

  drawCgPlayheadCursor(globalTime) {
    if (this.cgGraphCanvas && this.colorGrading) {
      this.renderColorGradeGraph();
    }
  }

  renderColorGradeGraph(totalDuration, totalWidthPx) {
    if (!this.cgGraphCanvas) return;
    const canvas = this.cgGraphCanvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dur = Math.max(0.1, totalDuration || this.getSequenceTotalDuration() || 15);
    const zoom = this.timelineZoom || 95;
    const width = totalWidthPx || Math.max(this.timelineTrackWrapper?.clientWidth || 1600, Math.round(dur * zoom) + 200);
    const height = 110;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padTop = 16;
    const padBottom = 16;
    const graphH = height - padTop - padBottom;

    // 1. Draw Visual Clip Boundary Blocks (Sync with video layers)
    const visualClips = this.getVisualTimelineClips();
    visualClips.forEach((c, idx) => {
      const cStart = (c.globalStart !== undefined ? c.globalStart : (c.trackStart || 0)) * zoom;
      const cDur = (c.effectiveDuration || Math.max(0.1, (c.trimEnd || c.duration) - (c.trimStart || 0))) * zoom;

      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(cStart, 0, cDur, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cStart, 0);
      ctx.lineTo(cStart, height);
      ctx.stroke();

      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillText(c.title || `Shot ${idx + 1}`, cStart + 6, 12);
    });

    const activeChKey = this.colorGrading?.activeChannel || 'exposure';
    const activeCh = this.colorGrading?.channels?.[activeChKey] || { min: -2, max: 2, defaultVal: 0, color: '#f59e0b', unit: 'EV' };
    const valRange = Math.max(0.001, activeCh.max - activeCh.min);

    const valToY = (v) => {
      const norm = (v - activeCh.min) / valRange;
      return padTop + (1.0 - norm) * graphH;
    };

    // 2. Horizontal Reference Grid Lines
    const neutralY = valToY(activeCh.defaultVal || 0);
    const upperY = valToY(activeCh.min + valRange * 0.75);
    const lowerY = valToY(activeCh.min + valRange * 0.25);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, upperY);
    ctx.lineTo(width, upperY);
    ctx.moveTo(0, lowerY);
    ctx.lineTo(width, lowerY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, neutralY);
    ctx.lineTo(width, neutralY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '8px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`${activeCh.max > 0 ? '+' : ''}${activeCh.max}${activeCh.unit || ''}`, 6, padTop + 2);
    ctx.fillText(`0.0${activeCh.unit || ''}`, 6, neutralY - 3);
    ctx.fillText(`${activeCh.min}${activeCh.unit || ''}`, 6, height - padBottom + 8);

    // 3. Faint Ghost Curves for Inactive Channels
    const allChannels = this.colorGrading?.channels || {};
    Object.keys(allChannels).forEach(chKey => {
      if (chKey === activeChKey) return;
      const ch = allChannels[chKey];
      if (!ch || !ch.keyframes || ch.keyframes.length === 0) return;

      const cRange = Math.max(0.001, ch.max - ch.min);
      ctx.beginPath();
      ctx.strokeStyle = ch.color + '44';
      ctx.lineWidth = 1.2;

      const stepPx = 6;
      let first = true;
      for (let x = 0; x <= width; x += stepPx) {
        const t = x / zoom;
        const v = this.evaluateChannelCurve(chKey, t);
        const norm = (v - ch.min) / cRange;
        const y = padTop + (1.0 - norm) * graphH;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    // 4. Render Active Bezier Curve & Fill
    const kfs = activeCh.keyframes || [];
    if (kfs.length > 0) {
      const stepPx = 3;
      const fillPath = new Path2D();
      fillPath.moveTo(0, neutralY);

      for (let x = 0; x <= width; x += stepPx) {
        const t = x / zoom;
        const v = this.evaluateChannelCurve(activeChKey, t);
        const y = valToY(v);
        fillPath.lineTo(x, y);
      }
      fillPath.lineTo(width, neutralY);
      fillPath.closePath();

      const fillGrad = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
      fillGrad.addColorStop(0, activeCh.glow || 'rgba(245, 158, 11, 0.25)');
      fillGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fillGrad;
      ctx.fill(fillPath);

      ctx.beginPath();
      ctx.strokeStyle = activeCh.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = activeCh.color;
      ctx.shadowBlur = 8;

      let first = true;
      for (let x = 0; x <= width; x += stepPx) {
        const t = x / zoom;
        const v = this.evaluateChannelCurve(activeChKey, t);
        const y = valToY(v);
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 5. Render Keyframe Nodes & Tangent Handles
    kfs.forEach((kf, idx) => {
      const kfX = kf.time * zoom;
      const kfY = valToY(kf.value);
      const isSelected = (this.selectedCgKeyframe && this.selectedCgKeyframeIndex === idx);

      if (isSelected) {
        const inDt = kf.inHandle ? kf.inHandle.dt : -0.4;
        const inDv = kf.inHandle ? kf.inHandle.dv : 0;
        const inX = (kf.time + inDt) * zoom;
        const inY = valToY(kf.value + inDv);

        const outDt = kf.outHandle ? kf.outHandle.dt : 0.4;
        const outDv = kf.outHandle ? kf.outHandle.dv : 0;
        const outX = (kf.time + outDt) * zoom;
        const outY = valToY(kf.value + outDv);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);

        ctx.beginPath();
        ctx.moveTo(inX, inY);
        ctx.lineTo(kfX, kfY);
        ctx.lineTo(outX, outY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(inX, inY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(outX, outY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      const size = isSelected ? 6.5 : 4.5;
      ctx.save();
      ctx.translate(kfX, kfY);
      ctx.rotate(Math.PI / 4);

      ctx.fillStyle = isSelected ? '#ffffff' : activeCh.color;
      ctx.strokeStyle = isSelected ? activeCh.color : '#0f172a';
      ctx.lineWidth = isSelected ? 2 : 1.5;
      if (isSelected) {
        ctx.shadowColor = activeCh.color;
        ctx.shadowBlur = 10;
      }

      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    });

    // 6. Current Playhead Cursor
    const curTime = this.getCurrentGlobalTimelineTime();
    const curVal = this.evaluateChannelCurve(activeChKey, curTime);
    const curX = curTime * zoom;
    const curY = valToY(curVal);

    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = activeCh.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  setupColorGradingCanvasInteractions() {
    if (!this.cgGraphCanvas) return;
    const canvas = this.cgGraphCanvas;

    const getMouseTimelinePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const zoom = this.timelineZoom || 95;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const time = Math.max(0, x / zoom);

      const activeChKey = this.colorGrading?.activeChannel || 'exposure';
      const activeCh = this.colorGrading?.channels?.[activeChKey] || { min: -2, max: 2, defaultVal: 0 };
      const valRange = Math.max(0.001, activeCh.max - activeCh.min);
      const padTop = 16;
      const graphH = 110 - 32;
      const norm = 1.0 - (y - padTop) / graphH;
      const val = Math.max(activeCh.min, Math.min(activeCh.max, activeCh.min + norm * valRange));

      return { x, y, time, val, zoom, activeChKey, activeCh, valRange, padTop, graphH };
    };

    const valToY = (v, activeCh, padTop, graphH, valRange) => {
      const norm = (v - activeCh.min) / valRange;
      return padTop + (1.0 - norm) * graphH;
    };

    canvas.addEventListener('mousemove', (e) => {
      const pos = getMouseTimelinePos(e);
      const activeCh = pos.activeCh;
      const kfs = activeCh.keyframes || [];

      if (this.isDraggingCg && this.dragTarget) {
        const dt = pos.time - this.dragTarget.startTime;
        const dv = pos.val - this.dragTarget.startVal;

        if (this.dragTarget.type === 'keyframe') {
          const kf = this.dragTarget.keyframe;
          let newTime = Math.max(0, this.dragTarget.origTime + dt);
          if (!e.shiftKey) {
            newTime = Math.round(newTime * 30) / 30; // 30fps snapping
          }
          kf.time = newTime;
          kf.value = Math.max(activeCh.min, Math.min(activeCh.max, this.dragTarget.origVal + dv));

          activeCh.keyframes.sort((a, b) => a.time - b.time);
          this.selectedCgKeyframeIndex = activeCh.keyframes.indexOf(kf);
        } else if (this.dragTarget.type === 'outHandle') {
          const kf = this.dragTarget.keyframe;
          kf.outHandle = kf.outHandle || { dt: 0.4, dv: 0 };
          kf.outHandle.dt = Math.max(0.01, pos.time - kf.time);
          kf.outHandle.dv = pos.val - kf.value;

          if (!e.shiftKey) {
            kf.inHandle = kf.inHandle || { dt: -0.4, dv: 0 };
            kf.inHandle.dt = -kf.outHandle.dt;
            kf.inHandle.dv = -kf.outHandle.dv;
          }
        } else if (this.dragTarget.type === 'inHandle') {
          const kf = this.dragTarget.keyframe;
          kf.inHandle = kf.inHandle || { dt: -0.4, dv: 0 };
          kf.inHandle.dt = Math.min(-0.01, pos.time - kf.time);
          kf.inHandle.dv = pos.val - kf.value;

          if (!e.shiftKey) {
            kf.outHandle = kf.outHandle || { dt: 0.4, dv: 0 };
            kf.outHandle.dt = -kf.inHandle.dt;
            kf.outHandle.dv = -kf.inHandle.dv;
          }
        }

        this.applyColorGrading(this.getCurrentGlobalTimelineTime());
        this.renderColorGradeGraph();
        return;
      }

      let hoveredType = null;
      if (this.selectedCgKeyframe && this.selectedCgKeyframeIndex >= 0) {
        const kf = this.selectedCgKeyframe;
        const inDt = kf.inHandle ? kf.inHandle.dt : -0.4;
        const inDv = kf.inHandle ? kf.inHandle.dv : 0;
        const inX = (kf.time + inDt) * pos.zoom;
        const inY = valToY(kf.value + inDv, activeCh, pos.padTop, pos.graphH, pos.valRange);

        const outDt = kf.outHandle ? kf.outHandle.dt : 0.4;
        const outDv = kf.outHandle ? kf.outHandle.dv : 0;
        const outX = (kf.time + outDt) * pos.zoom;
        const outY = valToY(kf.value + outDv, activeCh, pos.padTop, pos.graphH, pos.valRange);

        if (Math.hypot(pos.x - outX, pos.y - outY) < 9) {
          hoveredType = 'outHandle';
        } else if (Math.hypot(pos.x - inX, pos.y - inY) < 9) {
          hoveredType = 'inHandle';
        }
      }

      if (!hoveredType) {
        for (let i = 0; i < kfs.length; i++) {
          const kf = kfs[i];
          const kfX = kf.time * pos.zoom;
          const kfY = valToY(kf.value, activeCh, pos.padTop, pos.graphH, pos.valRange);
          if (Math.hypot(pos.x - kfX, pos.y - kfY) < 9) {
            hoveredType = 'keyframe';
            break;
          }
        }
      }

      if (hoveredType === 'outHandle' || hoveredType === 'inHandle') {
        canvas.style.cursor = 'grab';
      } else if (hoveredType === 'keyframe') {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'crosshair';
      }

      if (this.cgTooltip) {
        const frameNum = Math.round(pos.time * 30);
        const evalVal = this.evaluateChannelCurve(pos.activeChKey, pos.time);
        let valFormatted = evalVal.toFixed(2);
        if (evalVal > 0) valFormatted = '+' + valFormatted;
        if (activeCh.unit) valFormatted += ' ' + activeCh.unit;

        this.cgTooltip.innerHTML = `<span class="tt-frame">F:${frameNum} (${this.formatSmpte(pos.time)})</span><span class="tt-val">${activeCh.name}: ${valFormatted}</span>`;
        this.cgTooltip.classList.remove('hidden');
        this.cgTooltip.style.left = `${pos.x}px`;
        this.cgTooltip.style.top = `${pos.y}px`;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (this.cgTooltip) this.cgTooltip.classList.add('hidden');
    });

    canvas.addEventListener('mousedown', (e) => {
      const pos = getMouseTimelinePos(e);
      const activeCh = pos.activeCh;
      const kfs = activeCh.keyframes || [];

      if (this.selectedCgKeyframe && this.selectedCgKeyframeIndex >= 0) {
        const kf = this.selectedCgKeyframe;
        const inDt = kf.inHandle ? kf.inHandle.dt : -0.4;
        const inDv = kf.inHandle ? kf.inHandle.dv : 0;
        const inX = (kf.time + inDt) * pos.zoom;
        const inY = valToY(kf.value + inDv, activeCh, pos.padTop, pos.graphH, pos.valRange);

        const outDt = kf.outHandle ? kf.outHandle.dt : 0.4;
        const outDv = kf.outHandle ? kf.outHandle.dv : 0;
        const outX = (kf.time + outDt) * pos.zoom;
        const outY = valToY(kf.value + outDv, activeCh, pos.padTop, pos.graphH, pos.valRange);

        if (Math.hypot(pos.x - outX, pos.y - outY) < 10) {
          this.isDraggingCg = true;
          this.dragTarget = { type: 'outHandle', keyframe: kf, startTime: pos.time, startVal: pos.val };
          e.stopPropagation();
          return;
        } else if (Math.hypot(pos.x - inX, pos.y - inY) < 10) {
          this.isDraggingCg = true;
          this.dragTarget = { type: 'inHandle', keyframe: kf, startTime: pos.time, startVal: pos.val };
          e.stopPropagation();
          return;
        }
      }

      let clickedKf = null;
      let clickedIdx = -1;
      for (let i = 0; i < kfs.length; i++) {
        const kf = kfs[i];
        const kfX = kf.time * pos.zoom;
        const kfY = valToY(kf.value, activeCh, pos.padTop, pos.graphH, pos.valRange);
        if (Math.hypot(pos.x - kfX, pos.y - kfY) < 10) {
          clickedKf = kf;
          clickedIdx = i;
          break;
        }
      }

      if (clickedKf) {
        this.selectedCgKeyframe = clickedKf;
        this.selectedCgKeyframeIndex = clickedIdx;
        this.isDraggingCg = true;
        this.dragTarget = {
          type: 'keyframe',
          keyframe: clickedKf,
          startTime: pos.time,
          startVal: pos.val,
          origTime: clickedKf.time,
          origVal: clickedKf.value
        };
        this.seekTimelineTo(clickedKf.time);
        this.renderColorGradeGraph();
        e.stopPropagation();
        return;
      }

      this.selectedCgKeyframe = null;
      this.selectedCgKeyframeIndex = -1;
      this.seekTimelineTo(pos.time);
      this.renderColorGradeGraph();
    });

    canvas.addEventListener('dblclick', (e) => {
      const pos = getMouseTimelinePos(e);
      this.addOrUpdateCgKeyframeAtTime(pos.time, pos.val);
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingCg) {
        this.isDraggingCg = false;
        this.dragTarget = null;
        this.saveProject();
      }
    });
  }

  addOrUpdateCgKeyframeAtTime(time, value = null) {
    if (!this.colorGrading) return;
    const activeChKey = this.colorGrading.activeChannel || 'exposure';
    const ch = this.colorGrading.channels[activeChKey];
    if (!ch) return;

    ch.keyframes = ch.keyframes || [];
    const frameSnappedTime = Math.round(time * 30) / 30;
    const targetVal = (value !== null && value !== undefined) ? value : this.evaluateChannelCurve(activeChKey, frameSnappedTime);

    let existing = ch.keyframes.find(k => Math.abs(k.time - frameSnappedTime) < 0.035);
    if (existing) {
      existing.value = Math.max(ch.min, Math.min(ch.max, targetVal));
      this.selectedCgKeyframe = existing;
      this.selectedCgKeyframeIndex = ch.keyframes.indexOf(existing);
    } else {
      const newKf = {
        time: frameSnappedTime,
        value: Math.max(ch.min, Math.min(ch.max, targetVal)),
        inHandle: { dt: -0.4, dv: 0.0 },
        outHandle: { dt: 0.4, dv: 0.0 },
        interpolation: 'bezier'
      };
      ch.keyframes.push(newKf);
      ch.keyframes.sort((a, b) => a.time - b.time);
      this.selectedCgKeyframe = newKf;
      this.selectedCgKeyframeIndex = ch.keyframes.indexOf(newKf);
    }

    this.applyColorGrading(frameSnappedTime);
    this.renderColorGradeGraph();
    this.saveProject();
  }

  jumpCgKeyframe(direction) {
    if (!this.colorGrading) return;
    const activeChKey = this.colorGrading.activeChannel || 'exposure';
    const ch = this.colorGrading.channels[activeChKey];
    if (!ch || !ch.keyframes || ch.keyframes.length === 0) return;

    const curTime = this.getCurrentGlobalTimelineTime();
    let targetKf = null;

    if (direction < 0) {
      for (let i = ch.keyframes.length - 1; i >= 0; i--) {
        if (ch.keyframes[i].time < curTime - 0.04) {
          targetKf = ch.keyframes[i];
          break;
        }
      }
    } else {
      for (let i = 0; i < ch.keyframes.length; i++) {
        if (ch.keyframes[i].time > curTime + 0.04) {
          targetKf = ch.keyframes[i];
          break;
        }
      }
    }

    if (targetKf) {
      this.selectedCgKeyframe = targetKf;
      this.selectedCgKeyframeIndex = ch.keyframes.indexOf(targetKf);
      this.seekTimelineTo(targetKf.time);
      this.renderColorGradeGraph();
    }
  }

  deleteSelectedCgKeyframe() {
    if (!this.selectedCgKeyframe || !this.colorGrading) return;
    const activeChKey = this.colorGrading.activeChannel || 'exposure';
    const ch = this.colorGrading.channels[activeChKey];
    if (!ch || !ch.keyframes) return;

    if (ch.keyframes.length <= 1) {
      ch.keyframes[0].value = ch.defaultVal || 0;
      ch.keyframes[0].time = 0;
      ch.keyframes[0].inHandle = { dt: -0.4, dv: 0 };
      ch.keyframes[0].outHandle = { dt: 0.4, dv: 0 };
    } else {
      ch.keyframes = ch.keyframes.filter(k => k !== this.selectedCgKeyframe);
    }
    this.selectedCgKeyframe = null;
    this.selectedCgKeyframeIndex = -1;

    this.applyColorGrading(this.getCurrentGlobalTimelineTime());
    this.renderColorGradeGraph();
    this.saveProject();
  }

  cycleCgPreset() {
    if (!this.colorGrading) return;
    const totalDur = this.getSequenceTotalDuration() || 10;
    const presets = [
      {
        name: 'Cinematic Golden Hour',
        apply: () => {
          this.colorGrading.channels.exposure.keyframes = [
            { time: 0, value: 0.15, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.8, dv: 0.15 } },
            { time: Math.max(1.5, totalDur * 0.45), value: 0.45, inHandle: { dt: -0.8, dv: 0 }, outHandle: { dt: 0.8, dv: 0 } },
            { time: Math.max(3, totalDur), value: 0.1, inHandle: { dt: -0.8, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.temperature.keyframes = [
            { time: 0, value: 25, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 1.0, dv: 15 } },
            { time: Math.max(1.5, totalDur * 0.45), value: 55, inHandle: { dt: -1.0, dv: 0 }, outHandle: { dt: 1.0, dv: 0 } },
            { time: Math.max(3, totalDur), value: 20, inHandle: { dt: -1.0, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.saturation.keyframes = [
            { time: 0, value: 0.15, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
        }
      },
      {
        name: 'Teal & Orange / Cyberpunk',
        apply: () => {
          this.colorGrading.channels.contrast.keyframes = [
            { time: 0, value: 0.3, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.temperature.keyframes = [
            { time: 0, value: -35, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.8, dv: -15 } },
            { time: Math.max(1.5, totalDur * 0.5), value: -55, inHandle: { dt: -0.8, dv: 0 }, outHandle: { dt: 0.8, dv: 0 } },
            { time: Math.max(3, totalDur), value: -30, inHandle: { dt: -0.8, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.tint.keyframes = [
            { time: 0, value: -15, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.saturation.keyframes = [
            { time: 0, value: 0.25, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
        }
      },
      {
        name: 'Bleach Bypass / Gritty War',
        apply: () => {
          this.colorGrading.channels.contrast.keyframes = [
            { time: 0, value: 0.45, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.saturation.keyframes = [
            { time: 0, value: -0.45, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.exposure.keyframes = [
            { time: 0, value: -0.15, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.temperature.keyframes = [
            { time: 0, value: -10, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
        }
      },
      {
        name: 'Sunset Twilight Fade',
        apply: () => {
          this.colorGrading.channels.temperature.keyframes = [
            { time: 0, value: 15, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 1.0, dv: 20 } },
            { time: Math.max(1.5, totalDur * 0.5), value: 65, inHandle: { dt: -1.0, dv: 0 }, outHandle: { dt: 1.0, dv: 0 } },
            { time: Math.max(3, totalDur), value: 30, inHandle: { dt: -1.0, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.tint.keyframes = [
            { time: 0, value: 5, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 1.0, dv: 15 } },
            { time: Math.max(1.5, totalDur * 0.5), value: 35, inHandle: { dt: -1.0, dv: 0 }, outHandle: { dt: 1.0, dv: 0 } },
            { time: Math.max(3, totalDur), value: 10, inHandle: { dt: -1.0, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
          this.colorGrading.channels.contrast.keyframes = [
            { time: 0, value: 0.2, inHandle: { dt: -0.5, dv: 0 }, outHandle: { dt: 0.5, dv: 0 } }
          ];
        }
      },
      {
        name: 'Neutral Flat Baseline',
        apply: () => {
          Object.keys(this.colorGrading.channels).forEach(k => {
            const ch = this.colorGrading.channels[k];
            ch.keyframes = [{ time: 0, value: ch.defaultVal, inHandle: { dt: -0.4, dv: 0 }, outHandle: { dt: 0.4, dv: 0 } }];
          });
        }
      }
    ];

    const idx = this.colorGradingPresetIndex % presets.length;
    this.colorGradingPresetIndex++;
    const chosen = presets[idx];
    chosen.apply();

    this.selectedCgKeyframe = null;
    this.selectedCgKeyframeIndex = -1;
    this.applyColorGrading(this.getCurrentGlobalTimelineTime());
    this.renderColorGradeGraph();
    this.saveProject();

    if (this.btnCgPresets) {
      this.btnCgPresets.title = `Applied Preset: ${chosen.name} (Click to cycle next look)`;
    }
  }

  setupNleResizers() {
    const root = document.documentElement;
    const workspaceLayout = document.querySelector('.timeline-workspace-content.nle-workspace-layout');
    const upperRow = this.nleUpperRow || document.getElementById('nle-upper-row') || document.querySelector('.nle-upper-row');
    const splitterMp = this.nleSplitterMp || document.getElementById('nle-splitter-mp');
    const mediaPoolDock = this.nleMediaPoolDock || document.getElementById('nle-media-pool-dock');
    const splitterCol = this.nleSplitterCol || document.getElementById('nle-splitter-col');
    const sideDock = document.getElementById('nle-side-dock') || this.clipInspectorDrawer || document.getElementById('clip-inspector-drawer');
    const splitterRow = this.nleSplitterRow || document.getElementById('nle-splitter-row');
    const splitterAudio = document.getElementById('nle-splitter-audio') || this.nleSplitterAudio;
    const audioDock = document.getElementById('nle-audio-panel-card') || this.nleAudioPanelCard;
    const btnExpand = this.btnExpandInspector || document.getElementById('btn-expand-inspector');
    const btnCollapse = this.toggleInspectorCollapseBtn || document.getElementById('toggle-inspector-collapse-btn');

    // 1. Restore saved dimensions & apply directly to elements and CSS variables
    const savedUpperHeight = parseInt(localStorage.getItem('pb_nle_upper_height') || '420', 10);
    if (upperRow) {
      upperRow.style.height = `${savedUpperHeight}px`;
      upperRow.style.flex = `0 0 ${savedUpperHeight}px`;
      upperRow.style.flexBasis = `${savedUpperHeight}px`;
      root.style.setProperty('--nle-upper-height', `${savedUpperHeight}px`);
    }

    const savedMpWidth = parseInt(localStorage.getItem('pb_nle_media_pool_width') || '310', 10);
    if (mediaPoolDock) {
      mediaPoolDock.style.width = `${savedMpWidth}px`;
      mediaPoolDock.style.flexBasis = `${savedMpWidth}px`;
      root.style.setProperty('--nle-media-pool-width', `${savedMpWidth}px`);
    }

    const savedInspectorWidth = parseInt(localStorage.getItem('pb_nle_inspector_width') || '340', 10);
    if (sideDock) {
      sideDock.style.width = `${savedInspectorWidth}px`;
      sideDock.style.flexBasis = `${savedInspectorWidth}px`;
      root.style.setProperty('--nle-inspector-width', `${savedInspectorWidth}px`);
    }

    const savedAudioWidth = parseInt(localStorage.getItem('pb_nle_audio_dock_width') || '325', 10);
    if (audioDock) {
      audioDock.style.width = `${savedAudioWidth}px`;
      audioDock.style.flexBasis = `${savedAudioWidth}px`;
      root.style.setProperty('--nle-audio-dock-width', `${savedAudioWidth}px`);
    }

    const savedInspectorCollapsed = localStorage.getItem('pb_nle_inspector_collapsed') === 'true';
    if (savedInspectorCollapsed && sideDock) {
      sideDock.classList.add('collapsed');
      btnExpand?.classList.remove('hidden');
    }

    const toggleInspectorCollapse = (force) => {
      if (!sideDock) return;
      const isNowCollapsed = typeof force === 'boolean' ? force : !sideDock.classList.contains('collapsed');
      sideDock.classList.toggle('collapsed', isNowCollapsed);
      if (btnExpand) btnExpand.classList.toggle('hidden', !isNowCollapsed);
      localStorage.setItem('pb_nle_inspector_collapsed', isNowCollapsed ? 'true' : 'false');
    };

    btnCollapse?.addEventListener('click', () => toggleInspectorCollapse(true));
    btnExpand?.addEventListener('click', () => toggleInspectorCollapse(false));

    // Helper to start resizing
    const startResize = (cursor) => {
      document.body.classList.add('nle-resizing');
      document.body.style.cursor = cursor;
    };

    const stopResize = () => {
      document.body.classList.remove('nle-resizing');
      document.body.style.cursor = '';
    };

    // 0. Media Pool Splitter (Horizontal: Media Pool vs Program Monitor)
    if (splitterMp && mediaPoolDock) {
      let isResizingMp = false;
      let startX = 0;
      let startWidth = 310;

      splitterMp.addEventListener('mousedown', (e) => {
        isResizingMp = true;
        startX = e.clientX;
        startWidth = mediaPoolDock.offsetWidth || parseInt(mediaPoolDock.style.width, 10) || 310;
        splitterMp.classList.add('resizing');
        startResize('col-resize');
        e.preventDefault();
      });

      splitterMp.addEventListener('dblclick', () => {
        const defaultW = 310;
        mediaPoolDock.style.width = `${defaultW}px`;
        mediaPoolDock.style.flexBasis = `${defaultW}px`;
        root.style.setProperty('--nle-media-pool-width', `${defaultW}px`);
        localStorage.setItem('pb_nle_media_pool_width', '310');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingMp) return;
        const deltaX = e.clientX - startX;
        const totalW = upperRow ? upperRow.clientWidth : window.innerWidth;
        const minW = 200;
        const maxW = Math.max(minW, totalW - 420);
        const newW = Math.min(maxW, Math.max(minW, startWidth + deltaX));
        mediaPoolDock.style.width = `${newW}px`;
        mediaPoolDock.style.flexBasis = `${newW}px`;
        root.style.setProperty('--nle-media-pool-width', `${newW}px`);
        localStorage.setItem('pb_nle_media_pool_width', `${Math.round(newW)}`);
      });

      window.addEventListener('mouseup', () => {
        if (isResizingMp) {
          isResizingMp = false;
          splitterMp.classList.remove('resizing');
          stopResize();
        }
      });
    }

    // 1. Column Splitter (Horizontal: Monitor vs Side Dock / Inspector)
    if (splitterCol && sideDock) {
      let isResizingCol = false;
      let startX = 0;
      let startWidth = 340;

      splitterCol.addEventListener('mousedown', (e) => {
        isResizingCol = true;
        startX = e.clientX;
        startWidth = sideDock.offsetWidth || parseInt(sideDock.style.width, 10) || 340;
        splitterCol.classList.add('resizing');
        startResize('col-resize');
        e.preventDefault();
      });

      splitterCol.addEventListener('dblclick', () => {
        if (sideDock.classList.contains('collapsed')) {
          toggleInspectorCollapse(false);
        }
        const defaultW = 340;
        sideDock.style.width = `${defaultW}px`;
        sideDock.style.flexBasis = `${defaultW}px`;
        root.style.setProperty('--nle-inspector-width', `${defaultW}px`);
        localStorage.setItem('pb_nle_inspector_width', '340');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingCol) return;
        const deltaX = startX - e.clientX; // moving left makes dock wider
        const totalW = upperRow ? upperRow.clientWidth : window.innerWidth;
        const minW = 220;
        const maxW = Math.max(minW, totalW - 420);
        let newW = Math.min(maxW, Math.max(minW, startWidth + deltaX));

        if (sideDock.classList.contains('collapsed')) {
          toggleInspectorCollapse(false);
        }

        sideDock.style.width = `${newW}px`;
        sideDock.style.flexBasis = `${newW}px`;
        root.style.setProperty('--nle-inspector-width', `${newW}px`);
        localStorage.setItem('pb_nle_inspector_width', `${Math.round(newW)}`);
      });

      window.addEventListener('mouseup', () => {
        if (isResizingCol) {
          isResizingCol = false;
          splitterCol.classList.remove('resizing');
          stopResize();
        }
      });
    }

    // 2. Row Splitter (Vertical: Upper Row vs Multi-Track Timeline)
    if (splitterRow && upperRow) {
      let isResizingRow = false;
      let startY = 0;
      let startHeight = 380;

      splitterRow.addEventListener('mousedown', (e) => {
        isResizingRow = true;
        startY = e.clientY;
        startHeight = upperRow.offsetHeight || parseInt(upperRow.style.height, 10) || 380;
        splitterRow.classList.add('resizing');
        startResize('row-resize');
        e.preventDefault();
      });

      splitterRow.addEventListener('dblclick', () => {
        const layoutH = workspaceLayout ? workspaceLayout.clientHeight : (window.innerHeight - 80);
        const defaultH = Math.min(650, Math.max(260, Math.round(layoutH * 0.48)));
        upperRow.style.height = `${defaultH}px`;
        upperRow.style.flex = `0 0 ${defaultH}px`;
        upperRow.style.flexBasis = `${defaultH}px`;
        root.style.setProperty('--nle-upper-height', `${defaultH}px`);
        localStorage.setItem('pb_nle_upper_height', `${defaultH}`);
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingRow) return;
        const deltaY = e.clientY - startY; // moving down makes upper row taller, shrinking timeline
        const layoutH = workspaceLayout ? workspaceLayout.clientHeight : (window.innerHeight - 80);
        const minH = 160;
        const maxH = Math.max(minH, layoutH - 140);
        let newH = Math.min(maxH, Math.max(minH, startHeight + deltaY));

        upperRow.style.height = `${newH}px`;
        upperRow.style.flex = `0 0 ${newH}px`;
        upperRow.style.flexBasis = `${newH}px`;
        root.style.setProperty('--nle-upper-height', `${newH}px`);
        localStorage.setItem('pb_nle_upper_height', `${Math.round(newH)}`);
      });

      window.addEventListener('mouseup', () => {
        if (isResizingRow) {
          isResizingRow = false;
          splitterRow.classList.remove('resizing');
          stopResize();
        }
      });
    }

    // 3. Audio Dock Splitter (Horizontal: Timeline vs Audio Mixer in Bottom Row)
    if (splitterAudio && audioDock) {
      let isResizingAud = false;
      let startX = 0;
      let startWidth = 325;

      splitterAudio.addEventListener('mousedown', (e) => {
        isResizingAud = true;
        startX = e.clientX;
        startWidth = audioDock.offsetWidth || parseInt(audioDock.style.width, 10) || 325;
        splitterAudio.classList.add('resizing');
        startResize('col-resize');
        e.preventDefault();
      });

      splitterAudio.addEventListener('dblclick', () => {
        const defaultW = 325;
        audioDock.style.width = `${defaultW}px`;
        audioDock.style.flexBasis = `${defaultW}px`;
        root.style.setProperty('--nle-audio-dock-width', `${defaultW}px`);
        localStorage.setItem('pb_nle_audio_dock_width', '325');
      });

      window.addEventListener('mousemove', (e) => {
        if (!isResizingAud) return;
        const deltaX = startX - e.clientX; // moving left makes audio dock wider
        const bottomRow = document.getElementById('nle-bottom-row');
        const totalW = bottomRow ? bottomRow.clientWidth : window.innerWidth;
        const minW = 140;
        const maxW = Math.max(minW, window.innerWidth - 300);
        let newW = Math.min(maxW, Math.max(minW, startWidth + deltaX));

        audioDock.style.width = `${newW}px`;
        audioDock.style.flexBasis = `${newW}px`;
        root.style.setProperty('--nle-audio-dock-width', `${newW}px`);
        localStorage.setItem('pb_nle_audio_dock_width', `${Math.round(newW)}`);
      });

      window.addEventListener('mouseup', () => {
        if (isResizingAud) {
          isResizingAud = false;
          splitterAudio.classList.remove('resizing');
          stopResize();
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
        handleEqChange();
      });
    });

    // Mode switcher: Mixer vs Master EQ
    this.btnAudioModeMixer?.addEventListener('click', () => {
      this.btnAudioModeMixer.classList.add('active');
      this.btnAudioModeEq?.classList.remove('active');
      this.audioMixerView?.classList.remove('hidden');
      this.audioEqView?.classList.add('hidden');
    });

    this.btnAudioModeEq?.addEventListener('click', () => {
      this.btnAudioModeEq.classList.add('active');
      this.btnAudioModeMixer?.classList.remove('active');
      this.audioEqView?.classList.remove('hidden');
      this.audioMixerView?.classList.add('hidden');
    });

    // Layered Audio Tracks Mixer State
    this.project.audioMixer = this.project.audioMixer || {
      a1: { volume: 0, pan: 0, muted: false, solo: false },
      a2: { volume: 0, pan: 0, muted: false, solo: false },
      master: { volume: 1, muted: false }
    };
    const mixerState = this.project.audioMixer;

    // A1 Dialogue Controls
    this.mixA1Slider?.addEventListener('input', () => {
      const db = parseFloat(this.mixA1Slider.value);
      mixerState.a1.volume = db;
      if (this.mixA1ValBadge) this.mixA1ValBadge.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
      this.syncTimelineAudio(this.getCurrentGlobalTimelineTime(), !this.getActiveVideoDeck()?.paused || this.isAnimaticPlaying);
      this.saveProject();
    });

    this.mixA1Pan?.addEventListener('input', () => {
      const pan = parseFloat(this.mixA1Pan.value);
      mixerState.a1.pan = pan;
      this.saveProject();
    });

    this.btnMixA1Mute?.addEventListener('click', () => {
      mixerState.a1.muted = !mixerState.a1.muted;
      this.btnMixA1Mute.classList.toggle('active-mute', mixerState.a1.muted);
      if (this.btnToggleA1Mute) this.btnToggleA1Mute.classList.toggle('active', mixerState.a1.muted);
      this.saveProject();
    });

    this.btnMixA1Solo?.addEventListener('click', () => {
      mixerState.a1.solo = !mixerState.a1.solo;
      this.btnMixA1Solo.classList.toggle('active-solo', mixerState.a1.solo);
      if (this.btnToggleA1Solo) this.btnToggleA1Solo.classList.toggle('active', mixerState.a1.solo);
      this.saveProject();
    });

    // A2 SFX / Music Controls
    this.mixA2Slider?.addEventListener('input', () => {
      const db = parseFloat(this.mixA2Slider.value);
      mixerState.a2.volume = db;
      if (this.mixA2ValBadge) this.mixA2ValBadge.textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
      this.syncTimelineAudio(this.getCurrentGlobalTimelineTime(), !this.getActiveVideoDeck()?.paused || this.isAnimaticPlaying);
      this.saveProject();
    });

    this.mixA2Pan?.addEventListener('input', () => {
      const pan = parseFloat(this.mixA2Pan.value);
      mixerState.a2.pan = pan;
      this.saveProject();
    });

    this.btnMixA2Mute?.addEventListener('click', () => {
      mixerState.a2.muted = !mixerState.a2.muted;
      this.btnMixA2Mute.classList.toggle('active-mute', mixerState.a2.muted);
      if (this.btnToggleA2Mute) this.btnToggleA2Mute.classList.toggle('active', mixerState.a2.muted);
      this.saveProject();
    });

    this.btnMixA2Solo?.addEventListener('click', () => {
      mixerState.a2.solo = !mixerState.a2.solo;
      this.btnMixA2Solo.classList.toggle('active-solo', mixerState.a2.solo);
      if (this.btnToggleA2Solo) this.btnToggleA2Solo.classList.toggle('active', mixerState.a2.solo);
      this.saveProject();
    });

    // Timeline Header Track Button Handlers
    this.btnToggleV2Vis?.addEventListener('click', () => {
      this.btnToggleV2Vis.classList.toggle('active');
      const hidden = this.btnToggleV2Vis.classList.contains('active');
      this.btnToggleV2Vis.textContent = hidden ? '🚫' : '👁️';
    });

    this.btnToggleA2Mute?.addEventListener('click', () => {
      mixerState.a2.muted = !mixerState.a2.muted;
      this.btnToggleA2Mute.classList.toggle('active', mixerState.a2.muted);
      if (this.btnMixA2Mute) this.btnMixA2Mute.classList.toggle('active-mute', mixerState.a2.muted);
      this.saveProject();
    });

    this.btnToggleA2Solo?.addEventListener('click', () => {
      mixerState.a2.solo = !mixerState.a2.solo;
      this.btnToggleA2Solo.classList.toggle('active', mixerState.a2.solo);
      if (this.btnMixA2Solo) this.btnMixA2Solo.classList.toggle('active-solo', mixerState.a2.solo);
      this.saveProject();
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

  onPlayerEnded(e) {
    if (!this.isPlayingTimeline) return;

    // If the ended event came from a video deck that is NOT the currently active deck,
    // it's the outgoing video deck from a recent transition finishing its playback.
    // In that case, ignore it so it doesn't trigger advanceTimeline().
    const activeVideo = this.getActiveVideoDeck();
    if (e && e.target && e.target !== activeVideo) {
      return;
    }

    if (this.isCrossfading) {
      this.finishTransitionToNextClip();
      return;
    }
    this.advanceTimeline();
  }

  advanceTimeline() {
    this.isCrossfading = false;
    const visualClips = this.getVisualTimelineClips();
    if (visualClips.length === 0) {
      this.isPlayingTimeline = false;
      this.stopAudioOnlyPlayback();
      this.onPlayerPause();
      this.seekTimelineTo(0);
      return;
    }

    const currentClip = (this.project.timeline || [])[this.currentTimelineIndex];
    let currentVisIdx = visualClips.indexOf(currentClip);
    if (currentVisIdx === -1) currentVisIdx = 0;

    if (currentVisIdx < visualClips.length - 1) {
      const nextVisual = visualClips[currentVisIdx + 1];
      const rawIdx = (this.project.timeline || []).indexOf(nextVisual);
      this.cueTimelineClip(rawIdx, true);
    } else {
      if (this.isTimelineLooping) {
        const rawIdx = (this.project.timeline || []).indexOf(visualClips[0]);
        this.cueTimelineClip(rawIdx, true);
      } else {
        this.isPlayingTimeline = false;
        this.stopAnimaticPlayback();
        if (this.cinemaPlayer) this.cinemaPlayer.pause();
        if (this.cinemaPlayerB) this.cinemaPlayerB.pause();
        const rawIdx = (this.project.timeline || []).indexOf(visualClips[0]);
        this.cueTimelineClip(rawIdx, false);
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
      this.addShotToMediaPool(shot);
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
        emptyMsg = 'No restyled keyframe exists yet for this shot. Upload a custom image or bake in the Compositor!';
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

      const isRestyleStage = (this.activeLightboxTarget === 'restyle' || this.activeLightboxTarget === 'regened');
      if (this.btnLightboxUploadRestyle) {
        this.btnLightboxUploadRestyle.classList.toggle('hidden', !isRestyleStage);
      }
      if (this.btnLightboxChainPrevRestyle) {
        this.btnLightboxChainPrevRestyle.classList.toggle('hidden', !isRestyleStage || this.activeLightboxShotIndex <= 0);
      }
      if (this.btnKfChainPrevRestyle) {
        this.btnKfChainPrevRestyle.style.display = (this.activeLightboxShotIndex > 0) ? 'inline-flex' : 'none';
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
    const visualClips = this.getVisualTimelineClips();
    if (visualClips.length === 0) {
      alert('Please add at least one visual clip (video or animatic) to the timeline before exporting.');
      return;
    }

    const total = this.getSequenceTotalDuration();

    this.modalClipCount.textContent = visualClips.length;
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
    const visualClips = this.getVisualTimelineClips();
    if (visualClips.length === 0) {
      alert('Please add at least one visual clip (video or animatic) to the timeline before exporting.');
      return;
    }

    this.exportProgressBox.classList.remove('hidden');
    this.startStitchExportBtn.disabled = true;
    this.exportProgressText.textContent = 'Calling local FFmpeg: conforming resolution, stitching video, and mixing audio tracks...';

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
    const current = trans || { type: 'cut', duration: 0 };
    const visualClips = this.getVisualTimelineClips();
    const clipA = visualClips[index];
    const clipB = visualClips[index + 1];
    const titleA = clipA ? (clipA.title || `Shot ${index + 1}`) : `Shot ${index + 1}`;
    const titleB = clipB ? (clipB.title || `Shot ${index + 2}`) : `Shot ${index + 2}`;

    const outgoingEl = document.getElementById('trans-outgoing-clip');
    const incomingEl = document.getElementById('trans-incoming-clip');
    const subtitleEl = document.getElementById('trans-seam-subtitle');
    if (outgoingEl) outgoingEl.textContent = titleA;
    if (incomingEl) incomingEl.textContent = titleB;
    if (subtitleEl) subtitleEl.textContent = `Cut Point between ${titleA} and ${titleB}`;

    const type = current.type || 'cut';
    this.selectedTransitionType = type;
    document.querySelectorAll('#transition-style-grid .trans-card').forEach(card => {
      card.classList.toggle('active', card.dataset.type === type);
    });
    if (this.transTypeSelect) this.transTypeSelect.value = type;

    const dur = type === 'cut' ? 0.8 : (current.duration !== undefined ? Number(current.duration) : 0.8);
    const rangeInput = document.getElementById('trans-duration-range');
    const durInput = document.getElementById('trans-duration-input');
    const readout = document.getElementById('trans-duration-readout');
    if (rangeInput) rangeInput.value = dur;
    if (durInput) durInput.value = dur;
    if (readout) readout.textContent = `${dur.toFixed(1)}s`;

    // Highlight closest preset chip
    document.querySelectorAll('.trans-dur-preset').forEach(preset => {
      const pDur = parseFloat(preset.dataset.dur);
      preset.classList.toggle('active', Math.abs(pDur - dur) < 0.05);
    });

    document.getElementById('trans-duration-group')?.classList.toggle('hidden', type === 'cut');
    this.transitionModal?.classList.remove('hidden');
  }

  closeTransitionModal() {
    this.transitionModal?.classList.add('hidden');
    this.activeTransitionIndex = null;
  }

  saveTransition() {
    if (this.activeTransitionIndex === null) return;
    this.project.timelineTransitions = this.project.timelineTransitions || [];
    const type = this.selectedTransitionType || (this.transTypeSelect ? this.transTypeSelect.value : 'cut');
    const durInput = document.getElementById('trans-duration-input');
    const duration = type === 'cut' ? 0 : (parseFloat(durInput?.value) || 0.8);

    this.project.timelineTransitions[this.activeTransitionIndex] = { type, duration };
    this.closeTransitionModal();
    this.renderTimeline();
    this.saveProject();
  }

  applyTransitionToAllCuts() {
    const visualClips = this.getVisualTimelineClips();
    if (visualClips.length <= 1) return;
    this.project.timelineTransitions = this.project.timelineTransitions || [];
    const type = this.selectedTransitionType || (this.transTypeSelect ? this.transTypeSelect.value : 'cut');
    const durInput = document.getElementById('trans-duration-input');
    const duration = type === 'cut' ? 0 : (parseFloat(durInput?.value) || 0.8);

    for (let i = 0; i < visualClips.length - 1; i++) {
      this.project.timelineTransitions[i] = { type, duration };
    }
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
    this.chkLayerShowMarkup = document.getElementById('chk-layer-show-markup');
    this.chkUseMarkupGuidance = document.getElementById('chk-use-markup-guidance');
    this.btnAlignMarkupAngle = document.getElementById('btn-align-markup-angle');
    this.markupGuidanceStatus = document.getElementById('markup-guidance-status');
    this.studioMarkupImage = null;

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
          this.syncActiveStudioLayersToShot();
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
    this.chkLayerShowMarkup?.addEventListener('change', () => this.renderCompositeCanvas());
    this.btnAlignMarkupAngle?.addEventListener('click', () => this.alignLayerAngleToMarkup());

    if (this.layerInteractionCanvas) {
      this.layerInteractionCanvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
      window.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
      window.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
    }
  }

  syncActiveStudioLayersToShot() {
    if (!this.activeStudioShot) return;
    if (this.activeStudioTargetFrame === 'end') {
      this.activeStudioShot.endLayers = this.studioLayers;
    } else {
      this.activeStudioShot.layers = this.studioLayers;
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

    // Reset overlay and canvas state before loading new frame
    this.studioGhostImage = null;
    this.studioMarkupImage = null;
    if (this.layerCompositeCanvas) {
      const ctx = this.layerCompositeCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.layerCompositeCanvas.width, this.layerCompositeCanvas.height);
    }
    if (this.layerInteractionCanvas) {
      const ctx = this.layerInteractionCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.layerInteractionCanvas.width, this.layerInteractionCanvas.height);
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
    }

    const markupUrl = isEndStudio ? (shot.endMarkupUrl || shot.endFlattenedMarkupUrl) : (shot.startMarkupUrl || shot.startFlattenedMarkupUrl);
    if (markupUrl) {
      const markupImg = new Image();
      markupImg.crossOrigin = 'anonymous';
      markupImg.src = markupUrl;
      markupImg.onload = () => {
        this.studioMarkupImage = markupImg;
        this.renderCompositeCanvas();
      };
    }

    this.layeredRestyleModal?.classList.remove('hidden');

    let studioLayersSource = isEndStudio ? shot.endLayers : shot.layers;

    // Detect and heal cross-contamination where end layers were saved into start layers (or vice versa)
    if (studioLayersSource && Array.isArray(studioLayersSource) && studioLayersSource.length > 0) {
      const bg = studioLayersSource.find(l => l.isBackground);
      const isContaminated = bg ? (
        isEndStudio ? (bg.id?.endsWith('_start') || bg.imageUrl?.includes('_start_'))
                    : (bg.id?.endsWith('_end') || bg.imageUrl?.includes('_end_'))
      ) : false;

      if (isContaminated) {
        console.warn(`[LayerStudio] Cross-contamination detected: ${isEndStudio ? 'endLayers' : 'layers'} contained ${isEndStudio ? 'start' : 'end'} background. Healing stack.`);
        if (!isEndStudio && (!shot.endLayers || shot.endLayers.length === 0)) {
          shot.endLayers = shot.layers;
        }
        if (isEndStudio) {
          shot.endLayers = [];
        } else {
          shot.layers = [];
        }
        this.saveProject();
        studioLayersSource = isEndStudio ? shot.endLayers : shot.layers;
      }
    }

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
    this.studioGhostImage = null;
    this.studioMarkupImage = null;
    this.activeStudioTargetFrame = 'start';
    if (this.layerCompositeCanvas) {
      const ctx = this.layerCompositeCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.layerCompositeCanvas.width, this.layerCompositeCanvas.height);
    }
    if (this.layerInteractionCanvas) {
      const ctx = this.layerInteractionCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.layerInteractionCanvas.width, this.layerInteractionCanvas.height);
    }
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
    // Update Previs Markup Guidance status
    const isEndTarget = this.activeStudioTargetFrame === 'end';
    const hasPrevisMarkup = !!(isEndTarget 
      ? (this.activeStudioShot?.endMarkupUrl || this.activeStudioShot?.endFlattenedMarkupUrl) 
      : (this.activeStudioShot?.startMarkupUrl || this.activeStudioShot?.startFlattenedMarkupUrl));
    
    if (this.markupGuidanceStatus) {
      if (hasPrevisMarkup) {
        this.markupGuidanceStatus.innerHTML = `🧭 Previs Markup detected: <span style="color:#ffe600; font-weight:600;">Yellow perspective &amp; Blue (Forward) / Orange (Backward) ready</span>`;
        if (this.chkUseMarkupGuidance) {
          this.chkUseMarkupGuidance.disabled = false;
        }
        if (this.btnAlignMarkupAngle) this.btnAlignMarkupAngle.disabled = false;
      } else {
        this.markupGuidanceStatus.innerHTML = `⚠️ No Previs Markup on this frame (draw lines in Grease Pen)`;
        if (this.chkUseMarkupGuidance) {
          this.chkUseMarkupGuidance.checked = false;
          this.chkUseMarkupGuidance.disabled = true;
        }
        if (this.btnAlignMarkupAngle) this.btnAlignMarkupAngle.disabled = true;
      }
    }

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
      this.syncActiveStudioLayersToShot();
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
      this.syncActiveStudioLayersToShot();
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
      this.syncActiveStudioLayersToShot();
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
      this.syncActiveStudioLayersToShot();
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
      formData.append('targetFrame', this.activeStudioTargetFrame || 'start');

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
      this.syncActiveStudioLayersToShot();
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
    this.syncActiveStudioLayersToShot();
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
    this.syncActiveStudioLayersToShot();

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

    if (this.chkLayerShowMarkup?.checked && this.studioMarkupImage) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.studioMarkupImage, 0, 0, w, h);
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
        this.syncActiveStudioLayersToShot();
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
    this.syncActiveStudioLayersToShot();
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
    this.syncActiveStudioLayersToShot();
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
    this.syncActiveStudioLayersToShot();
    this.saveProject();
  }

  async alignLayerAngleToMarkup() {
    const layer = this.studioLayers.find(l => l.id === this.selectedLayerId);
    if (!layer || !this.activeStudioShot) return;

    if (this.btnAlignMarkupAngle) {
      this.btnAlignMarkupAngle.disabled = true;
      this.btnAlignMarkupAngle.innerHTML = `<span class="btn-spinner"></span> Aligning...`;
    }

    try {
      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/${layer.id}/derive-markup-orientation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFrame: this.activeStudioTargetFrame || 'start'
        })
      });
      const data = await res.json();
      if (!data.success || !data.orientation) {
        throw new Error(data.error || 'Failed to derive orientation from markup');
      }

      const o = data.orientation;
      if (this.selLayerOrientation && o.presetAngle) {
        for (let i = 0; i < this.selLayerOrientation.options.length; i++) {
          const opt = this.selLayerOrientation.options[i];
          if (opt.text.toLowerCase().includes(o.presetAngle.toLowerCase()) || 
              opt.value.toLowerCase().includes(o.presetAngle.toLowerCase())) {
            this.selLayerOrientation.selectedIndex = i;
            break;
          }
        }
      }

      if (this.txtLayerOrientationExtra && o.orientationPrompt) {
        this.txtLayerOrientationExtra.value = o.orientationPrompt;
      }

      if (this.markupGuidanceStatus) {
        this.markupGuidanceStatus.innerHTML = `✅ Aligned to Previs: <span style="color:#ffe600; font-weight:600;">${o.presetAngle || 'Perspective Decoded'}</span>`;
      }
    } catch (err) {
      alert('Previs Alignment Notice: ' + err.message);
    } finally {
      if (this.btnAlignMarkupAngle) {
        this.btnAlignMarkupAngle.disabled = false;
        this.btnAlignMarkupAngle.innerHTML = `⚡ Align Now`;
      }
    }
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
      const useMarkupGuidance = !!this.chkUseMarkupGuidance?.checked;

      const res = await fetch(`/api/storyboard/${this.activeStudioShot.id}/layers/${layer.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt,
          useMarkupGuidance,
          targetFrame: this.activeStudioTargetFrame || 'start'
        })
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
      this.syncActiveStudioLayersToShot();
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
      this.syncActiveStudioLayersToShot();
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
    if (!this.shotRangeModal) this.shotRangeModal = document.getElementById('shot-range-modal') || document.getElementById('modal-shot-range');
    if (!this.rangeModalVideo) this.rangeModalVideo = document.getElementById('range-modal-video');
    if (!this.rangeTrackLabel) this.rangeTrackLabel = document.getElementById('range-marker-track-label');
    if (!this.rangePreviewStartCanvas) this.rangePreviewStartCanvas = document.getElementById('range-preview-start-canvas');
    if (!this.rangePreviewEndCanvas) this.rangePreviewEndCanvas = document.getElementById('range-preview-end-canvas');
    if (!this.rangeCurrentTimecode) this.rangeCurrentTimecode = document.getElementById('range-current-timecode');
    if (!this.rangeVideoScrubber) this.rangeVideoScrubber = document.getElementById('range-video-scrubber');
    if (!this.rangeSliderHighlight) this.rangeSliderHighlight = document.getElementById('range-slider-highlight');

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
          cameraMotion,
          highLevelContext: this.highLevelContextInput?.value?.trim() || this.project.highLevelContext || ''
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
    document.getElementById('btn-open-shot-marker')?.addEventListener('click', () => this.openShotRangeModal());
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


// =========================================================================
  // SPATIAL PREVIZ GREASE PEN MARKUP & VISION PROMPT SYNTHESIS
  // =========================================================================
  initGreasePenElements() {
    this.modalGreasePen = document.getElementById('modal-grease-pen');
    this.closeGreasePenBtn = document.getElementById('close-grease-pen-modal-btn');
    this.cancelGreasePenBtn = document.getElementById('cancel-grease-pen-btn');
    this.saveGreasePenBtn = document.getElementById('save-grease-pen-btn');
    this.gpSaveSpinner = document.getElementById('gp-save-spinner');
    this.greasePenSubtitle = document.getElementById('grease-pen-subtitle');
    this.greasePenBgImg = document.getElementById('grease-pen-bg-img');
    this.greasePenCanvas = document.getElementById('grease-pen-canvas');
    this.gpBtnUndo = document.getElementById('gp-btn-undo');
    this.gpBtnClear = document.getElementById('gp-btn-clear');

    this.gpActiveTool = 'arrow';
    this.gpActiveColor = '#00ff66';
    this.gpActiveSize = 6;
    this.gpIsDrawing = false;
    this.gpStartX = 0;
    this.gpStartY = 0;
    this.gpUndoStack = [];
    this.gpSnapshotBeforeStroke = null;
    this.activeGreasePenShot = null;
    this.activeGreasePenFrame = 'start';
  }

  initGreasePenEvents() {
    this.closeGreasePenBtn?.addEventListener('click', () => this.closeGreasePenModal());
    this.cancelGreasePenBtn?.addEventListener('click', () => this.closeGreasePenModal());
    this.saveGreasePenBtn?.addEventListener('click', () => this.saveGreasePenMarkup());

    this.modalGreasePen?.addEventListener('click', (e) => {
      if (e.target === this.modalGreasePen) {
        this.closeGreasePenModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalGreasePen && !this.modalGreasePen.classList.contains('hidden')) {
        this.closeGreasePenModal();
      }
    });

    // Tool selectors (Enforces color-coded directing workflow)
    document.querySelectorAll('.btn-gp-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-gp-tool').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gpActiveTool = btn.dataset.tool || 'arrow';
        if (btn.dataset.color) {
          this.gpActiveColor = btn.dataset.color;
        }
      });
    });

    // Size selectors
    document.querySelectorAll('.btn-gp-size').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-gp-size').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gpActiveSize = parseInt(btn.dataset.size || '6', 10);
      });
    });

    // Color swatches
    document.querySelectorAll('.gp-color-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gp-color-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gpActiveColor = btn.dataset.color || '#ff0055';
      });
    });

    this.gpBtnUndo?.addEventListener('click', () => this.gpUndo());
    this.gpBtnClear?.addEventListener('click', () => this.gpClear());

    // Canvas drawing interactions
    if (this.greasePenCanvas) {
      const canvas = this.greasePenCanvas;

      const getCoords = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
          x: (clientX - rect.left) * scaleX,
          y: (clientY - rect.top) * scaleY
        };
      };

      const startDrawing = (e) => {
        e.preventDefault();
        const coords = getCoords(e);
        this.gpIsDrawing = true;
        this.gpStartX = coords.x;
        this.gpStartY = coords.y;

        const ctx = canvas.getContext('2d');
        this.gpSnapshotBeforeStroke = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (this.gpActiveTool === 'pen' || this.gpActiveTool === 'eraser') {
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
          if (this.gpActiveTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.arc(coords.x, coords.y, this.gpActiveSize * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };

      const drawMove = (e) => {
        if (!this.gpIsDrawing) return;
        e.preventDefault();
        const coords = getCoords(e);
        const ctx = canvas.getContext('2d');

        if (this.gpActiveTool === 'pen') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = this.gpActiveColor;
          ctx.lineWidth = this.gpActiveSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        } else if (this.gpActiveTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, this.gpActiveSize * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.gpActiveTool === 'arrow') {
          if (this.gpSnapshotBeforeStroke) ctx.putImageData(this.gpSnapshotBeforeStroke, 0, 0);
          this.gpDrawArrow(ctx, this.gpStartX, this.gpStartY, coords.x, coords.y, this.gpActiveColor, this.gpActiveSize);
        } else if (this.gpActiveTool === 'curved-arrow') {
          if (this.gpSnapshotBeforeStroke) ctx.putImageData(this.gpSnapshotBeforeStroke, 0, 0);
          this.gpDrawCurvedArrow(ctx, this.gpStartX, this.gpStartY, coords.x, coords.y, this.gpActiveColor, this.gpActiveSize);
        } else if (this.gpActiveTool === 'line') {
          if (this.gpSnapshotBeforeStroke) ctx.putImageData(this.gpSnapshotBeforeStroke, 0, 0);
          this.gpDrawLine(ctx, this.gpStartX, this.gpStartY, coords.x, coords.y, this.gpActiveColor, this.gpActiveSize);
        } else if (this.gpActiveTool === 'orientation') {
          if (this.gpSnapshotBeforeStroke) ctx.putImageData(this.gpSnapshotBeforeStroke, 0, 0);
          this.gpDrawOrientation(ctx, this.gpStartX, this.gpStartY, coords.x, coords.y, this.gpActiveColor, this.gpActiveSize);
        }
      };

      const stopDrawing = (e) => {
        if (!this.gpIsDrawing) return;
        this.gpIsDrawing = false;
        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.closePath();
        this.gpPushUndo();
      };

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', drawMove);
      window.addEventListener('mouseup', stopDrawing);

      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', drawMove, { passive: false });
      window.addEventListener('touchend', stopDrawing);
    }
  }

  gpDrawArrow(ctx, fromX, fromY, toX, toY, color, width) {
    const headLength = Math.max(16, width * 3.5);
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Main line shaft
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead cone
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  gpDrawCurvedArrow(ctx, fromX, fromY, toX, toY, color, width) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy);
    if (dist < 5) return;

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    // Compute graceful perpendicular arc offset (22% of line length)
    const perpX = -dy / dist * (dist * 0.22);
    const perpY = dx / dist * (dist * 0.22);
    const ctrlX = midX + perpX;
    const ctrlY = midY + perpY;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, toX, toY);
    ctx.stroke();

    // Arrowhead angle aligned with end tangent of quadratic bezier curve
    const tangentAngle = Math.atan2(toY - ctrlY, toX - ctrlX);
    const headLength = Math.max(16, width * 3.5);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(tangentAngle - Math.PI / 6), toY - headLength * Math.sin(tangentAngle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(tangentAngle + Math.PI / 6), toY - headLength * Math.sin(tangentAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  gpDrawLine(ctx, fromX, fromY, toX, toY, color, width) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.restore();
  }

  gpDrawOrientation(ctx, fromX, fromY, toX, toY, color, width) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const headLength = Math.max(14, width * 3);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Base position anchor circle where element sits
    ctx.beginPath();
    ctx.arc(fromX, fromY, Math.max(5, width * 1.3), 0, Math.PI * 2);
    ctx.fill();

    // Facing shaft
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Directional orientation chevron
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 5), toY - headLength * Math.sin(angle - Math.PI / 5));
    ctx.lineTo(toX - (headLength * 0.6) * Math.cos(angle), toY - (headLength * 0.6) * Math.sin(angle));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 5), toY - headLength * Math.sin(angle + Math.PI / 5));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  gpPushUndo() {
    if (!this.greasePenCanvas) return;
    if (this.gpUndoStack.length >= 20) this.gpUndoStack.shift();
    this.gpUndoStack.push(this.greasePenCanvas.toDataURL());
  }

  gpUndo() {
    if (!this.greasePenCanvas || this.gpUndoStack.length === 0) return;
    this.gpUndoStack.pop(); // Remove current state
    const prev = this.gpUndoStack[this.gpUndoStack.length - 1];
    const ctx = this.greasePenCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.greasePenCanvas.width, this.greasePenCanvas.height);
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = prev;
    }
  }

  gpClear() {
    if (!this.greasePenCanvas) return;
    const ctx = this.greasePenCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.greasePenCanvas.width, this.greasePenCanvas.height);
    this.gpPushUndo();
  }

  openGreasePenModal(shot, targetFrame = 'start') {
    if (!this.modalGreasePen) {
      this.initGreasePenElements();
      this.initGreasePenEvents();
    }
    this.activeGreasePenShot = shot;
    this.activeGreasePenFrame = targetFrame;

    const isEnd = targetFrame === 'end';
    const spatialUrl = isEnd ? shot.endKeyframeUrl : shot.keyframeUrl;
    if (!spatialUrl) {
      alert('Please ensure a Spatial Previs frame is loaded or extracted first.');
      return;
    }

    if (this.greasePenSubtitle) {
      this.greasePenSubtitle.textContent = `Shot #${shot.shotNumber || 1} · ${targetFrame.toUpperCase()} Frame Spatial Previs Markup`;
    }

    if (this.greasePenBgImg) {
      this.greasePenBgImg.src = spatialUrl;
    }

    if (this.greasePenCanvas) {
      this.greasePenCanvas.width = 1280;
      this.greasePenCanvas.height = 720;
      const ctx = this.greasePenCanvas.getContext('2d');
      ctx.clearRect(0, 0, 1280, 720);
      this.gpUndoStack = [];

      // Check if previous markup exists
      const existingMarkupUrl = isEnd ? shot.endMarkupUrl : shot.startMarkupUrl;
      if (existingMarkupUrl) {
        const mImg = new Image();
        mImg.crossOrigin = 'anonymous';
        mImg.onload = () => {
          ctx.drawImage(mImg, 0, 0, 1280, 720);
          this.gpPushUndo();
        };
        mImg.src = existingMarkupUrl;
      } else {
        this.gpPushUndo();
      }
    }

    this.modalGreasePen?.classList.remove('hidden');
  }

  closeGreasePenModal() {
    this.modalGreasePen?.classList.add('hidden');
  }

  async saveGreasePenMarkup() {
    if (!this.activeGreasePenShot || !this.greasePenCanvas || !this.greasePenBgImg) return;
    const shot = this.activeGreasePenShot;
    const frameType = this.activeGreasePenFrame;

    if (this.gpSaveSpinner) this.gpSaveSpinner.classList.remove('hidden');
    if (this.saveGreasePenBtn) this.saveGreasePenBtn.disabled = true;

    try {
      const markupDataUrl = this.greasePenCanvas.toDataURL('image/png');

      // Create flattened composite offscreen
      const offscreen = document.createElement('canvas');
      offscreen.width = 1280;
      offscreen.height = 720;
      const offCtx = offscreen.getContext('2d');

      // Draw background image if loaded
      if (this.greasePenBgImg.complete && this.greasePenBgImg.naturalWidth > 0) {
        offCtx.drawImage(this.greasePenBgImg, 0, 0, 1280, 720);
      }
      // Draw markup on top
      offCtx.drawImage(this.greasePenCanvas, 0, 0, 1280, 720);
      const flattenedDataUrl = offscreen.toDataURL('image/png');

      const res = await fetch(`/api/storyboard/${shot.id}/markup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameType,
          markupDataUrl,
          flattenedDataUrl
        })
      });

      const data = await res.json();
      if (!data.success || !data.shot) throw new Error(data.error || 'Failed to save markup');

      Object.assign(shot, data.shot);
      this.renderStoryboard();
      this.saveProject();
      this.closeGreasePenModal();
    } catch (err) {
      alert('Error saving markup: ' + err.message);
    } finally {
      if (this.gpSaveSpinner) this.gpSaveSpinner.classList.add('hidden');
      if (this.saveGreasePenBtn) this.saveGreasePenBtn.disabled = false;
    }
  }

  async handleEnhanceWithMarkup(shot, btn, descInput, motionSelect) {
    if (!shot) return;
    btn.disabled = true;
    const origHtml = btn.innerHTML;
    btn.innerHTML = `<span class="btn-spinner"></span> Synthesizing with Vision AI...`;

    const currentDescription = descInput?.value || shot.description || '';
    const cameraMotion = motionSelect?.value || shot.cameraMotion || 'Dolly Forward';

    try {
      const res = await fetch(`/api/storyboard/${shot.id}/enhance-with-markup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDescription,
          cameraMotion
        })
      });

      const data = await res.json();
      if (!data.success || !data.description) throw new Error(data.error || 'Enhancement failed');

      shot.description = data.description;
      if (descInput) {
        descInput.value = data.description;
        descInput.style.transition = 'box-shadow 0.3s ease';
        descInput.style.boxShadow = '0 0 14px rgba(14, 165, 233, 0.6)';
        setTimeout(() => { descInput.style.boxShadow = ''; }, 2000);
      }
      if (data.cameraMotion) {
        shot.cameraMotion = data.cameraMotion;
        if (motionSelect) motionSelect.value = data.cameraMotion;
      }
      if (data.shot) Object.assign(shot, data.shot);

      this.saveProject();
    } catch (err) {
      alert('Prompt Enhancement Notice: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }

  autoDetectShotReferences(shot) {
    const allRefs = this.getAllProjectReferences();
    if (!allRefs || allRefs.length === 0) {
      alert('No Consistent Assets found in your References library.');
      return;
    }
    const text = `${shot.title || ''} ${shot.description || ''} ${JSON.stringify(shot.spatialContinuity || {})}`.toLowerCase();
    const matched = allRefs.filter(ref => {
      const name = (ref.name || '').toLowerCase();
      const tag = (ref.tag || '').toLowerCase().replace('@', '').replace(/_/g, ' ');
      const desc = (ref.description || '').toLowerCase();
      if (name && text.includes(name)) return true;
      if (tag && text.includes(tag)) return true;
      if (ref.category === 'props') {
        if ((name.includes('raiding vessel') || desc.includes('raiding vessel') || desc.includes('warship')) && (text.includes('raiding') || text.includes('vessel') || text.includes('fleet') || text.includes('pirate'))) return true;
        if ((name.includes('landing craft') || desc.includes('landing craft')) && (text.includes('landing craft') || text.includes('craft') || text.includes('heat shield'))) return true;
        if ((name.includes('frigate') || desc.includes('frigate')) && text.includes('frigate')) return true;
      }
      if (ref.category === 'places') {
        if (text.includes('orbit') && (name.includes('orbit') || desc.includes('orbit'))) return true;
        if (text.includes('surface') && (name.includes('surface') || desc.includes('surface'))) return true;
        if ((text.includes('atmosphere') || text.includes('altitude') || text.includes('clouds')) && (name.includes('altitude') || desc.includes('altitude'))) return true;
      }
      return false;
    });

    if (matched.length === 0) {
      alert(`No matching references detected for Shot #${shot.shotNumber || 1}. You can assign references manually via 'Assign'.`);
      return;
    }

    const currentSet = new Set(shot.assignedReferences || []);
    matched.forEach(m => currentSet.add(m.id));
    shot.assignedReferences = Array.from(currentSet);
    this.saveProject();
    this.renderStoryboard();
    alert(`⚡ Auto-detected and linked ${matched.length} Consistent Asset(s) to Shot #${shot.shotNumber || 1}: ${matched.map(m => m.name).join(', ')}`);
  }

}

document.addEventListener('DOMContentLoaded', () => {
  window.studioApp = new StudioApp();


});
