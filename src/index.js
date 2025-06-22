import { Client, IntentsBitField} from 'discord.js'; 
import dotenv from 'dotenv';
import { DealScraperService } from './services/DealScraperService.js';
import { sendDeals } from './utils/sendDeals.js';
import { ConfigService } from './services/ConfigService.js';
import { DealStorage } from './services/storage/DealStorage.js';
dotenv.config();

const configService = new ConfigService();
const dealStorage = new DealStorage();
const dealScraperService = new DealScraperService(configService, dealStorage);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
}); 

client.on('ready', (c) => {
    console.log(`${c.user.tag} is ready!`); 
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
        case 'start':
            await handleStart(interaction);
            break;
        case 'config':
            await handleConfig(interaction);
            break;
        case 'filter':
            await handleFilter(interaction);
            break;
    }
});

async function handleStart(interaction) {
    const channelId = interaction.channelId;
    await interaction.reply({ content: 'Starting deal monitoring...', ephemeral: true });
    const channel = client.channels.cache.get(channelId);

    const upvotes = interaction.options.getInteger('upvotes') || 20;
    const time = interaction.options.getInteger('time') || 60;
    const category = interaction.options.getString('category') || null;
    const tag = interaction.options.getString('tag') || null;

    configService.updateConfig(channelId, {
        upvoteThreshold: upvotes,
        timeThreshold: time,
        categories: category ? [category] : [],
        tags: tag ? [tag] : []
    });

    console.log(`Starting bot with configuration as ${configService.getConfig(channelId)}`);
    
    setInterval(async () => {
        const config = configService.getConfig(channelId)
        const deals = await dealScraperService.scrapeDeals(channelId, config.categories[0], config.tags[0]);
        console.log(deals);
        await sendDeals(deals, channel);
    }, 30 * 1000);
}

async function handleConfig(interaction) {
    const channelId = interaction.channelId;
    const upvotes = interaction.options.getInteger('upvotes');
    const time = interaction.options.getInteger('time');
    
    configService.updateConfig(channelId, {
        upvoteThreshold: upvotes,
        timeThreshold: time
    });
    
    await interaction.reply({ 
        content: `Updated configuration: ${upvotes} upvotes in ${time} minutes`,
        ephemeral: true 
    });
}

async function handleFilter(interaction) {
    const channelId = interaction.channelId;
    const category = interaction.options.getString('category');
    const tag = interaction.options.getString('tag');

    configService.updateConfig(channelId, {
        categories: category ? [category] : [],
        tags: tag ? [tag] : []
    });

    await interaction.reply({
        content: `Updated filters: ${category ? `Category: ${category}` : ''} ${tag ? `Tag: ${tag}` : ''}`,
        ephemeral: true
    });
}

client.login(process.env.TOKEN);

