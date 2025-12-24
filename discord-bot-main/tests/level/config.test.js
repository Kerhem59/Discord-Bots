const { expect } = require('chai');
const levelConfig = require('../../src/utils/leveling/levelConfig');
const levelManager = require('../../src/utils/leveling/LevelManager');

describe('Level Config & opt-out', function() {
  const guild = 'gcfg';
  it('default should be enabled', function() {
    levelConfig.setEnabled(guild, true);
    const cfg = levelConfig.get(guild);
    expect(cfg.enabled).to.be.true;
  });

  it('toggle disables level gain', function() {
    levelManager.resetGuild(guild);
    levelConfig.setEnabled(guild, false);
    const res = levelManager.addXP(guild, 'u1', 100);
    expect(res).to.be.null;
  });

  it('announce settings default and setters', function() {
    // defaults
    const c0 = levelConfig.get(guild);
    expect(c0.announceOnLevelUp).to.be.true;
    expect(c0.announceChannelId).to.be.null;

    // set channel
    levelConfig.setAnnounceChannel(guild, '123456');
    const c1 = levelConfig.get(guild);
    expect(c1.announceChannelId).to.equal('123456');

    // clear channel
    levelConfig.clearAnnounceChannel(guild);
    const c2 = levelConfig.get(guild);
    expect(c2.announceChannelId).to.be.null;

    // toggle announce
    levelConfig.setAnnounceEnabled(guild, false);
    expect(levelConfig.get(guild).announceOnLevelUp).to.be.false;
    levelConfig.toggleAnnounce(guild);
    expect(levelConfig.get(guild).announceOnLevelUp).to.be.true;
  });
});
