let currentGameCode = null;

document.getElementById('createBtn').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) return alert('Voer een naam in!');

    document.getElementById('createForm').style.display = 'none';
    currentGameCode = Math.floor(100000 + Math.random() * 900000);
    document.getElementById('gameInfo').style.display = 'block';
    document.getElementById('gameCodeDisplay').textContent = `Game Code: ${currentGameCode}`;

    const gameRef = database.ref('games/' + currentGameCode);
    gameRef.set({
        host: playerName,
        players: { [playerName]: true },
        status: 'waiting'
    });

    // Luister naar wijzigingen in de spelerslijst
    gameRef.child('players').on('value', (snapshot) => {
        const players = Object.keys(snapshot.val() || {});
        document.getElementById('playersList').innerHTML = `
            <h3>Spelers:</h3>
            <ul>${players.map(player => `<li>${player}</li>`).join('')}</ul>
        `;

        // Laat de gamemode-selectie zien zodra er minstens 1 speler is
        if (players.length > 0) {
            document.getElementById('gameModeContainer').style.display = 'block';
        }

        // Schakel de Start-knop in of uit op basis van het aantal spelers
        const startGameBtn = document.getElementById('startGameBtn');
        if (players.length >= 1 && players.length <= 9) {
            startGameBtn.disabled = false;
        } else {
            startGameBtn.disabled = true;
        }
    });
});

// Start de game wanneer op de Start-knop wordt gedrukt
document.getElementById('startGameBtn').addEventListener('click', () => {
    if (!currentGameCode) return;

    const selectedGameMode = document.getElementById('gameMode').value;
    const gameRef = database.ref('games/' + currentGameCode);
    
    gameRef.update({ 
        status: 'play',
        gamemode: selectedGameMode
    }).then(() => {
        sessionStorage.setItem('allowedToEnterGame', 'true');
        window.location.href = 'game.html';
    });
});

// Stop de game wanneer op de Stop-knop wordt gedrukt
document.getElementById('stopGameBtn').addEventListener('click', () => {
    if (!currentGameCode) return;
    if (confirm('Weet je zeker dat je het spel wilt stoppen?')) {
        database.ref('games/' + currentGameCode).remove().then(() => {
            window.location.href = 'index.html';
        });
    }
});

// Verwijder de game als de host de pagina verlaat
window.addEventListener('beforeunload', (e) => {
    if (currentGameCode) {
        database.ref('games/' + currentGameCode).update({
            status: 'ended'
        }).then(() => {
            database.ref('games/' + currentGameCode).remove();
        });
    }
});
