const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { interactions } = require('./core/interaction/Core');
const { EventCore  } = require('./core/event/EventCore');
const config = require('./config/genaral/main.json');
const JsonManager = require('../Database/SuperCore/JsonManager')

const jsonManager = new JsonManager()
const client = new Client({
    partials: [
        Partials.GuildMember,
        Partials.User,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
    shards: 'auto',
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
    ],
});

async function initializeinteractions() {
    try {
        client.interactions = new interactions(client, config);
        jsonManager.initializeBackup();
        client.interactions.setupListeners();
        await client.interactions.initialize();

        // Optional: auto-register ticket commands on startup if enabled (opt-in)
        try {
          if (config.TicketSystem && config.TicketSystem.AutoRegister) {
            console.info('AutoRegister enabled — registering ticket command for server...');
            const exec = require('child_process').execSync;
            const guildId = config.ServerID || '';
            const cmd = `node ${require('path').resolve(__dirname, '..', 'scripts', 'register-ticket-commands.js')} guild ${guildId}`;
            exec(cmd, { stdio: 'inherit' });
          }
        } catch (e) {
          console.error('Auto register failed:', e);
        }
    } catch (error) {
        console.error("interactions başlatma hatası:", error);
    }
}

EventCore(client);

client.once('ready', async () => {
    await initializeinteractions();
});

const BOT_TOKEN = process.env.MAIN_BOT_TOKEN || config.MainBotToken;
const BOT_ID = process.env.MAIN_BOT_ID || config.MainBotID;

client.login(BOT_TOKEN)
    .then(() => {
        console.info("Bot oturum açtı, hazırlanıyor...");
    })
    .catch((err) => {
        console.error("Bot oturum açarken hata oluştu:", err);
    });

process.on('unhandledRejection', (error) => {
    console.error('İşlenmeyen Promise Hatası:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Yakalanmayan Hata:', error);
});