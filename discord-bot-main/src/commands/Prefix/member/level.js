module.exports = {
  name: 'level',
  description: 'Kendi seviyenizi gösterir',
  usage: '[@user]',
  async run(client, message, args) {
    const target = message.mentions.users.first() || message.author;
    const levelManager = require('../../../utils/leveling/LevelManager');
    const { createEmbed } = require('../../../utils/message/embed');
    const guildId = message.guild?.id;
    if (!guildId) return message.reply('Bu komut sunucu içinde kullanılmalıdır.');

    const { level, xp, toNext } = levelManager.getLevel(guildId, target.id);
    const currentLevelXP = 100 * Math.pow(level, 2);
    const nextLevelXP = 100 * Math.pow(level + 1, 2);
    const xpInto = xp - currentLevelXP;
    const xpForLevel = nextLevelXP - currentLevelXP;
    const pct = Math.floor((xpForLevel > 0 ? (xpInto / xpForLevel) * 100 : 0));
    const totalBlocks = 12;
    const filledBlocks = Math.round((pct / 100) * totalBlocks);
    const bar = '▰'.repeat(filledBlocks) + '▱'.repeat(Math.max(0, totalBlocks - filledBlocks));
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
      context: { guild: message.guild }
    });

    return message.reply({ embeds: [embed] });
  }
};
