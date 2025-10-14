// Fonction pour demander les permissions d'hôtes
async function requestHostPermissions() {
    try {
        const hasPermission = await chrome.permissions.contains({
            origins: ['<all_urls>']
        });

        if (!hasPermission) {
            const granted = await chrome.permissions.request({
                origins: ['<all_urls>']
            });

            if (granted) {
                console.log('Hover Zoom: Host permissions granted');
                return true;
            } else {
                console.log('Hover Zoom: Host permissions denied');
                return false;
            }
        }
        return true;
    } catch (error) {
        console.log('Hover Zoom: Error requesting permissions:', error);
        return false;
    }
}

// Fonction pour injecter le script dans un onglet avec gestion des erreurs
async function injectScriptInTab(tabId, tabUrl) {
    try {
        // Vérifier que l'URL est valide pour l'injection
        if (!tabUrl || (!tabUrl.startsWith('http://') && !tabUrl.startsWith('https://'))) {
            return false;
        }

        // Vérifier que l'extension est activée
        const data = await chrome.storage.local.get('extensionEnabled');
        if (data.extensionEnabled === false) {
            return false;
        }

        // Vérifier les permissions
        const hasPermission = await chrome.permissions.contains({
            origins: [new URL(tabUrl).origin + '/*']
        });

        if (!hasPermission) {
            // Essayer d'injecter quand même (peut fonctionner avec activeTab)
            console.log(`Hover Zoom: No permission for ${new URL(tabUrl).origin}, trying anyway`);
        }

        // Injecter le CSS
        await chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['core/zoom.css']
        }).catch(() => {}); // Ignorer les erreurs CSS

        // Injecter le script de contenu
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['core/content.js']
        }).catch(() => {}); // Ignorer les erreurs de script

        console.log(`Hover Zoom: Script injected in tab ${tabId}`);
        return true;
    } catch (error) {
        // Erreur silencieuse - probablement un onglet sans permission
        return false;
    }
}

// Définir les valeurs par défaut lors de l'installation de l'extension
chrome.runtime.onInstalled.addListener(async (details) => {
    // Initialiser les paramètres pour toutes les raisons (install, update, etc.)
    await chrome.storage.local.set({
        extensionEnabled: true,
        zoomMode: 'natural', // 'natural' ou 'page'
        zoomFactor: 2
    });

    console.log("Hover Zoom: Settings initialized.");

    // Pour les nouvelles installations, demander les permissions
    if (details.reason === 'install') {
        console.log("Hover Zoom: First installation detected");
        
        // Attendre un peu avant de demander les permissions pour éviter les popups simultanés
        setTimeout(async () => {
            const granted = await requestHostPermissions();
            if (granted) {
                // Injecter le script dans tous les onglets existants
                await injectInAllTabs();
            }
        }, 1000);
    } else {
        // Pour les mises à jour, juste injecter dans les onglets existants
        await injectInAllTabs();
    }
});

// Fonction pour injecter dans tous les onglets
async function injectInAllTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        const promises = tabs.map(tab => injectScriptInTab(tab.id, tab.url));
        await Promise.allSettled(promises);
        console.log("Hover Zoom: Scripts injected in existing tabs.");
    } catch (error) {
        console.log("Hover Zoom: Error injecting in existing tabs:", error);
    }
}

// Écoute les mises à jour des onglets pour injecter le script si nécessaire
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // S'assurer que la page est complètement chargée
    if (changeInfo.status === 'complete' && tab.url) {
        await injectScriptInTab(tabId, tab.url);
    }
});

// Gérer l'activation/désactivation de l'extension
chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes.extensionEnabled) {
        const isEnabled = changes.extensionEnabled.newValue;
        
        // Si l'extension est réactivée, injecter dans tous les onglets
        if (isEnabled) {
            await injectInAllTabs();
        } else {
            // Si désactivée, envoyer un message pour désactiver
            try {
                const tabs = await chrome.tabs.query({});
                for (const tab of tabs) {
                    try {
                        await chrome.tabs.sendMessage(tab.id, { type: 'EXTENSION_DISABLED' });
                    } catch (e) {
                        // Ignorer les erreurs (onglet probablement fermé ou sans content script)
                    }
                }
            } catch (error) {
                console.log("Hover Zoom: Error sending disable message:", error);
            }
        }
    }
});

// Gérer les changements de permissions
chrome.permissions.onAdded.addListener(async (permissions) => {
    if (permissions.origins && permissions.origins.includes('<all_urls>')) {
        console.log('Hover Zoom: All URLs permission granted, injecting in all tabs');
        await injectInAllTabs();
    }
});

chrome.permissions.onRemoved.addListener((permissions) => {
    if (permissions.origins && permissions.origins.includes('<all_urls>')) {
        console.log('Hover Zoom: All URLs permission removed');
    }
});

// Gérer les messages depuis les pages d'options ou popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'PERMISSIONS_GRANTED') {
        await injectInAllTabs();
    } else if (message.type === 'REINJECT_ALL_TABS') {
        await injectInAllTabs();
    }
});
