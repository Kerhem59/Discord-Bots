// Usage: node scripts/register-ticket-commands.js [global|guild] [guildId]
// Example: node scripts/register-ticket-commands.js guild 123456789012345678

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('../src/config/genaral/main.json');

async function main() {
  const arg = process.argv[2] || 'guild';
  const guildIdArg = process.argv[3];
  const token = process.env.MAIN_BOT_TOKEN || config.MainBotToken;
  const clientId = process.env.MAIN_BOT_ID || config.MainBotID;

  if (!token || !clientId) {
    console.error('MainBotToken or MainBotID missing in config/genaral/main.json');
    process.exit(1);
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const ticketCmd = require('../src/commands/Slash/Root/ticket.js');
  const body = [ticketCmd.data.toJSON()];

  try {
    if (arg === 'global') {
      console.info('Registering ticket command globally...');
      await rest.put(Routes.applicationCommands(clientId), { body });
      console.log('Registered globally.');
    } else {
      const guildId = guildIdArg || config.ServerID;
      if (!guildId) {
        console.error('Guild ID missing. Provide as arg or set ServerID in config.');
        process.exit(1);
      }
      console.info(`Registering ticket command for guild ${guildId}...`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
      console.info('Registered for guild.');
    }
  } catch (error) {
    console.error('Failed to register command:', error);
    process.exit(1);
  }
}

main();