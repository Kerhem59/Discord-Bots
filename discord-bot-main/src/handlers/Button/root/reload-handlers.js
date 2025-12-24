const { createEmbed } = require('../../../utils/message/embed');

module.exports = {
    customId: 'reload_handlers',
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: 'Bu işlemi gerçekleştirmek için yönetici yetkisine sahip olmalısınız.',
                ephemeral: true
            });
        }
        const client = interaction.client;
        if (!client.interactions) {
            return interaction.reply({
                content: 'interactions sistemi yüklenemedi!',
                ephemeral: true
            });
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            await client.interactions.reload();
            const embed = createEmbed({
                color: 0x2B2D31,
                title: '✅ Handler Yönetimi',
                description: 'Tüm handlerlar başarıyla yeniden yüklendi!',
                timestamp: true,
                context: { guild: interaction.guild }
            });
            await interaction.editReply({
                embeds: [embed]
            });
        } catch (error) {
            const embed = createEmbed({
                color: 0xFF0000,
                title: '❌ Handler Yönetimi',
                description: 'Handlerlar yeniden yüklenirken bir hata oluştu!',
                fields: [
                    {
                        name: 'Hata',
                        value: `\`\`\`${error.message}\`\`\``
                    }
                ],
                timestamp: true,
                context: { guild: interaction.guild }
            });
            await interaction.editReply({
                embeds: [embed]
            });
        }
    }
};