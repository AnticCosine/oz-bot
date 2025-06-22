import { EmbedBuilder } from 'discord.js';

export async function sendDeals(deals, channel) {
    for (const deal of deals) {
        const messageContent = `🔥 **${deal.postTitle}** \n🟢 ${deal.upvotes} Upvotes in ${deal.diffMinutes} Minutes \n**Link: **<${deal.postLink}>`;
        await channel.send(messageContent);

        const embed = new EmbedBuilder()
            .setColor([208, 100, 4])
            .setTitle(deal.postTitle)
            .setURL(deal.postLink)
            .setDescription(`**${deal.upvotes} Upvotes in ${deal.diffMinutes} Minutes**`)
            .setImage(deal.postImg)
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
}