(function () {
  if (!window.SprintScript) window.SprintScript = {};

  let tooltip = document.getElementById("sprint-tooltip");
  let autoHideTimeout;
  let keyListener;
  let currentElement;
  let currentShortcut;

  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "sprint-tooltip";
    
    // Estilo modernizado e compacto do tooltip
    Object.assign(tooltip.style, {
      position: "absolute",
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      color: "#1f2937",
      border: "1px solid #e5e7eb",
      padding: "8px 12px",
      borderRadius: "8px",
      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06)",
      zIndex: "10000",
      fontSize: "13px", // Aumentado de "12px" para "13px"
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      maxWidth: "350px",
      minWidth: "250px",
      overflowWrap: "break-word",
      whiteSpace: "normal",
      lineHeight: "1.3",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(4px)",
      display: "none",
      opacity: "0"
    });
    
    document.body.appendChild(tooltip);
  }

  function hideTooltip() {
    tooltip.style.opacity = "0";
    tooltip.style.transform = "translateY(3px) scale(0.96)";
    clearTimeout(autoHideTimeout);
    document.removeEventListener("keydown", keyListener);
    setTimeout(() => {
      tooltip.style.display = "none";
      currentElement = null;
      currentShortcut = null;
    }, 200);
  }

  function getCaretCoordinates(input, position) {
    const div = document.createElement("div");
    const style = getComputedStyle(input);
    for (const prop of style) {
      div.style[prop] = style[prop];
    }
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.style.width = input.offsetWidth + "px";
    div.textContent = input.value.substring(0, position);
    const span = document.createElement("span");
    span.textContent = input.value.substring(position) || ".";
    div.appendChild(span);
    document.body.appendChild(div);
    const rect = span.getBoundingClientRect();
    document.body.removeChild(div);
    return rect;
  }

  function showTooltip(element, shortcut, text, type, confirmCallback) {
    clearTimeout(autoHideTimeout);
    document.removeEventListener("keydown", keyListener);

    currentElement = element;
    currentShortcut = shortcut;

    tooltip.innerHTML = "";

    // Container principal
    const container = document.createElement('div');
    Object.assign(container.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    });

    // Texto de confirmação (voltou!)
    const confirmText = document.createElement('div');
    Object.assign(confirmText.style, {
      color: '#6b7280',
      fontSize: '12px', // Aumentado de '11px' para '12px'
      lineHeight: '1.3', // Aumentado de '1.2' para '1.3'
      marginBottom: '2px'
    });
    
    // Truncar textos longos para evitar quebras
    const displayShortcut = shortcut.length > 15 ? shortcut.substring(0, 15) + '...' : shortcut;
    const displayText = text.length > 30 ? text.substring(0, 30) + '...' : text;

    // SEGURO: Usa textContent em vez de innerHTML
    confirmText.innerHTML = '';
    const substituirText = document.createTextNode((chrome.i18n.getMessage("replace_with") || "Substituir") + ' ');
    const shortcutSpan = document.createElement('strong');
    shortcutSpan.style.color = '#2563eb';
    shortcutSpan.textContent = displayShortcut;
    const porText = document.createTextNode(' ' + (chrome.i18n.getMessage("with_text") || "por") + ' ');
    const textSpan = document.createElement('strong');
    textSpan.style.color = '#059669';
    textSpan.textContent = displayText;
    const questionText = document.createTextNode('?');

    confirmText.appendChild(substituirText);
    confirmText.appendChild(shortcutSpan);
    confirmText.appendChild(porText);
    confirmText.appendChild(textSpan);
    confirmText.appendChild(questionText);

    // Container dos botões
    const buttonsContainer = document.createElement('div');
    Object.assign(buttonsContainer.style, {
      display: 'flex',
      gap: '6px',
      justifyContent: 'flex-end'
    });

    // Botão de confirmar
    const btnConfirm = document.createElement('button');
    btnConfirm.innerHTML = '✓';
    Object.assign(btnConfirm.style, {
      padding: '4px 8px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px', // Aumentado de '11px' para '12px'
      fontWeight: '600',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '24px',
      height: '22px'
    });

    // Botão de cancelar
    const btnCancel = document.createElement('button');
    btnCancel.innerHTML = '✕';
    Object.assign(btnCancel.style, {
      padding: '4px 8px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px', // Aumentado de '11px' para '12px'
      fontWeight: '600',
      transition: 'all 0.15s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '24px',
      height: '22px'
    });

    // Hover effects
    btnConfirm.addEventListener('mouseenter', () => {
      btnConfirm.style.transform = 'scale(1.05)';
      btnConfirm.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
    });
    btnConfirm.addEventListener('mouseleave', () => {
      btnConfirm.style.transform = 'scale(1)';
      btnConfirm.style.boxShadow = 'none';
    });

    btnCancel.addEventListener('mouseenter', () => {
      btnCancel.style.transform = 'scale(1.05)';
      btnCancel.style.boxShadow = '0 2px 6px rgba(239, 68, 68, 0.3)';
    });
    btnCancel.addEventListener('mouseleave', () => {
      btnCancel.style.transform = 'scale(1)';
      btnCancel.style.boxShadow = 'none';
    });

    buttonsContainer.appendChild(btnCancel);
    buttonsContainer.appendChild(btnConfirm);
    
    container.appendChild(confirmText);
    container.appendChild(buttonsContainer);
    tooltip.appendChild(container);

    // Calcula posição
    let top = 0;
    let left = 0;
    if (element.selectionStart !== undefined) {
      const caret = getCaretCoordinates(element, element.selectionStart);
      top = caret.top + window.scrollY + 16;
      left = caret.left + window.scrollX;
    } else {
      const rect = element.getBoundingClientRect();
      top = rect.bottom + 6 + window.scrollY;
      left = rect.left + window.scrollX;
    }

    // Ajusta posição para não sair da tela
    setTimeout(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
        tooltip.style.left = left + 'px';
      }
      if (left < 10) {
        left = 10;
        tooltip.style.left = left + 'px';
      }
    }, 20);

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.style.display = 'block';
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(3px) scale(0.96)';
    
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0) scale(1)';
    }, 10);

    // Event listeners
    btnConfirm.addEventListener("mousedown", function (e) {
      e.preventDefault();
      if (typeof confirmCallback === 'function') confirmCallback();
      hideTooltip();
    });

    btnCancel.addEventListener("mousedown", function (e) {
      e.preventDefault();
      if (typeof window.SprintScript.substitutions?.markIgnored === 'function') {
        window.SprintScript.substitutions.markIgnored(element, shortcut);
        window.SprintScript.substitutions.clearShown(element);
      }
      hideTooltip();
    });

    keyListener = function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnConfirm.dispatchEvent(new MouseEvent("mousedown"));
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        btnCancel.dispatchEvent(new MouseEvent("mousedown"));
      }
    };
    document.addEventListener('keydown', keyListener);

    // Auto-hide e verificação
    const checkForCompletion = () => {
      if (!currentElement) {
        hideTooltip();
        return;
      }
      const currentValue = currentElement.value || currentElement.textContent;
      if (!currentValue.includes(currentShortcut)) {
        hideTooltip();
        return;
      }
      setTimeout(checkForCompletion, 100);
    };

    checkForCompletion();
    autoHideTimeout = setTimeout(() => {
      hideTooltip();
    }, 5000);
  }

  window.SprintScript.tooltip = {
    showTooltip,
    hideTooltip
  };
})();
