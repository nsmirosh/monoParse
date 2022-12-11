const request = require('request')
const prompt = require('prompt-sync')();
const transactionUtils = require('./transaction_utils')
const fs = require('fs');


const mccCodesMap = transactionUtils.mccCodesMap
const currentDate = new Date()
const defaultYear = currentDate.getFullYear()
const defaultMonth = currentDate.getMonth() + 1
const defaultStartTime = "00:00:01"

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

const startDate = prompt('Enter start date in MM-DD-YYYY HH:MM:SS: ', `${defaultMonth}-1-${defaultYear} ${defaultStartTime}`);
var fromDate = new Date(startDate);

const endDate = prompt('Enter end date in MM-DD-YYYY HH:MM:SS: ', `${defaultMonth}-${currentDate.getDate() + 1}-${defaultYear}`);
var toDate = new Date(endDate);

const from = fromDate.getTime() / 1000
const to = toDate.getTime() / 1000

const asiaAccount = 'https://api.monobank.ua/personal/statement/0/' + from + '/' + to

const myAccount = 'https://api.monobank.ua/personal/statement/0/' + from + '/' + to

const myEuroAccount = 'https://api.monobank.ua/personal/statement/CNgV5hCPO4uYoSgg6KUGEw/' + from + '/' + to



const getDateTime = (currentdate) => {
    return currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
}


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

                const mccCode = transaction['originalMcc']
                const mccCategory = mccCodesMap.get(mccCode.toString()).replaceAll(',', '/')
                dataFromSecond.push({ date, amount, description, mccCode, mccCategory, myCategory: transactionUtils.getMyCategory(mccCode), author: "КОЛЯ" })
            })

            dataFromSecond.sort((a, b) => a['date'] - b['date']);

            var csv = "";

            dataFromSecond.forEach(transaction => {
                console.log(`${transaction.date.toLocaleDateString("en-US")}, ${transaction.description}, ${transaction.amount}, ${transaction.mccCode}, ${transaction.mccCategory}, ${transaction.myCategory}, ${transaction.author}`);
                csv += (`${transaction.date.toLocaleDateString("en-US")}, ${transaction.description}, ${transaction.amount}, ${transaction.mccCode}, ${transaction.mccCategory}, ${transaction.myCategory}, ${transaction.author}` + "\r\n");
            })


            csv += "\n"

            csv += (`category, sum ` + "\r\n")


            const splitArrays = {};

            dataFromSecond.forEach(v => {
                if (splitArrays[v.myCategory]) {
                    splitArrays[v.myCategory].push(v);
                } else {
                    splitArrays[v.myCategory] = [v];
                }
            })

            for (const [key, value] of Object.entries(splitArrays)) {

                const sum = value.reduce((n, { amount }) => n + amount, 0)

                console.log(`category ${key} with sum = ${sum}`);

                csv += (`${key}, ${sum}`  + "\r\n")
            }
            
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
            const parsedTransactions = transactionUtils.parseTransactions(dataFromFirst, response.body, "АСЯ")

            parsedTransactions.then((value) => {
                thirdRequest(value)
            }
            ).catch((error) => {
                console.log(`error = ${error}`);
            })
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
        const parsedTransactions = transactionUtils.parseTransactions([], response.body, "КОЛЯ")

        parsedTransactions.then((value) => {
            secondRequest(value)
        }
        ).catch((error) => {
            console.log(`error = ${error}`);
        })
    }
})


