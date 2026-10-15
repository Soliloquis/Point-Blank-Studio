using System;
using System.IO;
using System.Net;
using System.Diagnostics;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;

namespace PointBlankLauncher
{
    static class Program
    {
        private static Process serverProcess = null;
        private static NotifyIcon trayIcon = null;
        private static int port = 3000;
        private static string appDir = "";
        private static Mutex singleInstanceMutex = null;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            appDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(appDir);

            // Single instance lock to prevent duplicate servers
            bool isFirstInstance = false;
            singleInstanceMutex = new Mutex(true, "PointBlankStudio_SingleInstance_Mutex", out isFirstInstance);

            port = ReadPortFromEnv();

            if (!isFirstInstance)
            {
                if (IsServerResponding())
                {
                    // Server is active; simply bring up the app window
                    OpenAppWindow();
                    return;
                }

                // Previous instance was left running as an orphan while the server stopped.
                // Terminate orphaned PointBlank processes so this instance can cleanly initialize.
                try
                {
                    int currentId = Process.GetCurrentProcess().Id;
                    foreach (Process p in Process.GetProcessesByName("PointBlank"))
                    {
                        if (p.Id != currentId)
                        {
                            try { p.Kill(); } catch { }
                        }
                    }
                    Thread.Sleep(400);
                    singleInstanceMutex = new Mutex(true, "PointBlankStudio_SingleInstance_Mutex", out isFirstInstance);
                }
                catch { }
            }

            try
            {
                // 1. Check Node.js prerequisite
                if (!IsNodeInstalled())
                {
                    DialogResult res = MessageBox.Show(
                        "Node.js was not found on your system.\n\nPoint Blank Studio requires Node.js (version 18 or newer) to run.\n\nWould you like to open https://nodejs.org to download it now?",
                        "Point Blank Studio — Missing Requirement",
                        MessageBoxButtons.YesNo,
                        MessageBoxIcon.Warning
                    );
                    if (res == DialogResult.Yes)
                    {
                        Process.Start("https://nodejs.org");
                    }
                    return;
                }

                // 2. Check if server is already running on port
                bool alreadyRunning = IsServerResponding();

                if (!alreadyRunning)
                {
                    // Ensure dependencies exist
                    string nodeModules = Path.Combine(appDir, "node_modules");
                    if (!Directory.Exists(nodeModules))
                    {
                        DialogResult installRes = MessageBox.Show(
                            "Point Blank Studio needs to perform a quick first-time installation of required components.\n\nClick OK to install automatically (this takes about 30 seconds).",
                            "Point Blank Studio — First Run Setup",
                            MessageBoxButtons.OKCancel,
                            MessageBoxIcon.Information
                        );
                        if (installRes != DialogResult.OK) return;

                        RunNpmInstall();
                    }

                    // Start background server
                    StartServerProcess();

                    // Wait for server to become responsive
                    bool ready = WaitForServer(15000);
                    if (!ready)
                    {
                        MessageBox.Show(
                            "Point Blank Studio server did not start in time. Check if another application is using port " + port + ".",
                            "Point Blank Studio",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Error
                        );
                        CleanupAndExit();
                        return;
                    }
                }

                // 3. Open dedicated app window
                OpenAppWindow();

                // 4. Setup System Tray Icon
                SetupTrayIcon();

                // 5. Watch server process and heartbeat
                ThreadPool.QueueUserWorkItem(delegate
                {
                    while (true)
                    {
                        Thread.Sleep(1500);
                        if (serverProcess != null && serverProcess.HasExited)
                        {
                            // Server was stopped (e.g. user clicked Shutdown in web UI)
                            if (trayIcon != null)
                            {
                                trayIcon.Visible = false;
                            }
                            Application.Exit();
                            break;
                        }
                        if (serverProcess == null && !IsServerResponding())
                        {
                            // External server stopped
                            if (trayIcon != null)
                            {
                                trayIcon.Visible = false;
                            }
                            Application.Exit();
                            break;
                        }
                    }
                });

                Application.Run();
            }
            finally
            {
                CleanupAndExit();
            }
        }

        private static int ReadPortFromEnv()
        {
            try
            {
                string envPath = Path.Combine(appDir, ".env");
                if (File.Exists(envPath))
                {
                    string[] lines = File.ReadAllLines(envPath);
                    foreach (string line in lines)
                    {
                        string trimmed = line.Trim();
                        if (trimmed.StartsWith("PORT="))
                        {
                            string val = trimmed.Substring(5).Trim();
                            int parsed;
                            if (int.TryParse(val, out parsed))
                            {
                                return parsed;
                            }
                        }
                    }
                }
            }
            catch { }
            return 3000;
        }

        private static bool IsNodeInstalled()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("node", "-v");
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.RedirectStandardOutput = true;
                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit(3000);
                    return p.ExitCode == 0;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void RunNpmInstall()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c npm install");
                psi.WorkingDirectory = appDir;
                psi.CreateNoWindow = false; // Show user that npm is installing
                psi.UseShellExecute = false;
                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit();
                }
            }
            catch { }
        }

        private static void StartServerProcess()
        {
            string serverJs = Path.Combine(appDir, "server.js");
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo("node.exe", "\"" + serverJs + "\"");
                psi.WorkingDirectory = appDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                serverProcess = Process.Start(psi);
            }
            catch
            {
                ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c node \"" + serverJs + "\"");
                psi.WorkingDirectory = appDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                serverProcess = Process.Start(psi);
            }
        }

        private static bool IsServerResponding()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://localhost:" + port + "/");
                req.Timeout = 1200;
                req.Method = "GET";
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static bool WaitForServer(int timeoutMs)
        {
            int elapsed = 0;
            int step = 250;
            while (elapsed < timeoutMs)
            {
                if (serverProcess != null && serverProcess.HasExited)
                {
                    return false;
                }
                if (IsServerResponding())
                {
                    return true;
                }
                Thread.Sleep(step);
                elapsed += step;
            }
            return false;
        }

        public static void OpenAppWindow()
        {
            string url = "http://localhost:" + port;

            // Search for Microsoft Edge (installed on every Windows 10/11 system)
            string edgeProg86 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            string edgeProg = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            string chromeProg = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            string chromeProg86 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");

            string browserExe = null;
            if (File.Exists(edgeProg86)) browserExe = edgeProg86;
            else if (File.Exists(edgeProg)) browserExe = edgeProg;
            else if (File.Exists(chromeProg)) browserExe = chromeProg;
            else if (File.Exists(chromeProg86)) browserExe = chromeProg86;

            if (browserExe != null)
            {
                try
                {
                    // Launches PointBlank in standalone App Mode (borderless application window, no URL bar, no tabs)
                    ProcessStartInfo psi = new ProcessStartInfo(browserExe, string.Format("--app={0} --window-size=1440,900", url));
                    Process.Start(psi);
                    return;
                }
                catch { }
            }

            // Fallback: Default system browser
            try
            {
                Process.Start(url);
            }
            catch
            {
                Process.Start("cmd.exe", "/c start " + url);
            }
        }

        private static void SetupTrayIcon()
        {
            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add(new MenuItem("Open Point Blank Studio", delegate { OpenAppWindow(); }));
            menu.MenuItems.Add(new MenuItem("Open in Default Browser", delegate { Process.Start("http://localhost:" + port); }));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add(new MenuItem("Shut Down Point Blank Studio", delegate { CleanupAndExit(); }));

            trayIcon = new NotifyIcon();
            trayIcon.Text = "Point Blank Studio";

            string icoPath = Path.Combine(appDir, "app.ico");
            if (File.Exists(icoPath))
            {
                try { trayIcon.Icon = new Icon(icoPath); }
                catch { trayIcon.Icon = SystemIcons.Application; }
            }
            else
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.ContextMenu = menu;
            trayIcon.Visible = true;
            trayIcon.DoubleClick += delegate { OpenAppWindow(); };

            trayIcon.ShowBalloonTip(
                2000,
                "Point Blank Studio",
                "Point Blank Studio is active at http://localhost:" + port + ".\nDouble-click this tray icon to open.",
                ToolTipIcon.Info
            );
        }

        private static void CleanupAndExit()
        {
            try
            {
                if (trayIcon != null)
                {
                    trayIcon.Visible = false;
                    trayIcon.Dispose();
                    trayIcon = null;
                }
            }
            catch { }

            // Notify backend shutdown endpoint if possible
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://localhost:" + port + "/api/shutdown");
                req.Method = "POST";
                req.Timeout = 1000;
                req.ContentLength = 0;
                using (req.GetResponse()) { }
            }
            catch { }

            // Kill child server process if still alive
            try
            {
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    serverProcess.Kill();
                }
            }
            catch { }

            try
            {
                if (singleInstanceMutex != null)
                {
                    singleInstanceMutex.ReleaseMutex();
                    singleInstanceMutex = null;
                }
            }
            catch { }

            Application.Exit();
        }
    }
}
