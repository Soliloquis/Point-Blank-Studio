const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function createDesktopShortcut() {
  const projectRoot = path.resolve(__dirname, '..');
  const targetExe = path.join(projectRoot, 'PointBlank.exe');
  const targetBat = path.join(projectRoot, 'start.bat');
  const target = fs.existsSync(targetExe) ? targetExe : targetBat;
  const icoPath = path.join(projectRoot, 'app.ico');

  if (process.platform !== 'win32') {
    console.log('Desktop shortcut creation is designed for Windows environments.');
    return;
  }

  // Temporary VBScript to safely call Windows Script Host without escaping issues
  const tempVbsPath = path.join(os.tmpdir(), `create_pb_lnk_${Date.now()}.vbs`);

  const vbsScript = [
    'Set oWS = CreateObject("WScript.Shell")',
    'desktopFolder = oWS.SpecialFolders("Desktop")',
    'oldShortcutPath = desktopFolder & "\\PointBlank AI Studio.lnk"',
    'shortcutPath = desktopFolder & "\\Point Blank Studio.lnk"',
    'Set fso = CreateObject("Scripting.FileSystemObject")',
    'If fso.FileExists(oldShortcutPath) Then fso.DeleteFile(oldShortcutPath) End If',
    'Set oLink = oWS.CreateShortcut(shortcutPath)',
    `oLink.TargetPath = "${target.replace(/\\/g, '\\\\')}"`,
    `oLink.WorkingDirectory = "${projectRoot.replace(/\\/g, '\\\\')}"`,
    `oLink.IconLocation = "${(fs.existsSync(icoPath) ? icoPath : target).replace(/\\/g, '\\\\')},0"`,
    'oLink.Description = "Point Blank Studio"',
    'oLink.Save',
    'WScript.Echo shortcutPath'
  ].join('\r\n');

  try {
    fs.writeFileSync(tempVbsPath, vbsScript, 'utf8');
    const result = execSync(`cscript //nologo "${tempVbsPath}"`).toString().trim();
    if (fs.existsSync(tempVbsPath)) {
      fs.unlinkSync(tempVbsPath);
    }
    console.log('=======================================================');
    console.log('  Point Blank Studio Shortcut Created!');
    console.log('=======================================================');
    console.log(`[+] Location: ${result}`);
    console.log('[+] Target:   ' + target);
    console.log('[+] Icon:     ' + (fs.existsSync(icoPath) ? icoPath : target));
    console.log('[+] You can now launch Point Blank Studio with a single click from your Desktop.');
    console.log('=======================================================');
  } catch (err) {
    console.error('Failed to create Desktop shortcut via VBScript:', err.message);
    if (fs.existsSync(tempVbsPath)) {
      fs.unlinkSync(tempVbsPath);
    }
  }
}

if (require.main === module) {
  createDesktopShortcut();
}

module.exports = { createDesktopShortcut };
