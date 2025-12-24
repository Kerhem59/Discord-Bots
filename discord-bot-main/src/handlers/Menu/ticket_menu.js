const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const ticketManager = require('../../utils/ticket/TicketV3Manager');

module.exports = {
  value: 'ticket',
  type: 'STRING_SELECT_MENU',
  async execute(interaction) {
    try {
      const values = interaction.values || [];
      const v = values[0];
      if (!v) return interaction.reply({ content: 'Seçim yapılmadı.', ephemeral: true });

      if (v === 'open_list') {
        const all = ticketManager.data;
        const tickets = Object.values(all).filter(t => t && t.status === 'open');
        if (!tickets.length) return interaction.reply({ content: 'Açık ticket yok.', ephemeral: true });
        const lines = tickets.map(t => `• ${t.name} — Sahip: <@${t.ownerId}> — Oluşturulma: ${t.createdAt}`);
        return interaction.reply({ content: lines.join('\n'), ephemeral: true });
      }

      if (v === 'closed_list') {
        const all = ticketManager.data;
        const tickets = Object.values(all).filter(t => t && t.status === 'closed');
        if (!tickets.length) return interaction.reply({ content: 'Kapalı ticket yok.', ephemeral: true });
        const lines = tickets.map(t => `• ${t.name} — Sahip: <@${t.ownerId}> — Kapanma: ${t.closedAt || 'N/A'}`);
        return interaction.reply({ content: lines.join('\n'), ephemeral: true });
      }

      if (v === 'my_tickets') {
        const uid = interaction.user.id;
        const all = ticketManager.data;
        const tickets = Object.values(all).filter(t => t && (t.ownerId === uid || (t.participants||[]).includes(uid)));
        if (!tickets.length) return interaction.reply({ content: 'Sizin ticketiniz yok.', ephemeral: true });
        const lines = tickets.map(t => `• ${t.name} — Durum: ${t.status} — Sahip: <@${t.ownerId}>`);
        return interaction.reply({ content: lines.join('\n'), ephemeral: true });
      }

      return interaction.reply({ content: 'Bilinmeyen seçim.', ephemeral: true });
    } catch (error) {
      console.error('ticket_menu error:', error);
      await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};