let currentShortcuts = {};

// Carrega os atalhos inicialmente
loadShortcuts();

// Escuta por atualizações nos atalhos
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateShortcuts") {
        loadShortcuts();
    }
});

// Observa mudanças na página para novos elementos
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                setupElements(node);
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Configura os elementos existentes
setupElements(document.body);

function loadShortcuts() {
    chrome.storage.sync.get("shortcuts", (data) => {
        currentShortcuts = data.shortcuts || {};
        console.log("Atalhos carregados:", currentShortcuts);
    });
}

function setupElements(root) {
    const textElements = root.querySelectorAll('textarea, input[type="text"]');
    
    textElements.forEach((element) => {
        // Remove event listeners antigos para evitar duplicação
        element.removeEventListener('blur', handleBlur);
        element.removeEventListener('keydown', handleKeydown);
        
        // Adiciona novos listeners
        element.addEventListener('blur', handleBlur);
        element.addEventListener('keydown', handleKeydown);
    });
}

function handleBlur(e) {
    replaceShortcuts(e.target);
}

function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === 'Tab') {
        replaceShortcuts(e.target);
    }
}

function replaceShortcuts(element) {
    if (!element.value || Object.keys(currentShortcuts).length === 0) return;
    
    let text = element.value;
    let changed = false;
    
    for (const [shortcut, replacement] of Object.entries(currentShortcuts)) {
        if (text.includes(shortcut)) {
            text = text.replace(new RegExp(escapeRegExp(shortcut), 'g'), replacement);
            changed = true;
        }
    }
    
    if (changed) {
        // Mantém a posição do cursor
        const start = element.selectionStart;
        const end = element.selectionEnd;
        
        element.value = text;
        
        // Restaura a posição do cursor
        element.setSelectionRange(start, end);
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}