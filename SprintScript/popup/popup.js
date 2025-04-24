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
  document.getElementById("saveButton")
          .addEventListener("click", saveShortcut);
});

function saveShortcut() {
  const shortcut    = document.getElementById("shortcut").value.trim();
  const replacement = document.getElementById("replacement").value.trim();

  if (!shortcut || !replacement) {
    showMessage(t("error_fill_fields"), "error");
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
      showMessage(t("message_error") + chrome.runtime.lastError.message, "error");
      return;
    }
    showMessage(t("message_saved"), "success");
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

      deleteBtn.addEventListener("click", () => {
        openConfirmModal(() => {
          delete shortcuts[sc];
          chrome.storage.sync.set({ shortcuts }, () => {
            showMessage(t("delete_success"), "success");
            loadShortcuts(); // Recarregar a lista após exclusão
          });
        });
      });

      li.appendChild(deleteBtn);
      list.appendChild(li); // Adiciona o item à lista
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
