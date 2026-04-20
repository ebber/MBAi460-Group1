CREATE DATABASE IF NOT EXISTS authsvc;

USE authsvc;

DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    userid       int not null AUTO_INCREMENT,
    username     varchar(64) not null,
    pwdhash      varchar(256) not null,
    givenname    varchar(64) not null,
    familyname   varchar(64) not null,
    PRIMARY KEY  (userid),
    UNIQUE       (username)
);

ALTER TABLE users AUTO_INCREMENT = 80001;  -- starting value

CREATE TABLE tokens
(
    token             varchar(128) not null,  -- authentication token
    userid            int not null,           -- user that token identifies
    expiration_utc    datetime not null,      -- token's expiration date/time UTC
    PRIMARY KEY (token),
    FOREIGN KEY (userid) REFERENCES users(userid)
);

--
-- Insert some users to start with:
-- 
-- PWD hashing: https://phppasswordhash.com/
--
INSERT INTO users(username, pwdhash, givenname, familyname)  -- pwd = abc123!!
            values('p_sarkar', 
            '$2y$10$/8B5evVyaHF.hxVx0i6dUe2JpW89EZno/VISnsiD1xSh6ZQsNMtXK',
            'Pooja',
            'Sarkar');

INSERT INTO users(username, pwdhash, givenname, familyname)  -- pwd = abc456!!
            values('e_ricci', 
            '$2y$10$F.FBSF4zlas/RpHAxqsuF.YbryKNr53AcKBR3CbP2KsgZyMxOI2z2',
            'Emanuele',
            'Ricci');

INSERT INTO users(username, pwdhash, givenname, familyname)  -- pwd = abc789!!
            values('l_chen', 
            '$2y$10$GmIzRsGKP7bd9MqH.mErmuKvZQ013kPfkKbeUAHxar5bn1vu9.sdK',
            'Li',
            'Chen');

--
-- Create ficticious users of database to limit access:
--
-- ref: https://dev.mysql.com/doc/refman/8.0/en/create-user.html
--

DROP USER IF EXISTS 'authsvc-read-only';
DROP USER IF EXISTS 'authsvc-read-write';

CREATE USER 'authsvc-read-only' IDENTIFIED BY 'abc123!!';
CREATE USER 'authsvc-read-write' IDENTIFIED BY 'def456!!';

GRANT SELECT, SHOW VIEW ON authsvc.* 
      TO 'authsvc-read-only';
GRANT SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER ON authsvc.* 
      TO 'authsvc-read-write';
      
FLUSH PRIVILEGES;

--
-- done
--

