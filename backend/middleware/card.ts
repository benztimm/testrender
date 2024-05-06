type NumberRange = {
    min: number;
    max: number;
};

type Card = number[][];

function generateCard(): Card {
    const numbers: (number)[][] = [];
    const rowRanges: NumberRange[] = [
        { min: 1, max: 15 },   // B: First row
        { min: 16, max: 30 },  // I: Second row
        { min: 31, max: 45 },  // N: Third row
        { min: 46, max: 60 },  // G: Fourth row
        { min: 61, max: 75 }   // O: Fifth row
    ];

    for (let i = 0; i < 5; i++) {
        numbers[i] = [];
        let usedNumbers: number[] = [];
        for (let j = 0; j < 5; j++) {
            let number: number;
            do {
                const range = rowRanges[i];
                number = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            } while (usedNumbers.includes(number)); // Check to avoid duplication within the same row
            numbers[i][j] = number;
            usedNumbers.push(number);
        }
    }
    numbers[2][2] = 0;
    return numbers;
}

export {
    generateCard,
};