const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Bir kullanıcıyı sunucudan atar.")
    .addUserOption(option => 
      option.setName("kullanıcı").setDescription("Atılacak kullanıcıyı seçin").setRequired(true))
    .addStringOption(option => 
      option.setName("sebep").setDescription("Atılma sebebini yazın").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getMember("kullanıcı");
    const reason = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

    if (!user.kickable) {
      return interaction.reply({ content: "Bu kullanıcıyı atmaya yetkim yetmiyor!", ephemeral: true });
    }

    await user.kick(reason);

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("👢 Kullanıcı Atıldı")
      .setDescription(`${user} başarıyla sunucudan atıldı.`)
      .addFields({ name: "Sebep", value: reason })
      .setFooter({ text: `Moderatör: ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  },
};