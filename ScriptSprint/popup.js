document.addEventListener("DOMContentLoaded", function() {
    const shortcutInput = document.getElementById("shortcut");
    const replacementInput = document.getElementById("replacement");
    const saveButton = document.getElementById("save");
    const shortcutList = document.getElementById("shortcutList");

    function loadShortcuts() {
        chrome.storage.sync.get("shortcuts", function(data) {
            shortcutList.innerHTML = "";
            const shortcuts = data.shortcuts || {};
            Object.keys(shortcuts).forEach(key => {
                const li = document.createElement("li");
                li.textContent = `${key} → ${shortcuts[key]}`;
                shortcutList.appendChild(li);
            });
        });
    }

    saveButton.addEventListener("click", function() {
        const shortcut = shortcutInput.value.trim();
        const replacement = replacementInput.value.trim();
        if (shortcut && replacement) {
            chrome.storage.sync.get("shortcuts", function(data) {
                const shortcuts = data.shortcuts || {};
                shortcuts[shortcut] = replacement;
                chrome.storage.sync.set({ shortcuts }, function() {
                    loadShortcuts();
                });
            });
        }
    });

    loadShortcuts();
});
