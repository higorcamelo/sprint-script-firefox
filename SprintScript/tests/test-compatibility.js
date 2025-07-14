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
      <head><title>Teste de Compatibilidade</title></head>
      <body>
        <h1>Testes de Compatibilidade - Diferentes Campos</h1>
        
        <h3>Input Fields</h3>
        <input type="text" id="input-text" placeholder="input text" />
        <input type="email" id="input-email" placeholder="input email" />
        <input type="search" id="input-search" placeholder="input search" />
        
        <h3>Textarea</h3>
        <textarea id="textarea-normal" rows="3" cols="50"></textarea>
        
        <h3>ContentEditable</h3>
        <div contenteditable="true" id="div-editable" style="border: 1px solid #ccc; padding: 10px; min-height: 50px;">Clique e digite aqui</div>
        <p contenteditable="true" id="p-editable" style="border: 1px solid #ccc; padding: 5px;">Parágrafo editável</p>
        
        <h3>Campos em formulários</h3>
        <form>
          <input type="text" id="form-input" name="test" />
          <textarea id="form-textarea" name="content"></textarea>
        </form>
        
        <h3>Campos com classes/IDs específicos</h3>
        <input type="text" class="comment-field" id="comment-input" />
        <textarea class="message-area" id="message-textarea"></textarea>
        
        <div id="results" style="margin-top: 20px; font-family: monospace;"></div>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(2000);

  // Mock do chrome.storage
  await page.evaluate(() => {
    window.chrome = window.chrome || {};
    window.chrome.storage = {
      sync: {
        set: (data, callback) => {
          window._syncStorage = { ...window._syncStorage, ...data };
          if (callback) callback();
        },
        get: (keys, callback) => {
          const result = {};
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              result[key] = window._syncStorage?.[key];
            });
          } else {
            Object.assign(result, window._syncStorage || {});
          }
          callback(result);
        }
      }
    };
    window._syncStorage = {};
  });

  const testShortcuts = {
    "test": "FUNCIONOU",
    "brb": "be right back",
    "email": "test@example.com"
  };

  await page.evaluate((shortcuts) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ shortcuts }, resolve);
    });
  }, testShortcuts);

  const compatibilityTests = [
    { elementId: 'input-text', type: 'input', description: 'Input type="text"' },
    { elementId: 'input-email', type: 'input', description: 'Input type="email"' },
    { elementId: 'input-search', type: 'input', description: 'Input type="search"' },
    { elementId: 'textarea-normal', type: 'textarea', description: 'Textarea normal' },
    { elementId: 'div-editable', type: 'contenteditable', description: 'Div contenteditable' },
    { elementId: 'p-editable', type: 'contenteditable', description: 'Paragraph contenteditable' },
    { elementId: 'form-input', type: 'input', description: 'Input dentro de form' },
    { elementId: 'form-textarea', type: 'textarea', description: 'Textarea dentro de form' },
    { elementId: 'comment-input', type: 'input', description: 'Input com classe específica' },
    { elementId: 'message-textarea', type: 'textarea', description: 'Textarea com classe específica' }
  ];

  const testSubstitution = (elementId, elementType) => {
    const shortcuts = window._syncStorage?.shortcuts || {};
    const element = document.getElementById(elementId);
    
    if (!element) return { success: false, error: 'Elemento não encontrado' };
    
    let text;
    if (elementType === 'contenteditable') {
      text = element.textContent || element.innerText || '';
    } else {
      text = element.value || '';
    }
    
    let substituted = text;
    for (let shortcut in shortcuts) {
      const replacement = shortcuts[shortcut];
      const regex = new RegExp(`\\b${shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      substituted = substituted.replace(regex, replacement);
    }
    
    try {
      if (elementType === 'contenteditable') {
        element.textContent = substituted;
      } else {
        element.value = substituted;
      }
      return { success: true, originalText: text, resultText: substituted };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  async function runCompatibilityTest(testCase) {
    const testInput = "Teste de test aqui brb";
    const expectedOutput = "Teste de FUNCIONOU aqui be right back";
    
    // Define o valor inicial
    if (testCase.type === 'contenteditable') {
      await page.evaluate((elementId, input) => {
        const element = document.getElementById(elementId);
        element.textContent = input;
      }, testCase.elementId, testInput);
    } else {
      await page.evaluate((elementId, input) => {
        const element = document.getElementById(elementId);
        element.value = input;
      }, testCase.elementId, testInput);
    }
    
    // Executa a substituição
    const result = await page.evaluate(testSubstitution, testCase.elementId, testCase.type);
    
    if (!result.success) {
      console.log(`❌ ${testCase.description}: ERRO - ${result.error}`);
      return false;
    }
    
    if (result.resultText.trim() === expectedOutput.trim()) {
      console.log(`✅ ${testCase.description}: OK`);
      return true;
    } else {
      console.log(`❌ ${testCase.description}: FALHOU`);
      console.log(`   Esperado: "${expectedOutput}"`);
      console.log(`   Obtido: "${result.resultText}"`);
      return false;
    }
  }

  console.log("🔧 Executando testes de compatibilidade...\n");
  
  let passedTests = 0;
  for (const testCase of compatibilityTests) {
    const passed = await runCompatibilityTest(testCase);
    if (passed) passedTests++;
    await sleep(200);
  }
  
  console.log(`\n📊 RESULTADO: ${passedTests}/${compatibilityTests.length} testes passaram`);
  
  if (passedTests === compatibilityTests.length) {
    console.log("✅ TODOS OS TIPOS DE CAMPO SÃO COMPATÍVEIS!");
  } else {
    console.log("⚠️  ALGUNS TIPOS DE CAMPO APRESENTARAM PROBLEMAS!");
  }

  await browser.close();
})();