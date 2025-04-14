document.addEventListener("DOMContentLoaded", () => {
    loadShortcuts();
    document.getElementById("saveButton").addEventListener("click", saveShortcut);
});

function saveShortcut() {
    const shortcut = document.getElementById("shortcut").value.trim();
    const replacement = document.getElementById("replacement").value.trim();

    if (!shortcut || !replacement) {
        showMessage("Please fill in both fields!", "error");
        return;
    }

    chrome.storage.sync.get(["shortcuts"], (result) => {
        const shortcuts = result?.shortcuts || {};

        if (shortcuts[shortcut]) {
            openConfirmModal(() => {
                shortcuts[shortcut] = replacement;
                saveAndRefresh(shortcuts, shortcut);
            });
        } else {
            shortcuts[shortcut] = replacement;
            saveAndRefresh(shortcuts, shortcut);
        }
    });
}

function saveAndRefresh(shortcuts, shortcut) {
    chrome.storage.sync.set({ shortcuts }, () => {
        if (chrome.runtime.lastError) {
            showMessage("Error saving: " + chrome.runtime.lastError.message, "error");
            return;
        }
        showMessage("Shortcut saved successfully!", "success");
        document.getElementById("shortcut").value = "";
        document.getElementById("replacement").value = "";
        loadShortcuts();

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateShortcuts" });
        });
    });
}

function loadShortcuts() {
    chrome.storage.sync.get(["shortcuts"], (result) => {
        if (chrome.runtime.lastError) {
            console.error("Error loading shortcuts:", chrome.runtime.lastError);
            return;
        }

        const shortcuts = result?.shortcuts || {};
        const list = document.getElementById("shortcutList");
        list.innerHTML = "";

        if (Object.keys(shortcuts).length === 0) {
            list.innerHTML = "<li class='empty'>No shortcuts saved</li>";
            return;
        }

        Object.entries(shortcuts).forEach(([shortcut, text]) => {
            const li = document.createElement("li");
            li.textContent = `${shortcut} → ${text}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.classList.add("delete-btn");

            deleteBtn.addEventListener("click", () => {
                openConfirmModal(() => {
                    delete shortcuts[shortcut];
                    chrome.storage.sync.set({ shortcuts }, () => {
                        showMessage("Shortcut deleted", "success");
                        loadShortcuts();
                    });
                });
            });

            li.appendChild(deleteBtn);
            list.appendChild(li);
        });
    });
}

function showMessage(message, type) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.style.display = "block";
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 2500);
}

// Modal logic
function openConfirmModal(onConfirm) {
    const modal = document.getElementById("confirmModal");
    modal.classList.remove("hidden");

    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");

    function cleanup() {
        confirmBtn.removeEventListener("click", handleConfirm);
        cancelBtn.removeEventListener("click", handleCancel);
        modal.classList.add("hidden");
    }

    function handleConfirm() {
        onConfirm();
        cleanup();
    }

    function handleCancel() {
        cleanup();
    }

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
}
