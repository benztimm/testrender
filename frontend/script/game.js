
/*
const calledNumbers = []
function generateRandomNumber() {
	let number = Math.floor(Math.random() * 75) + 1
	while (calledNumbers.includes(number)) {
		number = Math.floor(Math.random() * 75) + 1
	}
	calledNumbers.push(number)
	return number
}
*/
const totalNumbers = 75;
const calledNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);

// Function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Shuffle the numbers initially
shuffle(calledNumbers);

function generateRandomNumber() {
	if (calledNumbers.length === 0) {
	return null;
  }
  return calledNumbers.pop();
}


function updateBingoNumber(number) {
	const bossCell = document.getElementById('boss')
	bossCell.textContent = data.number
}

socket.on('number generated', function (data) {
	const calledNumbersDiv = document.getElementById('called-numbers')
	calledNumbersDiv.innerHTML += data.number + ', '
	document.getElementById('boss').innerText = 'Boss: ' + data.number
})

function callNumber() {
	setInterval(function () {
		// console.log(`host Id = ${hostId}, user id = ${userId}`)
		if (userId == hostId) {
			const number = generateRandomNumber()
			if (number == null) {
				return
			}
			socket.emit('generate random number', {
				roomId: roomId,
				userId: userId,
				session: userId,
				number: number,
			})
		}
	}, 2000)
}


function startSynchronizedTimer(startTime, maxDuration, display) {
    const start = new Date(startTime).getTime(); // Get start time in milliseconds
    const totalDuration = maxDuration * 60 * 1000; // Convert maxDuration from minutes to milliseconds

    const countdown = setInterval(function () {
        const now = Date.now(); // Current time in milliseconds
        const elapsedTime = now - start; // Time elapsed since start in milliseconds
        let remainingTime = totalDuration - elapsedTime; // Remaining time in milliseconds

        if (remainingTime < 0) {
            clearInterval(countdown);
            display.textContent = "00:00";
            console.log('Time up! Game Over.');
            // Optionally trigger any end of game logic here
            return;
        }

        // Convert remaining time from milliseconds to minutes and seconds
        let secondsLeft = Math.floor(remainingTime / 1000);
        let minutes = parseInt(secondsLeft / 60, 10);
        let seconds = parseInt(secondsLeft % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        display.textContent = minutes + ':' + seconds;
    }, 1000);
}

window.onload = function () {
    const maxGameTime = 8.74; // Maximum game time in minutes
    var display = document.querySelector('#timer');
    startSynchronizedTimer(startTime, maxGameTime, display);
	if (userId == hostId){
		callNumber(); // Ensure this function is defined
	}
}


function markNumber(cell) {
	const [playerId, row, col, number] = cell.id.split('-');
	const isMarked = cell.classList.contains("marked");
	socket.emit('user marked number', { roomId, playerId, row, col, number, isMarked  })
	
}

socket.on('update card marked', function (data) {
	const userCard = document.getElementById(`${data.playerId}-${data.row}-${data.col}-${data.number}`)
	userCard.classList.toggle('marked')
})


function checkWon(user_id, room_id) {
	console.log(user_id + ' '+room_id)
	socket.emit('check won', { user_id: user_id, room_id: room_id, user_name: userName })
	console.log('check won')
}

socket.on('player won', function (data) {
	if(userId==data.playerId){
		alert('You won the game!')
	}else{
		alert(data.playerUsername + ' won the game!')
	}
	if(userId==hostId){
		socket.emit('game ended', {roomId: roomId})
	}else{
		alert('Please wait for the host to end the game!')
	}
})

socket.on('finished cleanup', function (data) {
	window.location.href = `/waiting/${data.roomId}`
})
socket.on('player not won', function (data) {
	if(userId==data.playerId){
		alert('You did not win, check your card again!')
	}
})

// document.querySelectorAll('.bingo-cell').forEach(function (cell, index) {
// 	cell.addEventListener('click', function () {
// 		var playerId = this.parentElement.parentElement.id
// 		handleClick(playerId, index + 1)
// 	})
// })

// function handleClick(playerId, number) {
// 	console.log('Number: ' + number)
// 	markNumber(playerId, number)
// }
