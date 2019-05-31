create database visnake;
use visnake;

create table highscore (
    username varchar(50) not null,
    score integer unsigned not null,
    sdate date not null,
    primary key (username, score, sdate)
);

create or replace view top_ten_all as select * from highscore H
order by H.score desc, H.sdate asc limit 10;

create or replace view top_ten_month as select * from highscore H
where month(H.sdate) = month(CURRENT_DATE())
order by H.score desc, H.sdate asc limit 10;

delimiter //
create procedure cleanup_highscores()
    begin
    delete from highscore
    where (username, score, sdate) not in
        (select * from top_ten_month)
        and (username, score, sdate) not in
        (select * from top_ten_all);
    end //
delimiter ;

/* If dev */
create user 'visnake-admin'@'localhost' identified by 'secret123';
grant all privileges on visnake.* to 'visnake-admin'@'localhost';
