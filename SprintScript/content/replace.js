(function () {
  if (!window.SprintScript) {
    window.SprintScript = {};
  }

  function replaceInTextField(field, shortcut, text) {
    console.log("[SprintScript] Dentro do replaceInTextField. Value:", field.value);
    const value = field.value;
    if (!value) return;
    if (value.includes(shortcut)) {
      const newValue = value.replaceAll(shortcut, text);
      field.value = newValue;
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function replaceInContentEditable(el, shortcut, fullText) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
  
    const range = selection.getRangeAt(0);
    const endContainer = range.endContainer;
    const text = endContainer.textContent;
    if (!text.endsWith(shortcut)) return;
  
    // Remove o atalho do final e adiciona o texto completo
    const newText = text.slice(0, -shortcut.length) + fullText;
    endContainer.textContent = newText;
  
    // Reposiciona o cursor no final do novo texto
    const newRange = document.createRange();
    newRange.setStart(endContainer, newText.length);
    newRange.setEnd(endContainer, newText.length);
    selection.removeAllRanges();
    selection.addRange(newRange);
  
    // Dispara evento de input para frameworks reativos
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  window.SprintScript.replace = {
    replaceInTextField,
    replaceInContentEditable
  };
})();
