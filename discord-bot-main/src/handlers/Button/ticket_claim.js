const ticketManager = require('../../utils/ticket/TicketV3Manager');
const main = require('../../config/genaral/main.json');

module.exports = {
  customId: 'ticket_claim',
  async execute(interaction) {
    try {
      const channel = interaction.channel;
      const rec = ticketManager.getByChannel(channel.id);
      if (!rec) return interaction.reply({ content: 'Bu kanal bir ticket değil.', ephemeral: true });

      const supportRoleId = main.TicketSystem?.SupportRoleID;
      if (supportRoleId && !interaction.member.roles.cache.has(supportRoleId) && !interaction.member.permissions.has('ManageGuild')) {
        return interaction.reply({ content: 'Sadece destek rolü sahipleri sahiplenebilir.', ephemeral: true });
      }

      ticketManager.claimByChannel(channel.id, interaction.user.id);
      await interaction.reply({ content: `Ticket sahiplenildi: <@${interaction.user.id}>`, ephemeral: true });
      await channel.send({ content: `Ticket sahiplenildi: <@${interaction.user.id}>` }).catch(() => {});
    } catch (error) {
      console.error('ticket_claim error:', error);
      await interaction.reply({ content: 'Sahiplenme sırasında hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};