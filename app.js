const request = require('request')
const prompt = require('prompt-sync')();
const fs = require('fs');

const currentDate = new Date()
const defaultYear = currentDate.getFullYear()
const defaultMonth = currentDate.getMonth() + 1

try {
  const data = fs.readFileSync('./tokens.txt', 'utf8');
  const array = data.split(",")
  console.log(array[1]);
} catch (err) {
  console.error(err);
}


const monoToken = prompt('Enter your monobank API token: ');

const monoToken2 = prompt('Enter your 2nd monobank API token: ');

const startDate = prompt('Enter start date in MM-DD-YYYY: ', `${defaultMonth}-1-${defaultYear}`);
var fromDate = new Date(startDate);

const endDate = prompt('Enter end date in MM-DD-YYYY: ', `${defaultMonth}-${currentDate.getDate()}-${defaultYear}`);
var toDate = new Date(endDate);

const from = fromDate.getTime() / 1000
const to = toDate.getTime() / 1000


const accountInfo = 'https://api.monobank.ua/personal/client-info'

/* request({
    url: accountInfo, json: true, headers: {
        'X-Token': monoToken
    }
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {
        console.log(response.body)
    }
}) */



request({
    url: "https://api.monobank.ua/bank/currency", json: true
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {
        console.log(response.body)
    }
})


const url = 'https://api.monobank.ua/personal/statement/0/' + from + '/' + to

const urlEuro = 'https://api.monobank.ua/personal/statement/CNgV5hCPO4uYoSgg6KUGEw/' + from + '/' + to


const secondRequest = (dataFromFirst) => {
    request({
        url: url, json: true, headers: {
            'X-Token': monoToken2
        }
    }, (error, response) => {
        if (error) {
            console.log('Unable to connect to location service!')
        }
        else {

            // console.log(response.body)
            response.body.forEach(transaction => {
                const date = (new Date(transaction['time'] * 1000).toLocaleDateString("en-US"));
                const amount = transaction['amount'] / 100
                const description = transaction['description']
                dataFromFirst.push({ date, amount, description, author: "АСЯ" })
            })

            var csv = "";

            dataFromFirst.forEach(transaction => {
                console.log(`${transaction.date}, ${transaction.description}, ${transaction.amount}, ${transaction.author}`);
                csv += (`${transaction.date}, ${transaction.description}, ${transaction.amount}, ${transaction.author}` + "\r\n");
            })

            const fs = require("fs");
            fs.writeFileSync("demoB.csv", csv);
            console.log("Done!");
        }
    })
}

request({
    url: urlEuro, json: true, headers: {
        'X-Token': monoToken
    }
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {

        const result = []

         console.log(response.body)
        response.body.forEach(transaction => {
            const date = (new Date(transaction['time'] * 1000).toLocaleDateString("en-US"));
            const amount = transaction['amount'] / 100
            const description = transaction['description']
            // console.log(`${date} ${description} ${amount}`); 
            result.push({ date, amount, description, author: "КОЛЯ" })
        })

        secondRequest(result)
    }
})


/*
v1. 
[x] - scan input via terminal
[x] receive info from mono
[x] make the default start date the start of the current month
[x] make the default end date the end of the current month
[x] get - description, amount and date
[x] add the project to git with proper .gitignore
[x] do a second transaction for Asya's account and 
[ ] read tokens from a file in case they're not provided via the prompt
[ ] print that info into csv file 
[ ] print info regarding euro account as well
*/

/*

[ ] print the total sum at the end

[ ] merge the two lists together based on date and label each transaction from where it comes (i.e. which acccount)
[ ] remove all commas from a descripton of the transaction
v1a
receive input from ZenMoney as well

*/


/*
v2. 
deploy the app to server
get the input via an html page

*/

/*

everything as in v2 but either - forward the output directly to google sheets
or implement the table myself 
*/
