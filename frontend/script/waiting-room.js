socket.on('player ready', function(data) {
    const { userId } = data;
        const statusElement = document.getElementById('status-' + userId);
        if (statusElement) {
            if(statusElement.textContent === 'Ready') {
                statusElement.textContent = 'Not Ready';
            } else {
                statusElement.textContent = 'Ready';
            }
        }
        const buttonElement = document.getElementById('readyButton-' + userId);
        if (buttonElement) {
            if(buttonElement.textContent === 'Ready') {
                buttonElement.textContent = 'Not Ready';
            } else {
                buttonElement.textContent = 'Ready';
            }
        }
});

// Listen for 'player exited' events
socket.on('player exited', function(data) {
    const { userId } = data;
    // Example: Remove the player's element or update it to show they've exited
    const playerElement = document.getElementById('player-' + userId);
    if (playerElement) {
        playerElement.parentNode.removeChild(playerElement);
        // Alternatively, update the innerHTML to show they've exited
        // playerElement.innerHTML = `<p>${userId} - Exited</p>`;
    }
});

socket.on('new player joined', function(data) {
    const player = data.username;
    const roomId = data.roomId;
    const userId = data.userId;
    addPlayer(player, roomId, userId);
});
function markReady(roomId, userId) {
    console.log("clicked ready")
    socket.emit('player ready', {roomId: roomId, userId: userId});
}

function exitRoom(roomId, userId) {
    console.log("clicked exit")
    socket.emit('exit room', {roomId: roomId, userId: userId});
    window.location.href = '/lobby';
}

function addPlayer(player, roomId, userId) {
    const playersDiv = document.getElementById('players');
    const sessionUsername = document.getElementById('sessionData').getAttribute('data-user-username');
    let playerDiv = document.getElementById(`player-${userId}`);
    if (!playerDiv) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerDiv.id = `player-${userId}`;

        const playerInfo = document.createElement('p');
        const usernameSpan = document.createElement('span');
        usernameSpan.id = `username-${userId}`;
        usernameSpan.textContent = player;

        const statusSpan = document.createElement('span');
        statusSpan.id = `status-${userId}`;
        statusSpan.textContent = 'Not Ready';

        playerInfo.appendChild(usernameSpan);
        playerInfo.appendChild(document.createTextNode(' - '));
        playerInfo.appendChild(statusSpan);

        playerDiv.appendChild(playerInfo);

        // Check if the newly joined player is the session user
        if (player === sessionUsername) {
            const readyButton = document.createElement('button');
            readyButton.id = `readyButton-${userId}`;
            readyButton.textContent = 'Ready';
            readyButton.onclick = function() { markReady(roomId, userId); };

            const exitButton = document.createElement('button');
            exitButton.textContent = 'Exit';
            exitButton.onclick = function() { exitRoom(roomId, userId); };

            playerDiv.appendChild(readyButton);
            playerDiv.appendChild(exitButton);
        }

        playersDiv.appendChild(playerDiv);
    }
}   
