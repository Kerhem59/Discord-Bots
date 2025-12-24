const { createEmbed } = require('../../../utils/message/embed');

module.exports = {
  name: 'ping',
  description: 'Bot gecikme ve bellek bilgilerini gösterir',
  usage: '',
  async run(client, message, args, config) {
    try {
      const reply = await message.reply({ content: 'Pong! Hesaplanıyor...' });
      const latency = reply.createdTimestamp - message.createdTimestamp;
      const ws = client.ws.ping || 0;
      const memMB = Math.round(process.memoryUsage().rss / 1024 / 1024);

      const embed = createEmbed({
        title: '🏓 Pong!',
        fields: [
          { name: 'Mesaj Gecikmesi', value: `${latency} ms`, inline: true },
          { name: 'WS Gecikmesi', value: `${ws} ms`, inline: true },
          { name: 'Bellek (RSS)', value: `${memMB} MB`, inline: true }
        ],
        timestamp: true,
        context: { guild: message.guild }
      });
      await reply.edit({ content: null, embeds: [embed] }).catch(async () => {
        // Eğer edit başarısız olursa, yeni bir mesaj gönder
        await message.channel.send({ embeds: [embed] }).catch(() => {});
      });
    } catch (error) {
      console.error('Prefix ping komutu çalıştırılırken hata oluştu:', error);
      message.channel.send('Bir hata oluştu.').catch(() => {});
    }
  }
};
