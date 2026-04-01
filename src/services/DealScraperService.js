import * as cheerio from "cheerio";
import fetch from "node-fetch"; 
import { sendDeals } from '../utils/sendDeals.js';

export class DealScraperService {
    constructor(configService, storage, client) {
        this.configService = configService;
        this.storage = storage;
        this.client = client;
        this.started = false;
    }

    start() {
        if (this.started) return;
        this.started = true;

        setInterval(async () => {

            const allDeals = await this.scrapeAllDeals();
            
            if (!allDeals.length) return;

            for (const [channelId, config] of Object.entries(this.configService.getAllConfigs())) {
                //console.log(channelId, config)
                const channel = this.client.channels.cache.get(channelId);
                if (!channel) continue;

                const filtered = this.filterDeals(allDeals, channelId, config);
                //console.log("filtered deals: " ,filtered)
                if (filtered.length) await sendDeals(filtered, channel, config);
            }

        }, 60 * 1000 * 45); // scrapes every 45 minutes 
    }

    async scrapeAllDeals() {
        try {
            const response = await fetch('https://www.ozbargain.com.au/deals');
            const body = await response.text();
            const $ = cheerio.load(body);
            return this.extractAll($);
        } catch (error) {
            console.log('Could not scrape deal', error);
            return [];
        }
    }

    extractAll($) {
        const deals = [];
        $('.node').each((_, el) => {
            const deal = this.extractDealInfo($, el);
            const match = deal.time;
            if (!match) return;

            const [, date, time] = match;
            const [d, m, y] = date.split('/');
            const [h, min] = time.split(':');
            const postDate = new Date(y, m - 1, d, h, min);
            const diffMinutes = Math.floor((Date.now() - postDate) / 60000);

            deals.push({ ...deal, diffMinutes });
        });
        return deals;
    }

    filterDeals(deals, channelId, config) {
        return deals.filter(deal => {
            if (deal.upvotes < config.upvoteThreshold) return false;
            if (deal.diffMinutes > config.timeThreshold) return false;
            if (this.storage.hasDeal(channelId, deal.postId)) return false;

            //Keyword Filter
            const title = deal.postTitle.toLowerCase();
            if (config.filterKeywords?.length && !config.filterKeywords.some(kw => title.includes(kw.toLowerCase()))) return false;

            //Category Filtrer
            if (config.categories?.length && !config.categories.some(cat => cat.toLowerCase() === deal.category.trim().toLowerCase())) return false;

            //console.log(`DEAL FOUND: ${deal}`)
            this.storage.addDeal(channelId, deal.postId);
            return true;
        });
    }

    extractDealInfo($, element) {
        return {
            postId: $(element).attr('id'),
            author: $(element).find('.n-right .submitted strong a').text().trim(),
            description: $(element).find('.n-right .content p').text().trim(),
            postTitle: $(element).find('.n-right .title a').text().trim(),
            upvotes: parseInt($(element).find('.n-left .nvb.voteup span').text().trim() || '0'),
            postLink: `https://www.ozbargain.com.au${$(element).find('h2.title > a').attr('href')}`,
            postImg: $(element).find('.n-right .right').find('img').attr('src'),
            time: $(element).find('.submitted').text().match(/(\d{2}\/\d{2}\/\d{4}) - (\d{2}:\d{2})/),
            category: $(element).find('.n-right .links .tag').text().trim()
        };
    }

}