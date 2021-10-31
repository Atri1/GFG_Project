// npm init -y
// npm install minimist
// npm install fs
// npm install jsdom
// npm install excel4node
// npm install pdf-lib
// npm install path
// npm install puppeteer
// node gfg_questions.js --source="https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=0&difficulty%5B%5D=1&difficulty%5B%5D=2&page=1&sortBy=submissions"
let minimist=require('minimist');
let axios=require('axios');
let jsdom=require('jsdom');
let excel=require('excel4node');
let puppeteer=require('puppeteer');
run();
 async function run() {

    let args=minimist(process.argv);
    let url=args.source;
    let response=await axios.get(url);
    let html=response.data;
    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;
    let idSelector = document.getElementById('accordion');
    let company = idSelector.querySelectorAll("div.checkbox");
    let companies = [];
    for(let i=0;i<company.length;i++) {
        let nameOfCompany = company[i].querySelector("input[type='checkbox']");
        let ans=nameOfCompany.getAttribute("value");
        companies.push(
            {
                name: ans
            }
            );
        }
    let browser=await puppeteer.launch({headless: false, args : ['--start-maximized'], defaultViewport: null});
     let pages = await browser.pages();
    let page = pages[0];
    await page.goto(url);
    for(let i=0;i<companies.length;i++)
    { 
        console.log(companies[i].name)
        let npage=await browser.newPage();
       //Hard Questions
        await npage.goto("https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=2&page=1&sortBy=submissions&company%5B%5D=" + companies[i].name);// for hard questions along with company name
        await npage.waitFor(1000);
        await npage.waitForSelector("div.panel-body > span");
        let hardQuestions = await npage.$$eval("div.panel-body > span",function(ques){ // getting all questions by name
                let questions = [];
                for(let i=0;i < ques.length;i++)
                {
                let question = ques[i].textContent;
                questions.push(question);
                
                }
                return questions;
        });
    
        await npage.waitFor(1000);
        await npage.waitForSelector("div.panel.problem-block > a");
        let urlHard = await npage.$$eval("div.panel.problem-block > a",function(atags){ //Having the urls of all the hard questions
                let urls = [];
                for(let i=0;i < atags.length;i++)
                {
                let url = atags[i].getAttribute("href");
                urls.push(url);
                }
                return urls;
        });
    
        //Medium questions
        await npage.goto("https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=1&page=1&sortBy=submissions&company%5B%5D=" + companies[i].name);// for medium questions along with company name
        await npage.waitFor(1000);
        await npage.waitForSelector("div.panel-body > span");
        let mediumQuestions = await npage.$$eval("div.panel-body > span",function(ques){ // getting all questions by name
                let questions = [];
                for(let i=0;i < ques.length;i++)
                {
                let question = ques[i].textContent;
                questions.push(question);
                
                }
                return questions;
        });
    
        await npage.waitFor(1000);
        await npage.waitForSelector("div.panel.problem-block > a");
        let urlMedium = await npage.$$eval("div.panel.problem-block > a",function(atags){ //Having the urls of all the medium questions
                let urls = [];
                for(let i=0;i < atags.length;i++)
                {
                let url = atags[i].getAttribute("href");
                urls.push(url);
                }
                return urls;
        });
        //Easy Questions
        await npage.goto("https://practice.geeksforgeeks.org/explore/?problemType=functional&difficulty%5B%5D=0&page=1&sortBy=submissions&company%5B%5D=" + companies[i].name);
        await npage.waitFor(1000);
        await npage.waitForSelector("div.panel-body > span");
        let easyQuestions = await npage.$$eval("div.panel-body > span",function(ques){ // getting all questions by name
                let questions = [];
                for(let i=0;i < ques.length;i++)
                {
                let question = ques[i].textContent;
                questions.push(question);
                
                }
                return questions;
        });
    
        await npage.waitFor(1000);
        await npage.waitForSelector("div.panel.problem-block > a");
        let urlEasy = await npage.$$eval("div.panel.problem-block > a",function(atags){ //Having the urls of all the easy questions
                let urls = [];
                for(let i=0;i < atags.length;i++)
                {
                let url = atags[i].getAttribute("href");
                urls.push(url);
                }
                return urls;
        });

        await putinexcelsheet(hardQuestions,urlHard,mediumQuestions,urlMedium,easyQuestions,urlEasy,companies[i].name);
        await npage.waitFor(1000);
        await npage.close();
        await page.waitFor(1000);
        
    }
}

async function  putinexcelsheet(hardQuestions,urlHard,mediumQuestions,urlMedium,easyQuestions,urlEasy,nameOfCompany) {
    let wb = new excel.Workbook();
    let level = ["Easy","Medium","Hard"];
    for(let j=0;j<level.length;j++)
    {
        let sheet = wb.addWorksheet(level[j]);
        if(j==0)
        {
        for (let i = 0; i < easyQuestions.length; i++) { // Traversing through the easy questions by name
            sheet.cell(1 + i, 1).string(easyQuestions[i]);
            sheet.cell(1 + i, 6).link(urlEasy[i]);
        }
        }
        else if(j==1)
        {
            for (let i = 0; i < mediumQuestions.length; i++) { // Traversing through the medium questions by name
                sheet.cell(1 + i, 1).string(mediumQuestions[i]);
                sheet.cell(1 + i, 6).link(urlMedium[i]);
            } 
        }
        else
        {
            for (let i = 0; i < hardQuestions.length; i++) { // Traversing through the hard questions by name
                sheet.cell(1 + i, 1).string(hardQuestions[i]);
                sheet.cell(1 + i, 6).link(urlHard[i]);
            }  
        }
    }
    wb.write(nameOfCompany+".csv");
}


