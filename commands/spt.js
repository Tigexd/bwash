let packagesInstalled = 2;
let packages = ["bwash", "sudo"];
const paksAvail = ["hyfetch", "htop"];

function addPak(pakName) {
    if (paksAvail.includes(target)) {
        packagesInstalled += 1;
        packages.push(target);
    } else {
        printLine(`bwash: spt: Unable to locate package '${target}' in https://gitlab.com/TigeXD/package-clump`);
    }
}

function delPak(pakName) {
    if (packages.includes(target)) {
        packagesInstalled -= 1;
        packages.pop(target);
    } else {
        printLine(`bwash: spt: Unable to locate package '${target}' in `);
    }
    
    packagesInstalled -= 1;
    const packages = list.filter(item => item !== pakName);
}


commands['spt'] = {
    level: 1,
    execute: (args) => {
        const action = args.join(' ');
        if (action === 'install') {
            const target = args.join(' ');
            addPak()
        } else if (output === 'update') {
            function sptUpdate() {
                localStorage.setItem('packagesInstalled', packagesInstalled);
            }
        } else if (output === 'upgrade') {

        } else if (output === 'remove') {

        }
    }
};
