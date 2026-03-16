// Initialize xterm
const term = new Terminal({
    theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#ffffff'
    },
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 14,
    cursorBlink: true,
    allowTransparency: true
});

term.open(document.getElementById('terminal'));

// Variables for input handling
let currentInput = '';
let awaitingUsername = true;

// Handle data from xterm (user input)
term.onData(data => {
    if (awaitingUsername) {
        if (data === '\r' || data === '\n') {
            if (currentInput.trim()) {
                username = currentInput.trim();
                localStorage.setItem('terminal_user', username);
                initUserSpace(username);
                term.writeln(`Initializing environment for user: ${username}... done.`);
                awaitingUsername = false;
                currentInput = '';
                renderPrompt();
                changePageTitle();
            }
        } else if (data === '\x7f') { // Backspace
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                term.write('\b \b'); // Erase last char
            }
        } else {
            currentInput += data;
            term.write(data);
        }
    } else {
        if (data === '\r' || data === '\n') {
            processCommand(currentInput.trim());
            currentInput = '';
        } else if (data === '\x7f') { // Backspace
            if (currentInput.length > 0) {
                currentInput = currentInput.slice(0, -1);
                term.write('\b \b');
            }
        } else {
            currentInput += data;
            term.write(data);
        }
    }
});

// Function to process commands
function processCommand(val) {
    if (val !== "") {
        const parts = val.split(' ').filter(part => part.trim() !== '');
        let isSudo = false;
        let cmdName = parts[0].toLowerCase();
        let args = parts.slice(1);

        if (cmdName === 'sudo') {
            isSudo = true;
            cmdName = args[0] ? args[0].toLowerCase() : '';
            args = args.slice(1);
        }

        if (cmdName === '') {
            term.writeln(`usage: sudo -h | -K | -k | -V
usage: sudo -v [-ABkNnS] [-g group] [-h host] [-p prompt] [-u user]
usage: sudo -l [-ABkNnS] [-g group] [-h host] [-p prompt] [-U user]
            [-u user] [command [arg ...]]
usage: sudo -e [-ABkNnS] [-r role] [-t type] [-C num] [-D directory]
            [-g group] [-h host] [-p prompt] [-R directory] [-T timeout]
            [-u user] file ...`);
        } else if (commands[cmdName]) {
            const cmd = commands[cmdName];
            if (cmd.level > 0 && !isSudo) {
                term.writeln(`bwash: ${cmdName}: Permission denied`);
            } else {
                cmd.execute(args);
                renderPrompt();
                changePageTitle();
            }
        } else {
            term.writeln(`bwash: ${cmdName}: command not found`);
        }
    } else {
        renderPrompt();
    }
}

function changePageTitle() {
    if (!username) return;
    const displayPath = getPromptPath();
    const newPageTitle = `${username}@bwash:${displayPath}$`;
    document.querySelector('title').textContent = newPageTitle;
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
        return '~ ';
    }
    return pathString === '/' ? '/' : pathString;
}

// function to render prompt in xterm
function renderPrompt() {
    if (!username) {
        term.write("Create a username: ");
    } else {
        const displayPath = getPromptPath();
        term.write(`${username}@bwash:${displayPath}$ `);
    }
}

function printLine(text) {
    term.writeln(text);
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
                printLine(`<span style="font-weight: 600;">User deleted. Connection terminated.</span>`);
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


// jump the page back to input place
document.addEventListener('click', () => {
    term.focus();
});

// Init Sequence
if (username) {
    initUserSpace(username);
    renderPrompt();
    changePageTitle();
} else {
    renderPrompt();
}
