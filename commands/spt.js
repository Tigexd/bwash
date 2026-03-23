let packagesInstalled = 2;
let packages = ["bwash", "sudo"];
const paksAvail = ["hyfetch", "htop"];

const paks = ["sudo", "bwash", "hyfetch", "htop", "nnn"];

function confirmation() {
  const line = document.createElement("div");
  line.innerHTML = "Continue? [Y/n] ";
  outputDiv.appendChild(line);
}

function addPak(target) {
  if (!target) {
    printLine("bwash: spt: no package specified.");
    return;
  }
  if (target === "hyfetch") {
    printLine(`Installing: ${target}`);
  } else {
    printLine(
      `bwash: spt: Unable to locate package '${target}' in https://gitlab.com/TigeXD/package-clump`
    );
  }
}

function delPak(target) {
  if (packages.includes(target)) {
    packagesInstalled -= 1;
    packages.pop(target);
  } else {
    printLine(`bwash: spt: Unable to locate package '${target}' in /user/bin`);
  }

  packagesInstalled -= 1;
  const packages = list.filter((item) => item !== target);
}

function sptUpdate() {
  localStorage.setItem("packagesInstalled", packagesInstalled);
}

function sptUpgrade(pakName) {
  if (paksAvail.includes(pakName)) {
    printLine(
      `bwash: spt: woah woah, too fast buddy, this feature is not ready yet`
    );
  } else {
    printLine(`bwash: spt: Unable to locate package '${target}' in /user/bin`);
  }
}

commands["spt"] = {
  level: 1,
  execute: (args) => {
    const action = args[0]; // "install"
    const target = args[1]; // "hyfetch"

    if (action === "install") {
      if (!target) {
        printLine("bwash: spt: no package specified.");
        return;
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
