const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();

class LevelRewards {
  constructor() {
    this.id = 'levels/rewards';
    this.data = json.readJson(this.id) || {};
  }

  _save() {
    json.writeJson(this.id, this.data);
  }

  _ensureGuild(guildId) {
    if (!this.data[guildId]) this.data[guildId] = {};
    return this.data[guildId];
  }

  addReward(guildId, level, roleId) {
    const guild = this._ensureGuild(guildId);
    guild[level] = guild[level] || [];
    if (!guild[level].includes(roleId)) guild[level].push(roleId);
    this.data[guildId] = guild;
    this._save();
    return guild[level];
  }

  removeReward(guildId, level, roleId = null) {
    const guild = this._ensureGuild(guildId);
    if (!guild[level]) return null;
    if (!roleId) {
      delete guild[level];
    } else {
      guild[level] = guild[level].filter(r => r !== roleId);
      if (guild[level].length === 0) delete guild[level];
    }
    this.data[guildId] = guild;
    this._save();
    return guild[level] || null;
  }

  getRewards(guildId) {
    return this.data[guildId] || {};
  }

  getRolesForLevel(guildId, level) {
    const guild = this.data[guildId] || {};
    return guild[level] || [];
  }

  list(guildId) {
    const guild = this.getRewards(guildId);
    return Object.keys(guild).map(l => ({ level: Number(l), roles: guild[l] } )).sort((a,b) => a.level - b.level);
  }
}

module.exports = new LevelRewards();
