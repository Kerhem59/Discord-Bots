const { Events } = require('discord.js');
const { loadAfkData, removeAfk, getAfkReason } = require('../utils/afk/AfkSystem');
const calculateSimilarity = require('../utils/message/core');
const { createEmbed } = require('../utils/message/embed');
const settings = require('../config/genaral/otomesaj.json');

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message) {
    if (message.author.bot || message.system) return;

    const afkData = loadAfkData();
    if (message.mentions.users.size > 0) {
      const mentionedUser = message.mentions.users.first();
      const afkReason = getAfkReason(mentionedUser, afkData);

      if (afkReason) {
        message.reply(`${mentionedUser.username} şu anda **${afkReason.reason}** sebebiyle AFK. (${afkReason.duration})`);
      }
    }
    if (afkData[message.author.id]) {
      const afkMessage = await removeAfk(message.author, afkData, message.guild);
      if (afkMessage) {
        message.reply(`AFK modundan çıktınız. ${afkMessage}`);
      }
    }
    try {
      if (!settings.responses || !Array.isArray(settings.responses)) {
        console.error('Invalid settings.json format: responses array is missing or not an array');
        return;
      }   
      const messageContent = message.content.toLowerCase();
      const similarityThreshold = settings.similarityThreshold || 80; // Default to 80% if not specified
      
      for (const response of settings.responses) {
        if (!response.trigger || !response.reply) continue;
        
        const triggerLower = response.trigger.toLowerCase();
        
        // Calculate similarity
        const similarity = calculateSimilarity(messageContent, triggerLower);
        
        if (similarity >= similarityThreshold) {   
          const useEmbed = response.embed === true || response.embed === "true"; 
          if (useEmbed) {
            const embed = createEmbed({
              description: response.reply,
              context: { guild: message.guild }
            });
            
            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: true } });
          } else {
            await message.reply({
              content: response.reply,
              allowedMentions: { repliedUser: true }
            });
          } 
          break;
        }
      }

      // Leveling: award XP for normal messages (not bots/system)
      try {
        const levelManager = require('../utils/leveling/LevelManager');
        const levelRewards = require('../utils/leveling/levelRewards');
        if (message.guild && !message.author.bot) {
          const res = levelManager.addXP(message.guild.id, message.author.id);
          if (res && res.levelUp) {
            const cfg = require('../utils/leveling/levelConfig').get(message.guild.id);

            const embed = createEmbed({
              title: '🎉 Seviye Atladınız!',
              description: `Tebrikler <@${message.author.id}>! Seviye **${res.newLevel}**'e ulaştınız ( +${res.gained} XP ).`,
              context: { guild: message.guild }
            });

            // Announce publicly in configured channel or current channel if enabled
            try {
              if (cfg.announceOnLevelUp) {
                let targetChannel = null;
                if (cfg.announceChannelId) {
                  targetChannel = message.guild.channels.cache.get(cfg.announceChannelId) || null;
                }
                if (!targetChannel) targetChannel = message.channel;

                await targetChannel.send({ embeds: [embed] }).catch(() => {});
              } else {
                // if announcements disabled, keep behavior: DM the user their level-up (no public announce)
                try {
                  await message.author.send({ embeds: [embed] }).catch(() => {});
                } catch (e) {}
              }
            } catch (announceErr) {
              console.error('Announce error:', announceErr);
              // fallback to replying so user still sees it
              await message.reply({ embeds: [embed] }).catch(() => {});
            }

            // Role rewards
            try {
              const roles = levelRewards.getRolesForLevel(message.guild.id, res.newLevel) || [];
              if (roles.length > 0 && message.member && message.member.roles) {
                for (const roleId of roles) {
                  try {
                    if (!message.member.roles.cache.has(roleId)) {
                      await message.member.roles.add(roleId);
                      const rEmbed = createEmbed({
                        description: `<@${message.author.id}> artık <@&${roleId}> rolüne sahip!`,
                        context: { guild: message.guild }
                      });
                      await message.channel.send({ embeds: [rEmbed] }).catch(() => {});
                    }
                  } catch (e) {
                    console.error(`Rol atama başarısız: ${roleId}`, e.message || e);
                  }
                }
              }
            } catch (rrErr) {
              console.error('Role reward error:', rrErr);
            }

          }
        }
      } catch (lvlErr) {
        console.error('Leveling error:', lvlErr);
      }

    } catch (error) {
      console.error('Error in MessageCreate event:', error);
    }
  },
};