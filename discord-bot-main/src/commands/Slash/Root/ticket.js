const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { createEmbed } = require('../../../utils/message/embed');
const main = require('../../../config/genaral/main.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Ticket sistemi yönetimi')
    .addSubcommand(sub => sub.setName('panel').setDescription('Panel gönderir'))
    .addSubcommand(sub => sub.setName('toggle').setDescription('Ticket sistemini aç/kapat')),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'panel') {
      if (!interaction.member.permissions.has('ManageGuild')) return interaction.reply({ content: 'Yetkiniz yok.', ephemeral: true });
      const embed = createEmbed({ title: '🎫 Destek Paneli', description: 'Aşağıdaki butona basarak ticket oluşturabilirsiniz.' , context: { guild: interaction.guild } });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_create_panel').setLabel('Ticket Oluştur').setStyle(ButtonStyle.Primary)
      );
      const menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('ticket_menu').setPlaceholder('Ticket Menüsü').addOptions([
          { label: 'Açık ticketler', value: 'open_list' },
          { label: 'Kapalı ticketler', value: 'closed_list' },
          { label: 'Benim ticketlerim', value: 'my_tickets' }
        ])
      );

      await interaction.reply({ content: 'Panel gönderildi.', ephemeral: true });
      await interaction.channel.send({ embeds: [embed], components: [row, menu] });
      return;
    }

    if (sub === 'toggle') {
      if (!interaction.member.permissions.has('ManageGuild')) return interaction.reply({ content: 'Yetkiniz yok.', ephemeral: true });
      const cfg = main.TicketSystem || {};
      cfg.enabled = !cfg.enabled;
      main.TicketSystem = cfg;
      const fs = require('fs');
      const path = require('path');
      const file = path.join(__dirname, '../../../config/genaral/main.json');
      fs.writeFileSync(file, JSON.stringify(main, null, 2));
      return interaction.reply({ content: `Ticket sistemi artık ${cfg.enabled ? 'aktif' : 'devre dışı'} `, ephemeral: true });
    }
  }
};
