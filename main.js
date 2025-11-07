const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const printer = require('pdf-to-printer');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  // Cargar Angular compilado
  mainWindow.loadFile(path.join(__dirname, 'dist/reservaciones/index.html'));
}

app.whenReady().then(() => {
  createWindow();
});

// Manejador de impresión PDF
ipcMain.handle('imprimir-pdf', async (event, filePath) => {
  try {
    await printer.print(filePath);
    return { success: true };
  } catch (error) {
    console.error('Error imprimiendo PDF:', error);
    return { success: false, error: error.message };
  }
});
