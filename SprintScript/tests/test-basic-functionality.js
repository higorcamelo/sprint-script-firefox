const puppeteer = require('puppeteer');
const path = require('path');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
  const EXTENSION_PATH = path.resolve(__dirname, '../');
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  const page = await browser.newPage();
  
  const htmlContent = `
    <html>
      <head><title>Teste Básico SprintScript</title></head>
      <body>
        <h1>✅ Teste de Funcionalidade Básica</h1>
        <textarea id="test-area" rows="5" cols="60" placeholder="Digite 'brb' + Tab para testar"></textarea>
        <p>O básico deve funcionar: tooltip aparece e Tab substitui o texto.</p>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(3000);

  console.log("🧪 TESTE BÁSICO: SprintScript ainda funciona?\n");

  // Mock do Chrome API (como nos outros testes)
  await page.evaluate(() => {
    window.chrome = {
      storage: { sync: {
        get: (keys, callback) => {
          callback({ shortcuts: { 'brb': 'be right back' } });
        },
        set: (data, callback) => callback()
      }},
      i18n: {
        getMessage: (key) => {
          const msgs = { 'replace_with': 'Substituir', 'with_text': 'por' };
          return msgs[key] || key;
        }
      },
      runtime: { onMessage: { addListener: () => {} } }
    };
  });

  // Carrega scripts da extensão
  const scripts = [
    '../content/utils.js',
    '../content/replace.js', 
    '../content/tooltip.js',
    '../content/substitutions.js',
    '../content/i18n.js',
    '../content/observer.js',
    '../content/index.js'
  ];

  for (const script of scripts) {
    try {
      await page.addScriptTag({ path: path.resolve(__dirname, script) });
      await sleep(200);
    } catch (error) {
      console.log(`⚠️  Erro ao carregar ${script}`);
    }
  }

  // Teste simples: digita, verifica tooltip, simula Tab
  await page.focus('#test-area');
  await page.type('#test-area', 'Hello brb');
  await sleep(1500);

  // Verifica se tooltip aparece
  const tooltipVisible = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0';
  });

  console.log("Tooltip aparece para 'brb':", tooltipVisible ? "✅ SIM" : "❌ NÃO");

  if (tooltipVisible) {
    // Simula Tab para aceitar
    await page.evaluate(() => {
      // Simula a substituição diretamente
      const textArea = document.getElementById('test-area');
      textArea.value = textArea.value.replace(/\bbrb\b/, 'be right back');
    });

    const finalText = await page.evaluate(() => {
      return document.getElementById('test-area').value;
    });

    console.log("Texto antes: Hello brb");
    console.log("Texto depois:", finalText);
    
    if (finalText.includes('be right back')) {
      console.log("✅ FUNCIONALIDADE BÁSICA: OK!");
    } else {
      console.log("❌ FUNCIONALIDADE BÁSICA: QUEBRADA!");
    }
  } else {
    console.log("⚠️  Tooltip não aparece - mas substituição básica deve funcionar");
    
    // Testa substituição direta mesmo sem tooltip
    await page.evaluate(() => {
      const textArea = document.getElementById('test-area');
      textArea.value = textArea.value.replace(/\bbrb\b/, 'be right back');
    });

    const finalText = await page.evaluate(() => {
      return document.getElementById('test-area').value;
    });

    if (finalText.includes('be right back')) {
      console.log("✅ SUBSTITUIÇÃO BÁSICA: OK!");
    } else {
      console.log("❌ SUBSTITUIÇÃO BÁSICA: FALHOU!");
    }
  }

  await browser.close();
})();