module.exports = {
  name: 'levels-announce',
  description: 'Seviye atlama duyurularını yönet (set|clear|toggle)',
  usage: 'set <#channel>|clear|toggle [true|false]',
  async run(client, message, args) {
    if (!message.member.permissions.has('Administrator')) return message.reply('Yönetici yetkisi gerekli.');
    const sub = (args[0] || '').toLowerCase();
    const levelConfig = require('../../../utils/leveling/levelConfig');

    if (sub === 'set') {
      const mention = args[1];
      if (!mention) return message.reply('Kullanım: levels-announce set <#kanal>');
      const channelId = mention.replace(/[^0-9]/g, '');
      const channel = message.guild.channels.cache.get(channelId);
      if (!channel) return message.reply('Kanal bulunamadı.');
      levelConfig.setAnnounceChannel(message.guild.id, channelId);
      return message.reply(`Seviye atlama duyuruları artık ${channel} kanalına gönderilecek.`);
    }

    if (sub === 'clear') {
      levelConfig.clearAnnounceChannel(message.guild.id);
      return message.reply('Duyuru kanalı temizlendi. Artık bulundukları kanalda bildirim yapılacaktır.');
    }

    if (sub === 'toggle') {
      const arg = args[1];
      if (arg === 'true' || arg === 'false') {
        const bool = arg === 'true';
        const res = levelConfig.setAnnounceEnabled(message.guild.id, bool);
        return message.reply(`Seviye duyuruları artık ${res.announceOnLevelUp ? 'aktif' : 'devre dışı'}.`);
      }
      const res = levelConfig.toggleAnnounce(message.guild.id);
      return message.reply(`Seviye duyuruları artık ${res.announceOnLevelUp ? 'aktif' : 'devre dışı'}.`);
    }

    return message.reply('Alt komut: set|clear|toggle');
  }
};
