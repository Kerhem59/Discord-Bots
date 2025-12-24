const ticketManager = require('../../utils/ticket/TicketV3Manager');
const { createEmbed } = require('../../utils/message/embed');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const main = require('../../config/genaral/main.json');

module.exports = {
  customId: 'ticket_create_modal',
  async execute(interaction) {
    try {
      const reason = interaction.fields.getTextInputValue('reason') || '';
      const guild = interaction.guild;
      const ownerId = interaction.user.id;
      const { name, ticket } = ticketManager.createTicket(guild, ownerId, reason);

      const categoryId = main.TicketSystem?.TicketCategoryID || null;
      const supportRoleId = main.TicketSystem?.SupportRoleID || null;

      const overwrites = [
        { id: guild.roles.everyone.id, deny: ['ViewChannel'] },
        { id: ownerId, allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'ReadMessageHistory'] }
      ];
      if (supportRoleId) overwrites.push({ id: supportRoleId, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] });

      const channel = await guild.channels.create({ name, type: 0, parent: categoryId || undefined, permissionOverwrites: overwrites });
      ticketManager.setChannel(name, channel.id);

      const embed = createEmbed({ title: '🎫 Ticket', description: `Ticket oluşturuldu: <@${ownerId}>`, context: { guild } });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_claim').setLabel('Sahiplen').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('ticket_add').setLabel('Kişi Ekle').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_remove').setLabel('Kişi Çıkar').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('ticket_close').setLabel('Kapat').setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `<@${ownerId}> ticket oluşturuldu: ${reason || 'Sebep belirtilmedi'}`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `Ticket oluşturuldu: ${channel}`, ephemeral: true });
    } catch (error) {
      console.error('ticket_create_modal error:', error);
      await interaction.reply({ content: 'Ticket oluşturulurken hata oluştu.', ephemeral: true }).catch(() => {});
    }
  }
};