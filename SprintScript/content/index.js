(function () {
  if (!window.SprintScript) {
    window.SprintScript = {};
  }

  let substitutions = {};

  function confirmSubstitution(element, shortcut, text, type) {
    window.SprintScript.tooltip.showTooltip(
      element,
      shortcut,
      window.SprintScript.utils.truncateText(text),
      type,
      () => {
        if (type === "input") {
          window.SprintScript.replace.replaceInTextField(element, shortcut, text);
        } else {
          window.SprintScript.replace.replaceInContentEditable(element, shortcut, text);
        }
      }
    );
  }

  function handleInput(e) {
    processField(e.target);
  }

  function handleEditable(e) {
    processContentEditable(e.target);
  }

  // Função que processa o campo de entrada
  function processField(field) {
    const text = field.value; // Pega o conteúdo do campo de texto
    if (substitutions) {
      Object.keys(substitutions).forEach(shortcut => {
        const replacement = substitutions[shortcut];
        if (text.includes(shortcut)) {
          // Chamando a função de substituição confirmada
          confirmSubstitution(field, shortcut, replacement, 'input');
        }
      });
    }
  }

  function processContentEditable(el) {
    const text = el.innerText; // Pega o conteúdo do conteúdo editável
    if (substitutions) {
      Object.keys(substitutions).forEach(shortcut => {
        const replacement = substitutions[shortcut];
        if (text.includes(shortcut)) {
          // Chamando a função de substituição confirmada
          confirmSubstitution(el, shortcut, replacement, 'contenteditable');
        }
      });
    }
  }

  function attachListeners() {
    document.querySelectorAll("input[type='text'], textarea").forEach(field => {
      field.removeEventListener("input", handleInput);
      field.addEventListener("input", handleInput);
    });
    document.querySelectorAll("[contenteditable='true']").forEach(el => {
      el.removeEventListener("input", handleEditable);
      el.addEventListener("input", handleEditable);
    });
  }

  window.SprintScript.substitutions.loadSubstitutions(() => {
    substitutions = window.SprintScript.substitutions.getSubstitutions();
    window.SprintScript.utils.addListeners();
    attachListeners();
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "substitutionsUpdated") {
      window.SprintScript.substitutions.loadSubstitutions(() => {
        substitutions = window.SprintScript.substitutions.getSubstitutions();
        window.SprintScript.utils.addListeners();
        attachListeners();
      });
    }
  });
})();
