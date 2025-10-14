document.addEventListener('DOMContentLoaded', () => {
    // Set page language to match browser UI
    document.documentElement.lang = chrome.i18n.getUILanguage();

    // Replace __MSG_***__ placeholders with translations
    localizeHtml();
    // --- SÉLECTEURS ---
    const toggleSwitch = document.getElementById('toggle-extension');
    const zoomOptionsDiv = document.getElementById('zoom-options');
    const zoomModeRadios = document.querySelectorAll('input[name="zoomMode"]');
    const zoomFactorInput = document.getElementById('zoom-factor');
    const githubLink = document.getElementById('github-link');
    const imagusLink = document.getElementById('imagus-link'); // NOUVEAU
    const optionsLink = document.getElementById('options-link'); // NOUVEAU

    // --- LOGIQUE DES OPTIONS (INCHANGÉE) ---
    chrome.storage.local.get(['extensionEnabled', 'zoomMode', 'zoomFactor'], (result) => {
        toggleSwitch.checked = result.extensionEnabled ?? true;
        updateOptionsVisibility(toggleSwitch.checked);

        const mode = result.zoomMode ?? 'natural';
        document.querySelector(`input[value="${mode}"]`).checked = true;

        zoomFactorInput.value = result.zoomFactor ?? 2;
    });

    toggleSwitch.addEventListener('change', (event) => {
        const isEnabled = event.target.checked;
        chrome.storage.local.set({ extensionEnabled: isEnabled });
        updateOptionsVisibility(isEnabled);
        notifyContentScriptOfUpdate();
    });

    zoomModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.checked) {
                chrome.storage.local.set({ zoomMode: event.target.value });
                notifyContentScriptOfUpdate();
            }
        });
    });

    zoomFactorInput.addEventListener('change', (event) => {
        const factor = parseFloat(event.target.value);
        chrome.storage.local.set({ zoomFactor: isNaN(factor) ? 2 : factor }, () => {
            notifyContentScriptOfUpdate();
        });
    });

    function updateOptionsVisibility(isEnabled) {
        zoomOptionsDiv.classList.toggle('disabled', !isEnabled);
    }

    async function notifyContentScriptOfUpdate() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                // Envoie un message au content script pour signaler que les paramètres ont été mis à jour
                await chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED' }).catch(() => {}); //
            }
        } catch (error) {
            console.error("Could not send message to content script:", error);
        }
    }

    // --- LOGIQUE DES LIENS EXTERNES ---
    
    // Fonction réutilisable pour ouvrir les liens externes
    function handleExternalLink(event) {
        event.preventDefault(); 
        chrome.tabs.create({ url: event.currentTarget.href });
    }

    // Fonction pour ouvrir la page options
    function handleOptionsLink(event) {
        event.preventDefault();
        chrome.runtime.openOptionsPage();
    }

    githubLink.addEventListener('click', handleExternalLink);
    imagusLink.addEventListener('click', handleExternalLink); // NOUVEAU
    optionsLink.addEventListener('click', handleOptionsLink); // NOUVEAU
});

// Replace all __MSG_key__ tokens in the DOM with localized strings
function localizeHtml() {
    const tokenRegex = /__MSG_(\w+)__/g;

    // Collect text nodes first so replacing them doesn't disturb the walker
    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }

    // Replace text node content (allowing HTML markup in translations)
    textNodes.forEach(textNode => {
        const original = textNode.nodeValue;
        if (tokenRegex.test(original)) {
            const replaced = original.replace(tokenRegex, (_, key) => chrome.i18n.getMessage(key) || '');
            const frag = document.createRange().createContextualFragment(replaced);
            textNode.replaceWith(frag);
        }
    });

    // Replace attribute values
    document.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.value.includes('__MSG_')) {
                attr.value = attr.value.replace(tokenRegex, (_, key) => chrome.i18n.getMessage(key) || '');
            }
        });
    });
}
