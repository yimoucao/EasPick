const { remote, ipcRenderer, desktopCapturer, screen } = require('electron');
const {BrowserWindow} = remote
const path = require('path')
const url = require('url')

const {width, height} = screen.getPrimaryDisplay().size
const canvas = document.querySelector('canvas');
const video = document.querySelector('video');
const image = document.getElementById('show-img');

let button1 = document.getElementById('region-cut');
button1.addEventListener('click', regionCut);

function regionCut() {
  getPrintScreen();
}

function getPrintScreen() {
  desktopCapturer.getSources({ types: ['window', 'screen'] }, (error, sources) => {
    if (error) throw error
    for (let i = 0; i < sources.length; ++i) {
      if (sources[i].name === 'Screen 1' || sources[i].name === 'Entire screen') {
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth: 20,
              // maxWidth: width,
              minHeight: 20,
              // maxHeight: height
            }
          }
        }).then((stream) => handleStream(stream))
          .catch((e) => handleError(e))
        return
      }
      // if (sources[i].name === 'Screen 1') {
      //   var image = sources[i].thumbnail;
      //   var url = image.toDataURL();
      //   var img_node = document.getElementById('shader-img')
      //   img_node.src = url;

      // }
    }
  });
}

function handleStream(stream) {
  video.srcObject = stream;
  video.onloadedmetadata = function (e) {
    video.play();
    DataURL = takepicture();
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    ipcRenderer.send('shader-img-ready', DataURL);
  };
}

function handleError(e) {
  console.log(e)
}

function takepicture() {
  var context = canvas.getContext('2d');
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    var data = canvas.toDataURL('image/png', 1.0); // toDataURL(type, quality)
    return data;
  }
}


ipcRenderer.on('img-ready', (event, data)=>{
  image.setAttribute('src', data);
});
