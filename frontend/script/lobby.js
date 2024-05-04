document.getElementById('createRoomBtn').addEventListener('click', function () {
    const roomName = prompt('Enter a room name:');
    if (roomName) {
        socket.emit('create room', { roomName: roomName, user: user });
    }
});

socket.on('update room', (room) => {
    const item = document.createElement('li');
    item.id = room.roomId
    item.textContent = room.roomName + " - " + room.user;
    document.getElementById('roomsList').appendChild(item);
});

async function fetchRooms() {
    try {
        const response = await fetch('/available_rooms');
        const rooms = await response.json();
        const roomsList = document.getElementById('roomsList');
        roomsList.innerHTML = ''; // Clear existing entries

        rooms.forEach(room => {
            const row = document.createElement('tr');

            const roomNameCell = document.createElement('td');
            roomNameCell.textContent = room.room_name;

            const hostCell = document.createElement('td');
            hostCell.textContent = room.host;

            const actionCell = document.createElement('td');
            const joinButton = document.createElement('a');
            joinButton.href = `/waiting/${room.room_id}`;
            joinButton.textContent = 'Join';
            joinButton.classList.add('join-btn'); // Add a class for styling if needed
            actionCell.appendChild(joinButton);

            row.appendChild(roomNameCell);
            row.appendChild(hostCell);
            row.appendChild(actionCell);

            roomsList.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to fetch rooms', error);
    }
}
fetchRooms();

