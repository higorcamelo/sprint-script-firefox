let i18n = {};   // Vai guardar as traduções
const LOCALES = {
  en: '_locales/en/messages.json',
  pt: '_locales/pt/messages.json'
};

function detectLanguage() {
  const nav = navigator.language || navigator.userLanguage;
  const lang = nav.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  return lang;
}

async function loadLocale(lang) {
  const url = chrome.runtime.getURL(LOCALES[lang] || LOCALES.en);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load locale ' + lang);
  return await res.json();
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const txt = dict[key];
    if (!txt) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = txt.message || txt;
    } else {
      el.textContent = txt.message || txt;
    }
  });
}

function t(key) {
  const val = i18n[key];
  return typeof val === 'string' ? val : val?.message || '';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const lang = detectLanguage();
    i18n = await loadLocale(lang);
    applyTranslations(i18n);
  } catch (e) {
    console.error('i18n load error:', e);
  }

  loadShortcuts();
  const btn = document.getElementById("saveButton");
  btn.addEventListener("click", () => {
    btn.disabled = true;
    saveShortcut().finally(() => {
      btn.disabled = false;
    });
  });

  document.getElementById("shortcut").focus();
  setupCharCounters();
  setupKeyboardShortcuts();
  updateStats();
});

function saveShortcut() {
  const shortcut    = document.getElementById("shortcut").value.trim();
  const replacement = document.getElementById("replacement").value.trim();

  if (!shortcut || !replacement) {
    showMessage(t("error_fill_fields"), "error");
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    chrome.storage.sync.get(["shortcuts"], (result) => {
      const shortcuts = result?.shortcuts || {};

      if (shortcuts[shortcut]) {
        openConfirmModal(() => {
          shortcuts[shortcut] = replacement;
          saveAndRefresh(shortcuts, shortcut, resolve);
        });
      } else {
        shortcuts[shortcut] = replacement;
        saveAndRefresh(shortcuts, shortcut, resolve);
      }
    });
  });
}

function saveAndRefresh(shortcuts, shortcut, resolve) {
  chrome.storage.sync.set({ shortcuts }, () => {
    if (chrome.runtime.lastError) {
      let msg = chrome.runtime.lastError.message;
      if (msg.includes("QUOTA_BYTES")) {
        showMessage(t("storage_limit_error") || "Limite de armazenamento atingido.", "error");
      } else {
        showMessage(t("message_error") + msg, "error");
      }
      resolve();
      return;
    }
    showMessage(t("message_saved"), "success");
    document.getElementById("shortcut").value    = "";
    document.getElementById("replacement").value = "";
    document.getElementById("shortcut").focus(); // <-- foca após salvar
    loadShortcuts();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateShortcuts" });
    });
    updateStats();
    resolve();
  });
}

function loadShortcuts() {
  chrome.storage.sync.get(["shortcuts"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading shortcuts:", chrome.runtime.lastError);
      return;
    }

    const shortcuts = result?.shortcuts || {};
    const list = document.getElementById("shortcutList");
    list.innerHTML = ""; // Limpa a lista antes de preenchê-la

    if (Object.keys(shortcuts).length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = t("no_shortcuts"); // Apenas texto
      list.appendChild(li);
      return;
    }

    Object.entries(shortcuts).forEach(([sc, txt]) => {
      const li = document.createElement("li");

      const strong = document.createElement("strong");
      strong.textContent = sc; 

      const span = document.createElement("span");
      span.classList.add("substitution");
      span.textContent = txt;

      li.appendChild(strong);
      li.appendChild(document.createTextNode(" → "));
      li.appendChild(span);

      // Criar o botão de exclusão
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = t("delete_button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.setAttribute("aria-label", t("delete_button") + " " + sc);
      deleteBtn.setAttribute("tabindex", "0");

      deleteBtn.addEventListener("click", () => {
        openConfirmModal(() => {
          delete shortcuts[sc];
          chrome.storage.sync.set({ shortcuts }, () => {
            showMessage(t("delete_success"), "success");
            loadShortcuts(); // Recarregar a lista após exclusão
          });
        }, sc); // Passa o atalho para a função de confirmação
      });

      li.appendChild(deleteBtn);
      list.appendChild(li); // Adiciona o item à lista
    });
  });
}

// Contador de caracteres
function setupCharCounters() {
  const shortcutInput = document.getElementById('shortcut');
  const replacementInput = document.getElementById('replacement');
  const shortcutCount = document.getElementById('shortcut-count');
  const replacementCount = document.getElementById('replacement-count');

  function updateCounter(input, counter, max) {
    const length = input.value.length;
    counter.textContent = `${length}/${max}`;
    
    counter.classList.remove('warning', 'danger');
    if (length > max * 0.8) counter.classList.add('warning');
    if (length > max * 0.95) counter.classList.add('danger');
  }

  shortcutInput.addEventListener('input', () => updateCounter(shortcutInput, shortcutCount, 50));
  replacementInput.addEventListener('input', () => updateCounter(replacementInput, replacementCount, 2000));
}

// Estatísticas simples
function updateStats() {
  chrome.storage.sync.get(['shortcuts'], (result) => {
    const count = Object.keys(result?.shortcuts || {}).length;
    const statsEl = document.getElementById('stats');
    if (statsEl) {
      statsEl.querySelector('[data-i18n="total_shortcuts"]').textContent = 
        t('total_shortcuts').replace('0', count);
    }
  });
}

// Atalhos de teclado
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.getElementById('saveButton').click();
    }
  });
}

function showMessage(message, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = message;
  messageDiv.className   = type;
  messageDiv.style.display = "block";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 2500);
}

function openConfirmModal(onConfirm, shortcut) {
  const modal      = document.getElementById("confirmModal");
  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn  = document.getElementById("cancelDelete");
  modal.classList.remove("hidden");

  // Atualiza o texto da confirmação com o atalho, se disponível
  document.querySelector('#confirmModal [data-i18n="confirm_delete"]').textContent =
    t("confirm_delete") + (shortcut ? ` (${shortcut})?` : "");

  function cleanup() {
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
    modal.classList.add("hidden");
    document.querySelector('#confirmModal [data-i18n="confirm_delete"]').textContent = t("confirm_delete");
  }
  function handleConfirm() {
    onConfirm();
    cleanup();
  }
  function handleCancel() {
    cleanup();
  }

  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn .addEventListener("click", handleCancel);
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.shortcuts) {
    loadShortcuts();
  }
});

// Função para validar o atalho
function validateShortcut(shortcut) {
  if (shortcut.length < 2) return "Atalho muito curto";
  if (shortcut.length > 50) return "Atalho muito longo";
  if (!/^[a-zA-Z0-9\/\-_]+$/.test(shortcut)) return "Caracteres inválidos";
  return null;
}

// Para campos contenteditable
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}
