import { EmbedBuilder } from 'discord.js';

export async function sendDeals(deals, channel, config, mentions = '') {
    const rolePings = (config?.pingRoles || [])
        .map(id => `<@&${id}>`)
        .join(' ');

    const content = [rolePings, mentions].filter(Boolean).join(' ') || undefined;

    for (const deal of deals) {
        const embed = new EmbedBuilder()
            .setColor([208, 100, 4])
            .setAuthor({ 
                name: deal.category || 'OzBargain'
            })
            .setTitle(deal.postTitle)
            .setURL(deal.postLink)
            .setDescription(
                `${deal.description?.replace(/\s*(\.\.\.|…)\s*$/, '') || 'No description provided.'}\n\n` +
                `✅ **${deal.upvotes} upvotes in ${deal.diffMinutes} minutes**`
            )
            .setThumbnail(deal.postImg || null)
            .setFooter({ text: deal.author })

        await channel.send({ content, embeds: [embed] });
    }
}