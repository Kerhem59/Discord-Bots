const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'ticket_add',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder().setCustomId('ticket_add_modal').setTitle('Kişi Ekle');
      const input = new TextInputBuilder().setCustomId('user').setLabel('Eklenecek kullanıcı (mention veya ID)').setStyle(TextInputStyle.Short).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    } catch (error) {
      console.error('ticket_add error:', error);
      await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};