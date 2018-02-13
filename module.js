window.addEventListener('load', init);

var canvas,
    canvas_ctx,
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

//var appendFileInput;
var selecterUVList,
    oldUVSelectLine;

function init() {
    XDO_file = new XDO();

    button = document.querySelector('input#loadButton');
    urlInput = document.querySelector('input#urlInput');
    downloadButton = document.querySelector('input#downloadButton');
    //   appendFileInput = document.querySelector('input#appendImage');

    button.addEventListener('change', fileChangeHandler, false);
    urlInput.addEventListener('click', urlInputHandler, false);
    downloadButton.addEventListener('click', canvasImageDownHandler, false);
    //    appendFileInput.addEventListener('click', appendFileHandler, false);

    canvas = document.querySelector('canvas#loadImage');
    checkUV = document.querySelector('input#checkUV');
    buttonDiv = document.getElementById('faceDraw');

    urlText = document.querySelector('input#XDO_url');
    click_width = document.querySelector('input#click_width');
    click_heigth = document.querySelector('input#click_heigth');

    canvas.addEventListener('click', function (event) {
        click_width.value = event.layerX;
        click_heigth.value = event.layerY;
    });
    canvas_ctx = canvas.getContext('2d');

    selecterUVList = document.querySelector('select#uvlist');
    selecterUVList.addEventListener('change', selectUVChangeHandler);
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

function drawImage(image, inCanvas, Ctx) {

    Ctx.clearRect(0, 0, inCanvas.width, inCanvas.height);

    image_heigth = image.naturalHeight;
    image_width = image.naturalWidth;

    inCanvas.width = image_width;
    inCanvas.height = image_heigth


    if (image instanceof HTMLImageElement) {
        Ctx.drawImage(image, 0, 0, image.width, image.height);
    } else if (image instanceof ImageData) {
        Ctx.putImageData(image, 0, 0);
    }
    clearSelectList();
    //TODO: face 여러개 나오는 것은 getUV[index] 로 처리
    if (checkUV.checked)
        uvLinedraw(Ctx, XDO_file.getUV()[loadfileIndex], 100);
    else
        uvLinedraw(Ctx, XDO_file.getUV()[loadfileIndex], 0);
    ''


}

function uvLinedraw(Ctx, uv, alpha) {

    Ctx.beginPath();
    if (uv != undefined && uv.length > 6) {
        //전체 uv를 그리기
        Ctx.strokeStyle = 'rgba(255, 0, 0,' + alpha + ')';

        let convertUV = [];
        let temp = [];
        for (let i = 0, startPoint; i < uv.length; i += 2) {
            let tempPoint = [Number(uv[i]) * image_width, Number(uv[i + 1]) * image_heigth];
            temp.push(tempPoint);
            if (i % 6 == 0) {
                Ctx.moveTo(tempPoint[0], tempPoint[1]);
                startPoint = tempPoint.slice(0, 2);
            }
            else {
                Ctx.lineTo(tempPoint[0], tempPoint[1]);
                Ctx.stroke();
                if (i % 6 == 4) {
                    Ctx.lineTo(startPoint[0], startPoint[1]);
                    Ctx.stroke();
                    convertUV.push(temp);
                    temp = [];
                }
            }
        }
        clearSelectList();
        setSelectListItem(convertUV);
    }
    else if (uv != undefined) {
        if (alpha == 100) {
            oldUVSelectLine = uv;
        }
        //한점 그리기 혹은 아예 안그리기. 이 때에는 ctx와 uv 만 받는다.
        Ctx.strokeStyle = 'rgba(51, 255, 255,' + alpha + ')';
        for (let i = 0, startPoint; i < uv.length; i += 2) {
            let tempPoint = [Number(uv[i]), Number(uv[i + 1])];
            if (i % 6 == 0) {
                Ctx.moveTo(tempPoint[0], tempPoint[1]);
                startPoint = tempPoint.slice(0, 2);
            }
            else {
                Ctx.lineTo(tempPoint[0], tempPoint[1]);
                Ctx.stroke();
                if (i % 6 == 4) {
                    Ctx.lineTo(startPoint[0], startPoint[1]);
                    Ctx.stroke();
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
function clearSelectList() {
    selecterUVList.innerText = null;
}

function clearPastLine() {
    uvLinedraw(canvas_ctx, oldUVSelectLine, 0);
}