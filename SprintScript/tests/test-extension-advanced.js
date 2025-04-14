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

  // Cria uma página de teste simples com um textarea
  const htmlContent = `
    <html>
      <head><title>Teste de Substituição Avançado</title></head>
      <body>
        <h1>Teste de Substituição de Atalhos</h1>
        <textarea id="test-area" rows="10" cols="50"></textarea>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);

  // Aguarda a página carregar
  await sleep(2000);

  // Simula o objeto chrome.storage.sync usando uma variável global
  await page.evaluate(() => {
    window.chrome = window.chrome || {};
    window.chrome.storage = {
      sync: {
        set: (data, callback) => {
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

  // Define os atalhos a serem usados em todos os testes
  const shortcuts = {
    "brb": "be right back",
    "omw": "on my way",
    "ty": "thank you",
    "np": "no problem",
    "id": "identifier",
    "xD": "😆"
  };

  // Salva os atalhos no "storage"
  await page.evaluate((shortcuts) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ shortcuts }, resolve);
    });
  }, shortcuts);

  console.log("Atalhos salvos no storage:", shortcuts);

  // Função de substituição a ser executada no contexto da página
  // Essa função lê os atalhos do storage simulado e substitui no valor do textarea
  const runSubstitution = () => {
    const textArea = document.querySelector('#test-area');
    let text = textArea.value;
    const shortcuts = window._syncStorage ? window._syncStorage.shortcuts : {};
    for (let key in shortcuts) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      text = text.replace(regex, shortcuts[key]);
    }
    textArea.value = text;
    return text;
  };

  // Define os testes como um array de objetos com descrição, entrada e saída esperada
  const tests = [
    {
      description: "Substituição simples: 'brb'",
      input: "brb",
      expected: "be right back"
    },
    {
      description: "Substituição repetida: 'brb brb brb'",
      input: "brb brb brb",
      expected: "be right back be right back be right back"
    },
    {
      description: "Vários atalhos: 'ty, omw, np'",
      input: "ty, omw, np",
      expected: "thank you, on my way, no problem"
    },
    {
      description: "Texto longo com muitas ocorrências de 'brb'",
      input: "brb ".repeat(100).trim(),
      expected: "be right back ".repeat(100).trim()
    },
    {
      description: "Teste de colisão: 'This idea is good. Use id to reference.'",
      input: "This idea is good. Use id to reference.",
      expected: "This idea is good. Use identifier to reference."
    },
    {
      description: "Atalho com emoji: 'xD'",
      input: "xD",
      expected: "😆"
    }
  ];

  // Função para executar cada teste
  async function runTest(testCase) {
    // Define o valor do textarea
    await page.evaluate((input) => {
      document.querySelector('#test-area').value = input;
    }, testCase.input);

    // Executa a substituição
    const result = await page.evaluate(runSubstitution);

    // Compara o resultado com o esperado
    if (result.trim() === testCase.expected.trim()) {
      console.log(`✅ ${testCase.description} passou.`);
    } else {
      console.error(`❌ ${testCase.description} falhou.`);
      console.error("Entrada:", testCase.input);
      console.error("Esperado:", testCase.expected);
      console.error("Obtido:", result);
    }
  }

  // Executa os testes em sequência
  for (const testCase of tests) {
    await runTest(testCase);
    await sleep(500); // pequeno delay entre testes
  }

  await browser.close();
})();
