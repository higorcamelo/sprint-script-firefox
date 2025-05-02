(function () {
    // Garante que a namespace global exista
    if (!window.SprintScript) {
      window.SprintScript = {};
    }
  
    let substitutions = {};
  
    function confirmSubstitution(element, shortcut, text, type) {
      const rect = element.getBoundingClientRect();
      const posX = rect.left + window.scrollX;
      const posY = rect.top + window.scrollY - 40;
  
      window.SprintScript.tooltip.showTooltip(element, shortcut, window.SprintScript.utils.truncateText(text), posX, posY, () => {
        if (type === "input") {
          window.SprintScript.replace.replaceInTextField(element, shortcut, text);
        } else if (type === "contenteditable") {
          window.SprintScript.replace.replaceInContentEditable(element, shortcut, text);
        }
      });
    }
  
    function processField(field) {
      const value = field.value;
      if (!value) return;
      Object.entries(substitutions).forEach(([shortcut, text]) => {
        if (value.includes(shortcut)) {
          confirmSubstitution(field, shortcut, text, "input");
        }
      });
    }
  
    function processContentEditable(el) {
      const value = el.innerText;
      if (!value) return;
      Object.entries(substitutions).forEach(([shortcut, text]) => {
        if (value.includes(shortcut)) {
          confirmSubstitution(el, shortcut, text, "contenteditable");
        }
      });
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "substitutionsUpdated") {
          loadSubstitutions(() => {
              substitutions = getSubstitutions();
              console.log("Atalhos atualizados após mensagem do popup:", substitutions);
          });
      }
  });
  
    function attachListeners() {
      const inputs = document.querySelectorAll("input[type='text'], textarea");
      const editables = document.querySelectorAll("[contenteditable='true']");
  
      inputs.forEach(field => {
        field.removeEventListener("input", handleInput);
        field.addEventListener("input", handleInput);
      });
  
      editables.forEach(el => {
        el.removeEventListener("input", handleEditable);
        el.addEventListener("input", handleEditable);
      });
    }
  
    function handleInput(e) {
      processField(e.target);
    }
  
    function handleEditable(e) {
      processContentEditable(e.target);
    }
  
    // Inicialização principal
    window.SprintScript.substitutions.loadSubstitutions(() => {
      substitutions = window.SprintScript.substitutions.getSubstitutions();
      attachListeners();
    });
    
  })();
  