const JsonManager = require('../../../Database/SuperCore/JsonManager');
const json = new JsonManager();

class LevelManager {
  constructor() {
    this.id = 'levels/data';
    this.data = json.readJson(this.id) || {};
    // in-memory cooldown: { `${guildId}:${userId}`: timestamp }
    this.cooldowns = new Map();
    this.COOLDOWN_MS = 60 * 1000; // 60 seconds
  }

  _save() {
    json.writeJson(this.id, this.data);
  }

  _ensureGuild(guildId) {
    if (!this.data[guildId]) this.data[guildId] = {};
    return this.data[guildId];
  }

  addXP(guildId, userId, amount = null) {
    if (!guildId || !userId) return null;

    // Respect per-guild enabled flag
    try {
      const levelConfig = require('./levelConfig');
      const cfg = levelConfig.get(guildId);
      if (cfg && cfg.enabled === false) return null;
    } catch (err) {
      // ignore
    }

    const key = `${guildId}:${userId}`;
    const now = Date.now();
    const last = this.cooldowns.get(key) || 0;
    if (now - last < this.COOLDOWN_MS) return null; // still on cooldown

    // random XP between 5-10 if not provided
    const xpToAdd = typeof amount === 'number' ? amount : (Math.floor(Math.random() * 6) + 5);

    const guild = this._ensureGuild(guildId);
    const user = guild[userId] || { xp: 0 };
    const oldXP = user.xp || 0;
    const oldLevel = this.getLevelFromXP(oldXP);

    user.xp = oldXP + xpToAdd;
    guild[userId] = user;
    this.data[guildId] = guild;
    this.cooldowns.set(key, now);
    this._save();

    const newLevel = this.getLevelFromXP(user.xp);
    const levelUp = newLevel > oldLevel;
    return { levelUp, oldLevel, newLevel, xp: user.xp, gained: xpToAdd };
  }

  get(guildId, userId) {
    const guild = (this.data[guildId] || {});
    return guild[userId] || { xp: 0 };
  }

  getLevelFromXP(xp = 0) {
    // Simple leveling formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt((xp || 0) / 100));
  }

  getLevel(guildId, userId) {
    const rec = this.get(guildId, userId);
    const lvl = this.getLevelFromXP(rec.xp || 0);
    const nextLvlXP = 100 * Math.pow(lvl + 1, 2);
    const remaining = Math.max(0, nextLvlXP - (rec.xp || 0));
    return { level: lvl, xp: rec.xp || 0, toNext: remaining };
  }

  getLeaderboard(guildId, limit = 10) {
    const guild = this.data[guildId] || {};
    const arr = Object.entries(guild).map(([userId, rec]) => ({ userId, xp: rec.xp || 0, level: this.getLevelFromXP(rec.xp || 0) }));
    arr.sort((a, b) => b.xp - a.xp);
    return arr.slice(0, limit);
  }

  resetGuild(guildId) {
    delete this.data[guildId];
    this._save();
  }
}

module.exports = new LevelManager();
