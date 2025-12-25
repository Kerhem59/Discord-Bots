module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'kick') {
      if (!interaction.member.permissions.has('KickMembers')) {
        return interaction.reply({ content: '❌ Bu komutu kullanmak için **Üyeleri At** iznin olmalı!', ephemeral: true });
      }

      const user = interaction.options.getUser('üye');
      const member = interaction.options.getMember('üye');
      const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

      if (!member) return interaction.reply({ content: '❌ Bu üye sunucuda bulunamadı.', ephemeral: true });
      if (!member.kickable) return interaction.reply({ content: '❌ Bu üyeyi atamam (rolü benden yüksek veya aynı olabilir).', ephemeral: true });

      await member.kick(reason);
      await interaction.reply({ content: `✅ **${user.tag}** sunucudan atıldı!\nSebep: ${reason}` });
    }

    if (commandName === 'ban') {
      if (!interaction.member.permissions.has('BanMembers')) {
        return interaction.reply({ content: '❌ Bu komutu kullanmak için **Üyeleri Yasakla** iznin olmalı!', ephemeral: true });
      }

      const user = interaction.options.getUser('üye');
      const member = interaction.options.getMember('üye');
      const reason = interaction.options.getString('sebep') || 'Sebep belirtilmedi';

      if (member && !member.bannable) return interaction.reply({ content: '❌ Bu üyeyi yasaklayamam (rolü benden yüksek olabilir).', ephemeral: true });

      await interaction.guild.members.ban(user.id, { reason });
      await interaction.reply({ content: `✅ **${user.tag}** sunucudan yasaklandı!\nSebep: ${reason}` });
    }
  },
};