(() => {
    if (window.__hyfetchLoaded) return;
    window.__hyfetchLoaded = true;

    let hostOS = "";
    let kernver = "";
    let uptimeVal = "";
    let packages = "";
    let shell = "";
    let resolution = "";
    let terminal = "";
    let cpu = "";
    let gpu = "";
    let memory = "";
    let colorMode = "";
    let flagPreset = "rainbow";

    const eightBitColor = `<div class="eightbitbar" style="width: 100vw;
      height: 16px; line-height: 1.5;
        background: linear-gradient(to right,
  #d70000 0%, #d70000 2%,
  #d75f00 2%, #d75f00 6%,
  #ff5f00 6%, #ff5f00 16%,
  #ff8700 16%, #ff8700 22%,
  #ffaf00 22%, #ffaf00 28%,
  #ffff00 28%, #ffff00 32%,
  #ffd700 32%, #ffd700 36%,
  #d7d700 36%, #d7d700 40%,
  #afd700 40%, #afd700 44%,
  #afaf00 44%, #afaf00 48%,
  #87af00 48%, #87af00 52%,
  #5f8700 52%, #5f8700 56%,
  #008700 56%, #008700 60%,
  #00875f 60%, #00875f 66%,
  #008787 66%, #008787 68%,
  #005faf 68%, #005faf 72%,
  #005fd7 72%, #005fd7 76%,
  #005fff 76%, #005fff 80%,
  #5f5fff 80%, #5f5fff 82%,
  #5f5fd7 82%, #5f5fd7 86%,
  #5f5faf 86%, #5f5faf 90%,
  #5f00af 90%, #5f00af 95%,
  #5f0087 95%, #5f0087 96%,
  #870087 96%, #870087 100%); display: flex;
  justify-content: center;
  align-items: center; color: black;">8bit Color Testing</div>`;

    const rgbColor = `<div class="rgbbar" style="width: 100vw; height: 16px; margin:0px; padding:0px; background: linear-gradient(90deg,
        rgb(255, 0, 0) 0%,
        rgb(255, 255, 0) 30%,
        rgb(0, 255, 0) 50%,
        rgb(0, 255, 255) 65%,
        rgb(0, 0, 255) 80%,
        rgb(255, 0, 255) 100%);
        display: flex; justify-content: center; align-items: center; color: black;">RGB Color Testing</div>`;

    const rainbowF = `<div class="rgbbar" style="width: 500px;
      height: 48px;
      background: linear-gradient(
        90deg,
        rgb(255, 0, 0) 0%,
        rgb(255, 255, 0) 17%,
        rgb(0, 255, 0) 33%,
        rgb(0, 255, 255) 50%,
        rgb(0, 0, 255) 67%,
        rgb(255, 0, 255) 83%,
        rgb(255, 0, 0) 100%
      );"></div>`;

    function confirmColor(onDone) {
        requestConfirmation("Your choice? ", (answer) => {
            const normAns = answer.trim().toLowerCase();
            if (normAns === "" || normAns === "rgb") {
                colorMode = "rgb";
                onDone();
                return;
            } else if (normAns === "8bit") {
                colorMode = "8bit";
                onDone();
                return;
            } else {
                printLine(`Invalid selection! ${answer} is not one of 8bit|rgb`);
                confirmColor(onDone);
            }
        });
    }

    function setConfig() {
        const config = { colorMode, flagPreset };
        localStorage.setItem("hyfetchConfig", JSON.stringify(config));
    }

    function loadConfig() {
        try {
            const raw = localStorage.getItem("hyfetchConfig");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                if (parsed.colorMode) colorMode = parsed.colorMode;
                if (parsed.flagPreset) flagPreset = parsed.flagPreset;
            }
        } catch {
            // ignore malformed config
        }
    }

    function gatherInfo() {
        hostOS = (navigator.userAgent.match(/\(([^)]+)\)/) || [])[1] || "Unknown";
        kernver = "1.0.16";
        uptimeVal = localStorage.getItem('formattedTime') || "calculating...";
        packages = (localStorage.getItem('packagesInstalled') || "2") + " (spt)";
        shell = "Bwash 1.13";
        resolution = window.innerWidth + "x" + window.innerHeight;
        terminal = "bwash.js";
        cpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + " cores" : "unknown";
        gpu = "not supported";
        memory = navigator.deviceMemory ? navigator.deviceMemory + " GiB (approx.)" : "unknown";
    }

    async function hyfetch() {
        try {
            const response = await fetch('ascii/bk.txt');
            const asciiArt = await response.text();
            const lines = asciiArt.split(/\r?\n/);

            const sysInfo = [
                `<span style="color: var(--user-color); font-weight: bold;">${username}@bwash</span>`,
                `-----------------`,
                `OS: ${hostOS}`,
                `Kernel: ${kernver}`,
                `Uptime: ${uptimeVal}`,
                `Packages: ${packages}`,
                `Shell: ${shell}`,
                `Resolution: ${resolution}`,
                `Terminal: ${terminal}`,
                `CPU: ${cpu}`,
                `GPU: ${gpu}`,
                `Memory: ${memory}`
            ];

            const lineCount = Math.max(lines.length, sysInfo.length);
            for (let i = 0; i < lineCount; i++) {
                const artPart = lines[i] !== undefined ? lines[i] : "";
                const infoPart = sysInfo[i] || "";
                printLine(artPart + "  " + infoPart);
            }
        } catch (err) {
            console.error('Could not load art:', err);
            printLine(`hyfetch: could not load ASCII art`);
        }
    }

    function initConfig() {
        printLine(`
    Welcome to hyfetch! Let's set up some colors first.
    ${eightBitColor}${rgbColor}
    
    1. Which color system do you want to use?
    (If you can't see colors under "RGB Color Testing", please choose 8bit)
    
    Your choice? (8bit|<span style="font-weight:bold;text-decoration: underline;">rgb</span>)
    `);
        confirmColor(() => {
            chooseFlag(0);
        });
    }

    const flagPresets = [
        "rainbow", "transgender", "nonbinary", "xenogender", "agender",
        "queer", "genderfluid", "bisexual", "pansexual", "polysexual",
        "omnisexual", "omniromantic", "gay-men", "lesbian", "abrosexual",
        "aromantic", "asexual", "demisexual", "intersex", "genderqueer",
        "pangender", "bigender", "trigender", "genderflux", "graysexual",
        "polyamory", "mlm", "wlw", "demigirl", "demiboy"
    ];

    function formatFlagPage(page, perPage) {
        const start = page * perPage;
        const end = Math.min(flagPresets.length, start + perPage);
        const items = flagPresets.slice(start, end);
        const row1 = items.slice(0, 5).map(n => n.padEnd(18)).join("");
        const row2 = items.slice(5, 10).map(n => n.padEnd(18)).join("");
        return `${row1}\n${row2}`.trimEnd();
    }

    function chooseFlag(page) {
        const perPage = 10;
        const pageCount = Math.ceil(flagPresets.length / perPage);
        const clamped = Math.max(0, Math.min(page, pageCount - 1));
        const pageText = formatFlagPage(clamped, perPage);
        printLine(`
    1. Selected color mode:           ${colorMode}
    2. Detected background color:     dark (it's impossible to be light mode)
    
    <span style="color: var(--user-color);">3. Let's choose a flag!</span>
    Available flag presets:
    Page: ${clamped + 1} of ${pageCount}
    
    ${pageText}
    
    Enter '[n]ext' to go to the next page and '[p]rev' to go to the previous page.
    Which preset do you want to use?  (default: rainbow)
    `);

        requestConfirmation("Preset? ", (answer) => {
            const choice = answer.trim().toLowerCase();
            if (choice === "" || choice === "rainbow") {
                flagPreset = "rainbow";
                setConfig();
                printLine(rainbowF);
                printLine(`Selected preset: ${flagPreset}`);
                return;
            }
            if (choice === "n" || choice === "next") {
                chooseFlag(clamped + 1);
                return;
            }
            if (choice === "p" || choice === "prev") {
                chooseFlag(clamped - 1);
                return;
            }
            if (flagPresets.includes(choice)) {
                flagPreset = choice;
                setConfig();
                printLine(`Selected preset: ${flagPreset}`);
                return;
            }
            printLine(`Invalid selection: ${answer}`);
            chooseFlag(clamped);
        });
    }

    commands['hyfetch'] = {
        level: 0,
        execute: (args) => {
            const action = args[0];
            const hyfetchConf = localStorage.getItem("hyfetchConfig");

            if (action === "--version") {
                printLine("hyfetch 1.0.16 (bwash port)");
                return;
            }

            if (action === "-c" || action === "--config") {
                initConfig();
                return;
            }

            if (!hyfetchConf) {
                initConfig();
                return;
            }

            loadConfig();
            gatherInfo();
            return hyfetch();
        }
    };

})();
