(function () {
    if (!window.SprintScript) {
      window.SprintScript = {};
    }
  
    /**
     * Substitui um atalho em um campo de texto (input ou textarea)
     * @param {HTMLInputElement|HTMLTextAreaElement} field
     * @param {string} shortcut
     * @param {string} text
     */
    function replaceInTextField(field, shortcut, text) {
      const value = field.value;
      if (!value) return;
      if (value.includes(shortcut)) {
        const newValue = value.replaceAll(shortcut, text);
        field.value = newValue;
        field.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  
    /**
     * Substitui um atalho em um campo contenteditable
     * @param {HTMLElement} el
     * @param {string} shortcut
     * @param {string} text
     */
    function replaceInContentEditable(el, shortcut, text) {
      const value = el.innerText;
      if (!value) return;
      if (value.includes(shortcut)) {
        const newValue = value.replaceAll(shortcut, text);
        el.innerText = newValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  
    window.SprintScript.replace = {
      replaceInTextField,
      replaceInContentEditable
    };
  })();
  