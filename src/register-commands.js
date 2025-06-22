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
                description: 'Category to filter (e.g., dining-takeaway)',
                type: 3,
                required: false
            },
            {
                name: 'tag',
                description: 'Tag to filter (e.g., tablet)',
                type: 3,
                required: false
            }
        ]
    },
    {
        name: 'config',
        description: 'Update deal monitoring configuration',
        options: [
            {
                name: 'upvotes',
                description: 'Minimum upvotes required',
                type: 4,
                required: true
            },
            {
                name: 'time',
                description: 'Time threshold in minutes',
                type: 4,
                required: true
            }
        ]
    },
    {
        name: 'filter',
        description: 'Filter deals by category or tag',
        options: [
            {
                name: 'category',
                description: 'Category to filter (e.g., dining-takeaway)',
                type: 3,
                required: false
            },
            {
                name: 'tag',
                description: 'Tag to filter (e.g., tablet)',
                type: 3,
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

