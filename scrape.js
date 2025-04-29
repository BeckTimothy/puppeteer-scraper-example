const puppeteer = require("puppeteer");
const fs = require("fs");

let documentUrls = [];
let temp;

const recursivelyScrapePages = async (urlList) => {
    if(urlList.length < 1)return;
    let thisPage = "https://www.soti.net/mc/help/javascriptapi/en/" + urlList.pop();

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //headless: false
    })
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 800})
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

    let response = await page.goto(thisPage)
    if(response.status() !== 200){
        console.log(`${timeStamp}: Error HTTP Status(${response.status()}) on ${thisPage} Expected 200`);
    } else{
        console.log('page loaded')
    }
    //await page.evaluate( () => {console.log(window.open.navigator)})
    let documentJSON;
    documentJSON = await page.evaluate(() => {
        //lnb-examples
        //lnb-api
        let title = document.getElementsByTagName("h2")[0].innerText

        return {"title":title}
    });
    console.log(documentJSON)

    await browser.close();



    console.log(thisPage)
    return recursivelyScrapePages(urlList)
}
const getPages = async (url) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //headless: false
    })
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 800})
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

    let response = await page.goto(url)
    if(response.status() !== 200){
        console.log(`${timeStamp}: Error HTTP Status(${response.status()}) on ${url} Expected 200`);
    } else{
        console.log('page loaded')
    }
    //await page.evaluate( () => {console.log(window.open.navigator)})

    documentUrls = await page.evaluate(() => {

        //lnb-examples
        //lnb-api
        let tutorials = Array.from(Array.from(document.getElementsByClassName('lnb-examples'))[0].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        temp = tutorials
        let apis = Array.from(Array.from(document.getElementsByClassName('lnb-api'))[0].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        let apis2 = Array.from(Array.from(document.getElementsByClassName('lnb-api'))[1].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        let apis3 = Array.from(Array.from(document.getElementsByClassName('lnb-api'))[2].children[1].children).map((x)=>{return x.innerHTML.substring(x.innerHTML.indexOf("=\"")+2, x.innerHTML.indexOf("\">"))});
        //console.log(apis)
        return tutorials.concat(apis, apis2, apis3)
    });
    //console.log(documentUrls)

    await browser.close();
}


const pageScrapeHelper = async (url) => {
    new Promise(async (resolve) => {

        await getPages(url);
        //console.log(temp);
        resolve(true);
    })
        .finally(async () => {
            if(documentUrls.length > 0){
                await recursivelyScrapePages(documentUrls);
            } else {
                console.log("something went wrong, see if website exists");
            }
        })
}
async function scrapeForum(url) {
    await pageScrapeHelper(url);
}

scrapeForum("https://www.soti.net/mc/help/javascriptapi/en/mobicontrol.html");