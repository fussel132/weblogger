import express from 'express'
import fs from 'fs'
import readLastLines from 'read-last-lines'

/* __dirname mapping for CommonJS/ES6 compatability */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const eventLog = fs.createWriteStream(__dirname + '/events.log', { flags: 'a+' });
let clients = [];
export const router = express.Router();

/**
 * Will check the hostnames.json file for a hostname for the given IP address. If not found, return the IP back
 * @param {*} fromIP IP address to get the hostname from
 */
function getHostname(fromIP) {
    const data = fs.readFileSync(__dirname + '/hostnames.json', { encoding: 'utf8', flag: 'r' });
    try {
        const hostnames = JSON.parse(data);
        for (let ip in hostnames) {
            if (fromIP.includes(ip)) {
                return hostnames[ip];
            }
        }
        if (fromIP.includes("::ffff:")) {
            fromIP = fromIP.replace("::ffff:", "");
        }
        return fromIP;
    }
    catch (err) {
        console.log("Error parsing JSON string:", err);
        return fromIP;
    }
}

/**
 * Sends data to all connected clients
 * @param {*} data The data to send
 */
function sendDataToClients(data) {
    clients.forEach(client => {
        client.write(`data: ${data}\n\n`);;
    });
    console.log(`Sent \"${data}\" to ${clients.length} clients`);
}

/**
 * Removes a client from the array of connected clients
 * @param {*} client The client to remove
 */
function removeClient(client) {
    clients = clients.filter(c => c !== client);
}

router.get('/log', (req, res, next) => {
    if (req.headers.reason == "fetchLog" && req.headers.lines) {
        let lines = req.headers.lines;
        res.status(200);
        res.set('Content-Type', 'text/plain');
        if (lines > 100 || lines < 1) {
            // res.send("Please enter a number between 1 and 100");
            // Bad request
            res.status(400);
            res.set('Content-Type', 'application/json');
            res.send(JSON.stringify({ "status": "400", "message": "Bad Request. Please enter a number between 1 and 100" }));
            console.log(`Sent API Error to ${req.ip}`);
            return;
        }
        readLastLines.read(__dirname + '/events.log', lines)
            .then((result) => {
                res.send(result);
            })
        console.log(`Sent events.log (last ${lines} lines) to ${req.ip}. Reason: ${req.headers.reason}`);
        return;
    }
    if (req.headers.reason != "fetchLog" || req.headers.lines == undefined) {
        // Bad request
        res.status(400);
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({ "status": "400", "message": "Bad Request" }));
        return;
    }
    // Assuming access from a web browser
    next(); // To go to the 404 page
})

router.get('/stream', (req, res, next) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Add the client to the array of connected clients
    console.log(`Client ${req.ip} connected`);
    clients.push(res);
    res.write(`data: connected\n\n`);

    // Close the connection when the client closes it
    req.on('close', () => {
        console.log(`Client ${req.ip} disconnected`);
        removeClient(res);;
    });
})

function leadingZero(time) {
    return time < 10 ? '0' + time : time;
}

router.post('/log', (req, res, next) => {
    if(req.headers['content-type'] != "application/json") {
        res.status(400);
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({ "status": "400", "message": "Bad Request" }));
        return;
    }
    res.status(200);
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({ "status": "200", "message": "OK" }));
    // Define here what is supposed to be logged
    const time = new Date();
    let hours = leadingZero(time.getHours());
    let minutes = leadingZero(time.getMinutes());
    let seconds = leadingZero(time.getSeconds());
    let date = leadingZero(time.getDate());
    let month = leadingZero(time.getMonth() + 1);
    let timestamp = `${date}.${month}.${time.getFullYear()} ${hours}:${minutes}:${seconds}`;
    let postedLogEntry = "";
    if (req.body.msg) {
        // LogEntry if the POST contains a "msg"
        postedLogEntry = `[ ${timestamp} ] ${getHostname(req.ip)} - ${req.body.msg}`;
    }
    else {
        console.log("No msg in POST body");
        // LogEntry if the POST does NOT contain a "msg"
        postedLogEntry = `[ ${timestamp} ] Received ${JSON.stringify(req.body)} from ${getHostname(req.ip)}`;
    }
    eventLog.write(`${postedLogEntry}\n`);
    console.log(`Received ${JSON.stringify(req.body)} from ${req.ip}`);
    console.log(`Logged \"${postedLogEntry}\"`);
    sendDataToClients(postedLogEntry);  
})