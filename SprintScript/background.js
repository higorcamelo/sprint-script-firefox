let translations = {};

// Carregar as traduções assim que a extensão for instalada ou atualizada
chrome.runtime.onInstalled.addListener(() => {
  try {
    // Detecta o idioma do navegador (ou usa inglês como padrão)
    const lang = navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';

    // Não precisamos fazer o fetch manualmente; o chrome.i18n lida com isso
    // Agora você pode usar as mensagens diretamente da API chrome.i18n
    console.log('Traduções carregadas com sucesso');
  } catch (err) {
    console.error('Erro ao carregar traduções:', err);
  }
});

// Ouvir pedidos de tradução do content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTranslation') {
    const message = translations[request.key] || chrome.i18n.getMessage(request.key) || request.key;
    sendResponse({ message });
  }
});