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

function markReady(roomId, userId) {
    console.log("clicked ready")
    socket.emit('player ready', {roomId: roomId, userId: userId});
}

function exitRoom(roomId, userId) {
    console.log("clicked exit")
    socket.emit('exit room', {roomId: roomId, userId: userId});
}