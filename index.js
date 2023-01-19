const express = require('express')
const { get } = require('./server/api')
const api = require('./server/api')
const app = express()
const port = 3000

app.use('/api', api)
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.status(200)
  res.set('Content-Type', 'text/html')
  res.sendFile(__dirname + '/public/index.html')
  console.log(`Sent index.html to ${req.ip}`)
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
  res.status(404)
  res.set('Content-Type', 'text/html')
  res.sendFile(__dirname + '/public/404.html');
  console.log(`Sent 404.html to ${req.ip}`)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})