import { Client, EmbedBuilder, IntentsBitField} from 'discord.js'; 
import dotenv from 'dotenv';
import getLatestDeals from './ozbscraper.js'
dotenv.config(); 

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

    if (interaction.commandName == 'start') {
        
        await interaction.reply({ content: 'Starting deal monitoring...', ephemeral: true });

        const channelId = interaction.channelId; 
        const channel = client.channels.cache.get(channelId);

        setInterval(async () => {
            const deals = await getLatestDeals();
            console.log(deals)
            if (deals.length > 0) {
                for (const deal of deals) {
                    
                    const messageContent = `🔥 **${deal.postTitle}** \n🟢 ${deal.upvotes} Upvotes in ${deal.diffMinutes} Minutes \n**Link: **<${deal.postLink}>`;
                    channel.send(messageContent);

                    const embed = new EmbedBuilder()
                    .setColor([208, 100, 4])
                    .setTitle(`${deal.postTitle}`)
                    .setURL(`${deal.postLink}`)
                    .setDescription(`**${deal.upvotes} Upvotes in ${deal.diffMinutes} Minutes**`)
                    .setImage(`${deal.postImg}`)
                    .setTimestamp()

                    channel.send({ embeds: [embed] }); 
                }
            }
        },10 * 60 * 1000); 
    } 
    
}) 

client.login(process.env.TOKEN);

