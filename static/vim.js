let gameActive = false;
let mobile = false;
let commandlineMode = false;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('main').insertBefore(grid, document.querySelector('main div+div'));
    document.onkeydown = (ev) => vim(ev.key);
});

function vim(key) {
    if (commandlineMode) {
        if (key == 'Enter') interpretCommand();
        else if (key == 'Escape') closeCommandlineMode();
        return;
    }
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
    else if (key == ':') {
        commandlineMode = true;
        let inputField = document.querySelector('#commandline input');
        inputField.disabled = false;
        inputField.focus();
        setTimeout(() => {
            // On chrome the ':' from the key event ends up on the input field
            // but on firefox it usually doesn't. This adds it if necessary.
            if (!inputField.value.startsWith(':'))
                inputField.value = ':' + inputField.value;
        }, 50);
    }
    else if (gameActive && key.startsWith('Arrow')) {
        document.querySelector('#play-help').classList.remove('hidden');
    }


    function interpretCommand() {
        commandlineMode = false;
        const cmd = document.querySelector('#commandline input').value;
        if (cmd.match(/^:qu?i?t?!?$/)) {
            document.querySelector('main div.container').innerHTML = `
            <h1>You managed to quit vim!</h1>
            <iframe src="https://giphy.com/embed/Ge86XF8AVY1KE" width="480" height="300" frameBorder="0"
               class="giphy-embed" allowFullScreen>
            </iframe>
            <p><a href="https://giphy.com/gifs/Ge86XF8AVY1KE">via GIPHY</a></p>
            `;
        } else if (cmd.match(/^:he?l?p?$/)) {
            document.querySelector('#play-help').classList.toggle('hidden');
        } else {
            return showErr('E001: Unrecognized command');
        }
        closeCommandlineMode();
    }

    function closeCommandlineMode() {
        commandlineMode = false;
        document.querySelector('#commandline input').disabled = true;
        document.querySelector('#commandline input').value = '';
    }

    function showErr(errStr) {
        document.querySelector('#commandline').classList.add('error');
        document.querySelector('#commandline input').value = errStr;
        document.querySelector('#commandline input').blur();
        setTimeout(() => {
            document.querySelector('#commandline').classList.remove('error');
            closeCommandlineMode();
        }, 2000);
    }
}
