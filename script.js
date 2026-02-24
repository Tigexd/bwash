const outputDiv = document.getElementById('output');
const promptPrefix = document.getElementById('prompt-prefix');
const cmdInput = document.getElementById('command-input');

// Check for cached user
let username = localStorage.getItem('terminal_user');

// Function to update the prompt
function renderPrompt() {
    if (!username) {
        promptPrefix.textContent = "system_login (Type your permanent username): ";
    } else {
        promptPrefix.innerHTML = `<span class="user-host">${username}@bwash</span><span class="symbol">:</span><span class="path">~</span><span class="symbol">$</span>`;
    }
}

// Helper to print a new line
function printLine(htmlContent) {
    const line = document.createElement('div');
    line.innerHTML = htmlContent;
    outputDiv.appendChild(line);
}

// ==========================================
// COMMAND REGISTRY
// Add new commands here!
// level 0 = normal user, level 1 = requires sudo
// ==========================================
const commands = {
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
        }
    },
    'userdel': {
        level: 1, 
        execute: (args) => {
            // args[0] is the first word after the command
            if (args[0] === username) {
                localStorage.removeItem('terminal_user');
                username = null;
                outputDiv.innerHTML = '';
                renderPrompt();
                printLine("User deleted. Connection terminated.");
                setTimeout(() => printLine("system_login (Type your permanent username): "), 500); // Small delay for effect
            } else if (!args[0]) {
                printLine(`userdel: missing operand`);
            } else {
                printLine(`userdel: user '${args[0]}' does not exist`);
            }
        }
    }
};

// Handle Enter keypress
cmdInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const val = this.value.trim();
        
        if (!username) {
            // Handle initial login
            if (val) {
                username = val;
                localStorage.setItem('terminal_user', username);
                printLine(`Initializing environment for user: <span class="user-host">${username}</span>... done.`);
                renderPrompt();
            }
        } else {
            // Echo the command to the output with the prompt prefix
            printLine(`${promptPrefix.innerHTML} ${val}`);
            
            if (val !== "") {
                // Parse the command and arguments
                // Split by spaces, filter out empty strings in case of double spaces
                const parts = val.split(' ').filter(part => part.trim() !== '');
                
                let isSudo = false;
                let cmdName = parts[0].toLowerCase();
                let args = parts.slice(1);

                // Check for sudo flag
                if (cmdName === 'sudo') {
                    isSudo = true;
                    cmdName = args[0] ? args[0].toLowerCase() : ''; // The actual command is now the next word
                    args = args.slice(1); // Shift arguments over again
                }

                // Execute logic
                if (cmdName === '') {
                    // User just typed "sudo" and nothing else
                    printLine(`usage: sudo <command>`);
                } else if (commands[cmdName]) {
                    const cmd = commands[cmdName];
                    
                    // Permission Check
                    if (cmd.level > 0 && !isSudo) {
                        printLine(`bwash: ${cmdName}: Permission denied`);
                    } else {
                        // Execute the command, passing in any arguments
                        cmd.execute(args);
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

// Init
renderPrompt();

if(!username) {
    printLine("Welcome to the interface. Connection established.");
}