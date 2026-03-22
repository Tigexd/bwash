let packagesInstalled = 2;
let packages = ["bwash", "sudo"];
const paksAvail = ["hyfetch", "htop"];

const paks = ["sudo", "bwash", "hyfetch", "htop", "nnn"];

fetch('https://gitlab.com/TigeXD/package-clump/-/raw/main/list.json?ref_type=heads') // Replace './data.json' with your file path or API URL
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json(); // Automatically parses the JSON string into a JavaScript object/array
    })
    .then(data => {
        // 'data' is now a usable JavaScript array (or object)
        console.log(data[0].firstName);
        // You can iterate over the array using forEach, map, etc.
        data.forEach(item => {
            console.log(`${item.firstName} ${item.lastName}`);
        });
    })
    .catch(error => {
        console.error('Error fetching or parsing JSON:', error);
    });


function confirmation() {
    const line = document.createElement('div');
    line.innerHTML = "Continue? [Y/n] ";
    outputDiv.appendChild(line);
}


function addPak(pakName) {
    if (paksAvail.includes(paks)) {
        packagesInstalled += 1;
        printLine(`Installing:
  ${pakName}

Installing dependencies:
  ${pakNameDependencies}

Suggested packages:
  idek bro

Summary:
  Upgrading: 0, Installing: 1, Removing: 0, Not Upgrading: 0
  Download size: 8,654 kB
  Space needed: 43.5 MB / 8,659 MB available`);
        confirmation();
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
        if (action.includes('install')) {
        const target = args.join(' ')[1];
            addPak(target);


        } else if (action === 'update') { // just a localStorage refresher
            sptUpdate();
        } else if (action === 'upgrade') { // also just a fancy thingy
            const target = args.join(' ');
            sptUpgrade(target);
        } else if (action === 'remove') {
            delPak(target);
        } else {
            printLine(`bwash: spt: '${action}' not found.`)
        }
    }
};
