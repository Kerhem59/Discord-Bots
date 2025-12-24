module.exports = {
  name: 'tickets-backup',
  description: 'Manage ticket DB backups (manual/list/restore)',
  usage: 'manual|list|restore <filename>',
  async run(client, message, args) {
    if (!message.member.permissions.has('ManageGuild')) return message.reply('Yönetici yetkisi gerekli.');
    const sub = args[0]?.toLowerCase();
    const ticketDB = require('../../../utils/ticket/db');

    if (sub === 'manual') {
      const res = ticketDB.manualBackup();
      if (!res) return message.reply('Yedek oluşturulamadı.');
      return message.reply('Yedek oluşturuldu: `' + res + '`');
    }

    if (sub === 'list') {
      const list = ticketDB.listBackups();
      if (!list || list.length === 0) return message.reply('Yedek bulunamadı.');
      return message.reply(`Yedekler:\n${list.map(f => `- ${f}`).join('\n')}`);
    }

    if (sub === 'restore') {
      const file = args[1];
      if (!file) return message.reply('Kullanım: restore <filename>');
      const res = ticketDB.restoreBackup(file);
      if (!res) return message.reply('Geri yükleme başarısız.');
      return message.reply(`Geri yüklendi. Önceki anlık yedek: ${res.preSnapshot || 'yok'}`);
    }

    return message.reply('Alt komut: manual|list|restore <filename>');
  }
};