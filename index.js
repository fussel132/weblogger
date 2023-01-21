const express = require('express')
const bodyParser = require('body-parser');
const api = require('./server/api')
const app = express()
const port = 3000

// Middleware
app.use(bodyParser.json());
app.use('/api', api)

app.get('/', (req, res, next) => {
  res.status(200)
  res.set('Content-Type', 'text/html')
  res.sendFile(__dirname + '/public/index.html')
  console.log(`Sent index.html to ${req.ip}. Reason: ${req.method} ${req.headers.host}${req.url}`)
})

app.use(express.static('public'))

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res, next) {
  res.status(404)
  res.set('Content-Type', 'text/html')
  res.sendFile(__dirname + '/public/404.html')
  console.log(`Sent 404.html to ${req.ip}. Reason: ${req.method} ${req.headers.host}${req.url}`)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})