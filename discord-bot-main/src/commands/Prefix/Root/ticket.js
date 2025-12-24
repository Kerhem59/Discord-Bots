const { createEmbed } = require('../../../utils/message/embed');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const main = require('../../../config/genaral/main.json');

module.exports = {
  name: 'ticket',
  description: 'Ticket sistemi',
  usage: 'panel|toggle',
  async run(client, message, args) {
    const sub = args[0];
    if (!sub || sub === 'panel') {
      if (!message.member.permissions.has('ManageGuild')) return message.reply('Yetkiniz yok.');
      const embed = createEmbed({ title: '🎫 Destek Paneli', description: 'Aşağıdaki butona basarak ticket oluşturabilirsiniz.' , context: { guild: message.guild } });
      const row = {
        type: 1,
        components: [
          { type: 2, custom_id: 'ticket_create_panel', label: 'Ticket Oluştur', style: 1 }
        ]
      };
      const menu = {
        type: 1,
        components: [
          { type: 3, custom_id: 'ticket_menu', placeholder: 'Ticket Menüsü', options: [
            { label: 'Açık ticketler', value: 'open_list' },
            { label: 'Kapalı ticketler', value: 'closed_list' },
            { label: 'Benim ticketlerim', value: 'my_tickets' }
          ] }
        ]
      };
      await message.channel.send({ embeds: [embed], components: [row, menu] });
      return message.reply('Panel gönderildi.').catch(() => {});
    }

    if (sub === 'toggle') {
      if (!message.member.permissions.has('ManageGuild')) return message.reply('Yetkiniz yok.');
      const cfg = main.TicketSystem || {};
      cfg.enabled = !cfg.enabled;
      main.TicketSystem = cfg;
      const fs = require('fs');
      const path = require('path');
      const file = path.join(__dirname, '../../../config/genaral/main.json');
      fs.writeFileSync(file, JSON.stringify(main, null, 2));
      return message.reply(`Ticket sistemi artık ${cfg.enabled ? 'aktif' : 'devre dışı'}`);
    }

    return message.reply('Alt komut: panel|toggle');
  }
};
