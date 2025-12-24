const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const levelManager = require('../../../utils/leveling/LevelManager');
const levelConfig = require('../../../utils/leveling/levelConfig');
const { createEmbed } = require('../../../utils/message/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levels')
    .setDescription('Seviye sistemi yönetimi (sadece yöneticiler)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub.setName('toggle').setDescription('Seviye sistemini aç/kapat'))
    .addSubcommand(sub => sub.setName('reset').setDescription('Sunucu seviyelerini sıfırla'))
    .addSubcommandGroup(group => group.setName('rewards').setDescription('Rol ödüllerini yönetir')
      .addSubcommand(sub => sub.setName('add').setDescription('Rol ödülü ekle').addIntegerOption(o => o.setName('level').setDescription('Hedef seviye').setRequired(true)).addRoleOption(r => r.setName('role').setDescription('Verilecek rol').setRequired(true)))
      .addSubcommand(sub => sub.setName('remove').setDescription('Rol ödülü kaldır (seviye veya seviye+rol)').addIntegerOption(o => o.setName('level').setDescription('Hedef seviye').setRequired(true)).addRoleOption(r => r.setName('role').setDescription('Kaldırılacak rol (opsiyonel)').setRequired(false)))
      .addSubcommand(sub => sub.setName('list').setDescription('Rol ödüllerini listeler')))
    .addSubcommandGroup(g => g.setName('announce').setDescription('Seviye atlama duyurularını yönetir')
      .addSubcommand(s => s.setName('set').setDescription('Duyuruların gönderileceği kanalı ayarla').addChannelOption(c => c.setName('channel').setDescription('Kanal').setRequired(true)))
      .addSubcommand(s => s.setName('clear').setDescription('Ayarlanmış duyuru kanalını temizle'))
      .addSubcommand(s => s.setName('toggle').setDescription('Seviye duyurularını aç/kapat').addBooleanOption(b => b.setName('enabled').setDescription('Aç (true) veya kapat (false) (opsiyonel)')))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild?.id;
    if (!guildId) return interaction.reply({ content: 'Bu komut sunucu içinde kullanılmalıdır.', ephemeral: true });

    if (sub === 'toggle') {
      const res = levelConfig.toggle(guildId);
      const embed = createEmbed({ title: '🔁 Seviye Sistemi', description: `Seviye sistemi artık ${res.enabled ? 'aktif' : 'devre dışı'}.`, context: { guild: interaction.guild } });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (sub === 'reset') {
      levelManager.resetGuild(guildId);
      const embed = createEmbed({ title: '♻️ Seviye Sıfırlama', description: 'Sunucudaki tüm seviye verileri sıfırlandı.', context: { guild: interaction.guild } });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // rewards subcommand group
    if (interaction.options.getSubcommandGroup() === 'rewards') {
      const action = interaction.options.getSubcommand();
      const level = interaction.options.getInteger('level');
      const role = interaction.options.getRole('role');
      const levelRewards = require('../../../utils/leveling/levelRewards');

      if (action === 'add') {
        levelRewards.addReward(guildId, level, role.id);
        const embed = createEmbed({ title: '✅ Ödül Eklendi', description: `Seviye **${level}** için <@&${role.id}> rolü eklendi.`, context: { guild: interaction.guild } });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (action === 'remove') {
        const res = levelRewards.removeReward(guildId, level, role ? role.id : null);
        const description = res ? `Güncel roller: ${res.join(', ')}` : `Seviye ${level} için artık ödül yok.`;
        const embed = createEmbed({ title: '✅ Ödül Kaldırıldı', description, context: { guild: interaction.guild } });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (action === 'list') {
        const list = levelRewards.list(guildId);
        if (!list || list.length === 0) return interaction.reply({ content: 'Bu sunucuda rol ödülü bulunmamaktadır.', ephemeral: true });
        const lines = list.map(l => `• Lv ${l.level}: ${l.roles.map(r => `<@&${r}>`).join(', ')}`);
        const embed = createEmbed({ title: '🏷️ Seviye Ödülleri', description: lines.join('\n'), context: { guild: interaction.guild } });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }

    // announce subcommand group
    if (interaction.options.getSubcommandGroup() === 'announce') {
      const action = interaction.options.getSubcommand();
      const lc = require('../../../utils/leveling/levelConfig');

      if (action === 'set') {
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== 0) { // 0 is GUILD_TEXT in older enums, but safe check: ensure channel is a text channel-like
          // allow channels that can send messages
        }
        lc.setAnnounceChannel(guildId, channel.id);
        const embed = createEmbed({ title: '✅ Duyuru Kanalı Ayarlandı', description: `${channel} kanalına seviye atlama duyuruları gönderilecek.`, context: { guild: interaction.guild } });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (action === 'clear') {
        lc.clearAnnounceChannel(guildId);
        const embed = createEmbed({ title: '🗑️ Duyuru Kanalı Temizlendi', description: 'Duyuru kanalı kaldırıldı. Artık bulundukları kanalda bildirim yapılacaktır.', context: { guild: interaction.guild } });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (action === 'toggle') {
        const bool = interaction.options.getBoolean('enabled');
        if (typeof bool === 'boolean') {
          const res = lc.setAnnounceEnabled(guildId, bool);
          const embed = createEmbed({ title: '🔁 Duyuru Ayarı', description: `Seviye duyuruları artık ${res.announceOnLevelUp ? 'aktif' : 'devre dışı'}.`, context: { guild: interaction.guild } });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const res = lc.toggleAnnounce(guildId);
        const embed = createEmbed({ title: '🔁 Duyuru Ayarı', description: `Seviye duyuruları artık ${res.announceOnLevelUp ? 'aktif' : 'devre dışı'}.`, context: { guild: interaction.guild } });
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }
};
