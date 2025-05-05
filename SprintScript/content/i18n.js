(function () {
    if (!window.SprintScript) {
      window.SprintScript = {};
    }
  
    const LOCALES = {
      en: 'locales/en-US.json',
      pt: 'locales/pt.json'
    };
  
    let i18n = {};
    let t = (key) => key;  // fallback até carregar traduções
  
    function detectLanguage() {
      const nav = navigator.language || navigator.userLanguage;
      return nav.toLowerCase().startsWith('pt') ? 'pt' : 'en';
    }
  
    async function loadLocale(lang) {
      const url = chrome.runtime.getURL(LOCALES[lang] || LOCALES.en);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not load locale ${lang}: ${res.statusText}`);
        return await res.json();
      } catch (e) {
        if (lang !== "en") {
          console.warn(`Failed to load ${lang}, trying 'en' as fallback.`);
          return loadLocale("en");
        }
        throw e;
      }
    }
  
    function createTranslator(dict) {
      return function (key, replacements = {}) {
        let txt = dict[key] || key;
        for (const [k, v] of Object.entries(replacements)) {
          txt = txt.replace(`__${k}__`, v);
        }
        return txt;
      };
    }
  
    // Carregar traduções ao iniciar
    setTimeout(async () => {
      try {
        const lang = detectLanguage();
        i18n = await loadLocale(lang);
        t = createTranslator(i18n);
      } catch (e) {
        console.error('i18n load error:', e);
      }
    }, 10);
  
    // Expor publicamente
    window.SprintScript.i18n = {
      t,
      getDict: () => i18n
    };
  })();
  