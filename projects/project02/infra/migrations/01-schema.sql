-- 01-schema.sql
-- Project 02-owned PhotoApp schema bootstrap — mounted to /docker-entrypoint-initdb.d/ by docker-compose.
-- Runs once when the MySQL container initialises a fresh volume.
-- Lineage: derived from Project 01 create-photoapp.sql + create-photoapp-labels.sql.
-- This file is the Project 02 runtime/local-dev schema contract for the split MVP.
--
-- Note: user_name / user_pwd in photoapp-config.ini.example map to
--       MYSQL_USER / MYSQL_PASSWORD in compose (full-access single user for local dev).
--       The multi-user read-only / read-write split is production-only (managed by Terraform IAM).

CREATE DATABASE IF NOT EXISTS photoapp;
USE photoapp;

-- ── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    userid     INT          NOT NULL AUTO_INCREMENT,
    username   VARCHAR(64)  NOT NULL,
    pwdhash    VARCHAR(256) NOT NULL,
    givenname  VARCHAR(64)  NOT NULL,
    familyname VARCHAR(64)  NOT NULL,
    PRIMARY KEY (userid),
    UNIQUE (username)
);
ALTER TABLE users AUTO_INCREMENT = 80001;

-- ── Assets ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
    assetid   INT          NOT NULL AUTO_INCREMENT,
    userid    INT          NOT NULL,
    localname VARCHAR(128) NOT NULL,
    bucketkey VARCHAR(128) NOT NULL,
    kind      ENUM('photo','document') NOT NULL DEFAULT 'photo',
    PRIMARY KEY (assetid),
    FOREIGN KEY (userid) REFERENCES users(userid),
    UNIQUE (bucketkey)
);
ALTER TABLE assets AUTO_INCREMENT = 1001;

-- ── Labels ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labels (
    labelid    INT          NOT NULL AUTO_INCREMENT,
    assetid    INT          NOT NULL,
    label      VARCHAR(128) NOT NULL,
    confidence INT          NOT NULL,
    PRIMARY KEY (labelid, label),
    FOREIGN KEY (assetid) REFERENCES assets(assetid) ON DELETE CASCADE,
    INDEX idx_labels_assetid (assetid),
    INDEX idx_labels_label   (label)
);

-- ── Seed users (same hashes as project01) ───────────────────────────────────
INSERT IGNORE INTO users (username, pwdhash, givenname, familyname) VALUES
    ('p_sarkar', '$2y$10$/8B5evVyaHF.hxVx0i6dUe2JpW89EZno/VISnsiD1xSh6ZQsNMtXK', 'Pooja',     'Sarkar'),
    ('e_ricci',  '$2y$10$F.FBSF4zlas/RpHAxqsuF.YbryKNr53AcKBR3CbP2KsgZyMxOI2z2', 'Emanuele',  'Ricci'),
    ('l_chen',   '$2y$10$GmIzRsGKP7bd9MqH.mErmuKvZQ013kPfkKbeUAHxar5bn1vu9.sdK', 'Li',        'Chen');
