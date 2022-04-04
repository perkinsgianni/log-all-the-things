const express = require('express');
const fs = require('fs'); // fs module enables interaction with file system
const app = express();
// const csv = require('csv-parser');

// create log headers
let log = ["Agent","Time","Method","Resource","Version","Status"];

// create file called log.csv and write headers to file
fs.writeFile("logs/log.csv", log + "\n", err => {
    if (err) {
        console.log(err);
    }
});

// logging middleware
app.use((req, res, next) => {
    // write your logging code here
    let agent = req.get('User-Agent').replace(',', '') ;
    let time = new Date().toISOString();
    let method = req.method;
    let resource = req.url;
    let version = "HTTP/" + req.httpVersion;
    let status = res.statusCode;

    // format log line
    let logText = `${agent},${time},${method},${resource},${version},${status}`;
    console.log(logText);

    // save log in csv file
    fs.appendFile('logs/log.csv', logText + "\n", err => {
        if (err) {
            console.log(err);
        }
    });

    // open csv file as readable stream
    // fs.createReadStream('logs/log.csv')
    //     .pipe(csv())
    //     .on('data', (row) => {
    //         console.log(row);
    //     })
    //     .on('end', () => {
    //         console.log('CSV file successfully processed');
    //     });

    next();
});

// routes
app.get('/', (req, res) => {
    // write your code to respond "ok" here
    res.sendStatus(200)
});

app.get('/logs', (req, res) => {
    // write your code to return a json object containing the log data here
    fs.readFile('logs/log.csv', (err, data) => {
        // create new arr
        let jsonArr = [];
        // convert data object to str, split at each new line, return array of str
        let logStrings = data.toString().split("\n");
        // split first str at each comma, return arr
        let logHeaders = logStrings[0].split(",");

        // iterate through arr after headers
        for ( let i = 1; i < logStrings.length - 1; i++ ) {
            // create new obj
            let jsonObj = {};
            // iterate through headers, invoke prop (element) and its index
            logHeaders.map((prop, index) => {
                // split and index str at each comma, assign as obj prop
                jsonObj[prop] = logStrings[i].split(",")[index];
            });
            // push obj into arr
            jsonArr.push(jsonObj);
        }
        // send arr as respone to /logs req
        res.send(jsonArr);
    });
});

module.exports = app;