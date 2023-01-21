let connectionState = "disconnected";
let autoReconnect = false;

function loadLog() {
    let lines = document.getElementById('linesToLoad').value;
    if (lines > 100 || lines < 1) {
        // Can still be manipulated by the user, move this to server side
        alert("Please enter a number between 1 and 100")
    }
    else {
        document.getElementById('log').innerHTML = `Loaded ${lines} lines from the Server:\n`;
        fetch('/api', {
            method: 'GET',
            headers: {
                'reason': 'fetchLog',
                'lines': lines
            }
        })
            .then(response => response.text())
            .then(data => {
                document.getElementById('log').innerHTML += data;
            })
        // scroll to bottom
        document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
    }
}

// Is called by the user if there is no connection
function reconnect() {
    if (connectionState == "disconnected") {
        // TODO: Re-establish keep-alive connection
        console.log("Reconnecting...") // Remove this in production, only for debugging purposes
        loadLog()
        setConnectionState("Connected");
    }
    else {
        console.log("Cannot reconnect, connection is already established") // Remove this in production, only for debugging purposes
    }
}

// Needs to be called if the keep-alive connection is lost
function lostConnection() {
    if (connectionState == "connected") {
        setConnectionState("Disconnected");
        if (autoReconnect) {
            reconnect();
        }
    }
}

// Will be called if the user changes the auto-reconnect checkbox
function setAutoReconnect() {
    autoReconnect = document.getElementById('autoReconnect').checked;
    console.log(`Auto-Reconnect is now ${autoReconnect}`) // Remove this in production, only for debugging purposes
}

function setConnectionState(state) {
    if (state.toLowerCase() == "connected") {
        connectionState = "connected";
        document.getElementById('state').innerHTML = "Connected";
        document.getElementById('state').style.backgroundColor = "#4CAF50";
        document.getElementById('state').style.cursor = "default";
    }
    else if (state.toLowerCase() == "disconnected") {
        connectionState = "disconnected";
        document.getElementById('state').innerHTML = "Disconnected";
        document.getElementById('state').style.backgroundColor = "#aa0404";
        document.getElementById('state').style.cursor = "pointer";
    }
    else {
        document.getElementById('state').innerHTML = "Unknown";
    }
}

function showTime() {
    const date = new Date();
    let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    document.getElementById('time').innerHTML = `${hours}:${minutes}:${seconds}`;
}

// What should happen if the page finished loading?
window.onload = () => {
    setInterval(showTime, 500);
    loadLog() // reconnect()
}
