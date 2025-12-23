const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
    const isDev = !app.isPackaged;
    // Define icon path dynamically
    const iconPath = isDev
        ? path.join(__dirname, '../public/icon.png')
        : path.join(__dirname, '../dist/icon.png');

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: iconPath,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        // Hide the default menu bar on Windows/Linux (optional, simpler look)
        autoHideMenuBar: true
    });

    if (isDev) {
        // In development, load from the Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools for debugging
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        // We assume dist is one level up from this file (which is in electron/)
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Handle notification requests from renderer
ipcMain.on('show-notification', (event, { title, body }) => {
    if (Notification.isSupported()) {
        const isDev = !app.isPackaged;
        const iconPath = isDev
            ? path.join(__dirname, '../public/icon.png')
            : path.join(__dirname, '../dist/icon.png');

        const notification = new Notification({
            title: title,
            body: body,
            icon: iconPath,
            urgency: 'normal'
        });
        notification.show();
    }
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.on('execute-update', (event, { url }) => {
    const tempPath = app.getPath('temp');
    const installerPath = path.join(tempPath, 'GunterSetup.exe');
    const currentPid = process.pid;

    // Command to run in Windows Terminal
    const psCommand = `
        $Host.UI.RawUI.WindowTitle = "Gunter System Updater";
        Clear-Host;
        Write-Host "=========================================" -ForegroundColor Cyan;
        Write-Host "      GUNTER SYSTEM AUTO-UPDATER         " -ForegroundColor Cyan;
        Write-Host "=========================================" -ForegroundColor Cyan;
        Write-Host "";
        Write-Host "[1/3] Downloading latest setup..." -ForegroundColor Yellow;
        
        try {
            Invoke-WebRequest -Uri "${url}" -OutFile "${installerPath}" -ErrorAction Stop;
            Write-Host ">>> Download complete." -ForegroundColor Green;
        } catch {
            Write-Host ">>> Error: Failed to download update." -ForegroundColor Red;
            Write-Host $_.Exception.Message;
            Pause;
            Exit;
        }

        Write-Host "";
        Write-Host "[2/3] Launching installer..." -ForegroundColor Yellow;
        Start-Process "${installerPath}";
        
        Write-Host "";
        Write-Host "[3/3] Closing current build for installation..." -ForegroundColor Yellow;
        Write-Host "The application will restart after you finish the setup." -ForegroundColor Gray;
        Start-Sleep -Seconds 2;
        Stop-Process -Id ${currentPid} -Force;
    `;

    // Try to launch Windows Terminal, fallback to powershell if not available
    const args = ['powershell', '-NoExit', '-Command', psCommand];

    const wt = spawn('wt.exe', args, {
        detached: true,
        stdio: 'ignore'
    });

    wt.on('error', () => {
        // Fallback to standard powershell window
        spawn('powershell.exe', ['-NoExit', '-Command', psCommand], {
            detached: true,
            stdio: 'ignore'
        });
    });
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
