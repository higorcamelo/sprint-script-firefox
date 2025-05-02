(function () {
  if (!window.SprintScript) {
    window.SprintScript = {};
  }

  /**
   * Trunca um texto para um número máximo de palavras
   * @param {string} text
   * @param {number} wordLimit
   * @returns {string}
   */
  function truncateText(text, wordLimit = 20) {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  }

  function listenerInput(e) {
    processTextField(e.target);
  }

  function listenerEditable(e) {
    processContentEditable(e.target);
  }

  function addListeners() {
    const inputs = document.querySelectorAll("input[type='text'], textarea");
    const editables = document.querySelectorAll("[contenteditable='true']");

    inputs.forEach(field => {
      field.removeEventListener("input", listenerInput);
      field.addEventListener("input", listenerInput);
    });

    editables.forEach(el => {
      el.removeEventListener("input", listenerEditable);
      el.addEventListener("input", listenerEditable);
    });
  }

  function processTextField(field) {
    const value = field.value;
    if (!value) return;
    const substitutions = window.SprintScript.substitutions?.getSubstitutions?.() || {};
    Object.entries(substitutions).forEach(([shortcut, text]) => {
      if (value.includes(shortcut)) {
        window.SprintScript.tooltip.confirmSubstitution(
          field,
          shortcut,
          text,
          "input",
          () => {
            window.SprintScript.replace.replaceInTextField(field, shortcut, text);
          }
        );
      }
    });
  }

  function processContentEditable(el) {
    const value = el.innerText;
    if (!value) return;
    const substitutions = window.SprintScript.substitutions?.getSubstitutions?.() || {};
    Object.entries(substitutions).forEach(([shortcut, text]) => {
      if (value.includes(shortcut)) {
        window.SprintScript.tooltip.confirmSubstitution(
          el,
          shortcut,
          text,
          "contenteditable",
          () => {
            window.SprintScript.replace.replaceInContentEditable(el, shortcut, text);
          }
        );
      }
    });
  }

  // Expor publicamente
  window.SprintScript.utils = {
    truncateText,
    addListeners,
  };
})();
