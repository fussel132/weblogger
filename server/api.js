const express = require('express')
const fs = require('fs')
const readLastLines = require('read-last-lines')

const eventLog = fs.createWriteStream(__dirname + '/events.log', { flags: 'a+' })
const router = express.Router()

router.get('/', (req, res, next) => {
    if (req.headers.reason == "fetchLog") {
        let lines = req.headers.lines
        res.status(200)
        res.set('Content-Type', 'text/plain')
        readLastLines.read(__dirname + '/events.log', lines)
            .then((result) => {
                res.send(result)
            })
        console.log(`Sent events.log (last ${lines} lines) to ${req.ip}. Reason: ${req.headers.reason}`)
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

router.post('/', (req, res, next) => {
    res.status(200)
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify({ "status": "200", "message": "OK" }))
    eventLog.write(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}\n`)
    console.log(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}`)
})

module.exports = router