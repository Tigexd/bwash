let packagesInstalled = 2;
let packages = ["bwash", "sudo"];
const paksAvail = ["hyfetch", "htop"];

function addPak(pakName) {
    if (paksAvail.includes(target)) {
        packagesInstalled += 1;
        packages.push(target);
    }
    
    packages.push(pakName);
}

function delPak(pakName) {
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
