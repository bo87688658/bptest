let isOnline=false, peer, conn;

// 2️⃣ Escolha do modo
document.getElementById("offlineBtn").onclick = ()=>{
    modeScreen.style.display="none";
    startGame();
};
document.getElementById("onlineBtn").onclick = ()=>{
    modeScreen.style.display="none";
    onlineScreen.style.display="flex";
    isOnline = true;
};

// 3️⃣ Online
document.getElementById("createServerBtn").onclick = ()=>{
    const id = document.getElementById("peerIdInput").value || undefined;
    peer = new Peer(id);
    peer.on('open', id=>{
        alert(`Servidor criado! Seu ID: ${id}`);
        onlineScreen.style.display="none";
        startGame();
    });
    peer.on('connection', c=>{
        conn = c;
        setupConnection(conn);
    });
};
document.getElementById("joinServerBtn").onclick = ()=>{
    const serverId = document.getElementById("peerIdInput").value;
    if(!serverId) return alert("Digite o ID do servidor!");
    peer = new Peer();
    conn = peer.connect(serverId);
    conn.on('open', ()=>{
        alert("Conectado ao servidor!");
        onlineScreen.style.display="none";
        startGame();
    });
    setupConnection(conn);
};
function setupConnection(c){
    c.on('data', data=>{
        console.log("Recebeu:",data);
        // Aqui você pode atualizar pinguins online ou chat
    });
}
