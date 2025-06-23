(function () {
  if (!window.SprintScript) window.SprintScript = {};

  const DEBUG = false;
  const shownShortcuts = new WeakMap();

  function truncateText(text, wordLimit = 20) {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  }

  function listenerInput(e) {
    processField(e.target, false);
  }

  function listenerEditable(e) {
    processField(e.target, true);
  }

  function addListeners() {
    const fields = document.querySelectorAll(
      "input[type='text'], textarea, div[contenteditable='true'][role='textbox'], [aria-label='Mensagem']"
    );
    fields.forEach(el => {
      if (el.matches("input[type='text'], textarea")) {
        el.removeEventListener('input', listenerInput);
        el.addEventListener('input', listenerInput);
      } else {
        el.removeEventListener('input', listenerEditable);
        el.addEventListener('input', listenerEditable);
      }
    });
  }

  function processField(el, isEditable) {
    // Suporte universal: pega o texto correto do campo
    let text = (typeof isEditable === "boolean")
      ? (isEditable ? el.innerText : el.value)
      : (el.value !== undefined ? el.value : el.innerText);

    if (!text) {
      if (DEBUG) console.log("[SprintScript] processField: Campo vazio, limpando estados.");
      window.SprintScript.substitutions.clearShown(el);
      window.SprintScript.substitutions.clearIgnored(el);
      shownShortcuts.delete(el);
      return;
    }

    const substitutions = window.SprintScript.substitutions.getSubstitutions();
    const keys = Object.keys(substitutions).sort((a, b) => b.length - a.length);
    const matchedShortcut = keys.find(sub => text.endsWith(sub));

    // Limpa ignorados se o comando sumiu do campo
    keys.forEach(shortcut => {
      if (
        window.SprintScript.substitutions.wasIgnored(el, shortcut) &&
        !text.includes(shortcut)
      ) {
        window.SprintScript.substitutions.clearOneIgnored(el, shortcut);
        if (DEBUG) console.log(`[SprintScript] processField: '${shortcut}' sumiu do campo, limpando ignorados.`);
      }
    });

    const lastShownSet = shownShortcuts.get(el) || new Set();
    const lastShortcut = Array.from(lastShownSet)[0];

    if (!matchedShortcut && lastShortcut) {
      if (DEBUG) console.log("[SprintScript] processField: Atalho não está mais no final. Ocultando tooltip.");
      window.SprintScript.tooltip.hideTooltip?.();
      window.SprintScript.substitutions.clearShown(el);
      shownShortcuts.delete(el);
      return;
    }

    // Não mostra tooltip se já foi ignorado e ainda está no campo
    if (matchedShortcut && window.SprintScript.substitutions.wasIgnored(el, matchedShortcut)) {
      if (DEBUG) console.log(`[SprintScript] processField: '${matchedShortcut}' já foi ignorado e ainda está no campo, não mostra tooltip.`);
      return;
    }

    if (matchedShortcut && window.SprintScript.substitutions.alreadyShown(el, matchedShortcut)) {
      if (DEBUG) console.log(`[SprintScript] processField: '${matchedShortcut}' já foi mostrado, não mostra novamente.`);
      return;
    }

    if (!matchedShortcut) return;

    const expanded = substitutions[matchedShortcut];

    if (DEBUG) console.log(`[SprintScript] processField: Mostrando tooltip para '${matchedShortcut}' em`, el);

    window.SprintScript.tooltip.showTooltip(
      el,
      matchedShortcut,
      truncateText(expanded),
      (typeof isEditable === "boolean" ? (isEditable ? "contenteditable" : "input") : (el.isContentEditable ? "contenteditable" : "input")),
      () => {
        if (isEditable || el.isContentEditable) {
          window.SprintScript.replace.replaceInContentEditable(el, matchedShortcut, expanded);
        } else {
          window.SprintScript.replace.replaceInTextField(el, matchedShortcut, expanded);
        }
        window.SprintScript.substitutions.clearShown(el);
        shownShortcuts.delete(el);
      }
    );

    shownShortcuts.set(el, new Set([matchedShortcut]));
  }

  window.SprintScript.utils = {
    truncateText,
    addListeners,
    processField // útil para integração direta
  };
})();
