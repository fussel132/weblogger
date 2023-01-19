const express = require('express')
const fs = require('fs');

const eventLog = fs.createWriteStream(__dirname + '/events.log', { flags: 'a+' })
const router = express.Router()

router.get('/', (req, res, next) => {
    res.status(405)
    res.set('Content-Type', 'text/html')
    res.send("The API is not meant to be accessed with your browser (GET). Return to the <a href='/'>home page</a>.")
    console.log(`Sent API Error to ${req.ip}`)
})

router.post('/', (req, res, next) => {
    res.status(200)
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify({ "status": "200", "message": "OK" }))
    eventLog.write(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}\n`)
    console.log(`Received ${JSON.stringify(req.body)} with headers ${JSON.stringify(req.headers)} from ${req.ip}`)
})

module.exports = router