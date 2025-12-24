const fs = require('fs');
const path = require('path');
const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();

class TicketDB {
  constructor() {
    this.id = 'tickets/data';
    this.transcriptId = 'tickets/transcripts';
    this.backupId = 'tickets/backup';
  }

  _resolveFilePath() {
    return json.resolvePath(this.id);
  }

  _resolveBackupDir() {
    const resolved = json.resolvePath(this.backupId);
    if (!resolved) {
      // fallback to Database/db/tickets/backup_v3
      return path.resolve(__dirname, '..', '..', '..', 'Database', 'db', 'tickets', 'backup_v3');
    }
    return resolved;
  }

  readAll() {
    return json.readJson(this.id) || {};
  }

  writeAll(data) {
    return json.writeJson(this.id, data);
  }

  createTicket(guild, ownerId, opts = {}) {
    const data = this.readAll();
    data._meta = data._meta || { counter: 0 };
    data._meta.counter = (data._meta.counter || 0) + 1;
    const id = data._meta.counter;
    const name = `ticket-${id}`;
    const ticket = {
      id,
      name,
      ownerId,
      channelId: null,
      status: 'open',
      claimedBy: null,
      participants: [ownerId],
      createdAt: new Date().toISOString(),
      reason: opts.reason || '',
      transcript: null,
      metadata: opts.metadata || {}
    };
    data[name] = ticket;
    this.writeAll(data);
    return ticket;
  }

  getByChannel(channelId) {
    const data = this.readAll();
    return Object.values(data).find(t => t && t.channelId === channelId) || null;
  }

  getById(id) {
    const data = this.readAll();
    return Object.values(data).find(t => t && t.id === id) || null;
  }

  getByName(name) {
    const data = this.readAll();
    return data[name] || null;
  }

  updateByName(name, update) {
    const data = this.readAll();
    if (!data[name]) return null;
    data[name] = { ...data[name], ...update };
    this.writeAll(data);
    return data[name];
  }

  setChannel(name, channelId) {
    return this.updateByName(name, { channelId });
  }

  addParticipantByChannel(channelId, userId) {
    const ticket = this.getByChannel(channelId);
    if (!ticket) return false;
    ticket.participants = ticket.participants || [];
    if (!ticket.participants.includes(userId)) ticket.participants.push(userId);
    return this.updateByName(ticket.name, ticket);
  }

  removeParticipantByChannel(channelId, userId) {
    const ticket = this.getByChannel(channelId);
    if (!ticket) return false;
    ticket.participants = (ticket.participants || []).filter(id => id !== userId);
    return this.updateByName(ticket.name, ticket);
  }

  claimByChannel(channelId, staffId) {
    const ticket = this.getByChannel(channelId);
    if (!ticket) return false;
    ticket.claimedBy = staffId;
    return this.updateByName(ticket.name, ticket);
  }

  closeByChannel(channelId, opts = { saveTranscript: false, transcriptPath: null }) {
    const ticket = this.getByChannel(channelId);
    if (!ticket) return false;
    ticket.status = 'closed';
    if (opts.transcriptPath) ticket.transcript = opts.transcriptPath;
    ticket.closedAt = new Date().toISOString();
    this.updateByName(ticket.name, ticket);
    return ticket;
  }

  // Backup helpers
  manualBackup() {
    try {
      const src = this._resolveFilePath();
      if (!src || !fs.existsSync(src)) return null;
      const backupDir = this._resolveBackupDir();
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const dest = path.join(backupDir, `tickets_backup_${timestamp}.json`);
      fs.copyFileSync(src, dest);
      return dest;
    } catch (error) {
      console.error('manualBackup error:', error);
      return null;
    }
  }

  listBackups() {
    try {
      const backupDir = this._resolveBackupDir();
      if (!fs.existsSync(backupDir)) return [];
      return fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    } catch (error) {
      console.error('listBackups error:', error);
      return [];
    }
  }

  restoreBackup(fileName) {
    try {
      const backupDir = this._resolveBackupDir();
      const backupPath = path.join(backupDir, fileName);
      const dest = this._resolveFilePath();
      if (!fs.existsSync(backupPath)) return false;
      // create a pre-restore snapshot
      const pre = this.manualBackup();
      fs.copyFileSync(backupPath, dest);
      return { restored: true, preSnapshot: pre };
    } catch (error) {
      console.error('restoreBackup error:', error);
      return false;
    }
  }
}

module.exports = new TicketDB();