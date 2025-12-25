const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("croxydb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reklam-engel")
    .setDescription("Reklam engelleyici sistemini ayarlar.")
    .addStringOption(option =>
      option.setName("durum")
        .setDescription("Sistemi aç ya da kapat")
        .setRequired(true)
        .addChoices(
          { name: "Aç", value: "ac" },
          { name: "Kapat", value: "kapat" }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const secenek = interaction.options.getString("durum");

    if (secenek === "ac") {
      db.set(`reklam_engel_${interaction.guild.id}`, true);
      return interaction.reply({ content: "✅ Reklam engelleyici başarıyla **açıldı**.", ephemeral: true });
    } else {
      db.delete(`reklam_engel_${interaction.guild.id}`);
      return interaction.reply({ content: "❌ Reklam engelleyici başarıyla **kapatıldı**.", ephemeral: true });
    }
  },
};