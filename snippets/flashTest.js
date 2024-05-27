
var flashUp = false;
var flashInterval = setInterval(displayFlash, 500);

function displayFlash() {
    if (flashUp) {
        moveDisplays.forEach(e => {
            e.render.classList.add("flash");
        })
        flashUp = false;
    }
    else {
        moveDisplays.forEach(e => {
            e.render.classList.remove("flash");
        })
        flashUp = true;
    }
}


.flash {
    background-color: rgba(255, 255, 255, 0.0);
}