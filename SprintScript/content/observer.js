(function () {
    if (!window.SprintScript) {
      window.SprintScript = {};
    }
  
    const observer = new MutationObserver(() => {
      if (window.SprintScript.utils && typeof window.SprintScript.utils.addListeners === "function") {
        window.SprintScript.utils.addListeners();
      }
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  })();
  