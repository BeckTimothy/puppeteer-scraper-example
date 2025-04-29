const puppeteer = require("puppeteer");
const fs = require("fs");

let documentUrls = [];
let JSONArray = [];
const recursivelyScrapePages = async (urlList) => {
    if(urlList.length < 1)return;
    let thisPage = "https://www.soti.net/mc/help/javascriptapi/en/" + urlList.pop();
    //launch chromium instance
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //headless: false
    })
    //open page and set viewport
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 800})

    //set custom user agent
    const customUA = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/126.0.0.0 Safari/537.36';
    await page.evaluateOnNewDocument( customUA => {
        let open = window.open
        window.open = (...args) => {
            let newpage = open(...args)
            Object.defineProperty(newpage.navigator, 'userAgent', { get: () => customUA })
            return newpage
        }
        window.open.toString = () => 'function open() { [native code] }'
    }, customUA)
    await page.setUserAgent(customUA);

    //Load page
    let response = await page.goto(thisPage)
    if(response.status() !== 200){
        console.log(`Error HTTP Status(${response.status()}) on ${thisPage} Expected 200`);
    } else{
        console.log('page '+ thisPage + ' loaded')
    }

    let documentJSON;
    documentJSON = await page.evaluate(() => {
        //build page data
        let pageData = {};
        pageData["title"] = document.getElementsByTagName("h2")[0].innerText;

        //find and add other elements you want to train on here:
        //----------------------------------




        //----------------------------------
        //return pageData to documentJSON
        return pageData;
    });
    console.log(documentJSON);
    //Push page data to JSON Array
    JSONArray.push(documentJSON);

    await browser.close();
    return recursivelyScrapePages(urlList)
}
const getPages = async (url) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //headless: false
    })

    //Load new page
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 800})

    //set custom User Agent
    const customUA = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/126.0.0.0 Safari/537.36';
    await page.evaluateOnNewDocument( customUA => {
        let open = window.open
        window.open = (...args) => {
            let newpage = open(...args)
            Object.defineProperty(newpage.navigator, 'userAgent', { get: () => customUA })
            return newpage
        }
        window.open.toString = () => 'function open() { [native code] }'
    }, customUA)
    await page.setUserAgent(customUA);

    //navigate to url
    let response = await page.goto(url)
    if(response.status() !== 200){
        console.log(`Error HTTP Status(${response.status()}) on ${url} Expected 200`);
    } else{
        console.log('page loaded')
    }

    documentUrls = await page.evaluate(() => {
        //build list of pages to scrape from documentation sidebar
        let tutorials = Array.from(Array.from(document.getElementsByClassName('lnb-examples'))[0].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        let apis = Array.from(Array.from(document.getElementsByClassName('lnb-api'))[0].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        let apis2 = Array.from(Array.from(document.getElementsByClassName('lnb-api'))[1].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        let apis3 = Array.from(Array.from(document.getElementsByClassName('lnb-api'))[2].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        //return list
        return tutorials.concat(apis, apis2, apis3)
    });

    await browser.close();
}


const pageScrapeHelper = async (url) => {
    new Promise(async (resolve) => {
        //build list of pages to scrape
        await getPages(url);
        resolve(true);
    })
        .finally(async () => {
            //scrape pages from documentUrls
            if(documentUrls.length > 0){
                await recursivelyScrapePages(documentUrls);
                //Use fs library to write JSONArray to file here:
                //----------------------------------



                //----------------------------------
            } else {
                console.log("something went wrong, see if website exists");
            }
        })
}
async function scrapeForum(url) {
    await pageScrapeHelper(url);
}

scrapeForum("https://www.soti.net/mc/help/javascriptapi/en/mobicontrol.html");