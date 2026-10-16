# Point Blank Studio

> **AI-Powered cinematic production studio for the masses — fusing traditional pre-visualization workflows with state-of-the-art AI video diffusion models.**

[![Point Blank Studio Demo Video](https://img.youtube.com/vi/6RdwvzVaKJ0/maxresdefault.jpg)](https://youtu.be/6RdwvzVaKJ0?si=Wl6POMCLskY6pp7U)

A professional desktop AI video production studio connecting video models with a unified visual style anchor as the sole aesthetic source of truth, featuring dual-video ingestion, shot in/out range scrubbing, dual-keyframe progression pipelines, 4-corner perspective layer compositing, and non-destructive timeline assembly.

---

## 🏗️ 4-Stage Production Pipeline Workspaces

Point Blank Studio is organized into an intuitive four-stage linear production pipeline:

### 1. 🎨 Visual Style Anchor Studio
- **Master Visual Anchor Image**: The film's aesthetic source of truth. Dictates lighting, color harmony, medium, and grain across all downstream shots.
- **AI Style Deconstruction Matrix**: Multimodal vision analysis decomposes any anchor painting into a structured aesthetic specification:
  - **Dominant Color Palette**: 5 calibrated hex swatches.
  - **Lighting Architecture**: Key/fill/rim lighting direction, volumetric haze, and shadow depth.
  - **Rendering Medium & Art Form**: Concept art, digital illustration, fine canvas impasto, or photographic optics.
  - **Texture & Surface Grain**: Impasto, halftone, 35mm film grain, or clean digital finish.
  - **Camera & Optics**: Focal lengths, lens characteristics, and depth of field.
- **Strict Style Matrix Conditioning**: Restyling and harmonization passes condition models strictly via text and Style Bible matrix tokens without raw image donor transplantation, preventing unwanted character or environment bleed into shots.

### 2. 👥 References Workspace (Consistent Asset Management)
- **Asset Categories**: Dedicated libraries for **Characters**, **Props & Vehicles**, and **Places & Environments**.
- **Sticky Content Group Tabs**: Quick-jump category navigation (`All Groups`, `Characters`, `Props & Vehicles`, `Places`) with smooth scrollspy tracking.
- **Spatial Previs Color Keying**: Assign distinct color keys (e.g., `#00FF00` for landing craft, `#00FFFF` for capital vessels) to assets for automated optical isolation and layer decomposition from 3D playblasts.
- **`@mention` Tagging**: Type `@` in any shot action description to autocomplete and bind canonical project assets for automated prompt injection and continuity checking.

### 3. 🎬 Storyboard & Generation Workspace
- **Dual-Track Video Ingestion**: Load complementary video passes:
  - *Spatial Previs Video*: 3D playblast, camera blocking, and primary color proxy geometry.
  - *True Color Companion Video*: Textured engine render providing lighting, atmospheric glow, and surface detail.
- **⏱️ Shot In / Out Range Marker Scrubber**:
  - Interactive scrubbing modal with keyboard transport controls (`Space` to play/pause, `i` to mark In, `o` to mark Out, `,` and `.` for single-frame stepping).
  - Synchronized Start Frame and End Frame preview canvases.
  - Track toggling between Spatial Previs and True Color passes.
- **Dual-Keyframe Progression Pipeline**: Stacked **Start Frame** and **End Frame** visual pipeline rows for every storyboard shot card:
  1. **1. Spatial Previs**: 3D camera blocking frame with high-resolution lightbox inspection and replacement options.
  2. **2. True Color**: Textured companion pass for atmospheric glow and environmental grounding.
  3. **3. Open Compositor**: Launch the interactive Layer Studio targeted to either the Start Frame or End Frame.
  4. **4. Comp Out**: High-fidelity composite output combining warped cutout assets over clean AI-inpainted backgrounds.
  5. **5. Restyle**: Final neural keyframe stylized to the Visual Style Anchor.
- **📐 Layer Compositor Studio**:
  - Automated 3-tier candidate asset color-key extraction.
  - 4-corner perspective quad warping with interactive canvas pinning and rotation.
  - Background inpainting to cleanly fill voids behind extracted foreground assets.
  - Target-frame isolated baking preserving Start vs. End composite states.
- **First-Last-Frame Video Generation**:
  - First-to-last frame clamping using models such as **Wan 2.1 (FLF2V)** and **Kling 1.6 / 2.0 (image & image_tail)**.
  - Ensures generated video clips begin precisely on the Start keyframe and conclude seamlessly on the End keyframe.

### 4. 🎞️ Timeline Assembly Workspace
- **Non-Destructive Editing**: Sequentially assemble generated takes directly from the storyboard into a master timeline track. Trimming in-points and out-points preserves original source media.
- **Cinema Player**: Full-featured transport controls, scrubber playhead, speed toggles, and synchronized timecode readouts.
- **Audio Stem Management**: Add dialogue, sound effects, and score tracks per shot with integrated volume sliders, mute controls, and multi-band equalizer presets.
- **Master Video Export (FFmpeg)**: Conforms resolutions (1080p, 720p, or 9:16 vertical), normalizes frame rates and audio, and renders a unified master MP4 file.

---

## ⚡ Keyboard Shortcuts Quick Reference

### Shot In/Out Range Scrubber Modal
| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause video playback |
| `i` / `I` | Mark Shot In point at current playhead |
| `o` / `O` | Mark Shot Out point at current playhead |
| `[` | Jump playhead directly to In marker |
| `]` | Jump playhead directly to Out marker |
| `,` or `<` | Step backward 1 single frame (1/30s) |
| `.` or `>` | Step forward 1 single frame (1/30s) |
| `Left Arrow` | Step backward 1 second (`Shift` + `Left` for 5s) |
| `Right Arrow` | Step forward 1 second (`Shift` + `Right` for 5s) |
| `Escape` | Close Range Scrubber Modal |

### References Workspace
| Action | Shortcut / Interaction |
| :--- | :--- |
| Jump to Category | Click category tab in sticky top bar |
| Tag Asset in Shot | Type `@` in shot description textarea for autocomplete |

---

## 🚀 Quick Start & Launch

### Option 1: Native Application Executable (`PointBlank.exe`) — Recommended
Double-click **`PointBlank.exe`** directly or use the desktop shortcut:
- **Standalone App Experience**: Opens Point Blank Studio in a dedicated borderless window without browser chrome.
- **Background Server Management**: Launches and manages the local Node.js server seamlessly.
- **System Tray Control**: Access quick shortcuts to re-open the interface or cleanly shut down the server.

### Option 2: Desktop Shortcut
- Double-click **`create-desktop-shortcut.bat`** (or run `npm run shortcut`) to place a **Point Blank Studio** shortcut on your Windows Desktop.

### Option 3: Terminal / CLI
```powershell
npm start
```
Starts the server and automatically opens **[http://localhost:3000](http://localhost:3000)** in app mode.

---

## 🛑 Single-Click Shutdown
Click the **"Shutdown"** button in the top-right header of the web interface to cleanly stop the server, release all open file handles, and terminate background workers, or press `Ctrl + C` in the launcher console window.

---

## 🔒 Security Architecture

Point Blank Studio is built as a secure local desktop environment:

- **Loopback Isolation (`127.0.0.1` / `::1`)**: Binds strictly to local loopback interfaces by default, preventing unauthorized external access across your local network.
- **Strict CORS Defense**: Origin checks reject cross-origin requests from external web pages.
- **Path Traversal Sanitization**: All file parameters and paths are strictly sanitized against storage boundaries.
- **Upload Whitelisting & Size Limits**: Strict MIME and extension whitelisting on all media ingest routes.
- **Credentials Protection**: API keys are securely stored in local configuration, masked in client payloads, and never committed to version control.

---

## 📄 License

Point Blank Studio is distributed under the [MIT License](LICENSE). Feel free to use, modify, distribute, and build upon this project.
