const ticketManager = require('../../utils/ticket/TicketV3Manager');
const main = require('../../config/genaral/main.json');

module.exports = {
  customId: 'ticket_close',
  async execute(interaction) {
    try {
      const channel = interaction.channel;
      const rec = ticketManager.getByChannel(channel.id);
      if (!rec) return interaction.reply({ content: 'Bu kanal bir ticket değil.', ephemeral: true });

      const ownerId = rec.ticket.ownerId;
      const supportRoleId = main.TicketSystem?.SupportRoleID;
      const isOwner = interaction.user.id === ownerId;
      const isSupport = (supportRoleId && (interaction.member.roles.cache.has(supportRoleId) || interaction.member.permissions.has('ManageGuild')));
      if (!isOwner && !isSupport) return interaction.reply({ content: 'Bu işlemi sadece sahip veya destek rolü yapabilir.', ephemeral: true });

      await interaction.reply({ content: 'Ticket kapatılıyor, transcript kaydediliyor...', ephemeral: true });
      const closedTicket = await ticketManager.closeByChannel(channel);
      await channel.send({ content: `Ticket kapatıldı. Transcript: ${closedTicket.transcript || 'yok'}` }).catch(() => {});
      try { await channel.delete(`Ticket kapatıldı by ${interaction.user.tag}`); } catch (e) { console.error('channel.delete error:', e); }
    } catch (error) {
      console.error('ticket_close error:', error);
      await interaction.reply({ content: 'Ticket kapatma sırasında bir hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};