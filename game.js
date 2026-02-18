const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic");

// Sprites
const imgBase = new Image();
imgBase.src = "assets/penguin_base.png";
const imgColor = new Image();
imgColor.src = "assets/penguin_color.png";
const mapImg = new Image();
mapImg.src = "assets/towntest.png";

let username = "", usernameColor = "#ff0000";
let state = "idle", frameIndex = 0, frameTimer = 0;

// Pinguim
const penguin = {x:400, y:250, targetX:400, targetY:250, speed:2.5, suffix:270, flip:false};
let mouseX = 400, mouseY = 250;

// Mouse
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    penguin.targetX = e.clientX - rect.left;
    penguin.targetY = e.clientY - rect.top;
    state = "walk";
});

// Telas
const usernameScreen = document.getElementById("usernameScreen");
const modeScreen = document.getElementById("modeScreen");
const onlineScreen = document.getElementById("onlineScreen");
const loaderScreen = document.getElementById("loaderScreen");

// 1️⃣ Próximo (username → modo) com nome padrão CP<number>
document.getElementById("nextButton").onclick = ()=>{
    const inputName = document.getElementById("usernameInput").value.trim();
    if(inputName === ""){
        const randNum = Math.floor(Math.random() * (59000 - 120 + 1)) + 120; // 120 até 59000
        username = `CP${randNum}`;
    } else {
        username = inputName;
    }
    usernameColor = document.getElementById("colorPicker").value;
    usernameScreen.style.display="none";
    modeScreen.style.display="flex";
};

// Cor do pinguim
document.getElementById("colorPicker").addEventListener("input", e => usernameColor = e.target.value);

// Chat
const chatInput = document.createElement("input");
chatInput.type = "text";
chatInput.placeholder = "Digite uma mensagem...";
chatInput.style.position = "absolute";
chatInput.style.bottom = "20px";
chatInput.style.left = "50%";
chatInput.style.transform = "translateX(-50%)";
chatInput.style.width = "300px";
chatInput.style.padding = "10px";
chatInput.style.borderRadius = "12px 12px 0 0";
chatInput.style.border = "2px solid #888";
chatInput.style.fontFamily = "'cpBurbankSmall',Arial,sans-serif";
chatInput.style.fontSize = "16px";
chatInput.style.outline = "none";
chatInput.style.background = "rgba(0,0,0,0.6)";
chatInput.style.color = "white";
document.body.appendChild(chatInput);

let chatMessage = "", chatTimer = 0;
chatInput.addEventListener("keydown", e => {
    if(e.key === "Enter" && chatInput.value.trim() !== ""){
        chatMessage = chatInput.value.trim();
        chatInput.value = "";
        chatTimer = 200;
    }
});
function drawChatBubble(){
    if(!chatMessage || chatTimer <= 0) return;
    chatTimer--;
    const bubbleWidth = ctx.measureText(chatMessage).width + 20;
    const bubbleHeight = 30;
    const bubbleX = penguin.x - bubbleWidth/2;
    const bubbleY = penguin.y - 30;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.font = "16px cpBurbankSmall, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(chatMessage, penguin.x, bubbleY + bubbleHeight/2);
    ctx.restore();
}

// 🔹 TOUCHABLES TEMPORÁRIO (substituir pelo towncollision.js real)
const touchableSquares = [];
for(let i = 0; i < 20; i++){
    for(let j = 0; j < 12; j++){
        touchableSquares.push({x:i, y:j}); // tudo atravessável
    }
}

// Funções do jogo
function drawShadow(){
    const shadowX = penguin.x, shadowY = penguin.y + 50;
    ctx.save();
    ctx.translate(shadowX, shadowY);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.filter = "blur(8px)";
    ctx.beginPath();
    ctx.ellipse(0,0,30,12,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
}

function calculateDirection(dx, dy){
    const absX = Math.abs(dx), absY = Math.abs(dy);
    penguin.flip = dx < 0;
    if(absX > absY*1.3) return 180;
    if(absY > absX*1.3) return dy > 0 ? 270 : 90;
    return dy > 0 ? 225 : 135;
}

function update(){
    if(!window.PenguinData || !window.PenguinData[state]) return; // evita erro undefined

    const dx = penguin.targetX - penguin.x;
    const dy = penguin.targetY - penguin.y;
    const dist = Math.hypot(dx, dy);

    if(dist > 2){
        const moveX = dx/dist * penguin.speed;
        const moveY = dy/dist * penguin.speed;
        const nextX = penguin.x + moveX;
        const nextY = penguin.y + moveY;
        const gridNextX = Math.floor(nextX / 50);
        const gridNextY = Math.floor(nextY / 50);

        if(touchableSquares.some(sq => sq.x === gridNextX && sq.y === gridNextY)){
            penguin.x = nextX;
            penguin.y = nextY;
            penguin.suffix = calculateDirection(dx, dy);
            state = "walk";
            frameTimer++;
            if(frameTimer > 3){ frameIndex++; frameTimer=0; }
        } else {
            penguin.targetX = penguin.x;
            penguin.targetY = penguin.y;
            state = "idle"; frameIndex=0;
        }
    } else {
        state = "idle"; frameIndex=0;
        const lookDX = mouseX - penguin.x;
        const lookDY = mouseY - penguin.y;
        penguin.suffix = calculateDirection(lookDX, lookDY);
    }

    const frames = window.PenguinData[state].filter(f => f.suffix === penguin.suffix);
    if(frameIndex >= frames.length) frameIndex = 0;
}

function draw(){
    if(!window.PenguinData || !window.PenguinData[state]) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawShadow();
    if(mapImg.complete) ctx.drawImage(mapImg,0,0);

    const frames = window.PenguinData[state].filter(f => f.suffix === penguin.suffix);
    if(!frames.length) return;

    const frame = frames[frameIndex];
    const centerOffsetX = frame.w/2;
    const centerOffsetY = frame.h*0;
    const drawX = penguin.flip ? -penguin.x - centerOffsetX : penguin.x - centerOffsetX;
    const drawY = penguin.y - centerOffsetY;

    ctx.save();
    if(penguin.flip) ctx.scale(-1,1);
    ctx.drawImage(imgBase, frame.x, frame.y, frame.w, frame.h, drawX, drawY, frame.w, frame.h);

    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = frame.w; tmpCanvas.height = frame.h;
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage(imgColor, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
    tmpCtx.globalCompositeOperation = "source-in";
    tmpCtx.fillStyle = usernameColor;
    tmpCtx.fillRect(0, 0, frame.w, frame.h);
    ctx.drawImage(tmpCanvas, drawX, drawY);
    ctx.restore();

    ctx.font="18px cpBurbankSmall, sans-serif";
    ctx.textAlign="center";
    ctx.lineWidth=4;
    ctx.strokeStyle="black";
    ctx.fillStyle="white";
    ctx.strokeText(username, penguin.x, penguin.y + frame.h/2 + 50);
    ctx.fillText(username, penguin.x, penguin.y + frame.h/2 + 50);
}

function gameLoop(){
    update();
    draw();
    drawChatBubble();
    requestAnimationFrame(gameLoop);
}

// Inicia o jogo (loader + loop)
function startGame(){
    loaderScreen.style.display="flex";
    let loadedCount = 0;
    const onLoad = ()=>{
        loadedCount++;
        if(loadedCount===2){
            loaderScreen.style.display="none";
            gameLoop();
            bgMusic.volume=0.5;
            bgMusic.play().catch(err => console.log("Autoplay impedido:", err));
        }
    };
    imgBase.onload = onLoad;
    imgColor.onload = onLoad;
    if(imgBase.complete && imgColor.complete) onLoad(), onLoad();
}
