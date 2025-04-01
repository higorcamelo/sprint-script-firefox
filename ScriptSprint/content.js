chrome.storage.sync.get("shortcuts", function(data) {
    const shortcuts = data.shortcuts || {};
    document.addEventListener("input", function(e) {
        if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
            let text = e.target.value;
            Object.keys(shortcuts).forEach(shortcut => {
                if (text.includes(shortcut)) {
                    e.target.value = text.replace(new RegExp(shortcut, 'g'), shortcuts[shortcut]);
                }
            });
        }
    });
});
