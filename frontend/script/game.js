
    function generateRandomNumber() {
        return Math.floor(Math.random() * 75) + 1;
    }

    function fillBingoCard(playerId) {
        var cells = document.querySelectorAll('#' + playerId + ' .bingo-row .bingo-cell:not(.free-space)');
        var usedNumbers = new Set();
    
        for (let row = 0; row < 5; row++) {
            for (let column = 0; column < 5; column++) {
                var cellIndex = row + column * 5; // Calculate cell index based on row and column
                var cell = cells[cellIndex];
                var number;
                if (cellIndex === 12) {
                    cell.innerText = "Free";
                } else {
                    do {
                        number = generateRandomNumber();
                    } while (usedNumbers.has(number));
                    usedNumbers.add(number);
                    cell.innerText = number;
                }
            }
        }
    }
    

    function markNumber(playerId, number) {
        const player = 'player1';
        console.log(player + '-cell' + number);
        var cell = document.getElementById(player + '-cell' + number);
        cell.classList.add('marked');
    }

    function updateBingoNumber(playerId, number) {
        var bingoNumber = document.getElementById(playerId).querySelector('.bingo-number');
        if (bingoNumber) {
            bingoNumber.innerText = number;
        }
    }

    function callNumber() {
        setInterval(function() {
            var number = generateRandomNumber();
            var calledNumbersDiv = document.getElementById('called-numbers');
            calledNumbersDiv.innerHTML += number + ', ';
            document.getElementById('boss').innerText = "Boss: " + number;
            updateBingoNumber('player1', generateRandomNumber());
            updateBingoNumber('player2', generateRandomNumber());
            updateBingoNumber('player3', generateRandomNumber());
            updateBingoNumber('player4', generateRandomNumber());
        }, 7000); // Change the interval duration to 5000 milliseconds (5 seconds)
    }

    function handleClick(playerId, number) {
        console.log("Number: " + number)
        markNumber(playerId, number);
    }

    function startTimer(duration, display) {
        var timer = duration, minutes, seconds;
        setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
    
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
    
            display.textContent = minutes + ":" + seconds;
    
            if (--timer < 0) {
                timer = duration;
            }
        }, 1000);
    }
    
    
    fillBingoCard('player1');
    fillBingoCard('player2');
    fillBingoCard('player3');
    fillBingoCard('player4');
    window.onload = function () {
        var minutes = 8.74;
        var display = document.querySelector('#timer');
        startTimer(minutes * 60, display);
        callNumber();
    };

    document.querySelectorAll('.bingo-cell').forEach(function(cell, index) {
        cell.addEventListener('click', function() {
            var playerId = this.parentElement.parentElement.id;
            handleClick(playerId, index+1);
        });
    });