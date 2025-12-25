const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bir kullanıcıyı sunucudan yasaklar.")
    .addUserOption(option => 
      option.setName("kullanıcı").setDescription("Yasaklanacak kullanıcıyı seçin").setRequired(true))
    .addStringOption(option => 
      option.setName("sebep").setDescription("Yasaklama sebebini yazın").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), // Sadece yetkililer görür

  async execute(interaction) {
    const user = interaction.options.getMember("kullanıcı");
    const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

    if (!user.bannable) {
      return interaction.reply({ content: "Bu kullanıcıyı yasaklamaya yetkim yetmiyor!", ephemeral: true });
    }

    await user.ban({ reason });

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🔨 Kullanıcı Yasaklandı")
      .setDescription(`${user} başarıyla sunucudan uzaklaştırıldı.`)
      .addFields({ name: "Sebep", value: reason })
      .setFooter({ text: `Moderatör: ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  },
};