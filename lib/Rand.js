
const randomSeed = require('random-seed');

let generator = null;

function resetGenerator(seed) {
    if(seed) {
        generator = randomSeed.create(seed);
    } else {
        generator = randomSeed();
    }
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = generator.range(currentIndex); // Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

module.exports = {
    resetGenerator,
    shuffle
}