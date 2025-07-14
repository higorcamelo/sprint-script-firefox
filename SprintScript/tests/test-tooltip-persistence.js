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
      <head><title>Teste de Persistência de Tooltip</title></head>
      <body>
        <h1>Teste: Tooltip Perseguindo Usuário</h1>
        <textarea id="test-area" rows="5" cols="60"></textarea>
        <p>Cenário: Digite 'brb', rejeite com ESC, continue digitando</p>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(2000);

  // Mock do Chrome API (versão corrigida)
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
    await page.addScriptTag({ path: path.resolve(__dirname, script) });
    await sleep(200);
  }

  console.log("🎭 TESTE: Tooltip perseguindo usuário após rejeição\n");

  // Passo 1: Digite o atalho
  await page.focus('#test-area');
  await page.type('#test-area', 'brb');
  await sleep(1000);

  let tooltipState = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      exists: !!tooltip,
      visible: tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0'
    };
  });

  console.log("Passo 1 - Após digitar 'brb':", tooltipState);

  // Passo 2: Rejeita com ESC (CORREÇÃO: Simula o evento correto)
  await page.evaluate(() => {
    // Simula o evento ESC diretamente no tooltip
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(escEvent);
    
    // Também clica no botão X se existir
    const tooltip = document.getElementById('sprint-tooltip');
    if (tooltip) {
      const cancelBtn = tooltip.querySelector('.cancel-btn, [title*="cancel"], [title*="Cancel"], button:contains("✕")');
      if (cancelBtn) {
        console.log('[TEST] Clicando no botão cancelar');
        cancelBtn.click();
      } else {
        console.log('[TEST] Botão cancelar não encontrado, tentando forçar hide');
        // Força esconder o tooltip
        if (window.SprintScript && window.SprintScript.tooltip && window.SprintScript.tooltip.hideTooltip) {
          window.SprintScript.tooltip.hideTooltip();
        }
      }
    }
  });
  await sleep(500);

  tooltipState = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      exists: !!tooltip,
      visible: tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0'
    };
  });

  console.log("Passo 2 - Após ESC:", tooltipState);

  // Passo 3: Continua digitando
  await page.type('#test-area', ' teste adicional');
  await sleep(1000);

  tooltipState = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      exists: !!tooltip,
      visible: tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0',
      content: tooltip ? tooltip.textContent : null
    };
  });

  console.log("Passo 3 - Após continuar digitando:", tooltipState);

  // Verifica se o tooltip voltou indevidamente
  if (tooltipState.visible) {
    console.log("❌ PROBLEMA: Tooltip voltou após rejeição!");
    console.log("Conteúdo do tooltip:", tooltipState.content);
  } else {
    console.log("✅ OK: Tooltip não voltou após rejeição");
  }

  const finalText = await page.evaluate(() => {
    return document.getElementById('test-area').value;
  });

  console.log("Texto final no campo:", finalText);

  await browser.close();
})();