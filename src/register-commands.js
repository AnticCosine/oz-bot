import { REST, Routes } from 'discord.js'; 
import dotenv from 'dotenv'; 
dotenv.config(); 

const commands = [
    {
        name: 'start', 
        description: 'starting bot' 
    }
]

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

