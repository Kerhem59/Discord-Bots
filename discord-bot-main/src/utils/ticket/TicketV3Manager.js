const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();
const transcriptSaver = require('./TranscriptSaver');

class TicketV3Manager {
  constructor() {
    this.id = 'tickets/data';
    this.data = json.readJson(this.id) || {};
    // use numeric incremental IDs
    this._ensureCounter();
    // keep memory and disk consistent: initialize file if missing
    if (!json.readJson(this.id)) json.writeJson(this.id, this.data);
  }

  _ensureCounter() {
    if (!this.data._meta) this.data._meta = { counter: 0 };
  }

  _save() {
    json.writeJson(this.id, this.data);
  }

  _nextId() {
    this.data._meta.counter += 1;
    this._save();
    return this.data._meta.counter;
  }

  createTicket(guild, ownerId, reason) {
    const id = this._nextId();
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
      reason: reason || '',
      transcript: null
    };
    this.data[name] = ticket;
    this._save();
    return { name, ticket };
  }

  setChannel(name, channelId) {
    if (!this.data[name]) return false;
    this.data[name].channelId = channelId;
    this._save();
    return true;
  }

  getByChannel(channelId) {
    const key = Object.keys(this.data).find(k => this.data[k] && this.data[k].channelId === channelId);
    return key ? { name: key, ticket: this.data[key] } : null;
  }

  claimByChannel(channelId, userId, options = {}) {
    const rec = this.getByChannel(channelId);
    if (!rec) return false;
    rec.ticket.claimedBy = userId;
    this.data[rec.name] = rec.ticket;
    this._save();
    return true;
  }

  addParticipantByChannel(channelId, userId) {
    const rec = this.getByChannel(channelId);
    if (!rec) return false;
    if (!rec.ticket.participants) rec.ticket.participants = [];
    if (!rec.ticket.participants.includes(userId)) rec.ticket.participants.push(userId);
    this.data[rec.name] = rec.ticket;
    this._save();
    return true;
  }

  removeParticipantByChannel(channelId, userId) {
    const rec = this.getByChannel(channelId);
    if (!rec || !rec.ticket.participants) return false;
    rec.ticket.participants = rec.ticket.participants.filter(id => id !== userId);
    this.data[rec.name] = rec.ticket;
    this._save();
    return true;
  }

  async closeByChannel(channel) {
    // channel: can be channel object or channelId
    let channelId = typeof channel === 'string' ? channel : channel.id;
    const rec = this.getByChannel(channelId);
    if (!rec) return null;

    // save transcript
    let transcriptPath = null;
    try {
      if (typeof channel !== 'string') {
        transcriptPath = await transcriptSaver.saveChannelTranscript(channel, rec.name);
      }
    } catch (e) {
      console.error('Transcript kaydı hata:', e);
    }

    rec.ticket.status = 'closed';
    rec.ticket.transcript = transcriptPath;
    this.data[rec.name] = rec.ticket;
    this._save();
    return rec.ticket;
  }

  migrateFromV2(oldData) {
    // oldData: object mapping name->ticket
    // backup already taken by caller
    for (const [key, val] of Object.entries(oldData)) {
      if (key === '_meta') continue;
      const idMatch = key.match(/ticket-(\d+)/);
      let id = idMatch ? parseInt(idMatch[1], 10) : this._nextId();
      if (this.data[key]) continue; // skip existing
      const ticket = {
        id: id,
        name: key,
        ownerId: val.ownerId,
        channelId: val.channelId || null,
        status: val.status || 'open',
        claimedBy: val.claimedBy || null,
        participants: [val.ownerId],
        createdAt: val.createdAt || new Date().toISOString(),
        reason: val.reason || '',
        transcript: null
      };
      this.data[key] = ticket;
      if (id > (this.data._meta.counter || 0)) this.data._meta.counter = id;
    }
    this._save();
    return true;
  }
}

module.exports = new TicketV3Manager();
