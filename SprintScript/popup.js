document.addEventListener("DOMContentLoaded", () => {
    carregarAtalhos();
    document.getElementById("saveButton").addEventListener("click", salvarAtalho);
});

function salvarAtalho() {
    const atalho = document.getElementById("shortcut").value.trim();
    const texto = document.getElementById("replacement").value.trim();

    if (!atalho || !texto) {
        mostrarMensagem("Por favor, preencha ambos os campos!", "error");
        return;
    }

    chrome.storage.sync.get(["shortcuts"], (result) => {
        const shortcuts = result?.shortcuts || {};
        
        if (shortcuts[atalho]) {
            if (!confirm(`O atalho "${atalho}" já existe. Deseja substituir?`)) {
                return;
            }
        }

        shortcuts[atalho] = texto;

        chrome.storage.sync.set({ shortcuts }, () => {
            if (chrome.runtime.lastError) {
                mostrarMensagem("Erro ao salvar: " + chrome.runtime.lastError.message, "error");
                return;
            }
            mostrarMensagem("Atalho salvo com sucesso!", "success");
            document.getElementById("shortcut").value = "";
            document.getElementById("replacement").value = "";
            carregarAtalhos();
            
            // Atualiza os content scripts
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateShortcuts"});
            });
        });
    });
}

function carregarAtalhos() {
    chrome.storage.sync.get(["shortcuts"], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Erro ao carregar atalhos:", chrome.runtime.lastError);
            return;
        }

        const shortcuts = result?.shortcuts || {};
        const lista = document.getElementById("shortcutList");
        lista.innerHTML = "";

        if (Object.keys(shortcuts).length === 0) {
            lista.innerHTML = "<li class='empty'>Nenhum atalho cadastrado</li>";
            return;
        }

        Object.entries(shortcuts).forEach(([atalho, texto]) => {
            const item = document.createElement("li");
            
            const textSpan = document.createElement("span");
            textSpan.textContent = `${atalho} → ${texto}`;
            
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remover";
            removeBtn.className = "remove-btn";
            removeBtn.onclick = () => removerAtalho(atalho);
            
            item.appendChild(textSpan);
            item.appendChild(removeBtn);
            lista.appendChild(item);
        });
    });
}

function removerAtalho(atalho) {
    if (!confirm(`Tem certeza que deseja remover o atalho "${atalho}"?`)) {
        return;
    }

    chrome.storage.sync.get(["shortcuts"], (result) => {
        const shortcuts = result?.shortcuts || {};
        delete shortcuts[atalho];
        
        chrome.storage.sync.set({ shortcuts }, () => {
            if (chrome.runtime.lastError) {
                mostrarMensagem("Erro ao remover atalho", "error");
                return;
            }
            mostrarMensagem("Atalho removido com sucesso!", "success");
            carregarAtalhos();
            
            // Atualiza os content scripts
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateShortcuts"});
            });
        });
    });
}

function mostrarMensagem(texto, tipo = "success") {
    const mensagem = document.getElementById("message");
    if (!mensagem) return;
    
    mensagem.textContent = texto;
    mensagem.className = `message ${tipo}`;
    
    setTimeout(() => {
        mensagem.style.display = "none";
    }, 3000);
}