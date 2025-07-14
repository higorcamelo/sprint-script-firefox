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
      <head><title>Teste de Comportamento de Tooltip</title></head>
      <body>
        <h1>Cenários Realistas de Uso</h1>
        <div style="margin: 20px 0;">
          <label>Gmail:</label>
          <textarea id="email-compose" rows="3" cols="60" placeholder="Compose your message..."></textarea>
        </div>
        <div style="margin: 20px 0;">
          <label>Slack:</label>
          <input type="text" id="slack-message" placeholder="Message #general" />
        </div>
        <div style="margin: 20px 0;">
          <label>Twitter:</label>
          <div contenteditable="true" id="tweet-compose" style="border: 1px solid #ccc; padding: 10px; min-height: 60px;">What's happening?</div>
        </div>
      </body>
    </html>
  `;
  await page.setContent(htmlContent);
  await sleep(3000);

  console.log("🎭 SIMULANDO CENÁRIOS REALISTAS DE USO...\n");

  // Cenário 1: Usuário escrevendo email
  console.log("📧 CENÁRIO 1: Composição de email");
  console.log("─".repeat(40));
  
  await page.focus('#email-compose');
  await page.type('#email-compose', 'Hi there! I will ');
  await sleep(500);
  await page.type('#email-compose', 'brb');
  await sleep(1000);
  
  let tooltipVisible = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return tooltip && tooltip.style.display !== 'none';
  });
  
  if (tooltipVisible) {
    console.log("✅ Tooltip aparece para 'brb'");
    
    // Usuário decide não usar o atalho
    await page.keyboard.press('Escape');
    await sleep(500);
    
    // Continua digitando
    await page.type('#email-compose', ' in 5 minutes to help you');
    await sleep(1000);
    
    tooltipVisible = await page.evaluate(() => {
      const tooltip = document.getElementById('sprint-tooltip');
      return tooltip && tooltip.style.display !== 'none';
    });
    
    if (tooltipVisible) {
      console.log("❌ PROBLEMA: Tooltip voltou após rejeição");
    } else {
      console.log("✅ OK: Tooltip não voltou após rejeição");
    }
  }

  // Cenário 2: Digitação rápida no Slack
  console.log("\n💬 CENÁRIO 2: Mensagem rápida no Slack");
  console.log("─".repeat(40));
  
  await page.focus('#slack-message');
  
  // Simula digitação rápida de uma frase comum
  const message = "Hey team, brb going to lunch";
  for (let char of message) {
    await page.type('#slack-message', char);
    await sleep(Math.random() * 100 + 50); // Velocidade variável de digitação
  }
  
  await sleep(1000);
  
  // Verifica quantas vezes o tooltip apareceu
  const tooltipInteractions = await page.evaluate(() => {
    // Simulação - na prática você teria que implementar um contador
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      isVisible: tooltip && tooltip.style.display !== 'none',
      currentText: document.getElementById('slack-message').value
    };
  });
  
  console.log("Estado após digitação rápida:", tooltipInteractions);

  // Cenário 3: Tweet com múltiplos atalhos potenciais
  console.log("\n🐦 CENÁRIO 3: Tweet com múltiplos atalhos");
  console.log("─".repeat(40));
  
  await page.focus('#tweet-compose');
  await page.evaluate(() => {
    document.getElementById('tweet-compose').textContent = '';
  });
  
  // Digita uma frase com vários possíveis atalhos
  await page.type('#tweet-compose', 'Going to the store brb, need to buy css books and js tutorials');
  await sleep(2000);
  
  const finalTooltipState = await page.evaluate(() => {
    const tooltip = document.getElementById('sprint-tooltip');
    return {
      visible: tooltip && tooltip.style.display !== 'none',
      content: tooltip ? tooltip.textContent : null,
      tweetContent: document.getElementById('tweet-compose').textContent
    };
  });
  
  console.log("Estado final:", finalTooltipState);

  console.log("\n" + "═".repeat(50));
  console.log("🏁 TESTE DE COMPORTAMENTO CONCLUÍDO");
  console.log("═".repeat(50));

  await browser.close();
})();