import * as cheerio from "cheerio";
import fetch from "node-fetch"; 


// might need to play around with these values but is essentially 20 upvotes for a post in 60 minutes is classified as trending 
const upvoteThreshold = 2
const timeThreshold = 180

const processedDeals = new Set(); // stores the ozbargain ID for deals which have already been sent on discord (to avoid duplication) 

export default async function getLatestDeals(){

    try {

        const response = await fetch('https://www.ozbargain.com.au/deals'); 
        const body = await response.text();

        const $ = cheerio.load(body); 

        const items = []; 

        

        $('#is0 > .node').map((index, element) => {

            const upvotes = $(element).find('.n-left .nvb.voteup span').text().trim();; 
            const time = $(element).find('.submitted').text().match(/(\d{2}\/\d{2}\/\d{4}) - (\d{2}:\d{2})/);
            const postTitle = $(element).find('.n-right .title a').text().trim()
            const postId = $(element).attr('id');
            const postLink = `https://www.ozbargain.com.au${$(element).find('h2.title > a').attr('href')}`;


            if (time) {
                const dayTime = `${time[1]} ${time[2]}`
                const date = `${time[1]}`
                const postTime = `${time[2]}`

                const [day, month, year] = date.split('/');
                const [hours, minutes] = postTime.split(':');
                const postDate = new Date(year, month - 1, day, hours, minutes);

                const currentTime = new Date(); 

                const diffMinutes = Math.floor((currentTime - postDate) / (1000 * 60));

                if (upvotes >= upvoteThreshold && diffMinutes <= timeThreshold && !processedDeals.has(postId)) {

                    processedDeals.add(postId);

                    items.push({
                        postId,
                        postTitle,
                        upvotes: parseInt(upvotes || '0'),
                        postLink,
                        dayTime, 
                        diffMinutes
                    });
    
                }

                
            }
            

            
            

            //console.log(items)

        }); 

        //console.log(items)

        return items; 
        
    } catch (error) {
        console.log(error); 
        return []; 
    }
} 

