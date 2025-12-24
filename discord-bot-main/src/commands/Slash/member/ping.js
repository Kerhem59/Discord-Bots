const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/message/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Bot gecikme ve bellek bilgilerini gösterir'),

  async execute(interaction) {
    try {
      const reply = await interaction.reply({ content: 'Pong! Hesaplanıyor...', fetchReply: true });
      const latency = reply.createdTimestamp - interaction.createdTimestamp;
      const ws = interaction.client.ws.ping || 0;
      const memMB = Math.round(process.memoryUsage().rss / 1024 / 1024);

      const embed = createEmbed({
        title: '🏓 Pong!',
        fields: [
          { name: 'Mesaj Gecikmesi', value: `${latency} ms`, inline: true },
          { name: 'WS Gecikmesi', value: `${ws} ms`, inline: true },
          { name: 'Bellek (RSS)', value: `${memMB} MB`, inline: true }
        ],
        timestamp: true,
        context: { guild: interaction.guild }
      });

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error('Ping komutu çalıştırılırken hata oluştu:', error);
      if (interaction.replied || interaction.deferred) {
        try {
          await interaction.editReply({ content: 'Bir hata oluştu.', embeds: [] });
        } catch (e) {
          // noop
        }
      } else {
        await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true }).catch(() => {});
      }
    }
  }
};
