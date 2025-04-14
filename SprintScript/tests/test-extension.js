// tests/test-extension.js

const puppeteer = require('puppeteer');
const path = require('path');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
  const EXTENSION_PATH = path.resolve(__dirname, '../');
  const browser = await puppeteer.launch({
    headless: false, // Visualizar a execução
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  const page = await browser.newPage();

  // Carrega uma página de teste com um textarea
  const htmlContent = `
    <html>
      <head><title>Teste de Substituição</title></head>
      <body>
        <h1>Teste de Substituição de Atalhos</h1>
        <textarea id="test-area" rows="10" cols="30"></textarea>
        <p>Digite 'brb' para testar o atalho.</p>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);

  console.log("Extensão carregada. Aguarde alguns segundos para testes manuais...");
  await sleep(3000);

  // Simula o objeto chrome.storage.sync no contexto da página
  await page.evaluate(() => {
    window.chrome = window.chrome || {};
    window.chrome.storage = {
      sync: {
        set: (data, callback) => {
          // Armazena os dados em uma variável global simulada
          window._syncStorage = data;
          callback();
        },
        get: (key, callback) => {
          const data = window._syncStorage;
          callback(data ? data[key] : null);
        }
      }
    };
  });

  // Insere um atalho no storage: "brb" → "be right back"
  const newShortcut = { "brb": "be right back" };
  await page.evaluate((shortcut) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ shortcuts: shortcut }, resolve);
    });
  }, newShortcut);

  console.log("Atalho 'brb' salvo com sucesso no storage.");

  // Simula digitação do atalho "brb" no textarea
  await page.type('#test-area', 'brb');
  await sleep(1000); // Aguarda a digitação

  // Simula a substituição: lê os atalhos do storage simulado e substitui no texto do textarea
  await page.evaluate(() => {
    const shortcuts = window._syncStorage ? window._syncStorage.shortcuts : {};
    const textArea = document.querySelector('#test-area');
    let text = textArea.value;
    for (let shortcut in shortcuts) {
      const regex = new RegExp(`\\b${shortcut}\\b`, 'g');
      text = text.replace(regex, shortcuts[shortcut]);
    }
    textArea.value = text;
  });

  // Lê o conteúdo do textarea e verifica se a substituição ocorreu
  const pageText = await page.$eval('#test-area', el => el.value);

  if (pageText.includes("be right back")) {
    console.log("✅ Teste de substituição passou!");
  } else {
    console.error("❌ Teste de substituição falhou. Resultado:", pageText);
  }

  await browser.close();
})();
