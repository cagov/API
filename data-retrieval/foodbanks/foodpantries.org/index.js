const puppeteer = require("puppeteer");
const chalk = require("chalk");
var fs = require("fs");

// MY OCD of colorful console.logs for debugging... IT HELPS
const error = chalk.bold.red;
const success = chalk.keyword("green");

(async () => {
  try {
    // open the headless browser
    var browser = await puppeteer.launch({ headless: true });
    // open a new page
    var page = await browser.newPage();
    // enter url in page
    await page.goto(`https://www.foodpantries.org/ci/ca-san_francisco`);
    // await page.waitForSelector("a.storylink");

    var links = await page.evaluate(() => {
      var titleNodeList = document.querySelectorAll(`.blog-list h2 a`);
      var titleLinkArray = [];
      for (var i = 0; i < titleNodeList.length; i++) {
        titleLinkArray[i] = {
          title: titleNodeList[i].innerText.trim(),
          link: titleNodeList[i].getAttribute("href")
        };
      }
      return titleLinkArray;
    });
    fs.writeFileSync('./allSF.json',JSON.stringify(links),'utf8')

    console.log(links)
    let detailsAll = [];
    for(let i = 0;i<links.length;i++) {
      await page.goto(links[i].link);
  
      var details = await page.evaluate(() => {
        return document.querySelectorAll('script[type="application/ld+json"]')[2].text.trim().replace(/(\r\n|\n|\r)/gm,"");
      });
      console.log(details);
      fs.writeFileSync('./banks/'+i+'.json',details,'utf8')       
    }

    await browser.close();
    // Writing the news inside a json file
    console.log(success("Browser Closed"));
  } catch (err) {
    // Catch and display errors
    console.log(error(err));
    await browser.close();
    console.log(error("Browser Closed"));
  }
})();