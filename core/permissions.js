// Script pour gérer les permissions d'hôtes
async function requestHostPermissions() {
    try {
        // Vérifier si on a déjà les permissions
        const hasPermission = await chrome.permissions.contains({
            origins: ['<all_urls>']
        });

        if (!hasPermission) {
            // Demander les permissions si elles ne sont pas accordées
            const granted = await chrome.permissions.request({
                origins: ['<all_urls>']
            });

            if (granted) {
                console.log('Hover Zoom: Host permissions granted');
                // Injecter dans tous les onglets existants
                reinjectAllTabs();
            } else {
                console.log('Hover Zoom: Host permissions denied');
            }
        }
    } catch (error) {
        console.log('Hover Zoom: Error requesting permissions:', error);
    }
}

async function reinjectAllTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                try {
                    await chrome.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ['core/zoom.css']
                    });
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['core/content.js']
                    });
                } catch (e) {
                    // Ignorer les erreurs pour les onglets où on ne peut pas injecter
                }
            }
        }
    } catch (error) {
        console.log('Hover Zoom: Error reinjecting in tabs:', error);
    }
}

// Exposer les fonctions pour utilisation dans background.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { requestHostPermissions, reinjectAllTabs };
} else if (typeof window !== 'undefined') {
    window.HoverZoomPermissions = { requestHostPermissions, reinjectAllTabs };
}