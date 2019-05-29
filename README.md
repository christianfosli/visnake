Vi Snake
----------

## Prod

The website is live at
<a href="https://visnake.azurewebsites.net/">
https://visnake.azurewebsites.net/highscores</a>

## Dev setup

**Push to master triggers build and deploy to azure**

### Server

I recommend to use virtual environment:
`python3 -m venv venv`, and `.  venv/bin/activate`.

Set environment variables:`. ./dev_config.sh`

Run server: `flask run`, then open your browser at `127.0.0.1:500`

### Database

Highscores are saved in a mysql database called visnake. Create your own dev
database by running the `database_config.sql` script into MySQL shell or MySQL
Workbench.
