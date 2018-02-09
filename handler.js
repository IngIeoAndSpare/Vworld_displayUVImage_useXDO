window.addEventListener('load', init);

var canvas;
var canvas_ctx;
var buttonDiv;
var button;
var XDO_file;

var urlText;
var urlInput;

var imageUrl;
var checkUV;
var downloadButton;

function init() {
    button = document.querySelector('input#loadButton');
    button.addEventListener('change', fileChangeHandler);

    canvas = document.querySelector('canvas#loadImage');
    canvas_ctx = canvas.getContext('2d');

    buttonDiv = document.getElementById('faceDraw');

    XDO_file = new XDO();

    urlText = document.querySelector('input#XDO_url');
    urlInput = document.querySelector('input#urlInput');
    urlInput.addEventListener('click', urlInputHandler);

    checkUV = document.querySelector('input#checkUV');
    downloadButton = document.querySelector('input#downloadButton');
    downloadButton.addEventListener('click', canvasImageDownHandler, false);
}

function urlInputHandler() {
    //clear div child
    buttonDiv.innerText = '';

    let fileUrl = urlText.value;
    //remove '.xdo' text
    imageUrl = fileUrl.slice(0, fileUrl.indexOf('DataFile') + 9);

    if (fileUrl == null) {
        alert('text is empty');
        return;
    }
    let request = new XMLHttpRequest();

    request.open('GET', fileUrl, true);
    request.responseType = 'blob';
    request.onload = function () {
        fileReader(request.response);
    };
    request.send();
}


function fileChangeHandler(event) {
    let file = event.target.files[0];
    let fileData = new Blob([file]);
    imageUrl = 'XDOFILE';
    fileReader(fileData);

}

function drawButtonHandler(event) {
    let target = event.target;
    let index = Number(target.getAttribute('data-arg'));
    
    let image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    //TODO : faceNum 이 여러개일 때 XDO imageName 이 어떻게 들어오는지 보고 XDO.js 의 getImage()수정해야함. 나중에 getImage에 index 매개변수 전달 혹은 배열로... 
    let imageName = XDO_file.getImage().imageName;
    image.src = imageUrl + imageName + '.jpg';
    image.onload = function () {
        drawImageUV(image, XDO_file.getUV()[index], canvas, canvas_ctx);
    }
}

function canvasImageDownHandler(){
    downloadButton.href = canvas.toDataURL();
    downloadButton.download = 'test.png'
}

function addButton(buttonValue) {
    let element = document.createElement('button');
    element.innerText = buttonValue + 'Num face';
    element.setAttribute('data-arg', buttonValue);

    element.addEventListener('click', drawButtonHandler);
    buttonDiv.appendChild(element);
}

function fileReader(blobFile) {
    let fileLoader = new FileReader();

    fileLoader.readAsArrayBuffer(blobFile);
    fileLoader.onload = function () {
        let arraybuffer = fileLoader.result;

        //TODO : xdo file version 판단...
        XDO_file.readRealData(arraybuffer, 0, false);
        let faceNumber = XDO_file.getFaceNum();

        for (let i = 0; i < faceNumber; i++) {
            addButton(i);
        }
    }
}



function drawImageUV(image, uv, inCanvas, Ctx) {

    Ctx.clearRect(0, 0, inCanvas.width, inCanvas.height);

    let image_heigth = image.naturalHeight;
    let image_width = image.naturalWidth;

    inCanvas.width = image_width;
    inCanvas.height = image_heigth

    if (image instanceof HTMLImageElement) {
        Ctx.drawImage(image, 0, 0, image.width, image.height);
    } else if (image instanceof ImageData) {
        Ctx.putImageData(image, 0, 0);
    }

    let convertUV = [];
    Ctx.beginPath();
    
    if (checkUV.checked)
        Ctx.strokeStyle = 'rgba(255, 0, 0, 100)';
    else
        Ctx.strokeStyle = 'rgba(255, 0, 0, 0)';
    ''

    for (let i = 0, startPoint; i < uv.length; i += 2) {
        let tempPoint = [Number(uv[i]) * image_width, Number(uv[i + 1]) * image_heigth];
        if (i % 6 == 0) {
            Ctx.moveTo(tempPoint[0], tempPoint[1]);
            startPoint = tempPoint.slice(0, 2);
        }
        else {
            Ctx.lineTo(tempPoint[0], tempPoint[1]);
            Ctx.stroke();
            if (i % 6 == 2) {
                Ctx.lineTo(startPoint[0], startPoint[1]);
                Ctx.stroke();
            }
        }
    }

}
