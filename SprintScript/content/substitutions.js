(function () {
  if (!window.SprintScript) {
    window.SprintScript = {};
  }

  let substitutions = {};
  const shownShortcuts = new WeakMap();
  const ignoredShortcuts = new WeakMap(); // NOVO

  function loadSubstitutions(callback) {
    chrome.storage.sync.get("shortcuts", (result) => {
      substitutions = result?.shortcuts || {};
      console.log("[SprintScript] Atalhos carregados:", substitutions);
      if (callback) callback();
    });
  }

  function getSubstitutions() {
    return substitutions;
  }

  function saveSubstitutions() {
    chrome.storage.sync.set({ shortcuts: substitutions }, () => {
      console.log("[SprintScript] Atalhos salvos:", substitutions);
    });
  }

  function findMatchingShortcut(input) {
    const keys = Object.keys(substitutions).sort((a, b) => b.length - a.length);
    for (const s of keys) {
      if (input.endsWith(s)) return s;
    }
    return null;
  }

  function alreadyShown(el, shortcut) {
    const set = shownShortcuts.get(el) || new Set();
    if (set.has(shortcut)) return true;
    set.add(shortcut);
    shownShortcuts.set(el, set);
    return false;
  }

  function clearShown(el) {
    shownShortcuts.delete(el);
  }

  // NOVO: Verifica se já foi ignorado naquele ponto
  function wasIgnored(el, shortcut, index) {
    const map = ignoredShortcuts.get(el);
    if (!map) return false;
    return map.has(`${shortcut}-${index}`);
  }

  // NOVO: Marca como ignorado
  function markIgnored(el, shortcut, index) {
    let map = ignoredShortcuts.get(el);
    if (!map) {
      map = new Set();
      ignoredShortcuts.set(el, map);
    }
    map.add(`${shortcut}-${index}`);
  }

  window.SprintScript.substitutions = {
    loadSubstitutions,
    getSubstitutions,
    saveSubstitutions,
    findMatchingShortcut,
    alreadyShown,
    clearShown,
    wasIgnored,       // exporta
    markIgnored       // exporta
  };
})();
