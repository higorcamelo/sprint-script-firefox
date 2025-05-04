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
