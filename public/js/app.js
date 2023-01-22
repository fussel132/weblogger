let connectionState = "disconnected";
let autoReconnect = false;
let reconnectCount = 0;

/**
 * Loads the last x lines from the log file from the server
 */
function loadLog() {
    let lines = document.getElementById('linesToLoad').value;
    if (lines > 100 || lines < 1) {
        alert("Please enter a number between 1 and 100\n");
    }
    else {
        document.getElementById('log').innerHTML = `Loading last ${lines} lines from the Server:\n`;
        fetch('/api/log', {
            method: 'GET',
            headers: {
                'reason': 'fetchLog',
                'lines': lines
            }
        })
            .then(response => response.text())
            .then(data => {
                document.getElementById('log').innerHTML += data;
                if (connectionState == "connected") {
                    document.getElementById('log').innerHTML += "Connected. Now displaying live data:\n";
                }
                // scroll to bottom
                document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

/**
 * Removes the last line from the log if it is a reconnect message
 * @param {*} x The log text
 * @returns The log text without the last line if it is a reconnect message
 */
function removeLastLine(x) {
    x = x.split('\n');
    if (x[x.length - 1].startsWith("Lost connection. Attempting to reconnect...")) {
        x.pop();
        x[x.length - 1] += "\n";
    }
    return x.join('\n');
}

let initialLoad = true;

/**
 * Creates a keep-alive connection to /api/stream
 * If the connection is lost, call lostConnection()
 * If the connection is established, call setConnectionState("connected")
 * Called by loadLog() and lostConnection() (also user activated)
 */
function reconnect() {
    if (connectionState !== "connected") {
        // hier hin der reconnect status falsch gewünscht
        if (!initialLoad) {
            reconnectCount++;
        } else {
            initialLoad = false;
        }
        setConnectionState("Connecting");
        // Create keep-alive connection to /api/stream
        let eventSource = new EventSource('/api/stream');
        eventSource.onmessage = function (event) {
            if (event.data == "connected") {
                // If the connection is established, call setConnectionState("connected")
                if (reconnectCount > 0) {
                    document.getElementById('log').innerHTML = removeLastLine(document.getElementById('log').innerHTML) + "Connected. Now displaying live data:\n";
                }
                reconnectCount = 0;
                setConnectionState("Connected");
                //document.getElementById('log').innerHTML += "Now displaying live data:\n"
                return;
            }
            // Add the received data to the log
            document.getElementById('log').innerHTML += event.data + "\n";
            // scroll to bottom
            document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
        };
        eventSource.onerror = function (event) {
            // If the connection is lost, call lostConnection()
            eventSource.close();
            lostConnection();
        };
    }
}

/**
 * Called if the connection is lost
 */
function lostConnection() {
    if (connectionState !== "disconnected") {
        setConnectionState("Disconnected");
        if (autoReconnect) {
            document.getElementById('log').innerHTML = removeLastLine(document.getElementById('log').innerHTML) + `Lost connection. Attempting to reconnect... (${reconnectCount} times)`;
            document.getElementById('log').scrollTop = document.getElementById('log').scrollHeight;
            reconnect();
        }
        else {
            alert("Lost connection. Is the server running?");
        }
    }
}

/**
 * Called if the user clicks on the connection state
 */
function setAutoReconnect() {
    autoReconnect = document.getElementById('autoReconnect').checked;
}

/**
 * Sets the connection state
 * @param {*} state The new connection state
 */
function setConnectionState(state) {
    if (state.toLowerCase() == "connected") {
        connectionState = "connected";
        document.getElementById('state').innerHTML = "Connected";
        document.getElementById('state').style.backgroundColor = "#4CAF50";
        document.getElementById('state').style.cursor = "default";
    }
    else if (state.toLowerCase() == "connecting") {
        connectionState = "connecting";
        document.getElementById('state').innerHTML = "Connecting";
        document.getElementById('state').style.backgroundColor = "#ff9800";
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

/**
 * Shows the current time in the format HH:MM:SS
 */
function showTime() {
    const date = new Date();
    let hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    document.getElementById('timetext').innerHTML = `${hours}:${minutes}:${seconds}`;
}

// What should happen if the page finished loading?
window.onload = () => {
    setInterval(showTime, 500);
    loadLog();
    reconnect();

    document.getElementById('linesToLoad').onkeydown = (event) => {
        if (event.key == "Enter") {
            loadLog();
        }
    }
    document.getElementById('year').innerHTML = new Date().getFullYear();
}

