--
-- create-shorten.sql
--
-- Creates the URL_Shortener database, schema, and application user
-- on the existing shared RDS MySQL 8.0 instance.
--
-- Run from repo root via:
--   utils/run-sql labs/lab02/create-shorten.sql
--
-- Connects as: admin (RDS master)
-- Credentials: labs/lab01/Part 01 - AWS Setup/secrets/rds-master-password.txt
--

--
-- Database
--
CREATE DATABASE IF NOT EXISTS URL_Shortener;

USE URL_Shortener;

--
-- Table: shorten
--
-- shorturl is the natural primary key — it is the lookup key.
-- COLLATE utf8mb4_bin enforces case-sensitivity: /Abc != /abc.
-- URLs supported up to 512 characters per assignment spec.
--
DROP TABLE IF EXISTS shorten;

CREATE TABLE shorten (
  shorturl  VARCHAR(512) NOT NULL COLLATE utf8mb4_bin,
  longurl   VARCHAR(512) NOT NULL,
  count     INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (shorturl)
);

--
-- Application user: shorten-app
--
-- @'%' = any host, explicit by design. Source IP is unpredictable
-- when connecting from Docker --network host through NAT to RDS.
--
-- Least privilege: SELECT, INSERT, UPDATE, DELETE on URL_Shortener only.
-- No DROP, CREATE, ALTER — the app has no DDL rights.
--
-- Note: FLUSH PRIVILEGES omitted intentionally.
-- CREATE USER + GRANT are self-effecting in MySQL 8.
--
DROP USER IF EXISTS 'shorten-app'@'%';

CREATE USER 'shorten-app'@'%' IDENTIFIED BY '${SHORTEN_APP_PWD}';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON URL_Shortener.*
  TO 'shorten-app'@'%';
