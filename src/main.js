const electron = require('electron');

const { app, BrowserWindow, Menu } = electron;

let mainWindow;

// Listen for app to be ready
app.on('ready', function () {
    // Create new window
    mainWindow = new BrowserWindow({
        title: 'Cripteaza! Decripteaza!',
        // width: 700,
        // height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Load html into window
    mainWindow.loadFile('src/index.html');
});