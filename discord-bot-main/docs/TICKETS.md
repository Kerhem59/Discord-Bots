# Ticket System — Design & Data Schema

## Overview
Profesyonel, güvenli ve test edilebilir bir ticket (destek) sistemi. Amaç: kolay kullanım, yetki kontrolleri, otomatik transcript ve yedekleme ile kararlı yönetim.

## Features
- Embed panel with ActionRow buttons
- Modal for reason / add / remove
- Select menus for filtering tickets
- Transcript saver (JSON + HTML export)
- Automatic + manual backups
- Permission checks (Support role + ManageGuild)
- Tests for handlers and manager

## Data schema (v3)
Each ticket stored under a unique key (e.g., `ticket-1`) with the following structure:

```json
{
  "id": 1,
  "name": "ticket-1",
  "ownerId": "123456789012345678",
  "channelId": "987654321098765432",
  "status": "open|closed",
  "claimedBy": null,
  "participants": ["123456789012345678"],
  "createdAt": "ISO timestamp",
  "reason": "optional reason text",
  "transcript": "path/to/transcript.json|null",
  "metadata": { "customKey": "value" }
}
```

There is also an internal `_meta` object to track counters and migration history.

## API contract (TicketManager)
- create(guild, ownerId, opts) => { id, name }
- getByChannel(channelId) => ticket | null
- addParticipant(channelId, userId)
- removeParticipant(channelId, userId)
- claim(channelId, staffId)
- close(channelId, opts) => { transcriptPath }
- backup(destPath)
- restore(backupPath)

## Messages & Embed templates
- Panel Embed: title, description, footer, color (configurable)
- On create: mention owner, show buttons: claim, add, remove, close
- Confirmation modals for destructive actions

## Backups & Transcripts
- Backups saved to `Database/db/tickets/backup_v3/` with timestamped filenames
- Transcripts saved to `Database/db/tickets/transcripts/` as JSON and optionally HTML

### CLI helper
A small prefix command `tickets-backup` is available for manual operations. Usage (admin-only):
- `!tickets-backup manual` — create a manual backup of the tickets DB
- `!tickets-backup list` — list available backups
- `!tickets-backup restore <filename>` — restore a specific backup (creates a pre-restore backup automatically)

Backups are stored under `Database/db/tickets/backup_v3/` with timestamped filenames.

### Enabling / Disabling Ticket System
- You can enable or disable the ticket system via `src/config/genaral/main.json` under `TicketSystem.enabled`.
- Or use the admin Slash/Prefix subcommand:
  - `/ticket toggle` (Slash)
  - `.ticket toggle` (Prefix)
- When disabled: handlers will respond politely and no new tickets will be allowed; existing tickets remain in the DB.

### Migration (v2 -> v3)
- Before migrating, create backups: `!tickets-backup manual` or ensure `Database/db/tickets/backup_v3/` contains a recent copy.
- Use the command (admin-only) to migrate v2 data to v3 schema (provided in the Slash command set under `migrate` if present).

### Registering Slash commands
If you add or update Slash commands, register them with Discord so they appear immediately.

- Quick local guild registration:
  - node scripts/register-ticket-commands.js guild <GUILD_ID>
  - (if you omit <GUILD_ID> it defaults to `ServerID` from `src/config/genaral/main.json`)
  - or run via npm script: `npm run register:ticket -- guild <GUILD_ID>`
- Register globally (can take up to 1 hour to propagate):
  - node scripts/register-ticket-commands.js global
  - or run via npm script: `npm run register:ticket -- global`

After registering, restart the bot process (or reload handlers) to ensure the runtime and file system are consistent.

> Tip: Use guild registration during development for faster updates. Global registration is for production-release.

**Security note:** Do not keep your bot token in source-controlled config files. Prefer using environment variables (`MAIN_BOT_TOKEN`, `MAIN_BOT_ID`) and add a `.env` file to `.gitignore`.

## Migration
- Use `TicketManager.migrateFromV2(oldData)` to migrate v2 -> v3; create backups prior to migration

## Testing
- Unit tests for manager methods
- Integration tests for handlers using mock interactions

---

If you'd like, I can now implement the DB + backup helpers (JsonManager wrappers, automatic backup strategy) and a small CLI to create/restore backups.