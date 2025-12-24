const { SlashCommandBuilder } = require('discord.js');
const { loadAfkData, setAfk, removeAfk } = require('../../../utils/afk/AfkSystem');
const { createEmbed } = require('../../../utils/message/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('AFK durumunuzu ayarlayın')
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('AFK olma sebebinizi belirtin')
        .setRequired(false)
    ),

  async execute(interaction) {
    const afkData = loadAfkData();
    const user = interaction.user;
    const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';
    const guild = interaction.guild;

    if (afkData[user.id]) {
      const afkDuration = await removeAfk(user, afkData, guild);

      const embed = createEmbed({ title: '🌟 AFK Modundan Çıkıldı', description: `${user.username}, artık AFK değilsin!\n${afkDuration}`, color: 0x2ecc71, timestamp: true, context: { guild } });
      await interaction.reply({ embeds: [embed] });
      return;
    }

    await setAfk(user, reason, afkData, guild);

    const embed2 = createEmbed({ title: '🌙 AFK Moduna Geçildi', description: `${user.username}, artık AFK modundasın!\n**Sebep:** ${reason}`, color: 0x3498db, timestamp: true, context: { guild } });
    await interaction.reply({ embeds: [embed2] });
  },
};
