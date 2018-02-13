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
    imageUrl = 'XDOLink';
    fileReader(fileData);

}

/*
function appendFileHandler(event) {
    if(click_width.value == "0" && click_heigth.value == "0"){
        alert('not coordinate!');
        return;
    }

    let file = event.target.files[0];
    let filereader = new FileReader();
    let image = new Image();

    filereader.onload = function (e) {
        image.src = e.target.result;
        image.onload = function () {
            let heigth = image.naturalHeight;
            let width = image.naturalWidth;

            appendCanvas.height = heigth;
            appendCanvas.width = width;

            if (image instanceof HTMLImageElement) {
                Ctx.drawImage(image, Number(click_width.value), Number(click_heigth.value), heigth);
            } else if (image instanceof ImageData) {
                Ctx.putImageData(image, Number(click_width.value), Number(click_heigth.value));
            }
        }
    }
    filereader.readAsDataURL(file);

}
*/

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
        drawImage(image, canvas, canvas_ctx);
    }
}

function canvasImageDownHandler(){
    let imageData = canvas.toDataURL();
    if(file === undefined){
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
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function selectUVChangeHandler(){
    let uv = this.options[this.selectedIndex].value.split(',');
    if(oldUVSelectLine != null){
        clearPastLine();
    }
    uvLinedraw(canvas_ctx, uv, 100);

}