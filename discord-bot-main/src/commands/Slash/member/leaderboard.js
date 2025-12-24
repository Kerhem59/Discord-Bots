const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/message/embed');
const levelManager = require('../../../utils/leveling/LevelManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Sunucu içindeki en yüksek seviyeleri listeler')
    .addIntegerOption(o => o.setName('limit').setDescription('Kaç kullanıcı listelensin').setRequired(false)),

  async execute(interaction) {
    const guildId = interaction.guild?.id;
    if (!guildId) return interaction.reply({ content: 'Bu komut sunucu içinde kullanılmalı.', ephemeral: true });

    const limit = Math.min(25, Math.max(3, interaction.options.getInteger('limit') || 10));
    const list = levelManager.getLeaderboard(guildId, limit);

    if (!list || list.length === 0) return interaction.reply({ content: 'Henüz kimse XP kazanmadı.', ephemeral: true });

    const lines = list.map((r, i) => `${i + 1}. <@${r.userId}> — Lv ${r.level} (${r.xp} XP)`);
    const embed = createEmbed({ title: '🏆 Seviye Lider Tablosu', description: lines.join('\n'), context: { guild: interaction.guild } });

    await interaction.reply({ embeds: [embed] });
  }
};
