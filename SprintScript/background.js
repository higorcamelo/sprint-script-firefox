let translations = {};

// Carregar as traduções assim que a extensão for instalada ou atualizada
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const lang = navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
    const localeFile = lang === 'pt' ? 'locales/pt.json' : 'locales/en-US.json';
    
    const res = await fetch(chrome.runtime.getURL(localeFile));
    translations = await res.json();
    console.log('Traduções carregadas com sucesso');
  } catch (err) {
    console.error('Erro ao carregar traduções:', err);
  }
});

// Ouvir pedidos de tradução do content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTranslation') {
    const message = translations[request.key] || request.key;
    sendResponse({ message });
  }
});
