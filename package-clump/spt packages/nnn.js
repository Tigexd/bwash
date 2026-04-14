(() => {
    if (window.__nnnLoaded) return;
    window.__nnnLoaded = true;

    function resolvePath(argPath) {
        if (!argPath || argPath === '~') {
            return ['home', username];
        }

        let base = argPath.startsWith('/') ? [] : [...currentPath];
        const parts = argPath.split('/').filter(p => p !== '');

        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (base.length > 0) base.pop();
            } else {
                base.push(part);
            }
        }
        return base;
    }

    function getDisplayPath(pathArr) {
        if (!pathArr.length) return '/';
        const full = '/' + pathArr.join('/');
        if (username && full === `/home/${username}`) return '~';
        return full;
    }

    function renderNnn(pathArr) {
        const dir = getDirFromPath(pathArr);
        if (!dir) {
            printLine(`nnn: '${getDisplayPath(pathArr)}': No such directory`);
            return;
        }

        const displayPath = getDisplayPath(pathArr);
        const entries = Object.entries(dir).sort(([a], [b]) => a.localeCompare(b));

        const dirs = entries.filter(([, node]) => node.type === 'dir');
        const files = entries.filter(([, node]) => node.type !== 'dir');

        printLine(
            `<span style="color: var(--path-color); font-weight: bold;">${displayPath}</span>` +
            `  [${entries.length} item${entries.length !== 1 ? 's' : ''}]`
        );
        printLine(`${"─".repeat(40)}`);

        if (entries.length === 0) {
            printLine(`  <span style="color: var(--text-dim);">(empty)</span>`);
            return;
        }

        for (const [name] of dirs) {
            printLine(`  <span style="color: var(--path-color);">${name}/</span>`);
        }
        for (const [name] of files) {
            printLine(`  ${name}`);
        }
    }

    commands['nnn'] = {
        level: 0,
        execute: (args) => {
            if (args[0] === '--version' || args[0] === '-v') {
                printLine("nnn 5.0 (bwash port) — virtual filesystem browser");
                return;
            }
            const targetPath = resolvePath(args[0]);
            renderNnn(targetPath);
        }
    };

})();
