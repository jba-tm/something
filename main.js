// // This is the main Node.js source code file of your actor.
// // It is referenced from the "scripts" section of the package.json file,
// // so that it can be started by running "npm start".
//
// // Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require('apify');
var fs = require('fs');


Apify.main(async () => {
    // Get input of the actor (here only for demonstration purposes).
    // If you'd like to have your input checked and have Apify display
    // a user interface for it, add INPUT_SCHEMA.json file to your actor.
    // For more information, see https://docs.apify.com/actors/development/input-schema
    const input = await Apify.getInput();
    console.log('Input:');
    console.dir(input);

    if (!input || !input.url) throw new Error('Input must be a JSON object with the "url" field!');

    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();

    console.log(`Opening page ${input.url}...`);
    const page = await browser.newPage();
    // await page.goto(input.url, {waitUntil: 'networkidle0'});
    await page.goto(input.url);
    await page.waitForTimeout(60000)
    const title = await page.title();
    console.log(`Title of the page "${input.url}" is "${title}".`);

    console.log('Saving output...');
    await Apify.setValue('OUTPUT', {
        title,
    });

    const parse_url = 'https://www.etoro.com/sapi/trade-data-real/live/public/portfolios?cid=3378352&format=json';
    const page2 = await browser.newPage();

    for (let i=0;i<500;i++) {
        console.log('go to with 20 times')
        console.log(`${i} time out 2 sec`)
        await page2.goto(parse_url, {waitUntil: 'networkidle0'})

        // await page.waitForTimeout(2000)
        console.log(`write ${i}.html`)
        fs.writeFile(`result/pages/${i}.html`, await page2.content(), err => {
            if (err) {
                console.log(err)
                return null
            }
        });

        // console.log(`screenshot ${i}.png`)
        // await page.screenshot({path: `result/screenshots/${i}.png`});
    }


        console.log('Closing Puppeteer...');
    await browser.close();

    console.log('Done.');
});
//
// const Apify = require('apify');
//
// Apify.main(async () => {
//     // Apify.openRequestQueue() creates a preconfigured RequestQueue instance.
//     // We add our first request to it - the initial page the crawler will visit.
//     const requestQueue = await Apify.openRequestQueue();
//     await requestQueue.addRequest({ url: 'https://www.etoro.com/' });
//
//     // Create an instance of the PuppeteerCrawler class - a crawler
//     // that automatically loads the URLs in headless Chrome / Puppeteer.
//     const crawler = new Apify.PuppeteerCrawler({
//         requestQueue,
//
//         // Here you can set options that are passed to the Apify.launchPuppeteer() function.
//         launchContext: {
//             launchOptions: {
//                 headless: true,
//                 // Other Puppeteer options
//             },
//         },
//
//         // Stop crawling after several pages
//         maxRequestsPerCrawl: 50,
//
//         // This function will be called for each URL to crawl.
//         // Here you can write the Puppeteer scripts you are familiar with,
//         // with the exception that browsers and pages are automatically managed by the Apify SDK.
//         // The function accepts a single parameter, which is an object with the following fields:
//         // - request: an instance of the Request class with information such as URL and HTTP method
//         // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
//         handlePageFunction: async ({ request, page }) => {
//             console.log(`Processing ${request.url}...`);
//
//             // A function to be evaluated by Puppeteer within the browser context.
//             const data = await page.$$eval('.athing', $posts => {
//                 const scrapedData = [];
//
//                 // We're getting the title, rank and URL of each post on Hacker News.
//                 $posts.forEach($post => {
//                     scrapedData.push({
//                         title: $post.querySelector('.title a').innerText,
//                         rank: $post.querySelector('.rank').innerText,
//                         href: $post.querySelector('.title a').href,
//                     });
//                 });
//
//                 return scrapedData;
//             });
//
//             // Store the results to the default dataset.
//             await Apify.pushData(data);
//
//             // Find a link to the next page and enqueue it if it exists.
//             const infos = await Apify.utils.enqueueLinks({
//                 page,
//                 requestQueue,
//                 selector: '.morelink',
//             });
//
//             if (infos.length === 0) console.log(`${request.url} is the last page!`);
//         },
//
//         // This function is called if the page processing failed more than maxRequestRetries+1 times.
//         handleFailedRequestFunction: async ({ request }) => {
//             console.log(`Request ${request.url} failed too many times.`);
//         },
//     });
//
//     // Run the crawler and wait for it to finish.
//     await crawler.run();
//
//     console.log('Crawler finished.');
// });