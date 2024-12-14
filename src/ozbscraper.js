import * as cheerio from "cheerio";
import fetch from "node-fetch"; 

async function getLatestDeals(){

    try {

        const response = await fetch('https://www.ozbargain.com.au/deals'); 
        const body = await response.text();

        const $ = cheerio.load(body); 

        const items = []; 

        $('.infscroll > .node').map((index, element) => {

            const upvotes = $(element).find('.n-left .nvb.voteup span').text().trim();; 
            const time = $(element).find('.submitted').text().match(/\d{2}:\d{2}/)?.[0];
            const post_title = $(element).find('.n-right .title a').text().trim()
            const post_id = $(element).attr('id');
            const post_link = `https://www.ozbargain.com.au${$(element).find('h2.title > a').attr('href')}`;

            items.push({
                post_id,
                post_title,
                upvotes: parseInt(upvotes || '0'),
                post_link,
                time
            });

            console.log(items)

        }); 

        console.log(items)
        
    } catch (error) {
        console.log(error); 
    }
} 

getLatestDeals(); 