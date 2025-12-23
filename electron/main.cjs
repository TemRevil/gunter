const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');

function createWindow() {
    const isDev = !app.isPackaged;
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
        autoHideMenuBar: true
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

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
    const mainWindow = BrowserWindow.getAllWindows()[0];
    const sendLog = (msg) => {
        console.log(msg);
        if (mainWindow) {
            mainWindow.webContents.send('update-log', msg);
        }
    };

    sendLog('Update execution started...');
    sendLog(`Download URL: ${url}`);

    const installerPath = path.join(app.getPath('temp'), 'GunterSetup.exe');

    sendLog(`Download path: ${installerPath}`);
    sendLog('Starting download...');

    const downloadFile = (downloadUrl) => {
        const file = fs.createWriteStream(installerPath);

        https.get(downloadUrl, (response) => {
            // Handle redirects
            if (response.statusCode === 302 || response.statusCode === 301) {
                sendLog(`Following redirect to: ${response.headers.location}`);
                file.close();
                // Clean up partial file
                try {
                    fs.unlinkSync(installerPath);
                } catch (e) { }
                // Follow the redirect
                downloadFile(response.headers.location);
                return;
            }

            if (response.statusCode !== 200) {
                file.close();
                try {
                    fs.unlinkSync(installerPath);
                } catch (e) { }
                sendLog(`Download failed with status code: ${response.statusCode}`);
                return;
            }

            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloadedSize = 0;
            let lastPercent = 0;

            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                const percent = Math.floor((downloadedSize / totalSize) * 100);
                if (percent !== lastPercent && percent % 10 === 0) {
                    sendLog(`Downloading: ${percent}%`);
                    lastPercent = percent;
                }
            });

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                sendLog('Download 100% complete!');
                sendLog('Launching installer...');

                // Launch the installer
                try {
                    spawn(installerPath, [], {
                        detached: true,
                        stdio: 'ignore'
                    }).unref();

                    sendLog('Installer launched successfully!');
                    sendLog('Closing app in 2 seconds...');

                    // Close the app after 2 seconds
                    setTimeout(() => {
                        app.quit();
                    }, 2000);
                } catch (err) {
                    sendLog(`Error launching installer: ${err.message}`);
                }
            });

            file.on('error', (err) => {
                try {
                    fs.unlinkSync(installerPath);
                } catch (e) { }
                sendLog(`File write error: ${err.message}`);
            });
        }).on('error', (err) => {
            try {
                fs.unlinkSync(installerPath);
            } catch (e) { }
            sendLog(`Download error: ${err.message}`);
        });
    };

    try {
        downloadFile(url);
    } catch (err) {
        sendLog(`Error starting download: ${err.message}`);
    }
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
