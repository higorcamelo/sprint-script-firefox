console.log("SprintScript ativo!");

const substituicoes = {
    "/linkedin": "https://www.linkedin.com/in/seu-perfil",
    "/github": "https://github.com/seu-usuario"
};

// Cria (ou reutiliza) o elemento tooltip para confirmação
let tooltip = document.getElementById("sprint-tooltip");
if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "sprint-tooltip";
    // Estilos básicos do tooltip (você pode ajustar conforme desejar)
    tooltip.style.position = "absolute";
    tooltip.style.background = "#fff";
    tooltip.style.border = "1px solid #ccc";
    tooltip.style.padding = "6px 10px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.boxShadow = "0px 2px 8px rgba(0,0,0,0.15)";
    tooltip.style.zIndex = 9999;
    tooltip.style.fontSize = "14px";
    tooltip.style.display = "none";
    document.body.appendChild(tooltip);
}

/**
 * Exibe o tooltip de confirmação perto do elemento.
 * @param {HTMLElement} elemento - O campo onde o atalho foi detectado.
 * @param {string} atalho - O atalho detectado (ex: "/linkedin").
 * @param {string} texto - O texto a ser substituído (ex: o link).
 * @param {number} posX - Posição horizontal para exibir o tooltip.
 * @param {number} posY - Posição vertical para exibir o tooltip.
 * @param {Function} confirmCallback - Função a executar se o usuário confirmar.
 */
function mostrarTooltip(elemento, atalho, texto, posX, posY, confirmCallback) {
    tooltip.innerHTML = `
        Substituir <b>${atalho}</b> por <b>${texto}</b>?
        <button id="sprint-confirm">✔</button>
        <button id="sprint-cancel">✖</button>
    `;
    tooltip.style.left = posX + "px";
    tooltip.style.top = posY + "px";
    tooltip.style.display = "block";

    document.getElementById("sprint-confirm").onclick = function() {
        confirmCallback();
        tooltip.style.display = "none";
    };
    document.getElementById("sprint-cancel").onclick = function() {
        tooltip.style.display = "none";
    };
}

/**
 * Chama o tooltip para confirmação e, se confirmado, executa a substituição.
 * @param {HTMLElement} campo - O elemento (input/textarea ou contenteditable).
 * @param {string} atalho - O atalho detectado.
 * @param {string} texto - O texto para substituir.
 * @param {string} tipo - "input" ou "contenteditable"
 */
function confirmarSubstituicao(campo, atalho, texto, tipo) {
    const rect = campo.getBoundingClientRect();
    const posX = rect.left + window.scrollX + 10;
    const posY = rect.bottom + window.scrollY + 5;

    mostrarTooltip(campo, atalho, texto, posX, posY, function() {
        if (tipo === "input") {
            substituirEmCampoTexto(campo, atalho, texto);
        } else {
            substituirEmContentEditable(campo, atalho, texto);
        }
    });
}

/**
 * Substitui o atalho por texto em inputs e textareas.
 * @param {HTMLInputElement|HTMLTextAreaElement} campo 
 * @param {string} atalho 
 * @param {string} texto 
 */
function substituirEmCampoTexto(campo, atalho, texto) {
    const valor = campo.value;
    if (!valor) return;
    if (valor.includes(atalho)) {
        const novoValor = valor.replaceAll(atalho, texto);
        console.log(`Substituindo ${atalho} por ${texto} em input`);
        campo.value = novoValor;
        campo.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

/**
 * Substitui o atalho por texto em elementos contenteditable.
 * @param {HTMLElement} el 
 * @param {string} atalho 
 * @param {string} texto 
 */
function substituirEmContentEditable(el, atalho, texto) {
    const valor = el.innerText;
    if (!valor) return;
    if (valor.includes(atalho)) {
        const novoValor = valor.replaceAll(atalho, texto);
        console.log(`Substituindo ${atalho} por ${texto} em contenteditable`);
        el.innerText = novoValor;
        el.dispatchEvent(new Event("input", { bubbles: true }));
    }
}

/**
 * Processa um campo input/textarea e, se encontrar algum atalho, aciona a confirmação.
 * @param {HTMLInputElement|HTMLTextAreaElement} campo 
 */
function processarCampoTexto(campo) {
    const valor = campo.value;
    if (!valor) return;
    Object.entries(substituicoes).forEach(([atalho, texto]) => {
        if (valor.includes(atalho)) {
            confirmarSubstituicao(campo, atalho, texto, "input");
        }
    });
}

/**
 * Processa um elemento contenteditable e, se encontrar algum atalho, aciona a confirmação.
 * @param {HTMLElement} el 
 */
function processarContentEditable(el) {
    const valor = el.innerText;
    if (!valor) return;
    Object.entries(substituicoes).forEach(([atalho, texto]) => {
        if (valor.includes(atalho)) {
            confirmarSubstituicao(el, atalho, texto, "contenteditable");
        }
    });
}

function adicionarListeners() {
    const inputs = document.querySelectorAll("input[type='text'], textarea");
    const editaveis = document.querySelectorAll("[contenteditable='true']");

    inputs.forEach(campo => {
        // Remove qualquer listener antigo para evitar duplicações
        campo.removeEventListener("input", listenerInput);
        campo.addEventListener("input", listenerInput);
    });

    editaveis.forEach(el => {
        el.removeEventListener("input", listenerEditable);
        el.addEventListener("input", listenerEditable);
    });

    console.log(`Listeners adicionados: ${inputs.length} input/textarea e ${editaveis.length} contenteditable`);
}

function listenerInput(e) {
    processarCampoTexto(e.target);
}

function listenerEditable(e) {
    processarContentEditable(e.target);
}

adicionarListeners();

// Observa elementos adicionados dinamicamente e adiciona os listeners
const observer = new MutationObserver(() => {
    adicionarListeners();
});
observer.observe(document.body, { childList: true, subtree: true });
