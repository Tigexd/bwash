let packagesInstalled = 2;
let packages = ["bwash", "sudo"];
const paksAvail = ["hyfetch", "htop"];

const paks = ["sudo", "bwash", "hyfetch", "htop", "nnn"];

window.sptLoaded = true;

function confirmation() {
  requestConfirmation("Continue? [Y/n] ", (answer) => {
    const normalized = answer.trim().toLowerCase();
    if (normalized === "" || normalized === "y" || normalized === "yes") {
      printLine("OK");
      return;
    } else {
      printLine("Aborted.");
    }
  });
}

function addpac(target) {
  const cdnSrc = `https://cdn.tigexd.org/spt%20packages/${target}.js`;
  const localSrc = `../package-clump/spt%20packages/${target}.js`;

  const loadScript = (src, isFallback) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => printLine(`${target}.js loaded successfully`);
    script.onerror = () => {
      if (!isFallback) {
        loadScript(cdnSrc, true);
        return;
      }
      printLine(`Failed to load ${target}.js`);
    };
    document.head.appendChild(script);
  };

  const useLocal = location.protocol === 'file:' || location.hostname === 'localhost';
  loadScript(useLocal ? localSrc : cdnSrc, !useLocal);
}

function addPak(target) {
  if (!target) {
    printLine("bwash: spt: no package specified.");
    return;
  }
  if (paks.includes(target)) {
    printLine(
      `Installing:
  ${target}

Installing dependencies:
  dependencies

Suggested packages:
  idek bro

Summary:
  Upgrading: 0, Installing: 1, Removing: 0, Not Upgrading: 0
  Download size: 8,654 kB
  Space needed: 43.5 MB / 8,659 MB available`
    );
    confirmation();
    addpac(target); // for the sake of demo for now
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
    function spt() {
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
    };
  },
};

