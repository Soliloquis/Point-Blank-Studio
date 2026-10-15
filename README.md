# Point Blank Studio

> **AI-Powered video creation tool for the masses with the goal of enabling creators with a fusion of traditional workflows and modern AI tools.**

A professional desktop AI video production studio connecting video models with a unified visual style anchor as the sole source of truth for aesthetic consistency, featuring video ingestion, shot deconstruction, spatial continuity, and timeline assembly.

---

## Workspaces Overview

Point Blank Studio is organized into a dedicated production workflow:

### 1. 🎬 Storyboard & Generation Workspace
- **Video Ingestion**: Ingest any source video (MP4, MOV, WebM).
- **ChatGPT Video Deconstruction**: Automatically analyzes video keyframes and decomposes the source video into an editable storyboard of discrete shots with timestamps, motion tags, and editable action descriptions.
- **Visual Reference (Sole Source of Truth)**: The uploaded visual reference image dictates the aesthetic lighting, colors, art direction, and textures for all generated shots.
- **Per-Frame Video Generation**:
  - **Generate in Style**: Trigger neural video generation via Fal.ai (Wan 2.1, Kling, Minimax) using the shot description, spatial continuity, and visual style anchor.
  - **Regenerate**: Re-roll any shot to produce new creative variations.
  - **Mark Approved**: Bookmark and approve preferred takes.
  - **Send to Timeline**: Send individual shots or batch-import all approved shots to the timeline.

### 2. 🎞️ Timeline Assembly Workspace
- **Non-Destructive Editing**: Populates clips from the storyboard into a sequential video track. Trimming in-points and out-points is entirely non-destructive and preserves original shot media.
- **Cinema Player**: Playback with transport controls, playhead scrubbing, speed controls, and timecodes.
- **Master Video Export (FFmpeg)**: Conforms resolution (1080p, 720p, or 9:16 vertical), normalizes frame rate and audio, and concatenates all clips into a single cohesive master MP4 file.

---

## Quick Start & One-Click Launch

### Option 1: Native Application Executable (`PointBlank.exe`) — Recommended
Double-click **`PointBlank.exe`** directly or double-click the **Point Blank Studio** shortcut on your Windows Desktop!
- **True desktop app experience**: Opens Point Blank Studio in a dedicated, borderless desktop application window (no URL bar, no browser tabs, standalone window).
- **Background server management**: Silently manages the Node.js server in the background with zero terminal clutter.
- **System Tray Icon**: Keeps an icon in the Windows notification tray with instant access to re-open the window or cleanly shut down the studio.

### Option 2: Desktop Shortcut
- Double-click **`create-desktop-shortcut.bat`** (or run `npm run shortcut`) to place a **Point Blank Studio** shortcut on your Windows Desktop.

### Option 3: Batch Launcher (`start.bat`)
- Double-click **`start.bat`** in the project folder to start with a visible terminal console for log debugging.

### Option 4: Terminal / CLI
```powershell
npm start
```
Starts the server and automatically opens **[http://localhost:3000](http://localhost:3000)** in app mode.

---

## Single-Click Shutdown
Click the **"Shutdown"** button in the top navigation bar of the web UI to cleanly stop the server and all background services, or press `Ctrl + C` in the launcher console window.

>>>>>>> 8e35c79 (Initial commit: Point Blank Studio)
