document.addEventListener("DOMContentLoaded", () => {
    carregarAtalhos();

    document.getElementById("saveButton").addEventListener("click", salvarAtalho);
});

function salvarAtalho() {
    let atalho = document.getElementById("shortcut").value.trim();
    let texto = document.getElementById("replacement").value.trim();

    if (!atalho || !texto) {
        mostrarMensagem("Por favor, preencha ambos os campos!");
        return;
    }

    chrome.storage.sync.get(["shortcuts"], (result) => {
        // Verifica se result existe e tem a propriedade shortcuts
        let shortcuts = result?.shortcuts || {};
        shortcuts[atalho] = texto;

        chrome.storage.sync.set({ shortcuts }, () => {
            if (chrome.runtime.lastError) {
                mostrarMensagem("Erro ao salvar: " + chrome.runtime.lastError.message);
                return;
            }
            mostrarMensagem("Atalho salvo com sucesso!");
            document.getElementById("shortcut").value = "";
            document.getElementById("replacement").value = "";
            carregarAtalhos();
        });
    });
}

function carregarAtalhos() {
    chrome.storage.sync.get(["shortcuts"], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Erro ao carregar atalhos:", chrome.runtime.lastError);
            return;
        }

        let shortcuts = result?.shortcuts || {};
        let lista = document.getElementById("shortcutList");
        lista.innerHTML = "";

        if (Object.keys(shortcuts).length === 0) {
            lista.innerHTML = "<li>Nenhum atalho cadastrado</li>";
            return;
        }

        Object.entries(shortcuts).forEach(([atalho, texto]) => {
            let item = document.createElement("li");
            
            // Adiciona botão de remoção
            let removeBtn = document.createElement("button");
            removeBtn.textContent = "×";
            removeBtn.className = "remove-btn";
            removeBtn.onclick = () => removerAtalho(atalho);
            
            item.textContent = `${atalho} → ${texto} `;
            item.appendChild(removeBtn);
            lista.appendChild(item);
        });
    });
}

function removerAtalho(atalho) {
    chrome.storage.sync.get(["shortcuts"], (result) => {
        let shortcuts = result?.shortcuts || {};
        delete shortcuts[atalho];
        
        chrome.storage.sync.set({ shortcuts }, () => {
            if (chrome.runtime.lastError) {
                mostrarMensagem("Erro ao remover atalho");
                return;
            }
            mostrarMensagem("Atalho removido!");
            carregarAtalhos();
        });
    });
}

function mostrarMensagem(texto) {
    let mensagem = document.getElementById("message");
    if (!mensagem) return;
    
    mensagem.textContent = texto;
    mensagem.style.display = "block";
    setTimeout(() => {
        mensagem.style.display = "none";
    }, 2000);
}   