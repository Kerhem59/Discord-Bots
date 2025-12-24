module.exports = {
  name: 'levels',
  description: 'Seviye sistemi yönetimi (toggle|reset)',
  usage: 'toggle|reset',
  async run(client, message, args) {
    if (!message.member.permissions.has('Administrator')) return message.reply('Yönetici yetkisi gerekli.');
    const sub = (args[0] || '').toLowerCase();
    const levelManager = require('../../../utils/leveling/LevelManager');
    const levelConfig = require('../../../utils/leveling/levelConfig');

    const guildId = message.guild?.id;
    if (!guildId) return message.reply('Bu komut sunucu içinde kullanılmalıdır.');

    if (sub === 'toggle') {
      const res = levelConfig.toggle(guildId);
      return message.reply(`Seviye sistemi artık ${res.enabled ? 'aktif' : 'devre dışı'}.`);
    }

    if (sub === 'reset') {
      levelManager.resetGuild(guildId);
      return message.reply('Sunucudaki seviye verileri sıfırlandı.');
    }

    return message.reply('Alt komut: toggle|reset');
  }
};
