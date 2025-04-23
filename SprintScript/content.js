// Variable to store dynamic shortcuts (key: command, value: substitution)
let substitutions = {};

const LOCALES = {
    en: 'locales/en-US.json',
    pt: 'locales/pt.json'
  };
  
  let i18n = {};
  let t = (k) => k;  // fallback até carregar traduções
  
  function detectLanguage() {
    const nav = navigator.language || navigator.userLanguage;
    return nav.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }
  
  async function loadLocale(lang) {
    const url = chrome.runtime.getURL(LOCALES[lang] || LOCALES.en);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Could not load locale ${lang}: ${res.statusText}`);
      return await res.json();
    } catch (e) {
      if (lang !== "en") {
        console.warn(`Failed to load ${lang}, trying 'en' as fallback.`);
        return loadLocale("en");
      }
      throw e;
    }
  }
  
  function createTranslator(dict) {
    return function (key, replacements = {}) {
      let txt = dict[key] || key;
      for (const [k, v] of Object.entries(replacements)) {
        txt = txt.replace(`__${k}__`, v);
      }
      return txt;
    };
  }
  
  // Carregar traduções ao iniciar
  setTimeout(async () => {
    try {
      const lang = detectLanguage();
      i18n = await loadLocale(lang);
      t = createTranslator(i18n);
    } catch (e) {
      console.error('i18n load error in content.js:', e);
    }
  }, 10);

// Load saved shortcuts from storage
function loadSubstitutions(callback) {
    chrome.storage.sync.get("shortcuts", (result) => {
        substitutions = result?.shortcuts || {};
        console.log("Shortcuts loaded:", substitutions);
        if (callback) callback();
    });
}

// Call initial load
loadSubstitutions();

// Listen for messages to update shortcuts dynamically
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === "updateShortcuts") {
        loadSubstitutions();
    }
});

// Create (or reuse) the tooltip element for confirmation
let tooltip = document.getElementById("sprint-tooltip");
if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "sprint-tooltip";
    // Basic styles for the tooltip (adjust as preferred)
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
    tooltip.style.overflowWrap = "break-word";
    tooltip.style.whiteSpace = "normal";
    tooltip.style.lineHeight = "1.5";
    document.body.appendChild(tooltip);
}

/**
 * Trunca o texto após X palavras, adicionando reticências.
 * @param {string} text 
 * @param {number} wordLimit 
 * @returns {string}
 */
function truncateText(text, wordLimit = 20) {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
}

/**
 * Displays the confirmation tooltip near the element.
 * @param {HTMLElement} element - The field where the shortcut was detected.
 * @param {string} shortcut - The detected shortcut (e.g., "/linkedin").
 * @param {string} text - The text to substitute.
 * @param {number} posX - Horizontal position for the tooltip.
 * @param {number} posY - Vertical position for the tooltip.
 * @param {Function} confirmCallback - Function executed if the user confirms.
 */
function showTooltip(_element, shortcut, text, posX, posY, confirmCallback) {
    tooltip.textContent = ''; // Limpar conteúdo antigo

    // Obter mensagens traduzidas
    const replaceWith = chrome.i18n.getMessage("replace_with"); 
    const withTextMessage = chrome.i18n.getMessage("with_text");

    const message = document.createElement('span');
    message.textContent = replaceWith;

    const shortcutElement = document.createElement('b');
    shortcutElement.textContent = shortcut;

    const withText = document.createElement('span');
    withText.textContent = withTextMessage;  // " por "

    const textElement = document.createElement('b');
    textElement.textContent = truncateText(text, 20);

    const confirmButton = document.createElement('button');
    confirmButton.id = 'sprint-confirm';
    confirmButton.textContent = chrome.i18n.getMessage("tooltip_confirm") || '✔'; // '✔' se não houver tradução

    const cancelButton = document.createElement('button');
    cancelButton.id = 'sprint-cancel';
    cancelButton.textContent = chrome.i18n.getMessage("tooltip_cancel") || '✖'; // '✖' se não houver tradução

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

/**
 * Calls the tooltip for confirmation and, if confirmed, performs the substitution.
 * @param {HTMLElement} field - The element (input/textarea or contenteditable).
 * @param {string} shortcut - The detected shortcut.
 * @param {string} text - The text to replace.
 * @param {string} type - "input" or "contenteditable"
 */
function confirmSubstitution(field, shortcut, text, type) {
    const rect = field.getBoundingClientRect();
    const posX = rect.left + window.scrollX + 10;
    const posY = rect.bottom + window.scrollY + 5;

    showTooltip(field, shortcut, text, posX, posY, function() {
        if (type === "input") {
            replaceInTextField(field, shortcut, text);
        } else {
            replaceInContentEditable(field, shortcut, text);
        }
    });
}

/**
 * Replaces the shortcut with text in inputs and textareas.
 * @param {HTMLInputElement|HTMLTextAreaElement} field 
 * @param {string} shortcut 
 * @param {string} text 
 */
function replaceInTextField(field, shortcut, text) {
    const value = field.value;
    if (!value) return;
    if (value.includes(shortcut)) {
        const newValue = value.replaceAll(shortcut, text);
        field.value = newValue;
        field.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

/**
 * Replaces the shortcut with text in contenteditable elements.
 * @param {HTMLElement} el 
 * @param {string} shortcut 
 * @param {string} text 
 */
function replaceInContentEditable(el, shortcut, text) {
    const value = el.innerText;
    if (!value) return;
    if (value.includes(shortcut)) {
        const newValue = value.replaceAll(shortcut, text);
        console.log(`Replacing ${shortcut} with ${text} in contenteditable`);
        el.innerText = newValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

/**
 * Processes an input/textarea field and triggers confirmation if a shortcut is found.
 * @param {HTMLInputElement|HTMLTextAreaElement} field 
 */
function processTextField(field) {
    const value = field.value;
    if (!value) return;
    Object.entries(substitutions).forEach(([shortcut, text]) => {
        if (value.includes(shortcut)) {
            confirmSubstitution(field, shortcut, text, "input");
        }
    });
}

/**
 * Processes a contenteditable element and triggers confirmation if a shortcut is found.
 * @param {HTMLElement} el 
 */
function processContentEditable(el) {
    const value = el.innerText;
    if (!value) return;
    Object.entries(substitutions).forEach(([shortcut, text]) => {
        if (value.includes(shortcut)) {
            confirmSubstitution(el, shortcut, text, "contenteditable");
        }
    });
}

function addListeners() {
    const inputs = document.querySelectorAll("input[type='text'], textarea");
    const editables = document.querySelectorAll("[contenteditable='true']");

    inputs.forEach(field => {
        // Remove old listeners to avoid duplication
        field.removeEventListener("input", listenerInput);
        field.addEventListener("input", listenerInput);
    });

    editables.forEach(el => {
        el.removeEventListener("input", listenerEditable);
        el.addEventListener("input", listenerEditable);
    });

    console.log(`Listeners added: ${inputs.length} input/textarea and ${editables.length} contenteditable`);
}

function listenerInput(e) {
    processTextField(e.target);
}

function listenerEditable(e) {
    processContentEditable(e.target);
}

addListeners();

// Observe dynamically added elements and add listeners
const observer = new MutationObserver(() => {
    addListeners();
});
observer.observe(document.body, { childList: true, subtree: true });