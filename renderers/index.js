const { remote, ipcRenderer, desktopCapturer, screen } = require('electron');

const image = document.getElementById('show-img');

let cutBtn = document.getElementById('region-cut');
cutBtn.addEventListener('click', regionCut);

let saveBtn = document.getElementById('save-img');
saveBtn.addEventListener('click', ()=>{
  ipcRenderer.send('save-dialog', image.src);
});

let closeBtn = document.getElementById("close-app");
closeBtn.addEventListener('click', ()=>{
  remote.getCurrentWindow().close();
});

function regionCut() {
  getPrintScreen();
}

function determineScreenShotSize() {
  const screenSize = screen.getPrimaryDisplay().workAreaSize
  const maxDimension = Math.max(screenSize.width, screenSize.height)
  return {
    width: maxDimension * window.devicePixelRatio,
    height: maxDimension * window.devicePixelRatio
  }
}

function getPrintScreen() {
  const thumbSize = determineScreenShotSize();
  let options = { types: ["window", "screen"], thumbnailSize: thumbSize };
  desktopCapturer.getSources(options, (error, sources) => {
    if (error) throw error;
    sources.forEach((source)=>{
      if (source.name === 'Screen 1' || source.name === 'Entire screen') {
        ipcRenderer.send("shader-img-ready", source.thumbnail.toDataURL());
      }
    });

  });
}


ipcRenderer.on('img-ready', (event, data)=>{
  image.setAttribute('src', data);
});
