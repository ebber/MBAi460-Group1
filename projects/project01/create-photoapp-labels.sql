-- create-photoapp-labels.sql
-- Rekognition label schema for photoapp — Project 01 Part 02
-- Apply AFTER create-photoapp.sql (requires assets table to exist)

USE photoapp;

DROP TABLE IF EXISTS labels;

CREATE TABLE labels (
  labelid    INT AUTO_INCREMENT PRIMARY KEY,
  assetid    INT NOT NULL,
  label      VARCHAR(128) NOT NULL,
  confidence INT NOT NULL,
  FOREIGN KEY (assetid) REFERENCES assets(assetid) ON DELETE CASCADE,
  INDEX idx_labels_assetid (assetid),
  INDEX idx_labels_label   (label)
);
