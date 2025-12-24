const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();

class LevelConfig {
  constructor() {
    this.id = 'levels/config';
    this.data = json.readJson(this.id) || {};
  }

  _save() {
    json.writeJson(this.id, this.data);
  }

  get(guildId) {
    const rec = this.data[guildId];
    // defaults: enabled true, announceOnLevelUp true, announceChannelId null
    return Object.assign({ enabled: true, announceOnLevelUp: true, announceChannelId: null }, rec || {});
  }

  setEnabled(guildId, enabled) {
    this.data[guildId] = this.data[guildId] || {};
    this.data[guildId].enabled = !!enabled;
    this._save();
    return this.get(guildId);
  }

  toggle(guildId) {
    const cur = this.get(guildId);
    const next = !cur.enabled;
    return this.setEnabled(guildId, next);
  }

  setAnnounceChannel(guildId, channelId) {
    this.data[guildId] = this.data[guildId] || {};
    this.data[guildId].announceChannelId = channelId || null;
    this._save();
    return this.get(guildId);
  }

  clearAnnounceChannel(guildId) {
    return this.setAnnounceChannel(guildId, null);
  }

  setAnnounceEnabled(guildId, enabled) {
    this.data[guildId] = this.data[guildId] || {};
    this.data[guildId].announceOnLevelUp = !!enabled;
    this._save();
    return this.get(guildId);
  }

  toggleAnnounce(guildId) {
    const cur = this.get(guildId);
    const next = !cur.announceOnLevelUp;
    return this.setAnnounceEnabled(guildId, next);
  }

  reset() {
    this.data = {};
    this._save();
  }
}

module.exports = new LevelConfig();
