create database visnake;
use visnake;

create table highscore (
    username varchar(50) not null,
    score integer unsigned not null,
    sdate date not null,
    primary key (username, score, sdate)
);

create view top_ten_all as select * from highscore H
order by H.score desc limit 10;

create view top_ten_month as select * from highscore H
where month(sdate) = month(CURRENT_DATE())
order by H.score desc limit 10;

/* If dev */
create user 'visnake-admin'@'localhost' identified by 'secret123';
grant all privileges on visnake.* to 'visnake-admin'@'localhost';
