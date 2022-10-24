const request = require('request')
const prompt = require('prompt-sync')();
const transactionUtils = require('./transaction_utils')
const fs = require('fs');

const mccCodesMap = transactionUtils.mccCodesMap
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

const endDate = prompt('Enter end date in MM-DD-YYYY: ', `${defaultMonth}-${currentDate.getDate() + 1}-${defaultYear}`);
var toDate = new Date(endDate);

const from = fromDate.getTime() / 1000
const to = toDate.getTime() / 1000


const accountInfo = 'https://api.monobank.ua/personal/client-info'

/* const euroCurrencyCode = 978
const usdCurrencyCode = 840
const uahCurrencyCode = 980

var euroRate = 0
var usdRate = 0

request({
    url: "https://api.monobank.ua/bank/currency", json: true
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {

        const result = response.body.find((currencyItem) =>
            currencyItem['currencyCodeA'] == euroCurrencyCode)

        const usdResult = response.body.find((currencyItem) =>
            currencyItem['currencyCodeA'] == usdCurrencyCode)

        euroRate = result['rateBuy']
        console.log(usdResult)
        usdRate = usdResult['rateBuy']
        console.log(euroRate)
    }
}) */

const asiaAccount = 'https://api.monobank.ua/personal/statement/0/' + from + '/' + to

const myAccount = 'https://api.monobank.ua/personal/statement/0/' + from + '/' + to

const myEuroAccount = 'https://api.monobank.ua/personal/statement/CNgV5hCPO4uYoSgg6KUGEw/' + from + '/' + to


const thirdRequest = (dataFromSecond) => {
    request({
        url: myEuroAccount, json: true, headers: {
            'X-Token': monoToken
        }
    }, (error, response) => {
        if (error) {
            console.log('Unable to connect to location service!')
        }
        else {
            response.body.forEach(transaction => {
                const date = (new Date(transaction['time'] * 1000));
                const amount = transaction['amount'] / 100
                const description = transaction['description'].replaceAll(',', '/')
                const mcc = mccCodesMap.get(transaction['originalMcc'].toString()).replaceAll(',', '/')
                dataFromSecond.push({ date, amount, description, mcc, author: "КОЛЯ" })
            })

            dataFromSecond.sort((a, b) => a['date'] - b['date']);

            var csv = "";

            dataFromSecond.forEach(transaction => {
                console.log(`${transaction.date.toLocaleDateString("en-US")}, ${transaction.description}, ${transaction.amount}, ${transaction.mcc}, ${transaction.author}`);
                csv += (`${transaction.date.toLocaleDateString("en-US")}, ${transaction.description}, ${transaction.amount}, ${transaction.mcc}, ${transaction.author}` + "\r\n");
            })

            fs.writeFileSync("transactions.csv", csv);
            console.log("Done!");
        }
    })
}


const secondRequest = (dataFromFirst) => {
    request({
        url: asiaAccount, json: true, headers: {
            'X-Token': monoToken2
        }
    }, (error, response) => {
        if (error) {
            console.log('Unable to connect to location service!')
        }
        else {

            /* console.log(response.body)

            response.body.forEach(transaction => {
                const date = (new Date(transaction['time'] * 1000));
                var amount =  transaction['operationAmount'] / 100 
                const description = transaction['description'].replaceAll(',', '/')
                const mcc = mccCodesMap.get(transaction['originalMcc'].toString()).replaceAll(',', '/')

                if(transaction['currencyCode'] == uahCurrencyCode) {
                    amount = (transaction['amount'] / euroRate) / 100
                }
                else if (transaction['currencyCode'] == usdCurrencyCode) {
                    amount = ((transaction['operationAmount'] * usdRate) / euroRate) / 100
                }
                dataFromFirst.push({ date, amount, description, mcc, author: "АСЯ" })
            }) */


            const parsedTransactions = transactionUtils.parseTransactions(dataFromFirst, response.body, "АСЯ")

            thirdRequest(parsedTransactions)
        }
    })
}

request({
    url: myAccount, json: true, headers: {
        'X-Token': monoToken
    }
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {

        /* const result = []

        response.body.forEach(transaction => {

            const date = (new Date(transaction['time'] * 1000));
            var amount =  transaction['operationAmount'] / 100 
            const description = transaction['description'].replaceAll(',', '/')
            const mcc = mccCodesMap.get(transaction['originalMcc'].toString()).replaceAll(',', '/')

            if(transaction['currencyCode'] == uahCurrencyCode) {
                amount = (transaction['amount'] / euroRate) / 100
            }
            else if (transaction['currencyCode'] == usdCurrencyCode) {
                amount = ((transaction['operationAmount'] * usdRate) / euroRate) / 100
            }
            result.push({ date, amount, description, mcc, author: "КОЛЯ" })
        }) */

        const parsedTransactions = transactionUtils.parseTransactions([], response.body, "КОЛЯ")

        secondRequest(parsedTransactions)
    }
})


