const request = require('request')
const prompt = require('prompt-sync')();
const fs = require('fs');

const currentDate = new Date()
const defaultYear = currentDate.getFullYear()
const defaultMonth = currentDate.getMonth() + 1

var tokens = []

try {
    const data = fs.readFileSync('./tokens.txt', 'utf8');
    tokens = data.split(",")
} catch (err) {
    console.error(err);
}

var monoToken = ""
var monoToken2 = ""

if (tokens.length == 0) {
    monoToken = prompt('Enter your monobank API token: ');
    monoToken2 = prompt('Enter your 2nd monobank API token: ');
}
else {
    monoToken = tokens[0]
    monoToken2 = tokens[1]
}

const startDate = prompt('Enter start date in MM-DD-YYYY: ', `${defaultMonth}-1-${defaultYear}`);
var fromDate = new Date(startDate);

const endDate = prompt('Enter end date in MM-DD-YYYY: ', `${defaultMonth}-${currentDate.getDate()}-${defaultYear}`);
var toDate = new Date(endDate);

const from = fromDate.getTime() / 1000
const to = toDate.getTime() / 1000


const accountInfo = 'https://api.monobank.ua/personal/client-info'


/* request({
    url: "https://api.monobank.ua/bank/currency", json: true
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {
        console.log(response.body)
    }
}) */


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
                const date = (new Date(transaction['time'] * 1000));
                const amount = transaction['amount'] / 100
                const description = transaction['description']
                const mcc = transaction['originalMcc']
                dataFromFirst.push({ date, amount, description, mcc, author: "АСЯ" })
            })


            dataFromFirst.sort((a, b) => a['date'] - b['date']);

            var csv = "";

            dataFromFirst.forEach(transaction => {
                console.log(`${transaction.date.toLocaleDateString("en-US")}, ${transaction.description}, ${transaction.amount}, ${transaction.mcc}, ${transaction.author}`);
                csv += (`${transaction.date.toLocaleDateString("en-US")}, ${transaction.description}, ${transaction.amount}, ${transaction.mcc}, ${transaction.author}` + "\r\n");
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

            const date = (new Date(transaction['time'] * 1000));
            const amount = transaction['amount'] / 100
            const description = transaction['description']
            const mcc = transaction['originalMcc']
            result.push({ date, amount, description, mcc, author: "КОЛЯ" })
        })

        secondRequest(result)
    }
})


