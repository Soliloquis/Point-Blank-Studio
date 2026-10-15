@echo off
cd /d "%~dp0"
echo [*] Compiling PointBlank.exe with custom studio app icon...
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /nologo /target:winexe /win32icon:app.ico /r:System.dll,System.Drawing.dll,System.Windows.Forms.dll /out:PointBlank.exe src-launcher\Program.cs
if %errorlevel% equ 0 (
    echo [OK] PointBlank.exe compiled successfully!
    node scripts/createShortcut.js
) else (
    echo [ERROR] Compilation failed.
    pause
)
