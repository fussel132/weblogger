// Without ES6: const express = require('express')
import express from 'express';
import bodyParser from 'body-parser';
import { router } from './server/api.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
// Redeclare __dirname to work with ES6
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(bodyParser.json());
app.use('/api', router);

app.get('/', (req, res, next) => {
  res.status(200);
  res.set('Content-Type', 'text/html');
  res.sendFile(__dirname + '/public/index.html');
  console.log(`Sent index.html to ${req.ip}. Reason: ${req.method} ${req.headers.host}${req.url}`);
})

app.use(express.static('public'));

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res, next) {
  res.status(404);
  res.set('Content-Type', 'text/html');
  res.sendFile(__dirname + '/public/404.html');
  console.log(`Sent 404.html to ${req.ip}. Reason: ${req.method} ${req.headers.host}${req.url}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})