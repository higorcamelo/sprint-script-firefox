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
      <head><title>Teste de Performance</title></head>
      <body>
        <h1>Testes de Performance - Textos Grandes</h1>
        <textarea id="test-area" rows="20" cols="100"></textarea>
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

  // Muitos atalhos para testar performance
  const performanceShortcuts = {};
  for (let i = 1; i <= 100; i++) {
    performanceShortcuts[`test${i}`] = `substituição número ${i}`;
  }
  
  // Adiciona alguns atalhos comuns
  Object.assign(performanceShortcuts, {
    "email": "usuario@exemplo.com",
    "brb": "be right back",
    "omw": "on my way",
    "ty": "thank you",
    "js": "JavaScript",
    "css": "Cascading Style Sheets"
  });

  await page.evaluate((shortcuts) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ shortcuts }, resolve);
    });
  }, performanceShortcuts);

  // Função de substituição com medição de tempo
  const runPerformanceTest = (text) => {
    const startTime = performance.now();
    
    const shortcuts = window._syncStorage?.shortcuts || {};
    let result = text;
    
    // Simula o algoritmo de substituição
    for (let shortcut in shortcuts) {
      const replacement = shortcuts[shortcut];
      const regex = new RegExp(`\\b${shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      result = result.replace(regex, replacement);
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    document.querySelector('#test-area').value = result;
    
    return {
      executionTime,
      originalLength: text.length,
      resultLength: result.length,
      shortcutsProcessed: Object.keys(shortcuts).length
    };
  };

  const performanceTests = [
    {
      description: "Texto pequeno (100 caracteres)",
      generateText: () => "brb email js css ty omw ".repeat(4).substring(0, 100),
      expectedMaxTime: 10 // ms
    },
    {
      description: "Texto médio (1000 caracteres)",
      generateText: () => "Este é um teste com brb email js css ty omw. ".repeat(20),
      expectedMaxTime: 50 // ms
    },
    {
      description: "Texto grande (10000 caracteres)", 
      generateText: () => "Texto longo com vários atalhos: brb email js css ty omw test1 test2 test3. ".repeat(150),
      expectedMaxTime: 200 // ms
    },
    {
      description: "Texto muito grande (50000 caracteres)",
      generateText: () => "Performance test brb email js css ty omw test1 test2 test3 test4 test5. ".repeat(600),
      expectedMaxTime: 500 // ms
    },
    {
      description: "Texto com muitas repetições do mesmo atalho",
      generateText: () => "brb ".repeat(1000),
      expectedMaxTime: 100 // ms
    },
    {
      description: "Texto sem atalhos (controle)",
      generateText: () => "Este texto não contém nenhum atalho conhecida pela extensão. ".repeat(100),
      expectedMaxTime: 100 // ms
    }
  ];

  async function runSinglePerformanceTest(testCase) {
    const text = testCase.generateText();
    
    console.log(`\n🚀 Testando: ${testCase.description}`);
    console.log(`   Tamanho do texto: ${text.length} caracteres`);
    
    // Executa o teste múltiplas vezes para obter média
    const iterations = 5;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = await page.evaluate(runPerformanceTest, text);
      times.push(result.executionTime);
      await sleep(100);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(`   Tempo médio: ${avgTime.toFixed(2)}ms`);
    console.log(`   Tempo mín/máx: ${minTime.toFixed(2)}ms / ${maxTime.toFixed(2)}ms`);
    
    if (avgTime <= testCase.expectedMaxTime) {
      console.log(`   ✅ Performance OK (limite: ${testCase.expectedMaxTime}ms)`);
    } else {
      console.log(`   ⚠️  Performance lenta (limite: ${testCase.expectedMaxTime}ms)`);
    }
    
    return {
      description: testCase.description,
      avgTime,
      maxTime,
      minTime,
      textLength: text.length,
      passed: avgTime <= testCase.expectedMaxTime
    };
  }

  console.log("⚡ Executando testes de performance...");
  console.log(`📊 Testando com ${Object.keys(performanceShortcuts).length} atalhos cadastrados`);
  
  const results = [];
  for (const testCase of performanceTests) {
    const result = await runSinglePerformanceTest(testCase);
    results.push(result);
  }

  // Resumo final
  console.log("\n📊 RESUMO DOS TESTES DE PERFORMANCE:");
  console.log("=" .repeat(60));
  
  results.forEach(result => {
    const status = result.passed ? "✅ OK" : "⚠️  LENTO";
    console.log(`${status} ${result.description}`);
    console.log(`     ${result.avgTime.toFixed(2)}ms (${result.textLength} chars)`);
  });
  
  const allPassed = results.every(r => r.passed);
  console.log("\n" + "=".repeat(60));
  console.log(allPassed ? "✅ TODOS OS TESTES PASSARAM!" : "⚠️  ALGUNS TESTES FALHARAM!");

  await browser.close();
})();