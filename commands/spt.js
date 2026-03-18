let packagesInstalled = 2;
let packages = ["bwash", "sudo"];
const paksAvail = ["hyfetch", "htop"];

const pakInfo = {
    "sudo": { type: "pkg", version: "1.1.13.p2" },
    "bwash": { type: "shell", version: "1.13.0" },
    "hyfetch": { type: "pkg", version: "2.0.1" },
    "htop": { type: "pkg", version: "2.3.1" },
    "nnn": { type: "pkg", version: "3.2.1" }
};




function addPak(pakName) {
    if (paksAvail.includes(pakName)) {
        packagesInstalled += 1;
        packages.push(pakName);
        dynamicallyLoadScript(`https://gitlab.com/TigeXD/package-clump/-/raw/main/${pakName}.js`);
    } else {
        printLine(`bwash: spt: Unable to locate package '${target}' in https://gitlab.com/TigeXD/package-clump`);
    }
}

function delPak(pakName) {
    if (packages.includes(pakName)) {
        packagesInstalled -= 1;
        packages.pop(pakName);
    } else {
        printLine(`bwash: spt: Unable to locate package '${target}' in /user/bin`);
    }

    packagesInstalled -= 1;
    const packages = list.filter(item => item !== pakName);
}

function sptUpdate() {
    localStorage.setItem('packagesInstalled', packagesInstalled);
}

function sptUpgrade(pakName) {
    if (paksAvail.includes(pakName)) {
        printLine(`bwash: spt: woah woah, too fast buddy, this feature is not ready yet`);
    } else {
        printLine(`bwash: spt: Unable to locate package '${target}' in /user/bin`);
    }
}

commands['spt'] = {
    level: 1,
    execute: (args) => {
        const action = args.join(' ');
        if (action === 'install') {
            const target = args.join(' ');
            addPak(target);
        } else if (action === 'update') { // just a localStorage refresher
            sptUpdate();
        } else if (action === 'upgrade') { // also just a fancy thingy
        const target = args.join(' ');
            sptUpgrade(target);
        } else if (action === 'remove') {
            delPak(target);
        }
    }
};
