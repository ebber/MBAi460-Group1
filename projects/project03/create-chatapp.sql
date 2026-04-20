CREATE DATABASE IF NOT EXISTS chatapp;

USE chatapp;

DROP TABLE IF EXISTS registered;

CREATE TABLE registered
(
    userid            int not null,
    displayname       varchar(64) not null,
    displaynamehook   varchar(256) not null,
    messagehook       varchar(256) not null,
    PRIMARY KEY (userid)
);

--
-- Create ficticious users of database to limit access:
--
-- ref: https://dev.mysql.com/doc/refman/8.0/en/create-user.html
--

DROP USER IF EXISTS 'chatapp-read-only';
DROP USER IF EXISTS 'chatapp-read-write';

CREATE USER 'chatapp-read-only' IDENTIFIED BY 'abc123!!';
CREATE USER 'chatapp-read-write' IDENTIFIED BY 'def456!!';

GRANT SELECT, SHOW VIEW ON chatapp.* 
      TO 'chatapp-read-only';
GRANT SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER ON chatapp.* 
      TO 'chatapp-read-write';
      
FLUSH PRIVILEGES;

--
-- done
--

