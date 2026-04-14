(() => {
    if (window.__htopLoaded) return;
    window.__htopLoaded = true;

    const FAKE_PROCESSES = [
        { pid: 1,  user: "root",     cpu: "0.0", command: "kernel (Meepian v1.0.16)" },
        { pid: 2,  user: "root",     cpu: "0.0", command: "bwash (shell v1.13)" },
        { pid: 3,  user: "root",     cpu: "0.0", command: "spt (package manager)" },
        { pid: 4,  user: "root",     cpu: "0.0", command: "localStorage (fs daemon)" },
        { pid: 5,  user: username,   cpu: "0.0", command: "htop (process viewer)" },
    ];

    function pad(str, len) {
        return String(str).padEnd(len);
    }

    function rpad(str, len) {
        return String(str).padStart(len);
    }

    function renderHtop() {
        const uptimeVal = localStorage.getItem('formattedTime') || "calculating...";
        const cores = navigator.hardwareConcurrency || "?";
        const memGiB = navigator.deviceMemory ? navigator.deviceMemory + " GiB" : "unknown";
        const taskCount = FAKE_PROCESSES.length;
        const divider = "─".repeat(60);

        printLine(`htop 3.3.0 - bwash process monitor`);
        printLine(divider);
        printLine(
            `CPU: ${cores} core(s)  │  Mem: ${memGiB}  │  Uptime: ${uptimeVal}`
        );
        printLine(
            `Tasks: ${taskCount} total, 1 running`
        );
        printLine(divider);
        printLine(
            `<span style="font-weight:bold;">${pad("PID", 6)}${pad("USER", 14)}${pad("CPU%", 7)}COMMAND</span>`
        );

        for (const proc of FAKE_PROCESSES) {
            const userDisplay = proc.user || username;
            printLine(
                `${rpad(proc.pid, 5)}  ${pad(userDisplay, 13)} ${pad(proc.cpu, 6)} ${proc.command}`
            );
        }

        printLine(divider);
        printLine(
            `<span style="color: var(--text-dim);">F1</span>Help  ` +
            `<span style="color: var(--text-dim);">F2</span>Setup  ` +
            `<span style="color: var(--text-dim);">F5</span>Tree  ` +
            `<span style="color: var(--text-dim);">F9</span>Kill  ` +
            `<span style="color: var(--text-dim);">F10</span>Quit`
        );
        printLine(`<span style="color: var(--text-dim);">(static snapshot — bwash has no real process scheduler)</span>`);
    }

    commands['htop'] = {
        level: 0,
        execute: (args) => {
            if (args[0] === '--version' || args[0] === '-v') {
                printLine("htop 3.3.0 (bwash port)");
                return;
            }
            renderHtop();
        }
    };

})();
