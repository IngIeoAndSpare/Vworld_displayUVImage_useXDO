function urlInputHandler() {
    //clear div child
    clearFaceButton();

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
    imageUrl = 'imageFileName';
    fileReader(fileData);
}

function appendFileHandler(event) {
    let file = event.target.files[0]; 

    if(click_width.value == "0" && click_heigth.value == "0"){
        alert('not coordinate!');
        event.preventDefault();
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert("not image");
        event.preventDefault();
        return;
    }

    let filereader = new FileReader();
    filereader.onload = function (e) {
        overlayImage = new Image();
        overlayImage.src = e.target.result;
        overlayImage.onload = function () {
            overlayDraw(overlayImage, overlayCanvas, overlay_ctx, Number(click_width.value), Number(click_heigth.value))
        }
    }
    filereader.readAsDataURL(file);
}


function drawButtonHandler(event) {
    let target = event.target;
    let index = Number(target.getAttribute('data-arg'));
    loadfileIndex = index;

    let image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');
    //TODO : faceNum 이 여러개일 때 XDO imageName 이 어떻게 들어오는지 보고 XDO.js 의 getImage()수정해야함. 나중에 getImage에 index 매개변수 전달 혹은 배열로... 
    let imageName = XDO_file.getImage().imageName;
    image.src = imageUrl + imageName + '.jpg';
    image.onload = function () {
        drawImage(image, canvas, canvas_ctx, 0, 0);
    }
    clearPointText();
}

function canvasImageDownHandler(){
    let imageData = canvas.toDataURL();
    if(imageData === undefined){
        alert('not image load..');
        return;
    }

    let filename = XDO_file.getImage().imageName;

    if (window.navigator.msSaveOrOpenBlob){
        window.navigator.msSaveOrOpenBlob(imageData, filename);
    }
    else { 
        let a = document.createElement("a");
        a.href = imageData;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(imageData);
        }, 0);
    }
}


function selectUVChangeHandler(){
    let uv = this.options[this.selectedIndex].value.split(',');
    uvLinedraw(uv_ctx, uv, 100, uvCanvas);
    setPointText(uv);
}

function modifyUVHandler(){
    let coorSet = getPoint();
    let origin_index = selecterUVList.selectedIndex * 6;
    let optionString = '';
    //XDO file uv 변경
    for(let i = 0; i < 6; i++, origin_index++){
        XDO_file.modifiedUV(loadfileIndex, origin_index, coorSet[0][i]);
        optionString += coorSet[1][i]+',';
    }
    //마지막 ',' 삭제
    selecterUVList.options[selecterUVList.selectedIndex].value = optionString.slice(0,-1);
}