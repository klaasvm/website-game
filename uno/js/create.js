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

    gameRef.child('players').on('value', (snapshot) => {
        const players = Object.keys(snapshot.val() || {});
        document.getElementById('playersList').innerHTML = `
            <h3>Spelers:</h3>
            <ul>${players.map(player => `<li>${player}</li>`).join('')}</ul>
        `;
    });
});

document.getElementById('stopGameBtn').addEventListener('click', () => {
    if (!currentGameCode) return;
    if (confirm('Weet je zeker dat je het spel wilt stoppen?')) {
        database.ref('games/' + currentGameCode).remove().then(() => {
            window.location.href = 'index.html';
        });
    }
});

window.addEventListener('beforeunload', (e) => {
    if (currentGameCode) {
        database.ref('games/' + currentGameCode).update({
            status: 'ended'
        }).then(() => {
            database.ref('games/' + currentGameCode).remove();
        });
    }
});