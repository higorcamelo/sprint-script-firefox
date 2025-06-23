(function () {
  if (!window.SprintScript) window.SprintScript = {};

  let substitutions = {};
  const shownShortcuts = new Map();
  const ignoredShortcuts = new Map();

  function loadSubstitutions(callback) {
    chrome.storage.sync.get("shortcuts", (result) => {
      substitutions = result?.shortcuts || {};
      if (callback) callback();
    });
  }

  function getSubstitutions() {
    return substitutions;
  }

  function saveSubstitutions() {
    chrome.storage.sync.set({ shortcuts: substitutions }, () => {});
  }

  function findMatchingShortcut(input) {
    const keys = Object.keys(substitutions).sort((a, b) => b.length - a.length);
    for (const s of keys) {
      if (input.endsWith(s)) return s;
    }
    return null;
  }

  function getFieldKey(el) {
    if (el.id) return `#${el.id}`;
    if (el.name) return `name=${el.name}`;
    if (el.getAttribute('data-key')) return `data-key=${el.getAttribute('data-key')}`;
    // Caminho no DOM (índice dos elementos até o body)
    let path = [];
    let node = el;
    while (node && node !== document.body) {
      let idx = 0;
      let sib = node;
      while ((sib = sib.previousElementSibling)) idx++;
      path.unshift(`${node.tagName}:nth-child(${idx + 1})`);
      node = node.parentElement;
    }
    return path.join('>');
  }

  function alreadyShown(el, shortcut) {
    const key = getFieldKey(el);
    const set = shownShortcuts.get(key) || new Set();
    if (set.has(shortcut)) return true;
    set.add(shortcut);
    shownShortcuts.set(key, set);
    return false;
  }

  function clearShown(el) {
    const key = getFieldKey(el);
    shownShortcuts.delete(key);
  }

  function wasIgnored(el, shortcut) {
    const key = getFieldKey(el);
    const set = ignoredShortcuts.get(key);
    return !!(set && set.has(shortcut));
  }

  function markIgnored(el, shortcut) {
    const key = getFieldKey(el);
    let set = ignoredShortcuts.get(key);
    if (!set) {
      set = new Set();
      ignoredShortcuts.set(key, set);
    }
    set.add(shortcut);
  }

  function clearIgnored(el) {
    const key = getFieldKey(el);
    ignoredShortcuts.delete(key);
  }

  function clearOneIgnored(el, shortcut) {
    const key = getFieldKey(el);
    const set = ignoredShortcuts.get(key);
    if (set) {
      set.delete(shortcut);
      if (set.size === 0) ignoredShortcuts.delete(key);
    }
  }

  window.SprintScript.substitutions = {
    loadSubstitutions,
    getSubstitutions,
    saveSubstitutions,
    findMatchingShortcut,
    alreadyShown,
    clearShown,
    wasIgnored,
    markIgnored,
    clearIgnored,
    clearOneIgnored
  };
})();
