import * as cheerio from "cheerio";
import fetch from "node-fetch"; 

export class dealScraperService {
    constructor(config, storage) {
        this.config = config;
        this.storage = storage;
    }

    async scrapeDeals(category='', tag='') {
        try {
            let baseURL = 'https://www.ozbargain.com.au';

            if (category) {
                let url = `${baseURL}/cat/${category}`;
            } else if (tag) {
                let url = `${baseURL}/tag/${tag}`;
            }

            const response = await fetch(url);
            const body = await response.text();
            const $ = cheerio.load(body);
            
            return this.processDeals($)
        } catch (error) {
            console.log('Could not scrape deal', error);
            return [];
        }
    }

    processDeals($) {
        const items = [];
        const config = this.config.getConfig();

        $('#is0 > .node').map((index, element) => {
            const deal = this.extractDealInfo($, element);
            if (this.isDealValid(deal, config)) {
                this.storage.addDeal(deal.postId);
                items.push(deal);
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
            timeInfo: this.extractTimeInfo($, element)
        };
    }

    isDealValid(deal, config) {
        return deal.upvotes >= config.upvoteThreshold && 
               deal.timeInfo.diffMinutes <= config.timeThreshold && 
               !this.storage.hasDeal(deal.postId);
    }
}