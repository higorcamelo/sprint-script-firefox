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
  
  // Captura TODOS os console.log
  page.on('console', msg => {
    console.log(`🔧 ${msg.text()}`);
  });
  
  const htmlContent = `
    <html>
      <head><title>Debug Tooltip Persistence</title></head>
      <body>
        <h1>Debug: Tooltip Persistence Issue</h1>
        <textarea id="test-area" rows="5" cols="60"></textarea>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(2000);

  // Mock do Chrome API
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

  // Carrega scripts
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
    await page.addScriptTag({ path: path.resolve(__dirname, script) });
    await sleep(300);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎭 DEBUG: Tooltip perseguindo usuário após ESC");
  console.log("=".repeat(60));

  // Passo 1: Digite 'brb'
  console.log("\n📝 PASSO 1: Digitando 'brb'");
  await page.focus('#test-area');
  await page.type('#test-area', 'brb');
  await sleep(1500);

  // Passo 2: ESC (com debug)
  console.log("\n🚫 PASSO 2: Pressionando ESC");
  await page.evaluate(() => {
    console.log('[TEST] === ANTES DO ESC ===');
    const tooltip = document.getElementById('sprint-tooltip');
    if (tooltip) {
      console.log('[TEST] Tooltip existe e está visível:', tooltip.style.display !== 'none');
    }
    
    // Dispara ESC
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(escEvent);
    
    console.log('[TEST] === APÓS ESC ===');
  });
  await sleep(1000);

  // Passo 3: Continua digitando
  console.log("\n✏️  PASSO 3: Continuando a digitar");
  await page.type('#test-area', ' mais texto aqui');
  await sleep(1500);

  // Verifica estado final
  const finalState = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      tooltipExists: !!tooltip,
      tooltipVisible: tooltip && tooltip.style.display !== 'none',
      tooltipContent: tooltip ? tooltip.textContent : null,
      fieldValue: document.getElementById('test-area').value
    };
  });

  console.log("\n📊 ESTADO FINAL:");
  console.log("─".repeat(30));
  console.log("Tooltip existe:", finalState.tooltipExists);
  console.log("Tooltip visível:", finalState.tooltipVisible);
  console.log("Conteúdo:", finalState.tooltipContent);
  console.log("Texto do campo:", finalState.fieldValue);

  if (finalState.tooltipVisible) {
    console.log("\n❌ PROBLEMA CONFIRMADO: Tooltip voltou após ESC!");
  } else {
    console.log("\n✅ SUCESSO: Tooltip não voltou após ESC!");
  }

  await browser.close();
})();