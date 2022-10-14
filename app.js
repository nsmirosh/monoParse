const request = require('request')
const prompt = require('prompt-sync')();


const currentDate = new Date()
const defaultYear = currentDate.getFullYear()
const defaultMonth = currentDate.getMonth() + 1

const monoToken = prompt('Enter your monobank API token: ');

const startDate = prompt('Enter start date in MM-DD-YYYY: ', `${defaultMonth}-1-${defaultYear}`);
var fromDate = new Date(startDate);

const endDate = prompt('Enter end date in MM-DD-YYYY: ', `${defaultMonth}-${currentDate.getDate()}-${defaultYear}`);
var toDate = new Date(endDate);

const from  = fromDate.getTime() / 1000
const to = toDate.getTime() / 1000 

const url = 'https://api.monobank.ua/personal/statement/0/' + from + '/' + to

request({url: url, json: true, headers: {
    'X-Token': monoToken
  }}, (error, response) => {
    if (error) {
        console.log('Unable to connect to location service!')
    }
    else {

        // console.log(response.body)
        response.body.forEach(transaction => { 
                const date  = (new Date(transaction['time'] * 1000).toLocaleDateString("en-US"));
                const amount = transaction['amount']
                const description = transaction['description']
                console.log(`${date} ${description} ${amount}`); 
        })

    }
}) 



/*
v1. 
[x] - scan input via terminal
[x] receive info from mono
[x] make the default start date the start of the current month
[x] make the default end date the end of the current month
[x] get - description, amount and date
[ ] add the project to git with proper .gitignore
print that info into csv file 

print the total sum at the end

manually import that file into the google sheets

*/



/*

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
