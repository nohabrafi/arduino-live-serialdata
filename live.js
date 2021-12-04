const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const fs = require('fs');

var cnt = 0;

var obj = {
    table: []
};

var port;

var json = JSON.stringify(obj);

fs.writeFile(__dirname + '/dataFromSerial.json', json, 'utf8', (err) => {
    if (err) throw err;
    console.log('The file has been created!');
});

try {

    port = new SerialPort('COM3', {
        baudRate: 9600
    });

} catch (error) {

    console.error(error);

}

const parser = port.pipe(new Readline({
    delimiter: '\n'
})); // Read the port data

port.on("open", () => {
    console.log('serial port open');
});

parser.on('data', dataFromSerial => {

    if (cnt != 100) {

        var curtime = new Date().toISOString();

        cnt++;

        console.log("got this %d", dataFromSerial, "from arduino at", curtime);
        console.log("counter: ", cnt);

        fs.readFile(__dirname + '/dataFromSerial.json', 'utf8', function readFileCallback(err, dataFromFile) {

            if (err) {

                console.log(err);

            } else {

                obj = JSON.parse(dataFromFile); //now it is an object

                obj.table.push({
                    x: curtime,
                    y: dataFromSerial
                }); //add some data

                json = JSON.stringify(obj); //convert it back to json string
                json = json.replace(/\\r/g, ''); // remove linebrake

                fs.writeFile(__dirname + '/dataFromSerial.json', json, 'utf8', (err) => {
                    if (err) throw err;
                    console.log('Element has been added!');
                }); // write it back to json file
            }
        });

    } else {

        port.close();

    }
});