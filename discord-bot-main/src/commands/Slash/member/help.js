const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Tüm komutları ve sistemlerin aktiflik durumunu gösterir."),

    async execute(interaction) {
        const int = interaction?.reply ? interaction : arguments[1];
        if (!int) return;

        // --- ANA SAYFA (Giriş) ---
        const mainEmbed = new EmbedBuilder()
            .setTitle("✨ Alt Yapı - Bilgi & Destek Sistemi")
            .setDescription(
                "> **Hoş geldin!** Botumuzun tüm sistemleri şu an optimize edilmiş ve kullanıma hazır durumdadır.\n\n" +
                "Aşağıdaki menüden bir kategori seçerek komutların **detaylı açıklamalarına** ve **aktiflik durumlarına** ulaşabilirsin."
            )
            .addFields(
                { name: "🏮 Sistem Durumu", value: "```🟢 Aktif / Sorunsuz```", inline: true },
                { name: "👑 Yetki Seviyen", value: "```" + (int.member.permissions.has("Administrator") ? "Yönetici" : "Üye") + "```", inline: true }
            )
            .setColor("#F1C40F") // Eskisi gibi canlı sarı
            .setFooter({ text: `İsteyen: ${int.user.tag}`, iconURL: int.user.displayAvatarURL({ dynamic: true }) });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("help_menu_internal")
                .setPlaceholder("📂 İncelenecek bir kategori seçiniz...")
                .addOptions([
                    { label: "Seviye & Gelişim", value: "lvl", emoji: "📊", description: "Rank, Leaderboard ve XP sistemleri." },
                    { label: "Koruma & Güvenlik", value: "grd", emoji: "🛡️", description: "Filtreleme ve engelleme sistemleri." },
                    { label: "Yönetim & Bilet", value: "adm", emoji: "⚙️", description: "Yönetici araçları ve destek talepleri." }
                ])
        );

        const response = await int.reply({ embeds: [mainEmbed], components: [row], fetchReply: true });

        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, 
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== (interaction.user?.id || int.user.id)) {
                return i.reply({ content: "❌ Bu menüyü sadece komutu başlatan kişi kullanabilir.", ephemeral: true });
            }

            const helpEmbed = new EmbedBuilder().setTimestamp();

            if (i.values[0] === 'lvl') {
                helpEmbed.setTitle("📊 Seviye ve Gelişim Sistemi")
                         .setColor("#F1C40F")
                         .setDescription(
                             "✅ **`/rank`** — [ `AKTİF` ]\n> Mevcut seviyeni ve tecrübe puanını (XP) detaylıca gösterir.\n\n" +
                             "✅ **`/leaderboard`** — [ `AKTİF` ]\n> Sunucunun en aktif ilk 10 üyesini listeler.\n\n" +
                             "✅ **`/daily`** — [ `AKTİF` ]\n> Her gün şansına bağlı olarak ücretsiz XP kazanmanı sağlar."
                         );
            } else if (i.values[0] === 'grd') {
                helpEmbed.setTitle("🛡️ Koruma ve Sunucu Güvenliği")
                         .setColor("#E74C3C")
                         .setDescription(
                             "✅ **Küfür Engelleyici** — [ `AKTİF` ]\n> Sunucuda edilen küfürleri anında tespit eder ve siler.\n\n" +
                             "✅ **Reklam Koruması** — [ `AKTİF` ]\n> İzinsiz paylaşılan tüm dış bağlantıları (link) engeller.\n\n" +
                             "✅ **`/filtre`** — [ `AKTİF` ]\n> Sunucuya özel yasaklı kelime listesi oluşturmanızı sağlar."
                         );
            } else if (i.values[0] === 'adm') {
                helpEmbed.setTitle("⚙️ Yönetici & Destek Araçları")
                         .setColor("#3498DB")
                         .setDescription(
                             "✅ **`/ticket-kur`** — [ `AKTİF` ]\n> Üyelerin yetkililere ulaşması için butonlu destek sistemi kurar.\n\n" +
                             "✅ **`/xp-yönet`** — [ `AKTİF` ]\n> Belirli kullanıcıların XP ve seviye verilerini düzenler.\n\n" +
                             "✅ **`/restart`** — [ `AKTİF` ]\n> Botun tüm sistemlerini güvenli bir şekilde kapatıp açar."
                         );
            }

            await i.update({ embeds: [helpEmbed] });
        });

        collector.on('end', () => {
            int.editReply({ components: [] }).catch(() => {});
        });
    }
};