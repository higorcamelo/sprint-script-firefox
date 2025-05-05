(function () {
  if (!window.SprintScript) {
    window.SprintScript = {};
  }

  const shownShortcuts = new WeakMap(); // Último atalho mostrado por campo

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
    // inclui input/textarea e contenteditable dos chats do WhatsApp e Instagram
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
    const text = isEditable ? el.innerText : el.value;
    if (!text) {
      window.SprintScript.substitutions.clearShown(el);
      shownShortcuts.delete(el);
      return;
    }

    const substitutions = window.SprintScript.substitutions.getSubstitutions();
    const keys = Object.keys(substitutions).sort((a, b) => b.length - a.length);
    const matchedShortcut = keys.find(sub => text.endsWith(sub));

    const lastShownSet = shownShortcuts.get(el) || new Set();
    const lastShortcut = Array.from(lastShownSet)[0];

    // Se não há atalho atual, mas havia um mostrado antes → esconder
    if (!matchedShortcut && lastShortcut) {
      console.log("[SprintScript] Atalho não está mais no final. Ocultando tooltip.");
      window.SprintScript.tooltip.hideTooltip?.();
      window.SprintScript.substitutions.clearShown(el);
      shownShortcuts.delete(el);
      return;
    }

    // Se já foi mostrado para esse campo, não mostrar novamente
    if (matchedShortcut && window.SprintScript.substitutions.alreadyShown(el, matchedShortcut)) {
      return;
    }

    if (!matchedShortcut) return;

    const expanded = substitutions[matchedShortcut];

    window.SprintScript.tooltip.showTooltip(
      el,
      matchedShortcut,
      window.SprintScript.utils.truncateText(expanded),
      isEditable ? "contenteditable" : "input",
      () => {
        if (isEditable) {
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
    addListeners
  };
})();
