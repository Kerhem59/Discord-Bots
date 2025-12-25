const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const main = require('../../../../config/genaral/main.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket sistemi yönetimi')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(s => s.setName('panel').setDescription('Destek panelini kanala gonderir'))
        .addSubcommand(s => s.setName('role').setDescription('Yetkili rolu ayarlamanizi saglar').addRoleOption(o => o.setName('rol').setDescription('Bir rol secin').setRequired(true)))
        .addSubcommand(s => s.setName('category').setDescription('Kategori ayarlamanizi saglar').addChannelOption(o => o.setName('kat').setDescription('Bir kategori secin').addChannelTypes(ChannelType.GuildCategory).setRequired(true))),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const configPath = path.join(__dirname, '../../../../../config/genaral/main.json');
        let cfg = main.TicketSystem;

        if (sub === 'panel') {
            const embed = new EmbedBuilder()
                .setTitle('🎫 Destek Talebi Olustur')
                .setDescription('Sorunlariniz icin asagidaki butona tiklayarak bilet acabilirsiniz.')
                .setColor('#2b2d31');
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_olustur').setLabel('Ticket Olustur').setEmoji('📩').setStyle(ButtonStyle.Success)
            );
            await interaction.reply({ content: '✅ Panel gonderildi.', ephemeral: true });
            return interaction.channel.send({ embeds: [embed], components: [row] });
        }

        if (sub === 'role') cfg.SupportRoleID = interaction.options.getRole('rol').id;
        if (sub === 'category') cfg.TicketCategoryID = interaction.options.getChannel('kat').id;

        main.TicketSystem = cfg;
        fs.writeFileSync(configPath, JSON.stringify(main, null, 2));
        return interaction.reply({ content: `✅ Ayarlar basariyla kaydedildi.`, ephemeral: true });
    }
};