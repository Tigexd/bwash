const outputDiv = document.getElementById('output');
const promptPrefix = document.getElementById('prompt-prefix');
const cmdInput = document.getElementById('command-input');

var input = document.getElementById("command-input");
input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("trigBtn").click();
  }
});



function changePageTitle() {

newPageTitle = `${username}@bwash:${displayPath}$`;
            document.querySelector('title').textContent
                = newPageTitle;
        };

// ==========================================
// SILLY FILESYSTEM IMPLEMENTATION
// ==========================================

// root dir FHS
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
            "www": { type: "dir", content: {} } // maybe future web apps
        }
    }
};

// universal vars
let username = localStorage.getItem('terminal_user');
let fileSystem = JSON.parse(localStorage.getItem('bwash_fs'));
let currentPath = []; // Array representing path. Empty array = '/'

// initialize File System if it doesn't exist
if (!fileSystem) {
    fileSystem = baseFHS;
    saveFS();
}

// saved current dir to localstorage
function saveFS() {
    localStorage.setItem('bwash_fs', JSON.stringify(fileSystem));
}

// dir path helper
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

// Setup user home dir on login
function initUserSpace(user) {
    if (!fileSystem["home"].content[user]) {
        fileSystem["home"].content[user] = { type: "dir", content: {} };
        saveFS();
    }
    currentPath = ["home", user]; // Set default path to ~
}

// ==========================================
// tui and logics
// ==========================================


// get device info function
function displayMaxDeviceInfo() {

printLine(`Device and Browser Information Collected:
User Agent: ${navigator.userAgent},
App Name: ${navigator.appName},
App Version: ${navigator.appVersion},
Platform/OS: ${navigator.platform},
Language: ${navigator.language},
User Languages: ${navigator.languages},
Cookies Enabled: ${navigator.cookieEnabled},
Online Status: ${navigator.onLine},
CPU Cores (Approx.): ${navigator.hardwareConcurrency},
Device Memory (GB, Approx.): ${navigator.deviceMemory},
Max Touch Points: ${navigator.maxTouchPoints},
Screen Width: ${screen.width},
Screen Height: ${screen.height},
Available Screen Width: ${screen.availWidth},
Available Screen Height: ${screen.availHeight},
Color Depth: ${screen.colorDepth},
Pixel Depth: ${screen.pixelDepth},
Time Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
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

// function to either create usr or display prompt thing
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
            fetch('ascii/bk.txt')
                .then(response => response.text())
                .then(asciiArt => {
                    printLine(asciiArt);
                })
                .catch(err => console.error('Could not load art:', err));
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
            printLine("  bash    - Run bash compatibility checks");
        }
    },
    'version': {
        level: 0,
        execute: (args) => {
            printLine("Meepian");
            printLine("Version 0.1.16 (Alpha pre-release)");
            printLine("Meepian - An open source operating system that allow users to run Bwash shell :3");
            printLine(`(c) 2026 ProtoGenuin and Tiger; The name "Meepian" is inspired by iceboy501 :P`)
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


    // shell level commands + filesystem commands (echo, pwd, ls, cd, bash) are in commands/shell-commands.js

    // program level commands (apt, systemctl, etc) will be in commands/program-commands.js

};

// ==========================================
// HTML EVENT LISTENERS & INIT
// ==========================================

// handle enter
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
            // prompt thing + inputted command combined
            // ---------------------------------------------------------

            printLine(`${promptPrefix.innerHTML} ${val}`);

            if (val !== "") {
                const parts = val.split(' ').filter(part => part.trim() !== '');

                let isSudo = false;
                let cmdName = parts[0].toLowerCase();
                let args = parts.slice(1);

                // SUDO CHRCKER
                

                if (cmdName === 'sudo') {
                    isSudo = true;
                    cmdName = args[0] ? args[0].toLowerCase() : '';
                    args = args.slice(1);
                }
                
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
                        renderPrompt(); // update prompt thing because for safety
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

// jump the page back to input place
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
            // Update the id with the fetched ip address (this will not auto display it, it will be printLine(d))
            document.getElementById('ip-ipv4').textContent = data.ip;
            document.getElementById('status-ipv4').textContent = ' OK ';
            document.getElementById('status-ipv4').style.color = 'var(--user-color)';
            document.getElementById('status-ipv4').style.fontWeight = 'bold';
        })
        .catch(error => {
            // cool error code
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
            document.getElementById('ip-ipv6').textContent = data.ip;
            document.getElementById('status-ipv6').textContent = ' OK ';
            document.getElementById('status-ipv6').style.color = 'var(--user-color)';
            document.getElementById('status-ipv6').style.fontWeight = 'bold';
        })
        .catch(error => {
            // cool error messages
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


// call the fetcher when the page is done loading
document.addEventListener('DOMContentLoaded', getVisitorIP);


if (!username) {
    printLine(`Establishing connection...`);
    printLine(`Fetching user IP...` + `<span id="ip-fetching" style="color: var(--user-color);">[IPv4 & IPv6]</span>`);
    printLine("User IPv4: " + `<span >[</span><span id="status-ipv4"> .. </span><span>] </span></span><span id="ip-ipv4" style="color: var(--user-color);">Fetching...</span>`);
    printLine("User IPv6: " + `<span >[</span><span id="status-ipv6"> .. </span><span>] </span></span><span id="ip-ipv6" style="color: var(--user-color);">Fetching...</span>`);
    printLine(`<span>[</span><span style="color: var(--user-color); font-weight: bold;"> OK </span><span>] </span><span>Connection established, even though fetching the IP was completely unecessary.</span>`);
    displayMaxDeviceInfo()
}
