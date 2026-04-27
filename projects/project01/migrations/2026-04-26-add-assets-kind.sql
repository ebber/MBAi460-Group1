-- Migration: add kind column to photoapp.assets (per DesignDecisions.md Q8)
-- Forward-only ALTER. Existing rows default to 'photo' (only photos exist pre-Part-03)
-- One-shot: do NOT re-run after rebuild-db (create-photoapp.sql now creates kind natively)
-- See 03-api-routes.md Pre-Phase 1 for full context
-- Note: utils/_run_sql.py splits on naked semicolons, so this file uses no semicolons inside comments

USE photoapp;

ALTER TABLE assets
  ADD COLUMN kind ENUM('photo','document') NOT NULL DEFAULT 'photo'
  AFTER bucketkey;
