const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const fs = require('fs');

var cnt = 0;
var path = __dirname + '/dataFromSerial.json';

if (!fs.existsSync(path)) {

    console.log("file does not exist. creating now...");
    // create base obj 
    var obj = {
        table: []
    };
    // create json string to write to file
    var json = JSON.stringify(obj);
    // create file
    fs.writeFile(path, json, 'utf8', (err) => {
        if (err) throw err;
        console.log('The file has been created!');
    });
}

// open new serialport
var portName = 'COM3';
var port;
try {
    port = new SerialPort(portName, {
        baudRate: 9600
    });
} catch (error) {
    console.error(error);
}

// Read the port data
const parser = port.pipe(new Readline({
    delimiter: '\n'
}));
// if port is open
port.on("open", () => {
    console.log('serial port open');
});
// if data is coming
parser.on('data', dataFromSerial => {

    // after 100 piece of data close connection
    if (cnt != 100) {
        // current time 
        var curtime = new Date().toISOString();
        // increase counter
        cnt++;
        // console log info
        console.log("got this %d", dataFromSerial, "from arduino at", curtime);
        console.log("counter: ", cnt);
        // read file contents
        fs.readFile(__dirname + '/dataFromSerial.json', 'utf8', function readFileCallback(err, dataFromFile) {
            // if errors
            if (err) {
                console.log(err);
            } else {
                // data from file to obj
                obj = JSON.parse(dataFromFile);
                // add data to it
                obj.table.push({
                    x: curtime,
                    y: dataFromSerial
                });
                //convert it back to json string
                json = JSON.stringify(obj);
                // remove linebrake
                json = json.replace(/\\r/g, '');
                // write it back to json file
                fs.writeFile(__dirname + '/dataFromSerial.json', json, 'utf8', (err) => {
                    if (err) throw err;
                    console.log('Element has been added!');
                });
            }
        });
    } else {
        // close port after 100 pieces of data
        port.close();
    }
});