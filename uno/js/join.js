let currentGameCode = null;
let currentPlayerName = null;

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
    document.getElementById('joinNameForm').style.display = 'none';

    gameRef.child('players').update({ [currentPlayerName]: true });
    
    document.getElementById('statusMessage').style.display = 'block';
    document.getElementById('displayGameCode').textContent = currentGameCode;
});

document.getElementById('leaveGameBtn').addEventListener('click', () => {
    if (!currentGameCode || !currentPlayerName) return;
    if (confirm('Weet je zeker dat je het spel wilt verlaten?')) {
        database.ref(`games/${currentGameCode}/players/${currentPlayerName}`).remove();
        window.location.href = 'index.html';
    }
});