import { Client, IntentsBitField} from 'discord.js'; 
import dotenv from 'dotenv';
import { DealScraperService } from './services/DealScraperService.js';
import { ConfigService } from './services/ConfigService.js';
import { DealStorage } from './services/storage/DealStorage.js';
dotenv.config();

const ScraperFrequency = 60 // minutes 

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
}); 

const configService = new ConfigService();
const dealStorage = new DealStorage();
const dealScraperService = new DealScraperService(configService, dealStorage, client, ScraperFrequency);

client.on('ready', (c) => {
    console.log(`${c.user.tag} is ready!`); 
    dealScraperService.start();
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
        case 'start':
            await handleStart(interaction);
            break;
        case 'stop':
            await handleStop(interaction);
            break;
        case 'config':
            await handleConfig(interaction);
            break;
    }
});

async function handleStart(interaction) {
    const channelId = interaction.channelId;


    const upvotes = interaction.options.getInteger('upvotes') || 20;
    const time = interaction.options.getInteger('time') || 60;
    const category = interaction.options.getString('category')?.split(',').map(c => c.trim()) || [];
    const keywords = interaction.options.getString('keywords')?.split(',').map(k => k.trim()) || [];
    const pingRole = interaction.options.getRole('role') || null;

    configService.updateConfig(channelId, {
        upvoteThreshold: upvotes,
        timeThreshold: time,
        categories: category,
        filterKeywords: keywords,
        pingRoles: pingRole ? [pingRole.id] : []
    });

    await interaction.reply({
        embeds: [
            {
                title: "Oz Bot scraper started with following params",
                color: 0x00FF00,
                fields: [
                    { name: "Trending ", value: `${upvotes} upvotes in ${time} minutes`, inline: true },
                    { name: "Category", value: category.length ? category.join(', ') : "None", inline: true },
                    { name: "Keywords", value: keywords.length ? keywords.join(', ') : "None", inline: true }
                ]
            }
        ]
    });
    
}

async function handleStop(interaction) {
    const channelId = interaction.channelId;
    
    configService.deleteConfig(channelId);
   
    await interaction.reply({
        embeds: [
            {
                title: "Oz Bot scraper stopped in this channel",
                color: 0xFF0000
            }
        ]
    });
}


async function handleConfig(interaction) {
    const interval = interaction.options.getInteger('interval');

    if (!interval) {
        return await interaction.reply({ content: 'Please provide at least one setting to update.', ephemeral: true });
    }

    if (interval < 1) {
        return await interaction.reply({ content: 'Interval must be at least 1 minute.', ephemeral: true });
    }

    dealScraperService.updateInterval(interval);

    await interaction.reply({
        embeds: [{
            title: "Scraper config updated",
            color: 0x0099FF,
            fields: [
                { name: "Scrape Interval", value: `Every ${interval} minutes`, inline: true }
            ]
        }]
    });
}

client.login(process.env.TOKEN);

