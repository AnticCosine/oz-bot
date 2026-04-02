import { REST, Routes } from 'discord.js'; 
import dotenv from 'dotenv'; 
dotenv.config(); 

const commands = [
    {
        name: 'start',
        description: 'Start monitoring deals (Also Initilise options here)',
        options: [
            {
                name: 'upvotes',
                description: 'Minimum upvotes required',
                type: 4,
                required: false
            },
            {
                name: 'time',
                description: 'Time threshold in minutes',
                type: 4,
                required: false
            },
            {
                name: 'category',
                description: 'Category to filter (e.g., Mobile, Dining & Takeaway)',
                type: 3,
                required: false
            },
            {
                name: 'keywords',
                description: 'Keywords to filter (e.g., Nintendo, Switch, Samsung)',
                type: 3,
                required: false
            },
            {
                name: 'role',
                description: 'The role you want to ping to alert users',
                type: 8,
                required: false
            }
        ]
    },
    {
        name: 'stop',
        description: 'Stop current deal scraper in this channel' 
    },
    {
        name: 'config',
        description: 'Update scraper frequency',
        options: [
            {
                name: 'interval',
                description: 'How often to scrape for deals (in minutes)',
                type: 4,
                required: false
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Slash commands were registered successfully!');
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();

