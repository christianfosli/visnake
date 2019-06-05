const gridSize = 16;  /* grid is gridSize x gridSize */
const grid = mkGrid();
const directions = { 'UP':1, 'RIGHT':2, 'DOWN':3, 'LEFT':4 };
let score = -1;
let maxScore = 0; // Replaced with fetch from server
let direction = directions.RIGHT;
let nextDirection = directions.RIGHT;
let snake = [Math.floor(((gridSize**2)/2)-(gridSize/2))];
let appleAt = -1;
let mobileKeyboardStartHtml = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchScores();
});

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
    mobileKeyboardStartHtml = document.getElementById('mobile-keyboard').innerHTML;
    document.getElementById('mobile-keyboard').innerHTML = `
        <button onclick="vim('h')">H</button>
        <button onclick="vim('j')">J</button>
        <button onclick="vim('k')">K</button>
        <button onclick="vim('l')">L</button>`;
    startSnake();
}

function mobileHelp(btn) {
    document.querySelector('#play-help').classList.remove('hidden');
    btn.parentNode.removeChild(btn);
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
    fetchScores();
    direction = directions.RIGHT;
    snake = [Math.floor((gridSize**2/2)-(gridSize/2))]
    appleAt = -1;
    document.querySelectorAll('.snake').forEach(div => div.classList.remove('snake'));
    document.querySelector('.apple').classList.remove('apple');
    document.querySelectorAll('.error').forEach(div => div.parentNode.removeChild(div));
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
    setTimeout(moveSnake, snakeSpeed());
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
    fetch('/score', {
        method: 'POST',
        body: JSON.stringify({'score': score}),
        headers: { 'Content-Type': 'application/json' }
    })  .then(res => res.json())
        .then(data => {
            if (data.is_highscore) addHighscore();
        });
    if (mobile)
        document.getElementById('mobile-keyboard').innerHTML = mobileKeyboardStartHtml;
}

function removeParent(selfNode) {
    selfNode.parentNode.parentNode.removeChild(selfNode.parentNode);
}

function createErrorDiv(message) {
    let div = document.createElement('div');
    div.classList.add('error');
    div.innerHTML = message + ' <button onclick="removeParent(this)">hide</button>';
    return div;
}

function addHighscore() {
    let usr = prompt('You made the highscore list! Please enter your (nick)name');
    if (usr == null) {
        document.querySelector('main div').appendChild(createErrorDiv(
            'Adding highscore cancelled! Click <button onclick="removeParent(this); addHighscore();">\
            here</button> if you change your mind'));
        return;
    } if (usr.length > 50) {
        document.querySelector('main div').appendChild(createErrorDiv(
            'Failed to add highscore as username is more than 50 characters long. Click \
            <button onclick="removeParent(this); addHighscore();">here</button> to choose another username'
        ));
        return;
    }
    fetch(`/add-to-highscore?usr=${usr}`)
        .then(async res => {
            fetchScores();
            if (!res.ok) {
                document.querySelector('main div').appendChild(createErrorDiv(
                    `Failed to add your score to the highscore list due to: ${getFirstPar(await res.text())}\
                     Please click <button onclick="removeParent(this); addHighscore();">here</button> to try again`));
            }
        });
}

function addApple() {
    appleAt = Math.ceil(Math.random() * (gridSize**2));
    if (snake.includes(appleAt)) return addApple();
    document.querySelector(`.container div:nth-child(${appleAt})`).classList.add('apple');
}

function eatApple() {
    snake.unshift(snake[0]);
    document.querySelector('.apple').classList.remove('apple');
    addApple();
    score++;
    updateScore();
}

function snakeSpeed() {
    return Math.floor(300 * Math.exp(-score/3) + 40);
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
        maxScore = data.max_score;
        document.getElementById('max-score').innerText = `Your max score: ${maxScore}`;
    });

    fetch('/top-month').then(res => res.json()).then(data => {
        document.getElementById('top-score-month').innerText = `${data[0].score} by ${data[0].username}`;
        document.querySelector('#top-month-tbl tbody').innerHTML = '';
        data.forEach(row =>
            document.querySelector('#top-month-tbl tbody').innerHTML +=
                `<tr><td>${escapeHTML(row.username)}</td><td>${row.score}</td></tr>`
        );
    });

    fetch('/top-all').then(res => res.json()).then(data => {
        document.getElementById('top-score-all').innerText = `${data[0].score} by ${data[0].username}`;
        document.querySelector('#top-all-tbl tbody').innerHTML = '';
        data.forEach(row =>
            document.querySelector('#top-all-tbl tbody').innerHTML +=
                `<tr><td>${escapeHTML(row.username)}</td><td>${row.score}</td></tr>`
        );
    });

}

function getFirstPar(htmlStr) {
    return htmlStr.substring(htmlStr.indexOf('<p>')+3, htmlStr.indexOf('</p>'));
}

function escapeHTML(html) {
    let escapeTA = document.createElement('textarea');
    escapeTA.textContent = html;
    return escapeTA.innerHTML;
}
