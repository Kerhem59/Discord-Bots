const { expect } = require('chai');
const levelRewards = require('../../src/utils/leveling/levelRewards');

describe('LevelRewards', function() {
  const guild = 'gR';

  it('add/list/remove', function() {
    // clean
    levelRewards.removeReward(guild, 1);
    let r = levelRewards.getRolesForLevel(guild, 1);
    expect(r).to.be.an('array').that.is.empty;

    levelRewards.addReward(guild, 1, 'role1');
    levelRewards.addReward(guild, 1, 'role2');
    r = levelRewards.getRolesForLevel(guild, 1);
    expect(r).to.include('role1').and.include('role2');

    levelRewards.removeReward(guild, 1, 'role1');
    r = levelRewards.getRolesForLevel(guild, 1);
    expect(r).to.not.include('role1');

    levelRewards.removeReward(guild, 1);
    r = levelRewards.getRolesForLevel(guild, 1);
    expect(r).to.be.an('array').that.is.empty;
  });
});
