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

  // Intercepta todos os logs do console
  page.on('console', msg => {
    console.log(`🔧 CONSOLE: ${msg.text()}`);
  });

  // Intercepta erros
  page.on('pageerror', error => {
    console.log(`❌ ERROR: ${error.message}`);
  });

  const htmlContent = `
    <html>
      <head><title>Diagnóstico de Carregamento da Extensão</title></head>
      <body>
        <h1>Teste de Carregamento</h1>
        <textarea id="test-area" rows="5" cols="60"></textarea>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(5000); // Aguarda mais tempo para carregamento

  console.log("🔍 DIAGNÓSTICO DE CARREGAMENTO DA EXTENSÃO...\n");

  // Verifica se a extensão foi injetada
  const extensionStatus = await page.evaluate(() => {
    return {
      hasChrome: typeof chrome !== 'undefined',
      hasSprintScript: typeof window.SprintScript !== 'undefined',
      hasStorage: typeof chrome !== 'undefined' && !!chrome.storage,
      scripts: Array.from(document.scripts).map(s => s.src || 'inline'),
      headContent: document.head.innerHTML.length
    };
  });

  console.log("📊 STATUS DA EXTENSÃO:");
  console.log("───────────────────────");
  console.log(`Chrome API: ${extensionStatus.hasChrome ? '✅' : '❌'}`);
  console.log(`SprintScript: ${extensionStatus.hasSprintScript ? '✅' : '❌'}`);
  console.log(`Storage: ${extensionStatus.hasStorage ? '✅' : '❌'}`);
  console.log(`Scripts carregados: ${extensionStatus.scripts.length}`);
  console.log(`Head content: ${extensionStatus.headContent} chars`);

  // SEMPRE cria mock do Chrome API para teste
  console.log("\n🔄 CONFIGURANDO CHROME API PARA TESTE...");
  
  await page.evaluate(() => {
    // Mock completo do Chrome API
    window.chrome = {
      storage: {
        sync: {
          get: (keys, callback) => {
            console.log('[MOCK] Storage get called with:', keys);
            const mockShortcuts = {
              'brb': 'be right back',
              'omw': 'on my way', 
              'ty': 'thank you',
              'np': 'no problem',
              'css': 'Cascading Style Sheets',
              'js': 'JavaScript',
              'lol': 'laugh out loud',
              'btw': 'by the way'
            };
            
            if (Array.isArray(keys)) {
              const result = {};
              keys.forEach(key => {
                if (key === 'shortcuts') {
                  result[key] = mockShortcuts;
                } else {
                  result[key] = undefined;
                }
              });
              setTimeout(() => callback(result), 10);
            } else if (keys === 'shortcuts') {
              setTimeout(() => callback({ shortcuts: mockShortcuts }), 10);
            } else {
              setTimeout(() => callback({}), 10);
            }
          },
          set: (data, callback) => {
            console.log('[MOCK] Storage set called with:', data);
            if (callback) setTimeout(callback, 10);
          }
        }
      },
      i18n: {
        getMessage: (key, substitutions) => {
          // CORREÇÃO: Evita logs excessivos e retorna textos simples
          const messages = {
            'replace_with': 'Substituir',
            'with_text': 'por',
            'appName': 'SprintScript',
            'tooltipHint': 'Pressione Tab para substituir, Esc para cancelar'
          };
          return messages[key] || key;
        },
        getUILanguage: () => 'pt'
      },
      runtime: {
        onMessage: {
          addListener: (callback) => {
            console.log('[MOCK] runtime.onMessage listener adicionado');
            // Simula listener sendo adicionado
          }
        }
      }
    };
    
    console.log('[MOCK] Chrome API configurado completamente');
  });

  // Força carregamento manual dos scripts da extensão
  console.log("\n🔄 CARREGANDO SCRIPTS MANUALMENTE...");
  
  try {
    // Carrega os arquivos da extensão na ordem correta (SEM content.js)
    const scriptsToLoad = [
      '../content/utils.js',
      '../content/replace.js', 
      '../content/tooltip.js',
      '../content/substitutions.js',
      '../content/i18n.js',
      '../content/observer.js',
      '../content/index.js'  // ← Este é o seu "content.js"!
    ];

    for (const scriptPath of scriptsToLoad) {
      try {
        await page.addScriptTag({
          path: path.resolve(__dirname, scriptPath)
        });
        console.log(`✅ Carregado: ${scriptPath}`);
        await sleep(500);
      } catch (error) {
        console.log(`❌ Erro ao carregar ${scriptPath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ Erro geral: ${error.message}`);
  }

  await sleep(2000);

  // Verifica novamente após carregamento manual
  const postLoadStatus = await page.evaluate(() => {
    return {
      hasSprintScript: typeof window.SprintScript !== 'undefined',
      sprintScriptMethods: window.SprintScript ? Object.keys(window.SprintScript) : [],
      hasEventListeners: !!window.SprintScript?.initialized
    };
  });

  console.log("\n📊 STATUS PÓS-CARREGAMENTO:");
  console.log("──────────────────────────");
  console.log(`SprintScript: ${postLoadStatus.hasSprintScript ? '✅' : '❌'}`);
  console.log(`Métodos: ${postLoadStatus.sprintScriptMethods.join(', ')}`);
  console.log(`Inicializado: ${postLoadStatus.hasEventListeners ? '✅' : '❌'}`);

  // Teste real de funcionalidade
  console.log("\n🧪 TESTE DE FUNCIONALIDADE:");
  console.log("──────────────────────────");

  await page.focus('#test-area');
  await page.type('#test-area', 'Testing brb functionality');
  await sleep(2000);

  const functionalityTest = await page.evaluate(() => {
    const tooltip = document.querySelector('[id*="tooltip"]') || 
                   document.querySelector('[class*="tooltip"]') ||
                   document.getElementById('sprint-tooltip');
    
    return {
      tooltipExists: !!tooltip,
      tooltipVisible: tooltip ? (tooltip.style.display !== 'none' && tooltip.style.opacity !== '0') : false,
      tooltipContent: tooltip ? tooltip.textContent || tooltip.innerHTML : null,
      textAreaValue: document.getElementById('test-area').value,
      allTooltips: Array.from(document.querySelectorAll('*')).filter(el => 
        el.id.includes('tooltip') || 
        el.className.includes('tooltip') ||
        el.tagName.toLowerCase().includes('tooltip')
      ).length
    };
  });

  console.log("Resultado do teste:", functionalityTest);

  // Força disparo manual se necessário
  if (!functionalityTest.tooltipExists) {
    console.log("\n🔄 TENTANDO DISPARO MANUAL...");
    
    await page.evaluate(() => {
      const textArea = document.getElementById('test-area');
      
      // Dispara eventos manualmente
      const events = ['input', 'keyup', 'keydown', 'change'];
      events.forEach(eventType => {
        textArea.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
      
      // Se SprintScript existe, tenta chamar diretamente
      if (window.SprintScript && window.SprintScript.checkForShortcuts) {
        window.SprintScript.checkForShortcuts(textArea);
      }
    });
    
    await sleep(1000);
    
    const manualTestResult = await page.evaluate(() => {
      const tooltip = document.querySelector('[id*="tooltip"]') || 
                     document.querySelector('[class*="tooltip"]') ||
                     document.getElementById('sprint-tooltip');
      
      return {
        tooltipExists: !!tooltip,
        tooltipVisible: tooltip ? (tooltip.style.display !== 'none') : false,
        tooltipContent: tooltip ? tooltip.textContent : null
      };
    });
    
    console.log("Resultado após disparo manual:", manualTestResult);
  }

  console.log("\n" + "═".repeat(60));
  console.log("🏁 DIAGNÓSTICO DE CARREGAMENTO CONCLUÍDO");
  console.log("═".repeat(60));

  await browser.close();
})();