# WebLogger

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
  - Example cURL: `curl -X POST -H "Content-type: application/json" -d "{\"Key\":\"Value\"}"`
- GET JSON data from `/api/log` to get all logged data. (Needs Reason and Line as Headers)
- GET Log Event Stream at `/api/stream` with EventSource. (Automatically done by the WebApp)

### WebApp (Frontend)
- The WebApp is served at `/`.
- The WebApp can be used to log data and view it.

## Contributors
Thanks to the following people who have contributed to this project:
- [@TheRealFloatDev](https://github.com/TheRealFloatDev)
- [@alexanderboric](https://github.com/alexanderboric)
