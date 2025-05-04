(function () {
  if (!window.SprintScript) window.SprintScript = {};

  let tooltip = document.getElementById("sprint-tooltip");
  let autoHideTimeout;
  let keyListener;
  let currentElement; // Adicionado para rastrear o elemento atual
  let currentShortcut; // Adicionado para rastrear o atalho atual

  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "sprint-tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.background = "#fff";
    tooltip.style.color = "#000";
    tooltip.style.border = "1px solid #ccc";
    tooltip.style.padding = "10px 12px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.15)";
    tooltip.style.zIndex = "10000";
    tooltip.style.fontSize = "14px";
    tooltip.style.maxWidth = "360px";
    tooltip.style.overflowWrap = "break-word";
    tooltip.style.whiteSpace = "normal";
    tooltip.style.lineHeight = "1.5";
    tooltip.style.transition = "opacity 0.2s ease";
    document.body.appendChild(tooltip);
  }

  function hideTooltip() {
    tooltip.style.opacity = "0";
    clearTimeout(autoHideTimeout);
    document.removeEventListener("keydown", keyListener);
    setTimeout(() => {
      tooltip.style.display = "none";
      currentElement = null; // Limpa o elemento ao esconder
      currentShortcut = null; // Limpa o atalho ao esconder
    }, 200);
  }

  function showTooltip(element, shortcut, text, type, confirmCallback) {
    console.log("[SprintScript] showTooltip para atalho:", shortcut, "com texto:", text);
    clearTimeout(autoHideTimeout);
    document.removeEventListener("keydown", keyListener);

    // Armazena o elemento e atalho atuais
    currentElement = element;
    currentShortcut = shortcut;

    tooltip.innerHTML = "";

    // Cria mensagem (mantido igual)
    const span1 = document.createElement('span');
    span1.textContent = (chrome.i18n.getMessage("replace_with") || "Replace") + ' ';
    const bold1 = document.createElement('b');
    bold1.textContent = shortcut + ' ';
    const span2 = document.createElement('span');
    span2.textContent = (chrome.i18n.getMessage("with_text") || "with") + ' ';
    const bold2 = document.createElement('b');
    bold2.textContent = text;
    tooltip.appendChild(span1);
    tooltip.appendChild(bold1);
    tooltip.appendChild(span2);
    tooltip.appendChild(bold2);
    tooltip.appendChild(document.createElement('br'));

    // Botões (mantido igual)
    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = chrome.i18n.getMessage("tooltip_confirm") || '✔';
    Object.assign(btnConfirm.style, {
      margin: '6px 8px 0 0',
      padding: '4px 8px',
      background: '#4CAF50',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    });

    const btnCancel = document.createElement('button');
    btnCancel.textContent = chrome.i18n.getMessage("tooltip_cancel") || '✖';
    Object.assign(btnCancel.style, {
      margin: '6px 0 0 0',
      padding: '4px 8px',
      background: '#f44336',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    });

    tooltip.appendChild(btnConfirm);
    tooltip.appendChild(btnCancel);

    // Posicionamento dinâmico (mantido igual)
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    tooltip.style.display = 'block';
    tooltip.style.opacity = '0';
    const h = tooltip.offsetHeight;
    const w = tooltip.offsetWidth;
    let top = rect.bottom + scrollY + 6;
    if (top + h > window.innerHeight + scrollY) {
      top = rect.top + scrollY - h - 6;
    }
    let left = rect.left + scrollX;
    if (left + w > window.innerWidth + scrollX) {
      left = window.innerWidth + scrollX - w - 6;
    }
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    setTimeout(() => {
      tooltip.style.opacity = '1';
    }, 10);

    // Eventos de confirmação/esc (mantido igual)
    btnConfirm.onclick = function() {
      if (typeof confirmCallback === 'function') confirmCallback();
      hideTooltip();
    };
    btnCancel.onclick = hideTooltip;
    keyListener = function(e) {
      if (e.key === 'Enter') btnConfirm.click();
      if (e.key === 'Escape') btnCancel.click();
    };
    document.addEventListener('keydown', keyListener);

    // MODIFICAÇÃO PRINCIPAL: Auto-hide mais inteligente
    const checkForCompletion = () => {
      // Verifica se o atalho ainda está presente no elemento
      const currentValue = currentElement.value || currentElement.textContent;
      if (!currentValue.includes(currentShortcut)) {
        hideTooltip();
        return;
      }
      
      // Continua verificando a cada 100ms
      setTimeout(checkForCompletion, 100);
    };
    
    // Inicia a verificação
    checkForCompletion();
    
    // Timeout de segurança (5 segundos)
    autoHideTimeout = setTimeout(hideTooltip, 5000);
  }

  window.SprintScript.tooltip = { showTooltip };
})();