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
    document.querySelectorAll("input[type='text'], textarea").forEach(field => {
      field.removeEventListener("input", listenerInput);
      field.addEventListener("input", listenerInput);
    });
    document.querySelectorAll("[contenteditable='true']").forEach(el => {
      el.removeEventListener("input", listenerEditable);
      el.addEventListener("input", listenerEditable);
    });
  }

  function processField(el, isEditable) {
    const text = isEditable ? el.innerText : el.value;
    if (!text) {
      window.SprintScript.substitutions.clearShown(el);
      return;
    }

    const shortcut = window.SprintScript.substitutions.findMatchingShortcut(text);
    if (!shortcut) {
      window.SprintScript.substitutions.clearShown(el);
      return;
    }
    if (window.SprintScript.substitutions.alreadyShown(el, shortcut)) return;

    const expanded = window.SprintScript.substitutions.getSubstitutions()[shortcut];
    window.SprintScript.tooltip.showTooltip(
      el,
      shortcut,
      truncateText(expanded),
      isEditable ? "contenteditable" : "input",
      () => {
        if (isEditable) {
          window.SprintScript.replace.replaceInContentEditable(el, shortcut, expanded);
        } else {
          window.SprintScript.replace.replaceInTextField(el, shortcut, expanded);
        }
        window.SprintScript.substitutions.clearShown(el);
      }
    );
  }

  window.SprintScript.utils = {
    truncateText,
    addListeners
  };
})();
