const fs = require('fs');
const request = require('request')


const euroCurrencyCode = 978
const usdCurrencyCode = 840
const uahCurrencyCode = 980

var euroRate = 0
var usdRate = 0

let rawdata = fs.readFileSync('mcc_codes.json');

let mccCodes = JSON.parse(rawdata);

const mccCodesMap = new Map()

mccCodes.forEach((code) => {
    mccCodesMap.set(code['mcc'], code['irs_description'])
})

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
})

const parseTransactions = (listToApendTo, transactions, author) => {

    transactions.forEach((transaction) => {

        const date = (new Date(transaction['time'] * 1000));
        var amount = transaction['operationAmount'] / 100
        const description = transaction['description'].replaceAll(',', '/')
        const mcc = mccCodesMap.get(transaction['originalMcc'].toString()).replaceAll(',', '/')

        if (transaction['currencyCode'] == uahCurrencyCode) {
            amount = (transaction['amount'] / euroRate) / 100
        }
        else if (transaction['currencyCode'] == usdCurrencyCode) {
            amount = ((transaction['operationAmount'] * usdRate) / euroRate) / 100
        }
        listToApendTo.push({ date, amount, description, mcc, author })
    })

    return listToApendTo
}

module.exports =   {
    parseTransactions: parseTransactions,
    mccCodesMap: mccCodesMap
}

