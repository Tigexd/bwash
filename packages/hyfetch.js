const hostOS;
const kernver;
const uptime;
const packages;
const shell;
const resolution;
const terminal;
const cpu;
const gpu;
const memory;
const graphic;
let colorMode;

const eightBitColor=(()=>{const n=Math.max(70,Math.floor(window.innerWidth||70));const levels=[0,95,135,175,215,255];const toRgb=i=>i<16?["rgb(0,0,0)","rgb(128,0,0)","rgb(0,128,0)","rgb(128,128,0)","rgb(0,0,128)","rgb(128,0,128)","rgb(0,128,128)","rgb(192,192,192)","rgb(128,128,128)","rgb(255,0,0)","rgb(0,255,0)","rgb(255,255,0)","rgb(0,0,255)","rgb(255,0,255)","rgb(0,255,255)","rgb(255,255,255)"][i]:i<232?(()=>{i-=16;const r=levels[Math.floor(i/36)%6],g=levels[Math.floor(i/6)%6],b=levels[i%6];return`rgb(${r},${g},${b})`;})():(()=>{const v=8+(i-232)*10;return`rgb(${v},${v},${v})`;})();return Array.from({length:n},(_,k)=>{const code=16+Math.floor(k*(231-16)/(n-1||1));return`<span style="color:${toRgb(code)}"> </span>`;}).join('');})();

const rgbColor=<div class="rgbbar" style="width: 100vw;
  height: 16px;
  background: linear-gradient(
    90deg,
    rgb(255, 0, 0) 0%,
    rgb(255, 255, 0) 17%,
    rgb(0, 255, 0) 33%,
    rgb(0, 255, 255) 50%,
    rgb(0, 0, 255) 67%,
    rgb(255, 0, 255) 83%,
    rgb(255, 0, 0) 100%
  );"></div>

let hyfetchConf = localStorage.getItem("hyfetchConfig");

const rainbowF=<div class="rgbbar" style="width: 500px;
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
  );"></div>


function confirmColor() {
    requestconfirmColor("$ ", (answer) => {
        const normAns = answer.trim().toLowerCase(); // in case they actually typed "RGB" for some reason
        if (normAns === "" || normAns === "rgb") {
            colorMode = "rgb";
            return;
        } else if (normAns === "8bit") {
            colorMode = "8bit";
            return;
        } else {
            printLine(`Invalid selection! ${answer} is not one of 8bit|rgb`);
            confirmColor();
        }
    });
}

function fetch() {
    hostOS = navigator.userAgent.match(/\(([^)]+)\)/);
    kernver = "1.0.16";
    uptime = localStorage.getItem('formattedTime');
    packages = (localStorage.getItem('packagesInstalled') + "(spt)");
    shell = "Bwash 1.13";
    resolution = window.innerWidth + "x" + window.innerHeight;
    terminal = "bwash.js";
    cpu = "not supported yet!";
    gpu = "not supported yet!";
    memory = navigator.deviceMemory + "GiB" + "(approximately)"
};

function graphic() {
    fetch('ascii/bwash.txt')
        .then(response => response.text())
        .then(asciiArt => {
            printLine(asciiArt);
        })
        .catch(err => console.error('Could not load art:', err));
}

fetch();

function displayFetched() {
    printLine(hostOS);

}

function initConfig() {
    printLine(`
    
Welcome to hyfetch Let's set up some colors first.

${eightBitColor}                                                   8bit Color Testing
${rgbColor}                                                   RGB Color Testing

1. Which color system do you want to use?
(If you can't see colors under "RGB Color Testing", please choose 8bit)

Your choice? (8bit|<span style="font-weight:bold;text-decoration: underline;">rgb</span>)
`)
    confirmColor();
    printLine(`
    Welcome to hyfetch Let's set up some colors first.
1. Selected color mode:           ${colorMode}
2. Detected background color:     dark (it's impossible to be light mode)

<span style="color: var(--user-color);">3. Let's choose a flag!</span>
Available flag presets:
Page: 1 of 8

      rainbow             transgender            nonbinary             xenogender             agender
${rainbowF}



       queer              genderfluid             bisexual             pansexual             polysexual




     omnisexual           omniromantic            gay-men               lesbian              abrosexual





Enter '[n]ext' to go to the next page and '[p]rev' to go to the previous page.
Which preset do you want to use?  (default: rainbow)
`)
}

commands["hyfetch"] = {
    level: 0,
    execute: (args) => {
        const action = args[0]; // "install"
        if (!hyfetchConf) {
            localStorage.setItem("hyfetchConfig");
            if (!action || action === "-c" || action === "--config") {
                initConfig();
            }

            addPak(target);
        } else if (action === "update") {
            sptUpdate();
        } else if (action === "upgrade") {
            sptUpgrade(target);
        } else if (action === "remove") {
            delPak(target);
        } else {
            printLine(`bwash: spt: '${action}' not found.`);
        }
    },
};


