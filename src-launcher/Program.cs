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

        private static readonly object logLock = new object();
        private static void Log(string msg)
        {
            try
            {
                lock (logLock)
                {
                    string logFile = Path.Combine(appDir, "launcher.log");
                    using (FileStream fs = new FileStream(logFile, FileMode.Append, FileAccess.Write, FileShare.ReadWrite))
                    using (StreamWriter sw = new StreamWriter(fs))
                    {
                        sw.WriteLine(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff") + " [LAUNCHER] " + msg);
                    }
                }
            }
            catch { }
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            appDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(appDir);

            Log("=== Point Blank Studio Launcher Starting ===");

            port = ReadPortFromEnv();
            Log("Target port: " + port);

            bool isFirstInstance = AcquireSingleInstance();
            Log("AcquireSingleInstance result: " + isFirstInstance);

            if (!isFirstInstance)
            {
                if (IsServerResponding())
                {
                    Log("Secondary instance detected and server is responding; opening app window and exiting.");
                    OpenAppWindow();
                    ReleaseMutex();
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
                    Thread.Sleep(300);
                    isFirstInstance = AcquireSingleInstance();
                }
                catch { }
            }

            try
            {
                // 1. Check Node.js prerequisite
                string nodePath = ResolveNodePath();
                Log("Resolved nodePath: " + nodePath);

                if (!IsNodeInstalled(nodePath))
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

                Log("Checking if server is already running...");
                bool alreadyRunning = IsServerResponding();
                Log("Is server already running on port " + port + "? " + alreadyRunning);

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
                    StartServerProcess(nodePath);

                    // Wait for server to become responsive
                    bool ready = WaitForServer(20000);
                    if (!ready)
                    {
                        string exitInfo = (serverProcess != null && serverProcess.HasExited) 
                            ? " (Server process exited with code " + serverProcess.ExitCode + ")" 
                            : "";
                        Log("Server failed to become responsive within timeout" + exitInfo);

                        MessageBox.Show(
                            "Point Blank Studio server did not start in time" + exitInfo + ".\n\nPlease check launcher.log or run start.bat to view console diagnostics.",
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
                            Log("Server process exited; shutting down launcher.");
                            if (trayIcon != null)
                            {
                                trayIcon.Visible = false;
                            }
                            Application.Exit();
                            break;
                        }
                        if (serverProcess == null && !IsServerResponding())
                        {
                            Log("Server stopped responding; shutting down launcher.");
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
            catch (Exception ex)
            {
                Log("FATAL UNHANDLED EXCEPTION in Main: " + ex.ToString());
            }
            finally
            {
                CleanupAndExit();
            }
        }

        private static bool AcquireSingleInstance()
        {
            try
            {
                bool createdNew;
                singleInstanceMutex = new Mutex(true, "Local\\PointBlankStudio_SingleInstance_Mutex", out createdNew);
                if (createdNew) return true;

                if (singleInstanceMutex.WaitOne(500, false))
                {
                    return true;
                }
            }
            catch (AbandonedMutexException)
            {
                // Previous owner terminated without releasing; we safely assume ownership
                return true;
            }
            catch { }
            return false;
        }

        private static void ReleaseMutex()
        {
            try
            {
                if (singleInstanceMutex != null)
                {
                    singleInstanceMutex.ReleaseMutex();
                    singleInstanceMutex.Close();
                    singleInstanceMutex = null;
                }
            }
            catch { }
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

        private static string ResolveNodePath()
        {
            string[] searchPaths = new string[]
            {
                @"C:\Program Files\nodejs\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\nodejs\node.exe")
            };
            foreach (string p in searchPaths)
            {
                if (File.Exists(p)) return p;
            }
            return "node.exe";
        }

        private static bool IsNodeInstalled(string nodePath)
        {
            if (File.Exists(nodePath)) return true;
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo(nodePath, "-v");
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

        private static void StartServerProcess(string nodePath)
        {
            string serverJs = Path.Combine(appDir, "server.js");
            Log("Starting server process: " + nodePath + " \"" + serverJs + "\" in " + appDir);

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = nodePath;
                psi.Arguments = "\"" + serverJs + "\"";
                psi.WorkingDirectory = appDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;

                serverProcess = new Process();
                serverProcess.StartInfo = psi;
                serverProcess.OutputDataReceived += (s, e) => {
                    if (!string.IsNullOrEmpty(e.Data)) Log("[SERVER-OUT] " + e.Data);
                };
                serverProcess.ErrorDataReceived += (s, e) => {
                    if (!string.IsNullOrEmpty(e.Data)) Log("[SERVER-ERR] " + e.Data);
                };

                serverProcess.Start();
                serverProcess.BeginOutputReadLine();
                serverProcess.BeginErrorReadLine();

                Log("serverProcess started with PID: " + serverProcess.Id);
            }
            catch (Exception ex)
            {
                Log("Failed to start with nodePath, attempting cmd fallback. Error: " + ex.Message);
                try
                {
                    ProcessStartInfo psi = new ProcessStartInfo("cmd.exe", "/c node \"" + serverJs + "\"");
                    psi.WorkingDirectory = appDir;
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;

                    serverProcess = Process.Start(psi);
                    Log("serverProcess (cmd fallback) started with PID: " + (serverProcess != null ? serverProcess.Id.ToString() : "null"));
                }
                catch (Exception ex2)
                {
                    Log("Failed cmd fallback: " + ex2.Message);
                }
            }
        }

        private static bool IsServerResponding()
        {
            System.Net.Sockets.Socket socket = null;
            try
            {
                socket = new System.Net.Sockets.Socket(
                    System.Net.Sockets.AddressFamily.InterNetwork,
                    System.Net.Sockets.SocketType.Stream,
                    System.Net.Sockets.ProtocolType.Tcp
                );
                socket.Blocking = false;
                try
                {
                    socket.Connect(new IPEndPoint(IPAddress.Loopback, port));
                }
                catch (System.Net.Sockets.SocketException se)
                {
                    // 10035 = WSAEWOULDBLOCK (expected for non-blocking socket)
                    if (se.NativeErrorCode != 10035) return false;
                }

                // Poll for connection completion with 400ms timeout
                bool isWritable = socket.Poll(400 * 1000, System.Net.Sockets.SelectMode.SelectWrite);
                if (!isWritable) return false;

                // Check for socket connection error
                int errorCode = (int)socket.GetSocketOption(
                    System.Net.Sockets.SocketOptionLevel.Socket,
                    System.Net.Sockets.SocketOptionName.Error
                );
                return errorCode == 0;
            }
            catch
            {
                return false;
            }
            finally
            {
                if (socket != null)
                {
                    try { socket.Close(); } catch { }
                }
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
                    Log("serverProcess exited prematurely with code: " + serverProcess.ExitCode);
                    return false;
                }
                if (IsServerResponding())
                {
                    Log("Server responding after " + elapsed + " ms");
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

            Log("OpenAppWindow with browserExe: " + (browserExe ?? "default browser") + " URL: " + url);

            if (browserExe != null)
            {
                try
                {
                    // Launches PointBlank in standalone App Mode (borderless application window, no URL bar, no tabs)
                    ProcessStartInfo psi = new ProcessStartInfo(browserExe, string.Format("--app={0} --window-size=1440,900", url));
                    Process.Start(psi);
                    return;
                }
                catch (Exception ex)
                {
                    Log("Failed to start browser in app mode: " + ex.Message);
                }
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
            Log("CleanupAndExit called");

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
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/api/shutdown");
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

            ReleaseMutex();
            Application.Exit();
        }
    }
}
