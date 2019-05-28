const gridSize = 16;  /* grid is gridSize x gridSize */
const grid = mkGrid();
const directions = { 'UP':1, 'RIGHT':2, 'DOWN':3, 'LEFT':4 }
let score = -1;
let maxScore = 0; //TODO: fetch max score from the server
let direction = directions.RIGHT;
let snake = [Math.floor((gridSize**2/2)-(gridSize/2))]
let appleAt = -1;
let snakeSpeed = 500;
let gameActive = false;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('main').insertBefore(grid, document.querySelector('main article'));
    document.onkeydown = (ev) => {
        const k = ev.key;
        if (k == 'i' && !gameActive) startSnake();
        else if (k == 'h') {
            if (snake.length > 1 && direction === directions.RIGHT) return;
            direction = directions.LEFT;
        }
        else if (k == 'j') {
            if (snake.length > 1 && direction === directions.UP) return;
            direction = directions.DOWN;
        } 
        else if (k == 'k') {
            if (snake.length > 1 && direction === directions.DOWN) return;
            direction = directions.UP;
        }
        else if (k == 'l') {
            if (snake.length > 1 && direction === directions.LEFT) return;
            direction = directions.RIGHT;
        }
    };
});

function mkGrid() {
    let container = document.createElement('div');
    container.classList.add('container');
    for (let i = 0; i<gridSize; i++)
        for (let j = 0; j<gridSize; j++)
            container.appendChild(document.createElement('div'));
    return container;
}

function startSnake() {
    if (score !== -1) resetSnake();
    score = 0;
    gameActive = true;
    document.querySelector('main div').removeChild(document.getElementById('start-instructions'));
    updateScore();
    document.querySelector(`.container div:nth-child(${snake[0]})`).classList.add('snake');
    addApple();
    moveSnake();
}

function resetSnake() {
    console.log('lets play again');
    direction = directions.RIGHT;
    snake = [Math.floor((gridSize**2/2)-(gridSize/2))]
    appleAt = -1;
    snakeSpeed = 500;
    document.querySelectorAll('.snake').forEach(div => div.classList.remove('snake'));
    document.querySelector('.apple').classList.remove('apple');
}

function moveSnake() {
    if (direction === directions.UP) moveSnakeUp();
    else if (direction === directions.RIGHT) moveSnakeRight();
    else if (direction === directions.DOWN) moveSnakeDown();
    else if (direction === directions.LEFT) moveSnakeLeft();
    if (!gameActive) return;
    if (snake[snake.length-1] == appleAt) eatApple();
    document.querySelector(`.container div:nth-child(${snake[snake.length-1]})`).classList.add('snake');
    document.querySelector(`.container div:nth-child(${snake.shift()})`).classList.remove('snake');
    setTimeout(moveSnake, snakeSpeed);
}

function moveSnakeUp() {
    let moveTo = snake[snake.length-1]-gridSize;
    if ((moveTo) < 1 || snake.includes(moveTo)) return gameOver();
    snake.push(moveTo);
}

function moveSnakeRight() {
    let moveTo = snake[snake.length-1]+1;
    if (moveTo % gridSize === 1 || snake.includes(moveTo)) return gameOver();
    snake.push(moveTo);
}

function moveSnakeDown() {
    let moveTo = snake[snake.length-1]+gridSize;
    if (moveTo > (gridSize**2) || snake.includes(moveTo)) return gameOver();
    snake.push(moveTo);
}

function moveSnakeLeft() {
    let moveTo = snake[snake.length-1]-1;
    if ((moveTo+1) % gridSize === 1 || snake.includes(moveTo)) return gameOver();
    snake.push(moveTo);
}

function gameOver() {
    gameActive = false;
    let gameoverdiv = document.createElement('span');
    gameoverdiv.id = 'start-instructions';
    gameoverdiv.innerText = 'Game Over. Press i to play again';
    document.querySelector('main div').appendChild(gameoverdiv);
}

function addApple() {
    appleAt = Math.ceil(Math.random() * (gridSize**2));
    document.querySelector(`.container div:nth-child(${appleAt})`).classList.add('apple');
}

function eatApple() {
    snake.unshift(snake[0]);
    document.querySelector('.apple').classList.remove('apple');
    addApple();
    score++;
    updateScore();
    if (snakeSpeed > 100) snakeSpeed -= 50;
    else if (snakeSpeed > 20) snakeSpeed -= 10;
}

function updateScore() {
    document.getElementById('score').innerText = 'Score: ' + score;
    if (score > maxScore) {
        maxScore = score;
        document.getElementById('max-score').innerText = `(max ${maxScore})`;
    }
}
