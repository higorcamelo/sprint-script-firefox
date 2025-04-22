// Variable to store dynamic shortcuts (key: command, value: substitution)
let substitutions = {};

// A URL correta para os arquivos JSON
const enURL = browser.runtime.getURL('locales/en-US.json');
const ptURL = browser.runtime.getURL('locales/pt.json');

// Função para carregar e imprimir os JSONs
function loadAndPrintLocales() {
    fetch(enURL)
        .then(response => response.json())
        .then(data => {
            console.log('Conteúdo do en-US.json:', data);
        })
        .catch(error => {
            console.error('Erro ao carregar o en-US.json:', error);
        });
    
    fetch(ptURL)
        .then(response => response.json())
        .then(data => {
            console.log('Conteúdo do pt.json:', data);
        })
        .catch(error => {
            console.error('Erro ao carregar o pt.json:', error);
        });
}


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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateShortcuts") {
        loadSubstitutions();
    }
});

// Function to detect the language from the browser
function detectLanguage() {
  const nav = navigator.language || navigator.userLanguage; // Example: "pt-BR", "en-US"
  return nav.toLowerCase().startsWith('pt') ? 'pt' : 'en-US';
}

// Load translation JSON
async function loadLocale(lang) {
  const url = chrome.runtime.getURL(LOCALES[lang] || LOCALES.en);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load locale ' + lang);
  return await res.json();
}

// Apply translations dynamically
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

// Initialize translations and update UI
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const lang = detectLanguage();
    i18n = await loadLocale(lang);
    applyTranslations(i18n);
  } catch (e) {
    console.error('i18n load error:', e);
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
    tooltip.style.wordWrap = "break-word";
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
function showTooltip(element, shortcut, text, posX, posY, confirmCallback) {
    // Limpar conteúdo antigo do tooltip
    tooltip.textContent = ''; // Remover conteúdo anterior

    // Substituir a construção do HTML com innerHTML por criar elementos de forma segura
    const message = document.createElement('span');
    // A chave do JSON é usada diretamente, e se não houver tradução, o fallback é o texto padrão.
    message.textContent = i18n.replace_with || "Não tá "; 
    
    const shortcutElement = document.createElement('b');
    shortcutElement.textContent = shortcut;

    const withText = document.createElement('span');
    // Usamos diretamente a tradução do JSON, se disponível, caso contrário, utilizamos o fallback.
    withText.textContent = i18n.with_text || "Funcionando"; 

    const textElement = document.createElement('b');
    textElement.textContent = truncateText(text, 20); // Trunca o texto após 20 palavras

    const confirmButton = document.createElement('button');
    confirmButton.id = 'sprint-confirm';
    confirmButton.textContent = i18n.confirm_button || "✔"; // Utilizando a tradução diretamente

    const cancelButton = document.createElement('button');
    cancelButton.id = 'sprint-cancel';
    cancelButton.textContent = i18n.cancel_button || "✖"; // Utilizando a tradução diretamente

    // Adiciona os elementos criados ao tooltip
    tooltip.appendChild(message);
    tooltip.appendChild(shortcutElement);
    tooltip.appendChild(withText);
    tooltip.appendChild(textElement);
    tooltip.appendChild(confirmButton);
    tooltip.appendChild(cancelButton);

    // Posicionar e exibir o tooltip
    tooltip.style.left = posX + "px";
    tooltip.style.top = posY + "px";
    tooltip.style.display = "block";

    // Ação ao clicar no botão de confirmação
    confirmButton.onclick = function() {
        confirmCallback();
        tooltip.style.display = "none";
    };

    // Ação ao clicar no botão de cancelamento
    cancelButton.onclick = function() {
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
        console.log(`Replacing ${shortcut} with ${text} in input`);
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
        // Remove old listeners to avoid duplication
        el.removeEventListener("input", listenerContentEditable);
        el.addEventListener("input", listenerContentEditable);
    });
}

// Add listeners to fields dynamically
function listenerInput(event) {
    processTextField(event.target);
}

function listenerContentEditable(event) {
    processContentEditable(event.target);
}

// Initialize listeners after the page is loaded
addListeners();
loadAndPrintLocales();

