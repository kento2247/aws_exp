drop table USERS;
drop table VOTES;
drop table GAMELOGS;
create table USERS (username varchar, password varchar, id varchar);
create table VOTES (title varchar, num varchar, id varchar);
create table GAMELOGS (username varchar, time varchar);

insert into VOTES values ('Youtube', '50', '0');
insert into VOTES values ('Instagram', '50', '1');
insert into VOTES values ('Twitter', '50', '2');