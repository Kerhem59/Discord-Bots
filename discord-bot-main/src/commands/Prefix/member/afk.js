const { loadAfkData, setAfk, removeAfk } = require('../../../utils/afk/AfkSystem');
const { createEmbed } = require('../../../utils/message/embed');

module.exports = {
  name: 'afk',
  subname: ["uzakta"],
  description: 'AFK durumunuzu ayarlayın',
  usage: '[sebep]',
  async run(client, message, args, config) {
    const afkData = loadAfkData();
    const user = message.author;
    const reason = args.join(' ') || 'Sebep belirtilmedi';
    const guild = message.guild;

    if (afkData[user.id]) {
      const afkDuration = await removeAfk(user, afkData, guild);

      const embed = createEmbed({ title: '🌟 AFK Modundan Çıkıldı', description: `${user.username}, artık AFK değilsin!\n${afkDuration}`, color: 0x2ecc71, timestamp: true, context: { guild } });
      await message.reply({ embeds: [embed] });
      return;
    }

    await setAfk(user, reason, afkData, guild);

    const embed2 = createEmbed({ title: '🌙 AFK Moduna Geçildi', description: `${user.username}, artık AFK modundasın!\n**Sebep:** ${reason}`, color: 0x3498db, timestamp: true, context: { guild } });
    await message.reply({ embeds: [embed2] });
  }
};