(function () {
  if (!window.SprintScript) {
    window.SprintScript = {};
  }

  let tooltip = document.getElementById("sprint-tooltip");
  let autoHideTimeout;
  let keyListener;

  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "sprint-tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.background = "#fff";
    tooltip.style.border = "1px solid #333";  // Borda escura para contraste
    tooltip.style.padding = "10px 12px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.8)";  // Sombra mais forte
    tooltip.style.zIndex = 9999;
    tooltip.style.fontSize = "14px";
    tooltip.style.display = "none";
    tooltip.style.maxWidth = "400px";
    tooltip.style.overflowWrap = "break-word";
    tooltip.style.whiteSpace = "normal";
    tooltip.style.lineHeight = "1.5";
    tooltip.style.transition = "all 0.3s ease";
    tooltip.style.color = "#fff";  // Texto branco para contraste
    document.body.appendChild(tooltip);
  }

  function hideTooltip() {
    tooltip.style.display = "none";
    clearTimeout(autoHideTimeout);
    document.removeEventListener("keydown", keyListener);
  }

  function showTooltip(element, shortcut, text, type, confirmCallback) {
    tooltip.innerHTML = '';

    const replaceWith = chrome.i18n.getMessage("replace_with") || "Replace";
    const withTextMessage = chrome.i18n.getMessage("with_text") || "with";

    const message = document.createElement('span');
    message.textContent = replaceWith + " ";

    const shortcutElement = document.createElement('b');
    shortcutElement.textContent = shortcut + " ";

    const withText = document.createElement('span');
    withText.textContent = withTextMessage + " ";

    const textElement = document.createElement('b');
    textElement.textContent = text;

    const confirmButton = document.createElement('button');
    confirmButton.id = 'sprint-confirm';
    confirmButton.textContent = chrome.i18n.getMessage("tooltip_confirm") || '✔';
    confirmButton.style.padding = '5px 10px';
    confirmButton.style.backgroundColor = '#4CAF50';
    confirmButton.style.color = '#fff';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '5px';
    confirmButton.style.cursor = 'pointer';
    confirmButton.style.marginRight = '8px';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'sprint-cancel';
    cancelButton.textContent = chrome.i18n.getMessage("tooltip_cancel") || '✖';
    cancelButton.style.padding = '5px 10px';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = '#fff';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';

    tooltip.appendChild(message);
    tooltip.appendChild(shortcutElement);
    tooltip.appendChild(withText);
    tooltip.appendChild(textElement);
    tooltip.appendChild(document.createElement("br"));
    tooltip.appendChild(confirmButton);
    tooltip.appendChild(cancelButton);

    const rect = element.getBoundingClientRect();

    let tooltipTop = rect.bottom + window.scrollY + 8;
    let tooltipLeft = rect.left + window.scrollX;

    const tooltipHeight = tooltip.offsetHeight;
    const windowHeight = window.innerHeight;

    // Se o tooltip estiver muito perto da parte inferior da tela, ajusta para cima
    if (tooltipTop + tooltipHeight > windowHeight) {
      tooltipTop = rect.top + window.scrollY - tooltipHeight - 8;
    }

    tooltip.style.left = tooltipLeft + "px";
    tooltip.style.top = tooltipTop + "px";
    tooltip.style.display = "block";

    // Confirmar via botão
    confirmButton.onclick = function () {
      if (typeof confirmCallback === "function") {
        confirmCallback();
      }
      hideTooltip();
    };

    // Cancelar via botão
    cancelButton.onclick = function () {
      hideTooltip();
    };

    // Confirmar via Enter, cancelar via Esc
    keyListener = function (e) {
      if (e.key === "Enter") {
        confirmButton.click();
      } else if (e.key === "Escape") {
        cancelButton.click();
      }
    };
    document.addEventListener("keydown", keyListener);

    // Auto esconder após 6 segundos sem interação
    autoHideTimeout = setTimeout(() => {
      hideTooltip();
    }, 6000);
  }

  window.SprintScript.tooltip = {
    showTooltip,
    confirmSubstitution: showTooltip
  };
})();
