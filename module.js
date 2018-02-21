window.addEventListener('load', init);

var canvas,
    canvas_ctx,
    uvCanvas,
    uv_ctx,
    overlayCanvas,
    overlay_ctx,
    textureArea,
    buttonDiv,
    button,
    XDO_file;

var urlText,
    urlInput;

var imageUrl,
    checkUV,
    downloadButton,
    image_heigth,
    image_width;

var loadfileIndex,
    click_width,
    click_heigth;

var appendFileInput;
var selecterUVList;

var point1_x, point2_x, point3_x,
    point1_y, point2_y, point3_y,
    modifybutton;

var overlayImage, overlayStart_x, overlayStart_y;

function init() {
    XDO_file = new XDO();

    button = document.querySelector('input#loadButton');
    urlInput = document.querySelector('input#urlInput');
    downloadButton = document.querySelector('input#downloadButton');
    textureArea = document.querySelector('div#textureArea');
    appendFileInput = document.querySelector('input#appendImage');

    button.addEventListener('change', fileChangeHandler, false);
    urlInput.addEventListener('click', urlInputHandler, false);
    downloadButton.addEventListener('click', canvasImageDownHandler, false);
    appendFileInput.addEventListener('change', appendFileHandler, false);

    canvas = document.querySelector('canvas#loadImage');
    uvCanvas = document.querySelector('canvas#uvCanvas');
    overlayCanvas = document.querySelector('canvas#overlayImage');
    checkUV = document.querySelector('input#checkUV');
    buttonDiv = document.getElementById('faceDraw');

    urlText = document.querySelector('input#XDO_url');
    click_width = document.querySelector('input#click_width');
    click_heigth = document.querySelector('input#click_heigth');

    overlayCanvas.addEventListener('click', function (event) {
        click_width.value = event.layerX;
        click_heigth.value = event.layerY;
    });
    //overlayCanvas.addEventListener()

    canvas_ctx = canvas.getContext('2d');
    uv_ctx = uvCanvas.getContext('2d');
    overlay_ctx = overlayCanvas.getContext('2d');

    selecterUVList = document.querySelector('select#uvlist');
    selecterUVList.addEventListener('change', selectUVChangeHandler);

    point1_x = document.querySelector('input#point1_x');
    point2_x = document.querySelector('input#point2_x');
    point3_x = document.querySelector('input#point3_x');

    point1_y = document.querySelector('input#point1_y');
    point2_y = document.querySelector('input#point2_y');
    point3_y = document.querySelector('input#point3_y');

    modifybutton = document.querySelector('input#modify');
    modifybutton.addEventListener('click', modifyUVHandler);
}


function addButton(buttonValue) {
    let element = document.createElement('button');
    element.innerText = buttonValue + 'Num face';
    element.setAttribute('data-arg', buttonValue);

    element.addEventListener('click', drawButtonHandler);
    buttonDiv.appendChild(element);
}

function fileReader(blobFile) {
    clearFaceButton();
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

function drawImage(image, inCanvas, Ctx, startX, startY) {

    Ctx.clearRect(0, 0, inCanvas.width, inCanvas.height);

    image_heigth = image.naturalHeight;
    image_width = image.naturalWidth;

    inCanvas.width = image_width;
    inCanvas.height = image_heigth;

    if (image instanceof HTMLImageElement) {
        Ctx.drawImage(image, startX, startY, image.width, image.height);
    } else if (image instanceof ImageData) {
        Ctx.putImageData(image, startX, startY);
    }
    clearSelectList();

    //TODO: face 여러개 나오는 것은 getUV(face_index) 로 처리
    if (checkUV.checked)
        uvLinedraw(uv_ctx, XDO_file.getUV(loadfileIndex), 100, uvCanvas);
    else
        uvLinedraw(uv_ctx, XDO_file.getUV(loadfileIndex), 0, uvCanvas);
    ''
}

function overlayDraw(image, inCanvas, Ctx, startX, startY){
    Ctx.clearRect(0, 0, inCanvas.width, inCanvas.height);

    inCanvas.width = image_width;
    inCanvas.height = image_heigth;

    if (image instanceof HTMLImageElement) {
        Ctx.drawImage(image, startX, startY, image.width, image.height);
    } else if (image instanceof ImageData) {
        Ctx.putImageData(image, startX, startY);
    }
}

function uvLinedraw(uv_ctx, uv, alpha, uvCanvas) {

    uv_ctx.clearRect(0, 0, image_width, image_heigth);

    uvCanvas.width = image_width;
    uvCanvas.height = image_heigth;

    uv_ctx.beginPath();
    if (uv != undefined && uv.length > 6) {
        //전체 uv를 그리기
        uv_ctx.strokeStyle = 'rgba(255, 0, 0,' + alpha + ')';

        let convertUV = [];
        let temp = [];
        for (let i = 0, startPoint; i < uv.length; i += 2) {
            let tempPoint = [Number(uv[i]) * image_width, Number(uv[i + 1]) * image_heigth];
            temp.push(tempPoint);
            if (i % 6 == 0) {
                uv_ctx.moveTo(tempPoint[0], tempPoint[1]);
                startPoint = tempPoint.slice(0, 2);
            }
            else {
                uv_ctx.lineTo(tempPoint[0], tempPoint[1]);
                uv_ctx.stroke();
                if (i % 6 == 4) {
                    uv_ctx.lineTo(startPoint[0], startPoint[1]);
                    uv_ctx.stroke();
                    convertUV.push(temp);
                    temp = [];
                }
            }
        }
        clearSelectList();
        setSelectListItem(convertUV);
    }
    else if (uv != undefined) {

        //한점 그리기 혹은 아예 안그리기. 이 때에는 ctx와 uv 만 받는다.
        uv_ctx.strokeStyle = 'rgba(51, 255, 255,' + alpha + ')';
        for (let i = 0, startPoint; i < uv.length; i += 2) {
            let tempPoint = [Number(uv[i]), Number(uv[i + 1])];
            if (i % 6 == 0) {
                uv_ctx.moveTo(tempPoint[0], tempPoint[1]);
                startPoint = tempPoint.slice(0, 2);
            }
            else {
                uv_ctx.lineTo(tempPoint[0], tempPoint[1]);
                uv_ctx.stroke();
                if (i % 6 == 4) {
                    uv_ctx.lineTo(startPoint[0], startPoint[1]);
                    uv_ctx.stroke();
                }
            }
        }
    }
    else {
        //TODO UV undifinde... draw one point
    }
}

function setSelectListItem(itemList) {
    let offset = 1;
    for (let item of itemList) {
        let optionItem = document.createElement('option');
        optionItem.text = offset + "번째 사각형";
        optionItem.value = item;
        selecterUVList.add(optionItem);
        offset++;
    }
    offset = null;
}

function setPointText(pointList){
    point1_x.value = pointList[0], point1_y.value = pointList[1],
    point2_x.value = pointList[2], point2_y.value = pointList[3],
    point3_x.value = pointList[4], point3_y.value = pointList[5];
}

function clearFaceButton() {
    buttonDiv.innerText = '';
}

function clearSelectList() {
    selecterUVList.innerText = null;
}

function clearPointText() {
    point1_x.value = 0, point1_y.value = 0,
    point2_x.value = 0, point2_y.value = 0,
    point3_x.value = 0, point3_y.value = 0;
}

function getPoint() {
    return [
        [
            Number(point1_x.value) / canvas.width, Number(point1_y.value) / canvas.height,
            Number(point2_x.value) / canvas.width, Number(point2_y.value) / canvas.height,
            Number(point3_x.value) / canvas.width, Number(point3_y.value) / canvas.height
        ],
        [
            Number(point1_x.value) , Number(point1_y.value),
            Number(point2_x.value) , Number(point2_y.value),
            Number(point3_x.value) , Number(point3_y.value)
        ]

    ]
    
}
