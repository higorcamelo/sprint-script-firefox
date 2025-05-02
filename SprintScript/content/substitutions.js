(function () {
    if (!window.SprintScript) {
      window.SprintScript = {};
    }
  
    let substitutions = {}; // Armazena os atalhos
  
    /**
     * Carrega as substituições armazenadas no Chrome Storage
     * @param {Function} callback Função de callback a ser chamada após o carregamento
     */
    function loadSubstitutions(callback) {
      chrome.storage.sync.get("shortcuts", (result) => {
        substitutions = result?.shortcuts || {};
        console.log("Atalhos carregados:", substitutions);
        if (callback) callback();
      });
    }
  
    /**
     * Retorna todos os atalhos carregados
     * @returns {Object} Lista de substituições
     */
    function getSubstitutions() {
      return substitutions;
    }
  
    /**
     * Atualiza as substituições no Chrome Storage
     */
    function saveSubstitutions() {
      chrome.storage.sync.set({ shortcuts: substitutions }, () => {
        console.log("Atalhos salvos:", substitutions);
      });
    }
  
    // Exportar para o namespace global
    window.SprintScript.substitutions = {
      loadSubstitutions,
      getSubstitutions,
      saveSubstitutions
    };
  })();
  