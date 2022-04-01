const express = require('express');
const fs = require('fs'); // fs module enables interaction with file system
const app = express();
const morgan = require('morgan');
const csv = require('csv-parser');

// logging middleware
app.use((req, res, next) => {
    // write your logging code here
    let nativeAgent = req.get('User-Agent');
    let agent = nativeAgent.replace(',', '') ;
    let nativeTime = new Date();
    let time = nativeTime.toISOString();
    let method = req.method;
    let resource = req.url;
    let version = "HTTP/" + req.httpVersion;
    let status = res.statusCode;

    // format log line
    let logText = `${agent},${time},${method},${resource},${version},${status}`;

    // save log in csv file
    fs.appendFile('log.csv', logText + "\n", err => {
        if (err) {
            console.log(err);
        }
    });

    // open csv file as readable stream
    // fs.createReadStream('log.csv')
    //     .pipe(csv())
    //     .on('data', (row) => {
    //         console.log(row);
    //     })
    //     .on('end', () => {
    //         console.log('CSV file successfully processed');
    //     });

    next();
});

// morgan dev middleware
app.use(morgan('dev'));

// routes
app.get('/', (req, res) => {
    // write your code to respond "ok" here
    res.sendStatus(200).send(console.log())
});

app.get('/logs', (req, res) => {
    // write your code to return a json object containing the log data here
    fs.readFile('./log.csv', (err, data) => {
        // create new arr
        let jsonArr = [];
        // convert data object to str, split at each new line, return array of str
        let logStrings = data.toString().split("\n");
        // split first str at each comma, return arr
        let logHeaders = logStrings[0].split(",");

        // iterate through arr after headers
        for ( let i = 1; i < logStrings.length; i++ ) {
            // create new obj
            let jsonObj = {};
            // for each header, invoke prop and index
            logHeaders.forEach((prop, index) => {
                // split and index str at each comma, assign as obj prop
                jsonObj[prop] = logStrings[i].split(",")[index];
            });
            // push obj into arr
            jsonArr.push(jsonObj)
        }
        // send arr as respone to /logs req
        res.send(jsonArr);
    });
});

module.exports = app;
