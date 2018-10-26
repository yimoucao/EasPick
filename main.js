const electron = require('electron');
const { app, BrowserWindow, ipcMain, dialog, nativeImage } = electron;
const path = require('path');
const url = require('url');

const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, shaderWindow;

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/statics/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    app.quit();
  })
}
function createShaderWindow() {
  shaderWindow = new BrowserWindow({
    frame: false,
    fullscreen: true,
    show: false
  });
  // and load the index.html of the app.
  shaderWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/statics/shader.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // shaderWindow.webContents.openDevTools();

  // Emitted when the shader window is closed.
  shaderWindow.on('closed', () => { shaderWindow = null; });

}

function createWindows() {
  createMainWindow();
  createShaderWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindows()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('shader-img-ready', (event, data) => {
  shaderWindow.webContents.send('screenimage', data);
  shaderWindow.show();
});

ipcMain.on('cropped-img-ready', (event, data)=>{
  mainWindow.webContents.send('img-ready', data);
});

ipcMain.on('save-dialog', (event, data)=>{
  const options = { title: "Save an Image", filters: [{ name: "Images", extensions: ["png", "jpg", "gif"] }] };
  dialog.showSaveDialog(options, filename => {
    img = nativeImage.createFromDataURL(data);
    fs.writeFile(filename, img.toPNG(), (error)=>{
      if (error) return console.log(error);
    });
  });
});
