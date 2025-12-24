module.exports = {
  name: 'levels-rewards',
  description: 'Seviye rol ödüllerini yönet (add/remove/list)',
  usage: 'add|remove|list <level> <@role>',
  async run(client, message, args) {
    if (!message.member.permissions.has('Administrator')) return message.reply('Yönetici yetkisi gerekli.');
    const sub = (args[0] || '').toLowerCase();
    const level = Number(args[1] || 0);
    const mention = args[2];
    const roleId = mention ? mention.replace(/[^0-9]/g, '') : null;
    const levelRewards = require('../../../utils/leveling/levelRewards');

    if (sub === 'add') {
      if (!level || !roleId) return message.reply('Kullanım: levels-rewards add <level> <@role>');
      levelRewards.addReward(message.guild.id, level, roleId);
      return message.reply(`Seviye ${level} için <@&${roleId}> rolü eklendi.`);
    }

    if (sub === 'remove') {
      if (!level) return message.reply('Kullanım: levels-rewards remove <level> [@role]');
      const res = levelRewards.removeReward(message.guild.id, level, roleId);
      return message.reply(res ? `Güncel roller: ${res.join(', ')}` : `Seviye ${level} için artık ödül yok.`);
    }

    if (sub === 'list') {
      const list = levelRewards.list(message.guild.id);
      if (!list || list.length === 0) return message.reply('Bu sunucuda rol ödülü bulunmamaktadır.');
      const lines = list.map(l => `• Lv ${l.level}: ${l.roles.map(r => `<@&${r}>`).join(', ')}`);
      return message.reply(lines.join('\n'));
    }

    return message.reply('Alt komut: add|remove|list');
  }
};
