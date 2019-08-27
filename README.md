Vi Snake
----------

## Status
[![Actions Status](https://github.com/christianfosli/visnake/workflows/Python%20package/badge.svg)](https://github.com/christianfosli/visnake/actions)

## Prod

The website is live at
<a href="https://visnake.azurewebsites.net/">
https://visnake.azurewebsites.net/</a>

## Dev setup

**Push to master triggers build and deploy to azure**

### Server / Environment

Set environment variables: `. ./dev_config.sh` on max/linux, or
`.\dev_config.ps1` on windows powershell.

Run server: `flask run` or `python3 app.py`, then open your browser at `127.0.0.1:5000`

### Database

Highscores are saved in a mysql database called visnake. Create your own dev
database by running the `database_config.sql` script into MySQL shell or MySQL
Workbench.
