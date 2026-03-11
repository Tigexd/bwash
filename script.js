const outputDiv = document.getElementById('output');
const promptPrefix = document.getElementById('prompt-prefix');
const cmdInput = document.getElementById('command-input');



// ==========================================
// SILLY FILESYSTEM IMPLEMENTATION
// ==========================================

// The base FHS skeleton
const baseFHS = {
    "bin": { type: "dir", content: {} },
    "boot": { type: "dir", content: {} },
    "dev": { type: "dir", content: {} },
    "etc": { type: "dir", content: {} },
    "home": { type: "dir", content: {} },
    "root": { type: "dir", content: {} },
    "var": {
        type: "dir",
        content: {
            "www": { type: "dir", content: {} } // Perfect place to mount your future web apps
        }
    }
};

// State variables
let username = localStorage.getItem('terminal_user');
let fileSystem = JSON.parse(localStorage.getItem('bwash_fs'));
let currentPath = []; // Array representing path. Empty array = '/'

// Initialize File System if it doesn't exist
if (!fileSystem) {
    fileSystem = baseFHS;
    saveFS();
}

// Helper to save FS state to client storage
function saveFS() {
    localStorage.setItem('bwash_fs', JSON.stringify(fileSystem));
}

// Helper to get the actual directory object from a path array
function getDirFromPath(pathArray) {
    let current = fileSystem;
    for (let i = 0; i < pathArray.length; i++) {
        if (current[pathArray[i]] && current[pathArray[i]].type === 'dir') {
            current = current[pathArray[i]].content;
        } else {
            return null; // Path invalid or is a file
        }
    }
    return current;
}

// Setup user home directory on login
function initUserSpace(user) {
    if (!fileSystem["home"].content[user]) {
        fileSystem["home"].content[user] = { type: "dir", content: {} };
        saveFS();
    }
    currentPath = ["home", user]; // Set default path to ~
}

// ==========================================
// UI & TERMINAL LOGIC
// ==========================================


// Get device info function
function displayMaxDeviceInfo() {
    const infoContainer = document.createElement('div');
    infoContainer.id = 'device-info';
    document.body.appendChild(infoContainer);

    function addInfo(title, value) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${title}:</strong> ${value}`;
        infoContainer.appendChild(p);
    }

    // Browser and Platform Information from window.navigator
    addInfo('User Agent', navigator.userAgent || 'N/A');
    addInfo('App Name', navigator.appName || 'N/A');
    addInfo('App Version', navigator.appVersion || 'N/A');
    addInfo('Platform/OS', navigator.platform || 'N/A');
    addInfo('Language', navigator.language || 'N/A');
    addInfo('User Languages', navigator.languages ? navigator.languages.join(', ') : 'N/A');
    addInfo('Cookies Enabled', navigator.cookieEnabled ? 'Yes' : 'No');
    addInfo('Online Status', navigator.onLine ? 'Online' : 'Offline');

    // Hardware Information from window.navigator
    addInfo('CPU Cores (Approx.)', navigator.hardwareConcurrency || 'N/A');
    addInfo('Device Memory (GB, Approx.)', navigator.deviceMemory || 'N/A');
    addInfo('Max Touch Points', navigator.maxTouchPoints || 'N/A');

    // Screen Information from window.screen
    addInfo('Screen Width', screen.width + 'px' || 'N/A');
    addInfo('Screen Height', screen.height + 'px' || 'N/A');
    addInfo('Available Screen Width', screen.availWidth + 'px' || 'N/A');
    addInfo('Available Screen Height', screen.availHeight + 'px' || 'N/A');
    addInfo('Color Depth', screen.colorDepth + ' bits' || 'N/A');
    addInfo('Pixel Depth', screen.pixelDepth + ' bits' || 'N/A');

    // Timezone Information
    addInfo('Time Zone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'N/A');

    printLine('Device and Browser Information Collected:', `
        userAgent: ${navigator.userAgent},
        appName: ${navigator.appName},
        appVersion: ${navigator.appVersion},
        platform: ${navigator.platform},
        language: ${navigator.language},
        languages: ${navigator.languages},
        cookieEnabled: ${navigator.cookieEnabled},
        onLine: ${navigator.onLine},
        hardwareConcurrency: ${navigator.hardwareConcurrency},
        deviceMemory: ${navigator.deviceMemory},
        maxTouchPoints: ${navigator.maxTouchPoints},
        screenWidth: ${screen.width},
        screenHeight: ${screen.height},
        availScreenWidth: ${screen.availWidth},
        availScreenHeight: ${screen.availHeight},
        colorDepth: ${screen.colorDepth},
        pixelDepth: ${screen.pixelDepth},
        timeZone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
    `);
}



// Calculate prompt path string
function getPromptPath() {
    const pathString = '/' + currentPath.join('/');
    if (username && pathString === `/home/${username}`) {
        return '~';
    }
    return pathString === '/' ? '/' : pathString;
}

// Function to update the prompt
function renderPrompt() {
    if (!username) {
        promptPrefix.textContent = "Create a username: ";
    } else {
        const displayPath = getPromptPath();
        promptPrefix.innerHTML = `<span class="user-host">${username}@bwash</span><span class="symbol">:</span><span class="path">${displayPath}</span><span class="symbol">$</span>`;
    }
}

function printLine(htmlContent) {
    const line = document.createElement('div');
    line.innerHTML = htmlContent;
    outputDiv.appendChild(line);
}

// ==========================================
// COMMAND REGISTRY
// level 0 = normal user, level 1 = requires sudo
// ==========================================
const commands = {

    // Commands for funziez :D

    'bk': {
        level: 0,
        execute: (args) => {
            const path = require('path');
            const fs = require('fs');

            // Use __dirname to start from the current script's folder
            const filePath = path.join(__dirname, 'ascii', 'bk.txt');

            // Read and log the file
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) throw err;
                printLine(data);
            });
        }
    },
    // -----------------------------------------
    // Basic static boring argumentless commands
    // -----------------------------------------

    'clear': {
        level: 0,
        execute: (args) => {
            outputDiv.innerHTML = '';
        }
    },
    'help': {
        level: 0,
        execute: (args) => {
            printLine("Available commands:");
            printLine("  clear   - Clear the terminal output");
            printLine("  help    - Display this help message");
            printLine("  userdel - Delete a user account (requires privileges)");
            printLine("  echo    - Print a line of text to the standard output");
            printLine("  pwd     - Print working directory");
            printLine("  ls      - List directory contents");
            printLine("  cd      - Change directory");
        }
    },
    'version': {
        level: 0,
        execute: (args) => {
            printLine("Meepian");
        }
    },

    // -----------------------------------------
    // Not basic argumentful commands
    // -----------------------------------------

    'userdel': {
        level: 1,
        execute: (args) => {
            if (args[0] === username) {
                localStorage.removeItem('terminal_user');
                username = null;
                currentPath = [];
                outputDiv.innerHTML = '';
                renderPrompt();
                printLine("User deleted. Connection terminated.");
                setTimeout(() => printLine("Create a username: "), 500);
            } else if (!args[0]) {
                printLine(`userdel: missing operand`);
            } else {
                printLine(`userdel: user '${args[0]}' does not exist`);
            }
        }
    },
    'echo': {
        level: 0,
        execute: (args) => {
            let output = args.join(' '); // Join all arguments back into a single string
            if (output.startsWith(`"`)) {
                if (output.endsWith(`"`)) {
                    printLine(output.slice(1, -1));
                } else {
                    printLine(`bwash: unexpected EOF while looking for matching '"'`);
                }
            } else if (output.length > 0) {
                printLine(output);
            }
        }
    },

    // -----------------------------------------
    // Filesystem monster (argumentless)
    // -----------------------------------------

    'pwd': {
        level: 0,
        execute: (args) => {
            printLine('/' + currentPath.join('/'));
        }
    },
    'ls': {
        level: 0,
        execute: (args) => {
            const currentDir = getDirFromPath(currentPath);
            const items = Object.keys(currentDir).sort();
            if (items.length > 0) {
                printLine(`<span style="color: var(--user-color);">${items.join('&nbsp;&nbsp;&nbsp;')}</span>`);
            }
        }
    },

    // -----------------------------------------
    // Filesystem monster (argumentful)
    // -----------------------------------------

    'cd': {
        level: 0,
        execute: (args) => {
            const target = args[0];
            if (!target || target === '~') {
                currentPath = ["home", username];
                return;
            }

            let newPath = [...currentPath];

            // Handle absolute paths
            if (target.startsWith('/')) {
                newPath = [];
            }

            const parts = target.split('/').filter(p => p !== '');

            for (const part of parts) {
                if (part === '.') continue;
                if (part === '..') {
                    if (newPath.length > 0) newPath.pop();
                } else {
                    newPath.push(part);
                }
            }

            // Validate the new path
            if (getDirFromPath(newPath) !== null) {
                currentPath = newPath;
            } else {
                printLine(`bwash: cd: ${target}: No such file or directory`);
            }
        }
    },

    // ------------------------------------------
    // PROGRAM/SERVICE COMMANDS
    // ------------------------------------------

    'bash': {
        level: 0,
        execute: (args) => {
            let output = args.join(' '); // Join all arguments back into a single string
            if (output === (`--version`)) {
                printLine(`
                GNU bwash, version 1.13 - release(v8/blink-js-gnu)
                Copyleft(C) 2026 ProtoGenuin, AG.
License GPLv3 +: GNU GPL version 3 or later < http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it. BUT YOU ARE ABSOLUTELY NOT ALLOWED TO SELL THIS SOFTWARE FOR PROFIT. For details see the COPYING file that came with this software.
There is NO WARRANTY, to the extent permitted by law.`);
            } else if (output === (``)) {
                renderPrompt();
            }

        }
    }
};

// ==========================================
// HTML EVENT LISTENERS & INIT
// ==========================================

// Handle Enter keypress
cmdInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const val = this.value.trim();

        if (!username) {

            // ---------------------------------
            // Handle initial login
            // ---------------------------------

            if (val) {
                username = val;
                localStorage.setItem('terminal_user', username);
                initUserSpace(username); // Create their home folder
                printLine(`Initializing environment for user: <span class="user-host">${username}</span>... done.`);
                renderPrompt();
            }
        } else {

            // ---------------------------------------------------------
            // Echo the command to the output with the prompt prefix
            // ---------------------------------------------------------

            printLine(`${promptPrefix.innerHTML} ${val}`);

            if (val !== "") {
                const parts = val.split(' ').filter(part => part.trim() !== '');

                let isSudo = false;
                let cmdName = parts[0].toLowerCase();
                let args = parts.slice(1);

                // ===========================================
                // SUDO CHRCKER
                // ===========================================

                if (cmdName === 'sudo') {
                    isSudo = true;
                    cmdName = args[0] ? args[0].toLowerCase() : '';
                    args = args.slice(1);
                }

                // ===========================================
                // EXECUTE LOGIC
                // ===========================================

                if (cmdName === '') { // User just typed "sudo" with no command
                    printLine(`usage: sudo -h | -K | -k | -V
usage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]
usage: sudo -l [-ABkNnS] [-g group] [-h host] [-p prompt] [-U user]
            [-u user] [command [arg ...]]
usage: sudo [-ABbEHkNnPS] [-r role] [-t type] [-C num] [-D directory]
            [-g group] [-h host] [-p prompt] [-R directory] [-T timeout]
            [-u user] [VAR=value] [-i | -s] [command [arg ...]]
usage: sudo -e [-ABkNnS] [-r role] [-t type] [-C num] [-D directory]
            [-g group] [-h host] [-p prompt] [-R directory] [-T timeout]
            [-u user] file ...`);
                } else if (commands[cmdName]) {
                    const cmd = commands[cmdName];

                    // Permission Check
                    if (cmd.level > 0 && !isSudo) {
                        printLine(`bwash: ${cmdName}: Permission denied`);
                    } else {
                        cmd.execute(args);
                        renderPrompt(); // Update prompt in case path changed
                    }
                } else {
                    printLine(`bwash: ${cmdName}: command not found`);
                }
            }
        }

        // Clear input and scroll to bottom
        this.value = '';
        window.scrollTo(0, document.body.scrollHeight);
    }
});

// Keep focus on the input
document.addEventListener('click', () => {
    cmdInput.focus();
});

// Init Sequence
if (username) {
    initUserSpace(username); // Make sure their path is set on page reload
}
renderPrompt();


// Silly IP fetcher
function getVisitorIP() {
    const timerId4 = setTimeout(() => {
        console.error('Timeout fetching IP');
        document.getElementById('ip-ipv4').textContent = 'Timeout fetching IP';
        document.getElementById('ip-ipv4').style.color = 'red';
        document.getElementById('status-ipv4').textContent = 'FAIL';
        document.getElementById('status-ipv4').style.color = 'red';
        printLine(`<span style="color: red;">Failed to fetch IPv4 address. This may be due to your network configuration or opening the page in a private browser window or being on a school network.</span>`);
        failedFetch = true;
    }, 3000);

    const timerId6 = setTimeout(() => {
        console.error('Timeout fetching IP');
        document.getElementById('ip-ipv6').textContent = 'Timeout fetching IP';
        document.getElementById('ip-ipv6').style.color = 'red';
        document.getElementById('status-ipv6').textContent = 'FAIL';
        document.getElementById('status-ipv6').style.color = 'red';
        printLine(`<span style="color: red;">Failed to fetch IPv6 address. This may be due to your network configuration or opening the page in a private browser window or being on a school network.</span>`);
        failedFetch = true;
    }, 3000);

    // ipv4 grabber

    fetch('https://api.ipify.org/?format=json')
        .then(response => response.json())
        .then(data => {
            // Update the HTML element with the fetched IP address
            document.getElementById('ip-ipv4').textContent = data.ip;
            document.getElementById('status-ipv4').textContent = ' OK ';
            document.getElementById('status-ipv4').style.color = 'var(--user-color)';
        })
        .catch(error => {
            // Handle any errors that may occur during the fetch operation
            console.error('Error fetching IP:', error);
            document.getElementById('ip-ipv4').textContent = 'Error fetching IP';
            document.getElementById('ip-ipv4').style.color = 'red';
            document.getElementById('status-ipv4').textContent = 'FAIL';
            document.getElementById('status-ipv4').style.color = 'red';
            printLine(`<span style="color: red;">Failed to fetch IPv4 address. This may be due to your network configuration or opening the page in a private browser window.</span>`);
            failedFetch = true;
        })
        .finally(() => clearTimeout(timerId4))
        ;

    navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion", "architecture", "model", "uaFullVersion"])


    // ipv6 grabber

    fetch('https://api64.ipify.org/?format=json')
        .then(response => response.json())
        .then(data => {
            // Update the HTML element with the fetched IP address
            document.getElementById('ip-ipv6').textContent = data.ip;
            document.getElementById('status-ipv6').textContent = ' OK ';
            document.getElementById('status-ipv6').style.color = 'var(--user-color)';
        })
        .catch(error => {
            // Handle any errors that may occur during the fetch operation
            console.error('Error fetching IP:', error);
            document.getElementById('ip-ipv6').textContent = 'Error fetching IP';
            document.getElementById('ip-ipv6').style.color = 'red';
            document.getElementById('status-ipv6').textContent = 'FAIL';
            document.getElementById('status-ipv6').style.color = 'red';
            printLine(`<span style="color: red;">Failed to fetch IPv6 address. This may be due to your network configuration or opening the page in a private browser window.</span>`);
            failedFetch = true;
        })
        .finally(() => clearTimeout(timerId6))
        ;


}


// Call the function when the page loads
document.addEventListener('DOMContentLoaded', getVisitorIP);


if (!username) {
    printLine(`Establishing connection...`);
    printLine(`Fetching Client IP...` + `<span id="ip-fetching" style="color: var(--user-color);">[IPv4 & IPv6]</span>`);
    printLine("Client IPv4: " + `<span >[</span><span id="status-ipv4"> .. </span><span>] </span></span><span id="ip-ipv4" style="color: var(--user-color);">Fetching...</span>`);
    printLine("Client IPv6: " + `<span >[</span><span id="status-ipv6"> .. </span><span>] </span></span><span id="ip-ipv6" style="color: var(--user-color);">Fetching...</span>`);
    printLine(`<span>[</span><span style="color: var(--user-color); font-weight: bold;"> OK </span><span>] </span><span>Connection established.</span>`);
    displayMaxDeviceInfo()
}
