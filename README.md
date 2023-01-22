# WebLogger

<a href="https://github.com/fussel132/weblogger/actions"><img src="https://github.com/fussel132/weblogger/actions/workflows/node.js.yml/badge.svg?branch=main" alt="Node.js Workflow Badge"></a>

A simple web application to log data and view it.

## Installation

Node.js is required to run this application. To install the dependencies, run:

```bash
npm install
```
To serve the applicatoin, run:

```bash
npm run start
```
And you are ready to go! The application will be served at `http://localhost:3000`.

## Usage

The Project can be split into two parts: The Frontend and the Backend.

### REST API (Backend)
- POST JSON data to `/api/log` to log data.
  - Example cURL: `curl -X POST -H "Content-type: application/json" -d "{\"Key\":\"Value\"}" http://localhost:3000/api/log`
- GET JSON data from `/api/log` to get all logged data. (Needs `reason: fetchLog, lines: <number between 1-100>` to be set as headers)
  - Example cURL: `curl -X GET -H "reason: fetchLog" -H "lines: 10" http://localhost:3000/api/log`
- GET Log Event Stream at `/api/stream` with EventSource. (Automatically done by the WebApp)

### WebApp (Frontend)
- The WebApp is served at `/`.
- The WebApp can be used to log data and view it.

## Known Issues
- Each request that is not being handled by a express middleware will result in the webserver sending the 404.html to the client. This is not intended as requests like GET /favicon.ico (if not present) should not be answered with the 404 page.
- No connection request timeout set, Safari will perform A LOT of requests to the server if the connection is lost and auto reconnect is set. This is not intended.
- Log lines disappear when reload is clicked while the server is not running.
- Yeah, no colors.

## Contributors
Thanks to the following people who have contributed to this project:
- [@TheRealFloatDev](https://github.com/TheRealFloatDev)
- [@alexanderboric](https://github.com/alexanderboric)
