(function () {
    if (!window.SprintScript) {
      window.SprintScript = {};
    }
  
    let tooltip = document.getElementById("sprint-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "sprint-tooltip";
      tooltip.style.position = "absolute";
      tooltip.style.background = "#fff";
      tooltip.style.border = "1px solid #ccc";
      tooltip.style.padding = "10px 12px";
      tooltip.style.borderRadius = "8px";
      tooltip.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.15)";
      tooltip.style.zIndex = 9999;
      tooltip.style.fontSize = "14px";
      tooltip.style.display = "none";
      tooltip.style.maxWidth = "400px";
      tooltip.style.overflowWrap = "break-word";
      tooltip.style.whiteSpace = "normal";
      tooltip.style.lineHeight = "1.5";
      document.body.appendChild(tooltip);
    }
  
    function showTooltip(_element, shortcut, text, posX, posY, confirmCallback) {
      tooltip.textContent = ''; // Limpar conteúdo antigo
  
      const replaceWith = chrome.i18n.getMessage("replace_with");
      const withTextMessage = chrome.i18n.getMessage("with_text");
  
      const message = document.createElement('span');
      message.textContent = replaceWith;
  
      const shortcutElement = document.createElement('b');
      shortcutElement.textContent = shortcut;
  
      const withText = document.createElement('span');
      withText.textContent = withTextMessage;
  
      const textElement = document.createElement('b');
      textElement.textContent = text;
  
      const confirmButton = document.createElement('button');
      confirmButton.id = 'sprint-confirm';
      confirmButton.textContent = chrome.i18n.getMessage("tooltip_confirm") || '✔';
  
      const cancelButton = document.createElement('button');
      cancelButton.id = 'sprint-cancel';
      cancelButton.textContent = chrome.i18n.getMessage("tooltip_cancel") || '✖';
  
      tooltip.appendChild(message);
      tooltip.appendChild(shortcutElement);
      tooltip.appendChild(withText);
      tooltip.appendChild(textElement);
      tooltip.appendChild(confirmButton);
      tooltip.appendChild(cancelButton);
  
      tooltip.style.left = posX + "px";
      tooltip.style.top = posY + "px";
      tooltip.style.display = "block";
  
      confirmButton.onclick = function () {
        confirmCallback();
        tooltip.style.display = "none";
      };
  
      cancelButton.onclick = function () {
        tooltip.style.display = "none";
      };
    }
  
    // Expor no namespace global da extensão
    window.SprintScript.tooltip = {
      showTooltip,
      confirmSubstitution: showTooltip // alias por compatibilidade com código existente
    };
  })();
  