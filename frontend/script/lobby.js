document.getElementById('createRoomBtn').addEventListener('click', function () {
    const roomName = prompt('Enter a room name:');
    if (roomName) {
        socket.emit('create room', { roomName: roomName, user: user });
        socket.on('update room', (room) => {
            console.log('Room created:', room);
            window.location.href = `/waiting/${room.roomId}`;
        });
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
    joinButton.textContent = 'Join';
    joinButton.classList.add('join-btn'); // Add a class for styling if needed
    joinButton.setAttribute('room-id', roomId); // Store room ID in data attribute
    
    joinButton.addEventListener('click', function() {
        const roomId = joinButton.getAttribute('room-id');
        // Implement join room functionality
        joinRoom(roomId,host);
    });
    
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

async function joinRoom(roomId) {
    try {
        const response = await fetch(`/join_room/${roomId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: user,
                roomId: roomId
            }),
        });
        const data = await response.json(); // Convert the response to JSON
        if (response.ok) {
            socket.emit('new player joined', { user: user, roomId: roomId });
            window.location.href = `/waiting/${roomId}`; // Redirect only if fetch was successful
        } else {
            console.error('Failed to join room:', data.message); // Display server error message if available
        }
    } catch (error) {
        console.error('Failed to join room', error);
    }
}



fetchRooms();

