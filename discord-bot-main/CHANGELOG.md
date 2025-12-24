# Changelog

## [Unreleased] - 2025-12-23
### Added
- Professional Ticket system (v3): button-based panel, modals, menu select filters
- `src/utils/ticket/TicketV3Manager.js` — Ticket Manager API (create, claim, add/remove participants, close)
- `src/utils/ticket/db.js` — DB helpers and backup/restore utilities
- `src/utils/ticket/TranscriptSaver.js` — JSON + HTML transcript export
- Handlers: Button (create, claim, add, remove, close), Modal (create, add, remove), Menu (ticket filters)
- Tests for tickets & transcript (Mocha + Chai) under `tests/ticket/`
- `scripts/register-ticket-commands.js` and npm script `register:ticket` for slash registration

### Changed
- Added `TicketSystem` config keys to `src/config/genaral/main.json` (enabled, SupportRoleID, TicketCategoryID, AutoTranscript, AutoRegister)
- Documentation: `docs/TICKETS.md` and README updated with ticket information

### Notes
- Ticket data backups: `Database/db/tickets/backup_v3/` — backups created before destructive operations
- To register commands during development prefer guild registration (`npm run register:ticket -- guild <id>`)