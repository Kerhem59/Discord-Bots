const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'ticket_remove',
  async execute(interaction) {
    try {
      const modal = new ModalBuilder().setCustomId('ticket_remove_modal').setTitle('Kişi Çıkar');
      const input = new TextInputBuilder().setCustomId('user').setLabel('Çıkarılacak kullanıcı (mention veya ID)').setStyle(TextInputStyle.Short).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    } catch (error) {
      console.error('ticket_remove error:', error);
      await interaction.reply({ content: 'Bir hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};