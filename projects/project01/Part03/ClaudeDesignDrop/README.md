# Claude Design Drop Zone

Place exported Claude Design files here before React integration.

## Expected Contents

- `raw/` - original exported HTML/CSS/JS files
- `assets/` - images, icons, fonts, or static visual assets
- `notes/` - screenshots, export notes, design prompts, or integration observations

## Rules

- Do not place AWS credentials, database config, or `photoapp-config.ini` here.
- Preserve the original export as much as possible.
- Integration work should happen in `../frontend/`, not directly in this raw drop zone.
- If an export depends on CDN scripts, fonts, or other external assets, document those dependencies in `notes/export-notes.md`.

## Handoff Checklist

- [ ] Raw exported files are copied into `raw/`.
- [ ] Static assets are copied into `assets/`.
- [ ] Export source, date, and known issues are documented in `notes/export-notes.md`.
- [ ] The raw export can be opened locally, or the reason it cannot render standalone is documented.

