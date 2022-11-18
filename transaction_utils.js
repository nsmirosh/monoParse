const fs = require('fs');
const request = require('request')


const euroCurrencyCode = 978
const usdCurrencyCode = 840
const uahCurrencyCode = 980

var euroRate = 0
var usdRate = 0

let rawdata = fs.readFileSync('mcc_codes.json');

let mccCodes = JSON.parse(rawdata);

const mccCodesMap = new Map();

mccCodes.forEach((code) => {
    mccCodesMap.set(code['mcc'], code['irs_description'])
});


const groceries = "Groceries";
const restaurants = "Restaurants/Cafes"
const entertainment = "Entertainment"
const travel = "Travel"
const transportCar = "Transport/Car"
const other = "Other"
const subscriptions = "Subscriptions / Digital goods"
const healthAndPersonalCare = "Health / Personal care"
const clothes = "Clothes"
const utilitiesAndBills = "Utilities / Bills"
const education = "education"

const getMyCategory = (code, description) => {


    switch (code) {
        case 5411: //Grocery Stores/ Supermarkets
        case 5499: //Miscellaneous Food Stores - Convenience Stores and Specialty Markets
            return groceries
        case 5811: //Caterers
        case 5812: //Eating Places/ Restaurants
        case 5441: //Candy/ Nut/ and Confectionery Stores
            return restaurants
        case 3035: //Airlines
        case 4722: //Travel Agencies/ Tour Operators
        case 7011: //Hotels/ Motels/ and Resorts
            return travel
        case 5621: //Women’s Ready-To-Wear Stores
        case 5941: //Sporting Goods Stores
            return clothes
        case 7523: //Parking Lots/ Garages
        case 4121: //Taxicabs/Limousines
        case 4784: //Tolls/Bridge Fees
        case 5541: //Service Stations
            return transportCar
        case 5817: //Digital Goods: Applications (Excludes Games)
        case 5815: //"Digital Goods: Media, Books, Movies, Music"
        case 5734: //Computer Software Stores
        case 4899: //Cable/ Satellite/ and Other Pay Television and Radio
            return subscriptions
        case 7999: //Miscellaneous Recreation Services
            return entertainment
        case 4812: //Telecommunication Equipment and Telephone Sales
        case 4900: //Electric gas and water utilities
            return utilitiesAndBills
        case 5912: //Drug Stores and Pharmacies
            return healthAndPersonalCare
        case 8299: //Education services
            return education
        case 4829: //Wires/ Money Orders
            return other
        default:
            return "unknown category";
    }
}

const courseRates = request({
    url: "https://api.monobank.ua/bank/currency", json: true
}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {

        console.log(response.body)
        const result = response.body.find((currencyItem) =>
            currencyItem['currencyCodeA'] == euroCurrencyCode);

        const usdResult = response.body.find((currencyItem) =>
            currencyItem['currencyCodeA'] == usdCurrencyCode);

        euroRate = result['rateBuy']
        usdRate = usdResult['rateBuy']
        console.log(`usdRate = ${usdRate}`)
        console.log(`euroRate = ${euroRate}`)
    }
})

const parseTransactions = async (listToApendTo, transactions, author) => {

    if (euroRate == 0) {
        await courseRates();
    }

    transactions.forEach((transaction) => {

        const date = (new Date(transaction['time'] * 1000));
        var amount = transaction['operationAmount'] / 100
        const description = transaction['description'].replaceAll(',', '/')

        const mccCode = transaction['originalMcc']
        const mccCategory = mccCodesMap.get(mccCode.toString()).replaceAll(',', '/')

        if (transaction['currencyCode'] == uahCurrencyCode) {
            amount = (transaction['amount'] / euroRate) / 100
        }
        else if (transaction['currencyCode'] == usdCurrencyCode) {
            amount = ((transaction['operationAmount'] * usdRate) / euroRate) / 100
        }

        console.log(`mccCode = ${mccCode}`)
        console.log(`mccCategory = ${mccCategory}`)


        const myTransaction = { date, amount, description, mccCode, mccCategory, myCategory: getMyCategory(mccCode, description), author }

        listToApendTo.push(myTransaction);
    })

    return listToApendTo
}

module.exports = {
    parseTransactions: parseTransactions,
    mccCodesMap: mccCodesMap,
    getMyCategory: getMyCategory
}

