const { ipcRenderer, remote, nativeImage, clipboard } = require('electron');
const { BrowserWindow } = remote;
const Cropper = require('cropperjs');

let cropper;

ipcRenderer.on('screenimage', (event, data) => {
    const image = document.getElementById('shader-img');
    image.setAttribute('src', data);

    cropper = new Cropper(image, {
        viewMode: 2,
        movable: false,
        rotatable: false,
        scalable: false,
        zoomable: false,
        autoCrop: false,
        ready() {
            cropper.setCanvasData({top:0});
            cropper.setDragMode("crop");
        },
        cropend() {
            ele = cropper.getCroppedCanvas();
            data = ele.toDataURL();
            // document.location.href = data;
            imgObj = nativeImage.createFromDataURL(data);
            clipboard.writeImage(imgObj);
            ipcRenderer.send('cropped-img-ready', data);
            cropper.destroy();
            remote.getCurrentWindow().close();
        }
    });
});