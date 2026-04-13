(() => {
  if (window.__sptCommandReady) {
    return;
  }
  window.__sptCommandReady = true;

  const PACKAGE_CACHE_KEY = "sptInstalledPackages";
  const DEFAULT_INSTALLED = ["bwash", "sudo"];
  const packageIndexCache = {
    loaded: false,
    packages: [],
    source: null
  };

  function buildSourceList(preferred, fallbacks) {
    const merged = [];
    if (Array.isArray(preferred)) {
      merged.push(...preferred);
    } else if (typeof preferred === "string" && preferred.trim() !== "") {
      merged.push(preferred);
    }
    merged.push(...fallbacks);
    return [...new Set(merged.filter(Boolean))];
  }

  function getIndexSources() {
    return buildSourceList(window.SPT_PACKAGE_INDEX_SOURCES, [
      window.SPT_PACKAGE_INDEX_URL,
      "../package-clump/list.json",
      "/package-clump/list.json",
      "https://gitlab.com/TigeXD/package-clump/-/raw/main/list.json"
    ]);
  }

  function getPackageScriptSources(packageName) {
    const encoded = encodeURIComponent(packageName).replace(/%20/g, "%20");
    return buildSourceList(window.SPT_PACKAGE_SCRIPT_SOURCES, [
      `https://gitlab.com/TigeXD/package-clump/-/raw/main/spt%20packages/${encoded}.js`,
      `https://cdn.tigexd.org/spt%20packages/${encoded}.js`
    ]);
  }

  async function fetchJsonFromSources(sources) {
    let lastError = null;
    for (const source of sources) {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return {
          source,
          json: await response.json()
        };
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("No package index source was reachable.");
  }

  function normalizePackage(entry) {
    const lowered = {};
    for (const [key, value] of Object.entries(entry || {})) {
      lowered[key.toLowerCase()] = value;
    }
    const name = String(lowered.name || "").trim();
    if (!name) {
      return null;
    }
    const dependencies = String(
      lowered.dependencies || lowered.dependency || "none"
    ).trim();
    const size = String(lowered.size || "unknown").trim();
    return { name, dependencies, size };
  }

  async function loadPackageIndex(forceRefresh = false) {
    if (packageIndexCache.loaded && !forceRefresh) {
      return packageIndexCache;
    }
    const result = await fetchJsonFromSources(getIndexSources());
    if (!Array.isArray(result.json)) {
      throw new Error("Package index format is invalid.");
    }
    packageIndexCache.loaded = true;
    packageIndexCache.source = result.source;
    packageIndexCache.packages = result.json
      .map(normalizePackage)
      .filter(Boolean);
    return packageIndexCache;
  }

  function readInstalledPackages() {
    try {
      const raw = localStorage.getItem(PACKAGE_CACHE_KEY);
      if (!raw) {
        return [...DEFAULT_INSTALLED];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [...DEFAULT_INSTALLED];
      }
      return [...new Set(parsed.map((item) => String(item).trim()).filter(Boolean))];
    } catch {
      return [...DEFAULT_INSTALLED];
    }
  }

  function saveInstalledPackages(packages) {
    const unique = [...new Set(packages.map((item) => String(item).trim()).filter(Boolean))];
    localStorage.setItem(PACKAGE_CACHE_KEY, JSON.stringify(unique));
    localStorage.setItem("packagesInstalled", String(unique.length));
  }

  async function loadPackageScript(packageName) {
    const sources = getPackageScriptSources(packageName);
    let lastError = null;
    for (const source of sources) {
      try {
        await new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${source}"]`);
          if (existing && existing.dataset.loaded === "true") {
            resolve();
            return;
          }
          if (existing) {
            existing.addEventListener("load", () => {
              existing.dataset.loaded = "true";
              resolve();
            }, { once: true });
            existing.addEventListener("error", () => reject(new Error(`Failed to load ${source}`)), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = source;
          script.async = true;
          script.onload = () => {
            script.dataset.loaded = "true";
            resolve();
          };
          script.onerror = () => reject(new Error(`Failed to load ${source}`));
          document.head.appendChild(script);
        });
        return source;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`Failed to load package script for '${packageName}'.`);
  }

  async function sptUpdate() {
    printLine("Hit:1 package index");
    const index = await loadPackageIndex(true);
    printLine(`Reading package lists... done (${index.packages.length} package(s) available)`);
    printLine(`Source: ${index.source}`);
  }

  async function addPak(target) {
    if (!target) {
      printLine("bwash: spt: no package specified.");
      return;
    }

    const index = await loadPackageIndex();
    const entry = index.packages.find((item) => item.name.toLowerCase() === target.toLowerCase());
    if (!entry) {
      printLine(`bwash: spt: Unable to locate package '${target}' in ${index.source || "configured sources"}`);
      return;
    }

    const installed = readInstalledPackages();
    if (installed.some((item) => item.toLowerCase() === entry.name.toLowerCase())) {
      printLine(`${entry.name} is already the newest version.`);
      return;
    }

    printLine(`Installing:
  ${entry.name}

Installing dependencies:
  ${entry.dependencies}

Summary:
  Upgrading: 0, Installing: 1, Removing: 0, Not Upgrading: 0
  Download size: ${entry.size}`);

    requestConfirmation("Continue? [Y/n] ", async (answer) => {
      const normalized = answer.trim().toLowerCase();
      if (normalized !== "" && normalized !== "y" && normalized !== "yes") {
        printLine("Aborted.");
        return;
      }

      printLine(`Get:1 ${index.source} ${entry.name} all ${entry.size}`);
      try {
        await loadPackageScript(entry.name);
        installed.push(entry.name);
        saveInstalledPackages(installed);
        printLine(`Setting up ${entry.name} ... done`);
      } catch (error) {
        printLine(`bwash: spt: ${error.message}`);
      }
    });
  }

  function delPak(target) {
    if (!target) {
      printLine("bwash: spt: no package specified.");
      return;
    }
    const installed = readInstalledPackages();
    const before = installed.length;
    const after = installed.filter((item) => item.toLowerCase() !== target.toLowerCase());
    if (after.length === before) {
      printLine(`bwash: spt: Unable to locate package '${target}' in installed package list`);
      return;
    }
    saveInstalledPackages(after);
    printLine(`Removing ${target} ... done`);
  }

  async function sptUpgrade(target) {
    if (!target) {
      printLine("bwash: spt: no package specified.");
      return;
    }
    const index = await loadPackageIndex();
    const entry = index.packages.find((item) => item.name.toLowerCase() === target.toLowerCase());
    if (!entry) {
      printLine(`bwash: spt: Unable to locate package '${target}' in ${index.source || "configured sources"}`);
      return;
    }
    printLine(`bwash: spt: '${entry.name}' is already up to date.`);
  }

  async function executeSptCommand(args) {
    const action = (args[0] || "").toLowerCase();
    const target = args[1];

    if (!action) {
      printLine("Usage: spt <install|update|upgrade|remove> [package]");
      return;
    }

    if (action === "install") {
      await addPak(target);
      return;
    }
    if (action === "update") {
      await sptUpdate();
      return;
    }
    if (action === "upgrade") {
      await sptUpgrade(target);
      return;
    }
    if (action === "remove") {
      delPak(target);
      return;
    }
    printLine(`bwash: spt: '${action}' not found.`);
  }

  window.executeSptCommand = executeSptCommand;
  commands["spt"] = {
    level: 1,
    execute: executeSptCommand
  };
})();
