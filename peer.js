// Recebe dados de outros jogadores
window.handlePeerData = (data) => {
    console.log("Dados recebidos:", data);
    // Ex: atualizar posições ou chat
};

// Envia sua posição
function sendPosition() {
    if (!isOnline) return;
    const data = {
        x: penguin.x,
        y: penguin.y,
        username,
        color: usernameColor
    };
    if (window.sendData) sendData(data);
}

// Chame sendPosition() no update() ou a cada 100ms
setInterval(sendPosition, 100);
