const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const main = require('../../config/genaral/main.json');

module.exports = {
  customId: 'ticket_create_panel',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder().setCustomId('ticket_create_modal').setTitle('Ticket Oluştur');
      const input = new TextInputBuilder().setCustomId('reason').setLabel('Talep / Sebep (opsiyonel)').setStyle(TextInputStyle.Paragraph).setRequired(false);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    } catch (error) {
      console.error('ticket_create_panel error:', error);
      await interaction.reply({ content: 'Ticket oluşturulurken bir hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};