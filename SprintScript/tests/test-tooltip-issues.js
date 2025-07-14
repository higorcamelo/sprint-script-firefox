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

  // Console logs da página para diagnóstico
  page.on('console', msg => {
    if (msg.text().includes('SprintScript') || msg.text().includes('tooltip')) {
      console.log('🔧 PAGE LOG:', msg.text());
    }
  });

  const htmlContent = `
    <html>
      <head><title>Teste de Problemas de Tooltip</title></head>
      <body>
        <h1>Diagnóstico de Problemas de UX</h1>
        <textarea id="test-area" rows="5" cols="60" placeholder="Digite aqui..."></textarea>
        <input type="text" id="test-input" placeholder="Ou aqui..." />
        <div contenteditable="true" id="test-div" style="border: 1px solid #ccc; padding: 10px; min-height: 50px;">Ou edite aqui...</div>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(3000); // Aguarda a extensão carregar

  console.log("🔍 INICIANDO DIAGNÓSTICO DE PROBLEMAS DE TOOLTIP...\n");

  // Problema 1: Tooltip vazio aparecendo
  console.log("📋 TESTE 1: Tooltip vazio");
  console.log("═".repeat(50));
  
  await page.focus('#test-area');
  await page.type('#test-area', 'teste normal sem atalho');
  await sleep(1000);
  
  const tooltipExists = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0';
  });
  
  if (tooltipExists) {
    const tooltipContent = await page.evaluate(() => {
      const tooltip = document.getElementById('sprint-tooltip');
      return tooltip ? tooltip.innerHTML : 'N/A';
    });
    console.log("❌ PROBLEMA: Tooltip aparece mesmo sem atalho válido");
    console.log("   Conteúdo:", tooltipContent);
  } else {
    console.log("✅ OK: Nenhum tooltip aparece para texto normal");
  }

  // Problema 2: Tooltip perseguindo o usuário após rejeição
  console.log("\n📋 TESTE 2: Persistência após rejeição");
  console.log("═".repeat(50));
  
  // Limpa o campo
  await page.evaluate(() => {
    document.getElementById('test-area').value = '';
  });
  
  // Digita um atalho válido (assumindo que 'brb' existe)
  await page.type('#test-area', 'brb');
  await sleep(1000);
  
  // Verifica se tooltip aparece
  let tooltipVisible = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0';
  });
  
  if (tooltipVisible) {
    console.log("✅ Tooltip aparece para atalho válido 'brb'");
    
    // Simula rejeição (ESC ou botão X)
    await page.keyboard.press('Escape');
    await sleep(500);
    
    // Verifica se tooltip some
    tooltipVisible = await page.evaluate(() => {
      const tooltip = document.getElementById('sprint-tooltip');
      return tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0';
    });
    
    if (!tooltipVisible) {
      console.log("✅ Tooltip some após ESC");
      
      // Agora digita mais texto
      await page.type('#test-area', ' teste');
      await sleep(1000);
      
      // Verifica se tooltip volta a aparecer indevidamente
      tooltipVisible = await page.evaluate(() => {
        const tooltip = document.getElementById('sprint-tooltip');
        return tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0';
      });
      
      if (tooltipVisible) {
        console.log("❌ PROBLEMA: Tooltip volta após rejeição quando usuário continua digitando");
        const currentText = await page.evaluate(() => document.getElementById('test-area').value);
        console.log("   Texto atual:", currentText);
      } else {
        console.log("✅ OK: Tooltip não volta após rejeição");
      }
    } else {
      console.log("❌ PROBLEMA: Tooltip não some após ESC");
    }
  } else {
    console.log("❌ PROBLEMA: Tooltip não aparece para atalho válido");
  }

  // Problema 3: Tooltip aparecendo em páginas sem atalhos configurados
  console.log("\n📋 TESTE 3: Tooltip em páginas sem atalhos");
  console.log("═".repeat(50));
  
  // Simula cenário sem atalhos
  await page.evaluate(() => {
    // Remove todos os atalhos do storage
    window.chrome = window.chrome || {};
    window.chrome.storage = window.chrome.storage || {};
    window.chrome.storage.sync = {
      get: (keys, callback) => callback({ shortcuts: {} }),
      set: (data, callback) => callback()
    };
  });
  
  await page.evaluate(() => {
    document.getElementById('test-area').value = '';
  });
  
  await page.type('#test-area', 'qualquer texto aqui brb teste');
  await sleep(1000);
  
  tooltipVisible = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return tooltip && tooltip.style.display !== 'none' && tooltip.style.opacity !== '0';
  });
  
  if (tooltipVisible) {
    console.log("❌ PROBLEMA: Tooltip aparece mesmo sem atalhos configurados");
  } else {
    console.log("✅ OK: Nenhum tooltip sem atalhos configurados");
  }

  // Problema 4: Múltiplos tooltips ou sobreposição
  console.log("\n📋 TESTE 4: Múltiplos tooltips");
  console.log("═".repeat(50));
  
  const tooltipCount = await page.evaluate(() => {
    return document.querySelectorAll('[id*="tooltip"], [class*="tooltip"]').length;
  });
  
  console.log(`Número de elementos tooltip encontrados: ${tooltipCount}`);
  
  if (tooltipCount > 1) {
    console.log("❌ PROBLEMA: Múltiplos tooltips detectados");
    const tooltips = await page.evaluate(() => {
      const elements = document.querySelectorAll('[id*="tooltip"], [class*="tooltip"]');
      return Array.from(elements).map(el => ({
        id: el.id,
        class: el.className,
        visible: el.style.display !== 'none'
      }));
    });
    console.log("   Tooltips encontrados:", tooltips);
  } else {
    console.log("✅ OK: Apenas um tooltip encontrado");
  }

  // Problema 5: Performance - tooltip aparecendo muito rapidamente
  console.log("\n📋 TESTE 5: Performance de tooltip");
  console.log("═".repeat(50));
  
  const startTime = Date.now();
  await page.evaluate(() => {
    document.getElementById('test-area').value = '';
  });
  
  // Digita rapidamente vários caracteres
  for (let i = 0; i < 10; i++) {
    await page.type('#test-area', 'a');
    await sleep(50); // Digitação rápida
  }
  
  const endTime = Date.now();
  console.log(`Tempo de digitação rápida: ${endTime - startTime}ms`);
  
  // Verifica se causou problemas
  const finalTooltipState = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      exists: !!tooltip,
      visible: tooltip && tooltip.style.display !== 'none',
      content: tooltip ? tooltip.innerHTML.substring(0, 50) : null
    };
  });
  
  console.log("Estado final do tooltip:", finalTooltipState);

  // Problema 6: Limpeza de listeners
  console.log("\n📋 TESTE 6: Limpeza de event listeners");
  console.log("═".repeat(50));
  
  // Testa se os listeners são removidos corretamente
  const listenerCount = await page.evaluate(() => {
    // Simula mudança de página/contexto
    const testElement = document.getElementById('test-area');
    
    // Conta quantos listeners estão attached (método aproximado)
    const events = [];
    for (let prop in testElement) {
      if (prop.startsWith('on') || prop.includes('event')) {
        events.push(prop);
      }
    }
    
    return {
      eventProps: events.length,
      hasSprintScriptListeners: !!window.SprintScript
    };
  });
  
  console.log("Análise de listeners:", listenerCount);

  console.log("\n" + "═".repeat(60));
  console.log("🏁 DIAGNÓSTICO CONCLUÍDO");
  console.log("═".repeat(60));
  
  console.log("\n💡 RECOMENDAÇÕES BASEADAS NOS TESTES:");
  console.log("1. Verificar lógica de exibição de tooltip em replace.js");
  console.log("2. Implementar debounce para evitar tooltips em digitação rápida");
  console.log("3. Melhorar limpeza de estado após rejeição");
  console.log("4. Adicionar verificação se existem atalhos antes de mostrar tooltip");
  console.log("5. Implementar timeout para auto-hide do tooltip");

  await browser.close();
})();