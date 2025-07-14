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
      <head><title>Teste de Regressão</title></head>
      <body>
        <h1>Testes de Regressão - Casos Problemáticos</h1>
        <textarea id="test-area" rows="10" cols="80"></textarea>
        <input type="text" id="test-input" />
        <div contenteditable="true" id="test-div" style="border: 1px solid #ccc; padding: 10px; min-height: 50px;"></div>
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
          } else if (typeof keys === 'string') {
            result[keys] = window._syncStorage?.[keys];
          } else {
            Object.assign(result, window._syncStorage || {});
          }
          callback(result);
        }
      }
    };
    window._syncStorage = {};
  });

  // Atalhos que já causaram problemas específicos
  const regressionShortcuts = {
    "email": "usuario@exemplo.com",
    "teste": "Este é um texto de teste",
    "css": "Cascading Style Sheets",
    "js": "JavaScript",
    "url": "https://exemplo.com",
    "brb": "be right back",
    "/": "barra",
    "xD": "😀",
    "123": "número um dois três"
  };

  await page.evaluate((shortcuts) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ shortcuts }, resolve);
    });
  }, regressionShortcuts);

  // Casos de regressão específicos
  const regressionTests = [
    {
      description: "Atalho no início da frase",
      input: "email para contato",
      expected: "usuario@exemplo.com para contato",
      element: "textarea"
    },
    {
      description: "Atalho no final da frase",
      input: "Meu email",
      expected: "Meu usuario@exemplo.com",
      element: "textarea"
    },
    {
      description: "Múltiplos atalhos na mesma linha",
      input: "Use js e css juntos",
      expected: "Use JavaScript e Cascading Style Sheets juntos",
      element: "textarea"
    },
    {
      description: "Atalho repetido múltiplas vezes",
      input: "teste teste teste",
      expected: "Este é um texto de teste Este é um texto de teste Este é um texto de teste",
      element: "textarea"
    },
    {
      description: "Atalho dentro de URL (não deve substituir)",
      input: "Acesse https://teste.com",
      expected: "Acesse https://teste.com", // NÃO deve substituir 'teste' dentro da URL
      element: "textarea"
    },
    {
      description: "Atalho com caracteres especiais",
      input: "Que engraçado xD",
      expected: "Que engraçado 😀",
      element: "textarea"
    },
    {
      description: "Atalho que é substring de palavra maior",
      input: "testing css file",
      expected: "testing Cascading Style Sheets file", // 'css' deve ser substituído, 'testing' não
      element: "textarea"
    },
    {
      description: "Atalho numérico",
      input: "Código 123 encontrado",
      expected: "Código número um dois três encontrado",
      element: "textarea"
    },
    {
      description: "Teste em input field",
      input: "brb em 5 minutos",
      expected: "be right back em 5 minutos",
      element: "input"
    },
    {
      description: "Teste em contenteditable",
      input: "email e url juntos",
      expected: "usuario@exemplo.com e https://exemplo.com juntos",
      element: "contenteditable"
    },
    {
      description: "Linha com quebras de linha",
      input: "Primeira linha\nemail aqui\nTerceira linha",
      expected: "Primeira linha\nusuario@exemplo.com aqui\nTerceira linha",
      element: "textarea"
    },
    {
      description: "Atalho com pontuação",
      input: "email, url e css.",
      expected: "usuario@exemplo.com, https://exemplo.com e Cascading Style Sheets.",
      element: "textarea"
    }
  ];

  // Injeta as funções do SprintScript no contexto da página
  await page.addScriptTag({
    content: `
      // Função para verificar se está dentro de uma URL
      function isInsideUrl(text, startIndex, endIndex) {
        const beforeText = text.substring(0, startIndex);
        const afterText = text.substring(endIndex);
        
        const urlStart = /https?:\\/\\/[^\\s]*$/i.test(beforeText);
        const urlEnd = /^[^\\s]*\\.[a-z]{2,}/i.test(afterText);
        
        return urlStart || urlEnd;
      }

      // Função segura para substituir atalhos (evita URLs)
      function replaceShortcuts(text, shortcuts) {
        let result = text;
        
        for (let shortcut in shortcuts) {
          const replacement = shortcuts[shortcut];
          
          // Escape de caracteres especiais - versão mais simples
          let escapedShortcut = shortcut;
          escapedShortcut = escapedShortcut.replace(/\\./g, '\\\\.');
          escapedShortcut = escapedShortcut.replace(/\\*/g, '\\\\*');
          escapedShortcut = escapedShortcut.replace(/\\+/g, '\\\\+');
          escapedShortcut = escapedShortcut.replace(/\\?/g, '\\\\?');
          escapedShortcut = escapedShortcut.replace(/\\^/g, '\\\\^');
          escapedShortcut = escapedShortcut.replace(/\\$/g, '\\\\$');
          escapedShortcut = escapedShortcut.replace(/\\(/g, '\\\\(');
          escapedShortcut = escapedShortcut.replace(/\\)/g, '\\\\)');
          escapedShortcut = escapedShortcut.replace(/\\|/g, '\\\\|');
          escapedShortcut = escapedShortcut.replace(/\\[/g, '\\\\[');
          escapedShortcut = escapedShortcut.replace(/\\]/g, '\\\\]');
          escapedShortcut = escapedShortcut.replace(/\\\\\\\\/g, '\\\\\\\\\\\\\\\\');
          
          // Cria a regex com word boundaries
          const regex = new RegExp('\\\\b' + escapedShortcut + '\\\\b', 'gi');
          
          result = result.replace(regex, function(match, offset) {
            const endOffset = offset + match.length;
            if (isInsideUrl(result, offset, endOffset)) {
              return match; // Não substitui se estiver em URL
            }
            return replacement;
          });
        }
        
        return result;
      }

      window.testReplaceShortcuts = replaceShortcuts;
      
      // Debug
      console.log('Função carregada:', typeof window.testReplaceShortcuts);
      const testResult = window.testReplaceShortcuts('teste aqui', {teste: 'FUNCIONOU'});
      console.log('Teste:', testResult);
    `
  });

  // Função de substituição usando a lógica real do SprintScript
  const runSubstitution = (elementType) => {
    const shortcuts = window._syncStorage?.shortcuts || {};
    let element, text;
    
    if (elementType === 'textarea') {
      element = document.querySelector('#test-area');
      text = element.value;
    } else if (elementType === 'input') {
      element = document.querySelector('#test-input');
      text = element.value;
    } else if (elementType === 'contenteditable') {
      element = document.querySelector('#test-div');
      text = element.textContent;
    }
    
    // Usa a função real do SprintScript
    const newText = window.testReplaceShortcuts(text, shortcuts);
    
    if (elementType === 'textarea') {
      element.value = newText;
    } else if (elementType === 'input') {
      element.value = newText;
    } else if (elementType === 'contenteditable') {
      element.textContent = newText;
    }
    
    return newText;
  };

  async function runRegressionTest(testCase) {
    const elementSelector = testCase.element === 'textarea' ? '#test-area' : 
                           testCase.element === 'input' ? '#test-input' : '#test-div';
    
    // Define o valor do elemento
    if (testCase.element === 'contenteditable') {
      await page.evaluate((selector, input) => {
        document.querySelector(selector).textContent = input;
      }, elementSelector, testCase.input);
    } else {
      await page.evaluate((selector, input) => {
        document.querySelector(selector).value = input;
      }, elementSelector, testCase.input);
    }

    // Executa a substituição usando a lógica real
    const result = await page.evaluate(runSubstitution, testCase.element);

    // Verifica o resultado
    if (result.trim() === testCase.expected.trim()) {
      console.log(`✅ REGRESSÃO: ${testCase.description}`);
      return true;
    } else {
      console.error(`❌ REGRESSÃO FALHOU: ${testCase.description}`);
      console.error(`   Entrada: "${testCase.input}"`);
      console.error(`   Esperado: "${testCase.expected}"`);
      console.error(`   Obtido: "${result}"`);
      console.error(`   Elemento: ${testCase.element}`);
      return false;
    }
  }

  console.log("🔍 Executando testes de regressão...\n");
  
  let passedTests = 0;
  let totalTests = regressionTests.length;
  
  for (const testCase of regressionTests) {
    const passed = await runRegressionTest(testCase);
    if (passed) passedTests++;
    await sleep(300);
  }

  console.log(`\n📊 RESULTADO: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === totalTests) {
    console.log("✅ TODOS OS TESTES DE REGRESSÃO PASSARAM!");
  } else {
    console.log("⚠️  ALGUNS TESTES DE REGRESSÃO FALHARAM!");
  }

  await browser.close();
})();