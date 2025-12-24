const { expect } = require('chai');
const levelManager = require('../../src/utils/leveling/LevelManager');

describe('LevelManager', function() {
  const guild = 'gtest';
  const user = 'u1';

  it('should start with 0 xp', function() {
    levelManager.resetGuild(guild);
    const rec = levelManager.get(guild, user);
    expect(rec.xp).to.equal(0);
  });

  it('should add xp and possibly level up', function() {
    levelManager.resetGuild(guild);
    const res1 = levelManager.addXP(guild, user, 500); // 500 XP
    expect(res1).to.be.an('object');
    const rec = levelManager.get(guild, user);
    expect(rec.xp).to.equal(500);
    expect(levelManager.getLevelFromXP(rec.xp)).to.equal(Math.floor(Math.sqrt(500/100)));
  });

  it('leaderboard returns sorted results', function() {
    levelManager.resetGuild(guild);
    levelManager.addXP(guild, 'a', 100);
    levelManager.addXP(guild, 'b', 500);
    levelManager.addXP(guild, 'c', 200);

    const top = levelManager.getLeaderboard(guild, 3);
    expect(top[0].userId).to.equal('b');
    expect(top[1].userId).to.equal('c');
    expect(top[2].userId).to.equal('a');
  });
});
