const ticketManager = require('../../utils/ticket/TicketV3Manager');

module.exports = {
  customId: 'ticket_remove_modal',
  async execute(interaction) {
    try {
      const value = interaction.fields.getTextInputValue('user');
      const idMatch = value.match(/<@!?(\d+)>/) || value.match(/(\d{17,19})/);
      if (!idMatch) return interaction.reply({ content: 'Geçersiz kullanıcı belirtimi.', ephemeral: true });
      const userId = idMatch[1];
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!member) return interaction.reply({ content: 'Kullanıcı bulunamadı.', ephemeral: true });

      await interaction.channel.permissionOverwrites.edit(member.id, { ViewChannel: false });
      ticketManager.removeParticipantByChannel(interaction.channel.id, member.id);
      await interaction.reply({ content: `${member.user.tag} kanaldan çıkarıldı.`, ephemeral: true });
    } catch (error) {
      console.error('ticket_remove_modal error:', error);
      await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};