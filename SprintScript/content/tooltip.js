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
    tooltip.style.backdropFilter = "blur(4px)";
    tooltip.style.background = "rgba(255, 255, 255, 0.95)";
    document.body.appendChild(tooltip);
  }

  function hideTooltip() {
    tooltip.style.opacity = "0";
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
    console.log("[SprintScript] showTooltip para atalho:", shortcut, "com texto:", text);
    clearTimeout(autoHideTimeout);
    document.removeEventListener("keydown", keyListener);

    currentElement = element;
    currentShortcut = shortcut;

    if (typeof window.SprintScript.substitutions?.markAsShown === 'function') {
      window.SprintScript.substitutions.markAsShown(element, shortcut);
    }

    tooltip.innerHTML = "";

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

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = chrome.i18n.getMessage("tooltip_confirm") || '✔';
    btnConfirm.setAttribute("tabindex", "-1");
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
    btnCancel.setAttribute("tabindex", "-1");
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

    let top = 0;
    let left = 0;

    if (element.selectionStart !== undefined) {
      const caret = getCaretCoordinates(element, element.selectionStart);
      top = caret.top + window.scrollY + 20;
      left = caret.left + window.scrollX;
    } else {
      const rect = element.getBoundingClientRect();
      top = rect.bottom + 6 + window.scrollY;
      left = rect.left + window.scrollX;
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
    tooltip.style.opacity = '0';
    tooltip.style.display = 'block';
    setTimeout(() => {
      tooltip.style.opacity = '1';
    }, 10);

    btnConfirm.addEventListener("mousedown", function (e) {
      e.preventDefault();
      if (typeof confirmCallback === 'function') confirmCallback();
      hideTooltip();
    });

    btnCancel.addEventListener("mousedown", function (e) {
      e.preventDefault();
      if (typeof window.SprintScript.substitutions?.markIgnored === 'function') {
        const index = (element.value || element.textContent).lastIndexOf(shortcut);
        window.SprintScript.substitutions.markIgnored(element, shortcut, index);
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
        if (typeof window.SprintScript.substitutions?.markIgnored === 'function') {
          const index = (currentElement.value || currentElement.textContent).lastIndexOf(currentShortcut);
          window.SprintScript.substitutions.markIgnored(currentElement, currentShortcut, index);
        }
        btnCancel.dispatchEvent(new MouseEvent("mousedown"));
      }
    };
    document.addEventListener('keydown', keyListener);

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
    autoHideTimeout = setTimeout(hideTooltip, 5000);
  }

  window.SprintScript.tooltip = {
    showTooltip,
    hideTooltip
  };
})();
