document.getElementById('createRoomBtn').addEventListener('click', function () {
    const roomName = prompt('Enter a room name:');
    if (roomName) {
        socket.emit('create room', { roomName: roomName, user: user });
    }
});
function addEntry(host,roomName,roomId,roomsList) {
    const row = document.createElement('tr');
    
    const roomNameCell = document.createElement('td');
    roomNameCell.textContent = roomName;
    
    const hostCell = document.createElement('td');
    hostCell.textContent = host;
    
    const actionCell = document.createElement('td');
    const joinButton = document.createElement('a');
    joinButton.href = `/waiting/${roomId}`;
    joinButton.textContent = 'Join';
    joinButton.classList.add('join-btn'); // Add a class for styling if needed
    actionCell.appendChild(joinButton);
    
    row.appendChild(roomNameCell);
    row.appendChild(hostCell);
    row.appendChild(actionCell);

    roomsList.appendChild(row);
}
socket.on('update room', (room) => {
    const roomsList = document.getElementById('roomsList');
    addEntry(room.user,room.roomName,room.roomId,roomsList);
});

async function fetchRooms() {
    try {
        const response = await fetch('/available_rooms');
        const rooms = await response.json();
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = ''; // Clear existing entries

        rooms.forEach(room => {
            addEntry(room.host,room.room_name,room.room_id,roomsList);
        });
    } catch (error) {
        console.error('Failed to fetch rooms', error);
    }
}
fetchRooms();

