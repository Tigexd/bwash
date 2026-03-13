// Shell-level commands (separate from the core UI/system commands)
// These are registered after script.js is loaded.

// NOTE: script.js must define `commands`, `currentPath`, and helpers like `getDirFromPath`, `renderPrompt`, `printLine`.

commands['echo'] = {
    level: 0,
    execute: (args) => {
        let output = args.join(' ');
        if (output.startsWith('"')) {
            if (output.endsWith('"')) {
                printLine(output.slice(1, -1));
            } else {
                printLine(`bwash: unexpected EOF while looking for matching '"'`);
            }
        } else if (output.length > 0) {
            printLine(output);
        }
    }
};

commands['pwd'] = {
    level: 0,
    execute: () => {
        printLine('/' + currentPath.join('/'));
    }
};

commands['ls'] = {
    level: 0,
    execute: () => {
        const currentDir = getDirFromPath(currentPath);
        const items = Object.keys(currentDir).sort();
        if (items.length > 0) {
            printLine(items.join('&nbsp;&nbsp;&nbsp;'));
        }
    }
};

commands['cd'] = {
    level: 0,
    execute: (args) => {
        const target = args[0];
        if (!target || target === '~') {
            currentPath = ['home', username];
            return;
        }

        let newPath = [...currentPath];

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

        if (getDirFromPath(newPath) !== null) {
            currentPath = newPath;
        } else {
            printLine(`bwash: cd: ${target}: No such file or directory`);
        }
    }
};

commands['bash'] = {
    level: 0,
    execute: (args) => {
        const output = args.join(' ');
        if (output === '--version') {
            printLine(`
                GNU bwash, version 1.13 - release(v8/blink-js-gnu)
                Copyleft(C) 2026 ProtoGenuin, AG.
License GPLv3 +: GNU GPL version 3 or later < http://gnu.org/licenses/gpl.html>

This is free software; you are free to change and redistribute it. BUT YOU ARE ABSOLUTELY NOT ALLOWED TO SELL THIS SOFTWARE FOR PROFIT. For details see the COPYING file that came with this software.
There is NO WARRANTY, to the extent permitted by law.`);
        } else if (output === '') {
            renderPrompt();
        }
    }
};