let currentGameCode = null;
let currentPlayerName = null;
let gameStatusRef = null;

document.getElementById('joinBtn').addEventListener('click', () => {
    currentGameCode = document.getElementById('gameCode').value.trim();
    if (!currentGameCode) return alert('Voer een game code in!');

    const gameRef = database.ref('games/' + currentGameCode);
    gameRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) return alert('Ongeldige game code!');
        document.getElementById('joinCodeForm').style.display = 'none';
        document.getElementById('joinNameForm').style.display = 'block';
    });
});

document.getElementById('confirmJoinBtn').addEventListener('click', () => {
    currentPlayerName = document.getElementById('playerName').value.trim();
    if (!currentPlayerName) return alert('Voer een naam in!');
    
    const gameRef = database.ref('games/' + currentGameCode);
    
    // Check of de naam al bestaat
    gameRef.child('players').once('value').then((snapshot) => {
        const players = snapshot.val() || {};
        if (players[currentPlayerName]) {
            alert('Deze naam is al in gebruik! Kies een andere naam.');
            return;
        }

        document.getElementById('joinNameForm').style.display = 'none';
        gameRef.child('players').update({ [currentPlayerName]: true });
        document.getElementById('statusMessage').style.display = 'block';
        document.getElementById('displayGameCode').textContent = currentGameCode;

        // Luister naar spelstatus
        gameStatusRef = database.ref('games/' + currentGameCode + '/status');
        gameStatusRef.on('value', (snapshot) => {
            if (!snapshot.exists() || snapshot.val() === 'ended') {
                alert('De spelleider heeft het spel beëindigd!');
                window.location.href = 'join.html';
            } else if (snapshot.val() === 'play') {
                // Markeer de gebruiker als toegestaan om naar game.html te gaan
                sessionStorage.setItem('allowedToEnterGame', 'true');
                // Stuur de speler door naar game.html
                window.location.href = 'game.html';
            }
        });
    });
});

document.getElementById('leaveGameBtn').addEventListener('click', () => {
    if (!currentGameCode || !currentPlayerName) return;
    if (confirm('Weet je zeker dat je het spel wilt verlaten?')) {
        database.ref(`games/${currentGameCode}/players/${currentPlayerName}`).remove();
        window.location.href = 'index.html';
    }
});

window.addEventListener('beforeunload', (e) => {
    if (currentGameCode && currentPlayerName) {
        database.ref(`games/${currentGameCode}/players/${currentPlayerName}`).remove();
    }
    if (gameStatusRef) gameStatusRef.off();
});