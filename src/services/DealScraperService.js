import * as cheerio from "cheerio";
import fetch from "node-fetch"; 

export class DealScraperService {
    constructor(configService, storage) {
        this.configService = configService;
        this.storage = storage;
    }

    async scrapeDeals(channelId, category='', tag='') {
        try {
            const config = this.configService.getConfig(channelId);
            let baseURL = 'https://www.ozbargain.com.au';
            let url = `${baseURL}`;

            if (category) {
                url = `${baseURL}/cat/${category}/deals`;
            } else if (tag) {
                url = `${baseURL}/tag/${tag}`;
            } else {
                url = `${baseURL}/deals`;
            }

            const response = await fetch(url);
            const body = await response.text();
            const $ = cheerio.load(body);
            
            return this.processDeals(channelId, $, config);
        } catch (error) {
            console.log('Could not scrape deal', error);
            return [];
        }
    }

    processDeals(channelId, $, config) {
        const items = [];

        $('.node').map((index, element) => {
            const deal = this.extractDealInfo($, element);
            console.log(`FOUND DEAL: ${deal}`);
            if (deal.time) {
                const dayTime = `${deal.time[1]} ${deal.time[2]}`
                const date = `${deal.time[1]}`
                const postTime = `${deal.time[2]}`

                const [day, month, year] = date.split('/');
                const [hours, minutes] = postTime.split(':');
                const postDate = new Date(year, month - 1, day, hours, minutes);

                const currentTime = new Date(); 

                const diffMinutes = Math.floor((currentTime - postDate) / (1000 * 60));
                
                if (
                    deal.upvotes >= config.upvoteThreshold &&
                    diffMinutes <= config.timeThreshold &&
                    !this.storage.hasDeal(channelId, deal.postId)
                ) {
                    this.storage.addDeal(channelId, deal.postId);

                    items.push({
                        postId: deal.postId,
                        postTitle: deal.postTitle,
                        upvotes: parseInt(deal.upvotes || '0'),
                        postLink: deal.postLink,
                        dayTime: dayTime, 
                        diffMinutes: diffMinutes,
                        postImg: deal.postImg
                    });
                }
            }
        });

        return items;
    }

    extractDealInfo($, element) {
        return {
            postId: $(element).attr('id'),
            postTitle: $(element).find('.n-right .title a').text().trim(),
            upvotes: parseInt($(element).find('.n-left .nvb.voteup span').text().trim() || '0'),
            postLink: `https://www.ozbargain.com.au${$(element).find('h2.title > a').attr('href')}`,
            postImg: $(element).find('.n-right .right').find('img').attr('src'),
            time: $(element).find('.submitted').text().match(/(\d{2}\/\d{2}\/\d{4}) - (\d{2}:\d{2})/)
        };
    }

}