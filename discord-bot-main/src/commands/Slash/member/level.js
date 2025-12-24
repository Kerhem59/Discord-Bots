const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/message/embed');
const levelManager = require('../../../utils/leveling/LevelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Kendi seviyenizi veya başka bir kullanıcının seviyesini gösterir')
    .addUserOption(o => o.setName('user').setDescription('Seviyesini görmek istediğiniz kullanıcı').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild?.id;
    if (!guildId) return interaction.reply({ content: 'Bu komut sunucu içinde kullanılmalı.', ephemeral: true });

    const rec = levelManager.get(guildId, target.id);
    const { level, toNext, xp } = levelManager.getLevel(guildId, target.id);

    // progress calculation
    const currentLevelXP = 100 * Math.pow(level, 2);
    const nextLevelXP = 100 * Math.pow(level + 1, 2);
    const xpInto = xp - currentLevelXP;
    const xpForLevel = nextLevelXP - currentLevelXP;
    const pct = Math.floor((xpForLevel > 0 ? (xpInto / xpForLevel) * 100 : 0));

    // progress bar
    const totalBlocks = 12;
    const filledBlocks = Math.round((pct / 100) * totalBlocks);
    const bar = '▰'.repeat(filledBlocks) + '▱'.repeat(Math.max(0, totalBlocks - filledBlocks));

    // color palette
    const colors = ['#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#1abc9c'];
    const color = colors[level % colors.length];

    const embed = createEmbed({
      title: `🎖️ ${target.username} — Seviye ${level}`,
      description: `${bar} **${pct}%**\n${xpInto}/${xpForLevel} XP`,
      color,
      thumbnail: target.displayAvatarURL ? target.displayAvatarURL({ format: 'png', size: 128 }) : undefined,
      fields: [
        { name: 'Toplam XP', value: `${xp}`, inline: true },
        { name: 'Bir sonraki seviye', value: `${toNext} XP`, inline: true }
      ],
      context: { guild: interaction.guild }
    });

    await interaction.reply({ embeds: [embed] });
  }
};
