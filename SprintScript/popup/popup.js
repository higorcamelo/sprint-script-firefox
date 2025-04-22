let i18n = {};   // Vai guardar as traduções
const LOCALES = {
  en: '_locales/en/messages.json',  // Caminho correto para o arquivo de tradução em inglês
  pt: '_locales/pt/messages.json'  // Caminho correto para o arquivo de tradução em português
};

// Detecta o idioma do navegador, retornando "pt" ou "en"
function detectLanguage() {
  const nav = navigator.language || navigator.userLanguage;  // ex: "pt-BR", "en-US"
  const lang = nav.toLowerCase().startsWith('pt') ? 'pt' : 'en';  // Definindo 'lang'
  console.log("Idioma detectado:", lang);  // Mostrando o idioma no console
  return lang;
}

// Carrega o JSON de traduções dentro da extensão
async function loadLocale(lang) {
  const url = chrome.runtime.getURL(LOCALES[lang] || LOCALES.en);  // Corrigido o caminho
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load locale ' + lang);
  return await res.json();
}

// Aplica as traduções em todo elemento que tenha data-i18n="CHAVE"
function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const txt = dict[key];
    if (!txt) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = txt;
    } else {
      el.textContent = txt;
    }
  });
}

// Inicializa tudo após o DOM estar pronto
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const lang = detectLanguage();  // Detectando o idioma
    i18n = await loadLocale(lang);  // Carregando as traduções para o idioma detectado
    applyTranslations(i18n);  // Aplicando as traduções
  } catch (e) {
    console.error('i18n load error:', e);
  }

  loadShortcuts();
  document.getElementById("saveButton")
          .addEventListener("click", saveShortcut);
});

function saveShortcut() {
  const shortcut    = document.getElementById("shortcut").value.trim();
  const replacement = document.getElementById("replacement").value.trim();

  if (!shortcut || !replacement) {
    showMessage(i18n.error_fill_fields, "error");
    return;
  }

  chrome.storage.sync.get(["shortcuts"], (result) => {
    const shortcuts = result?.shortcuts || {};

    if (shortcuts[shortcut]) {
      openConfirmModal(() => {
        shortcuts[shortcut] = replacement;
        saveAndRefresh(shortcuts, shortcut);
      });
    } else {
      shortcuts[shortcut] = replacement;
      saveAndRefresh(shortcuts, shortcut);
    }
  });
}

function saveAndRefresh(shortcuts, shortcut) {
  chrome.storage.sync.set({ shortcuts }, () => {
    if (chrome.runtime.lastError) {
      showMessage(i18n.message_error + chrome.runtime.lastError.message, "error");
      return;
    }
    showMessage(i18n.message_saved, "success");
    document.getElementById("shortcut").value    = "";
    document.getElementById("replacement").value = "";
    loadShortcuts();

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateShortcuts" });
    });
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
    list.innerHTML = "";

    if (Object.keys(shortcuts).length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = i18n.no_shortcuts;
      list.appendChild(li);
      return;
    }

    Object.entries(shortcuts).forEach(([sc, txt]) => {
      const li = document.createElement("li");
      // atalho → texto
      li.innerHTML = `<strong>${sc}</strong> → <span class="substitution">${txt}</span>`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = i18n.delete_button;
      deleteBtn.classList.add("delete-btn");

      deleteBtn.addEventListener("click", () => {
        openConfirmModal(() => {
          delete shortcuts[sc];
          chrome.storage.sync.set({ shortcuts }, () => {
            showMessage(i18n.delete_success, "success");
            loadShortcuts();
          });
        });
      });

      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
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

// Modal de confirmação
function openConfirmModal(onConfirm) {
  const modal      = document.getElementById("confirmModal");
  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn  = document.getElementById("cancelDelete");
  modal.classList.remove("hidden");

  function cleanup() {
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
    modal.classList.add("hidden");
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
