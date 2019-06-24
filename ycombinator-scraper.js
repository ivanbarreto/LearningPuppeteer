const puppeteer = require('puppeteer');
function run (pagesToScrape) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto("https://news.ycombinator.com/");
            let currentPage = 1;
            let urls = [];
            //runs until the last page is scrapped
            while (currentPage <= pagesToScrape) {
                //gets results for each individual page
                let newUrls = await page.evaluate(() => {
                    let results = [];
                    let items = document.querySelectorAll('a.storylink');
                    items.forEach((item) => {
                        results.push({
                            url:  item.getAttribute('href'),
                            text: item.innerText,
                        });
                    });
                    return results;
                });
                //joins the urls
                urls = urls.concat(newUrls);
                //after processing and joining the URLs, if we are not on the last page, clicks to access the next page
                if (currentPage < pagesToScrape) {
                    await Promise.all([
                        await page.click('a.morelink'),
                        await page.waitForSelector('a.storylink')
                    ])
                }
                currentPage++;
            }
            browser.close();
            return resolve(urls);
        } catch (e) {
            return reject(e);
        }
    })
}
//runs the script on 5 pages
run(5).then(console.log).catch(console.error);