import express from 'express'
import fs from 'fs'
import readLastLines from 'read-last-lines'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const eventLog = fs.createWriteStream(__dirname + '/events.log', { flags: 'a+' })
let clients = []
export const router = express.Router()

// Function to send data to all connected clients
function sendDataToClients(data) {
    clients.forEach(client => {
        client.write(`data: ${data}\n\n`);
    });
    console.log(`Sent ${data} to ${clients.length} clients`)
}

// Function to remove a disconnected client
function removeClient(client) {
    clients = clients.filter(c => c !== client);
}

router.get('/log', (req, res, next) => {
    if (req.headers.reason == "fetchLog") {
        let lines = req.headers.lines
        res.status(200)
        res.set('Content-Type', 'text/plain')
        if (lines > 100 || lines < 1) {
            res.send("Please enter a number between 1 and 100")
            console.log(`Sent API Error to ${req.ip}`)
        }
        else {
            readLastLines.read(__dirname + '/events.log', lines)
                .then((result) => {
                    res.send(result)
                })
            console.log(`Sent events.log (last ${lines} lines) to ${req.ip}. Reason: ${req.headers.reason}`)
        }
    }
    else {
        /*
        res.status(405)
        res.set('Content-Type', 'text/html')
        res.send("The API is not meant to be accessed with your browser (GET). Return to the <a href='/'>home page</a>.")
        console.log(`Sent API Error to ${req.ip}`)
        */
        next()
    }

})

router.get('/stream', (req, res, next) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // Add the client to the array of connected clients
    console.log(`Client ${req.ip} connected`)
    clients.push(res);
    res.write(`data: connected\n\n`);

    // Close the connection when the client closes it
    req.on('close', () => {
        console.log(`Client ${req.ip} disconnected`)
        removeClient(res);
    });
})

router.post('/', (req, res, next) => {
    res.status(200)
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify({ "status": "200", "message": "OK" }))
    // Define here what is supposed to be logged
    let postedLogEntry = "";
    eventLog.write(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}\n`)
    console.log(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}`)
    sendDataToClients(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}`)
})