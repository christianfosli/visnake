const gridSize = 16;  /* grid is gridSize x gridSize */
const grid = mkGrid();
const directions = { 'UP':1, 'RIGHT':2, 'DOWN':3, 'LEFT':4 }
let score = -1;
let maxScore = 0; // Replaced with fetch from server
let direction = directions.RIGHT;
let nextDirection = directions.RIGHT;
let snake = [Math.floor((gridSize**2/2)-(gridSize/2))]
let appleAt = -1;
let snakeSpeed = 500;
let gameActive = false;
let mobile = false;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('main').insertBefore(grid, document.querySelector('main div+div'));
    document.onkeydown = (ev) => vim(ev.key);
    fetchScores();
});

function vim(key) {
    if (key == 'i' && !gameActive) startSnake();
    else if (key == 'h') {
        if (snake.length > 1 && direction === directions.RIGHT) return;
        nextDirection = directions.LEFT;
    }
    else if (key == 'j') {
        if (snake.length > 1 && direction === directions.UP) return;
        nextDirection = directions.DOWN;
    } 
    else if (key == 'k') {
        if (snake.length > 1 && direction === directions.DOWN) return;
        nextDirection = directions.UP;
    }
    else if (key == 'l') {
        if (snake.length > 1 && direction === directions.LEFT) return;
        nextDirection = directions.RIGHT;
    }
}

function mkGrid() {
    let container = document.createElement('div');
    container.classList.add('container');
    for (let i = 0; i<gridSize; i++)
        for (let j = 0; j<gridSize; j++)
            container.appendChild(document.createElement('div'));
    return container;
}

function startSnakeMobile() {
    mobile = true;
    document.getElementById('mobile-keyboard').innerHTML = `
        <button onclick="vim('h')">h</button>
        <button onclick="vim('j')">j</button>
        <button onclick="vim('k')">k</button>
        <button onclick="vim('l')">l</button>`;
    startSnake();
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
    direction = nextDirection;
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
    if (score >= maxScore)
        fetch('/score', {
            method: 'POST',
            body: JSON.stringify({'score': score}),
            headers: { 'Content-Type': 'application/json' }
        })  .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.is_highscore) addHighscore();
            });
    if (mobile)
        document.getElementById('mobile-keyboard').innerHTML = 
            '<button onclick="startSnakeMobile()">i</button>';
}

function addHighscore() {
    let usr = prompt('You made the highscore list! Please enter your (nick)name');
    fetch(`/add-to-highscore?usr=${usr}`)
        .then(res => {
            console.log(`req highscore to server - status ${res.status}`);
            fetchScores();
        });
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
        document.getElementById('max-score').innerText = `Your max score: ${maxScore}`;
    }
}

function fetchScores() {

    fetch('/score').then(res => res.json()).then(data => {
        maxScore = data.score;
        document.getElementById('max-score').innerText = `Your max score: ${maxScore}`;
    });

    fetch('/top-month').then(res => res.json()).then(data => {
        document.getElementById('top-score-month').innerText = data[0].score;
    });

    fetch('/top-all').then(res => res.json()).then(data => {
        document.getElementById('top-score-all').innerText = data[0].score;
    });

}
