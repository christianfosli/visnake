Vi Snake
----------

Snake with Vim navigation.

## Status
[![Actions Status](https://github.com/christianfosli/visnake/workflows/Python%20test/badge.svg)](https://github.com/christianfosli/visnake/actions)
[![Actions Status](https://github.com/christianfosli/visnake/workflows/Python%20deploy/badge.svg)](https://github.com/christianfosli/visnake/actions)

## Background

I created this when I was doing a web programming class at University of Stavanger.
We were thought Python Flask, MySQL and JavaScript.
I later added tests with `pytest`, continuous integration
and continuous deployments to azure app service.

## Prod

The website _may_ be live at
<a href="https://visnake.azurewebsites.net/"> https://visnake.azurewebsites.net/</a>,
but it's probably down, as I'm using my precious Azure credits for newer projects.

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
