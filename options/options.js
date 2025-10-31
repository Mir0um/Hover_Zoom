document.addEventListener('DOMContentLoaded', async () => {
    // Set page language and localize content
    document.documentElement.lang = chrome.i18n.getUILanguage();
    
    // Translate page title
    document.title = chrome.i18n.getMessage('optionsPageTitle');
    
    localizeHtml();
    
    const permissionsStatus = document.getElementById('permissions-status');
    const extensionStatus = document.getElementById('extension-status');
    const grantButton = document.getElementById('grant-permissions');
    const revokeButton = document.getElementById('revoke-permissions');
    const reinjectButton = document.getElementById('reinject-scripts');
    const versionSpan = document.getElementById('version');
    const statusSpan = document.getElementById('status');
    const welcomeMessage = document.getElementById('welcome-message');
    const closeWelcomeButton = document.getElementById('close-welcome');

    // Afficher la version
    const manifest = chrome.runtime.getManifest();
    versionSpan.textContent = manifest.version;

    // Vérifier si c'est une première installation
    const installData = await chrome.storage.local.get('firstInstallShown');
    if (!installData.firstInstallShown) {
        // C'est la première fois que l'utilisateur ouvre les options
        welcomeMessage.style.display = 'block';
        
        // Défiler vers le haut pour s'assurer que le message est visible
        window.scrollTo(0, 0);
        
        // Marquer comme affiché
        await chrome.storage.local.set({ firstInstallShown: true });
        
        console.log('Hover Zoom: Welcome message displayed for first-time user');
    }

    // Gestionnaire pour fermer le message de bienvenue
    if (closeWelcomeButton) {
        closeWelcomeButton.addEventListener('click', () => {
            welcomeMessage.style.display = 'none';
        });
    }

    // Vérifier le statut initial
    await updateStatus();

    // Event listeners
    grantButton.addEventListener('click', async () => {
        try {
            const granted = await chrome.permissions.request({
                origins: ['<all_urls>']
            });

            if (granted) {
                await updateStatus();
                // Informer le background script
                chrome.runtime.sendMessage({ type: 'PERMISSIONS_GRANTED' });
            }
        } catch (error) {
            console.error('Error granting permissions:', error);
        }
    });

    revokeButton.addEventListener('click', async () => {
        try {
            const revoked = await chrome.permissions.remove({
                origins: ['<all_urls>']
            });

            if (revoked) {
                await updateStatus();
            }
        } catch (error) {
            console.error('Error revoking permissions:', error);
        }
    });

    reinjectButton.addEventListener('click', async () => {
        try {
            reinjectButton.disabled = true;
            reinjectButton.textContent = 'Réactivation en cours...';

            // Envoyer un message au background script pour réinjecter
            chrome.runtime.sendMessage({ type: 'REINJECT_ALL_TABS' });

            setTimeout(() => {
                reinjectButton.disabled = false;
                reinjectButton.textContent = 'Réactiver sur tous les onglets ouverts';
                updateStatus();
            }, 2000);
        } catch (error) {
            console.error('Error reinjecting scripts:', error);
            reinjectButton.disabled = false;
            reinjectButton.textContent = 'Réactiver sur tous les onglets ouverts';
        }
    });

    // Fonction pour mettre à jour le statut
    async function updateStatus() {
        try {
            // Vérifier les permissions
            const hasAllUrls = await chrome.permissions.contains({
                origins: ['<all_urls>']
            });

            // Vérifier si l'extension est activée
            const settings = await chrome.storage.local.get('extensionEnabled');
            const isEnabled = settings.extensionEnabled !== false;

            // Mettre à jour l'affichage des permissions
            if (hasAllUrls) {
                permissionsStatus.className = 'status success';
                permissionsStatus.textContent = '✓ Permissions accordées - L\'extension peut fonctionner sur tous les sites';
                grantButton.disabled = true;
                revokeButton.disabled = false;
            } else {
                permissionsStatus.className = 'status warning';
                permissionsStatus.textContent = '⚠ Permissions limitées - L\'extension ne fonctionne que sur l\'onglet actif';
                grantButton.disabled = false;
                revokeButton.disabled = true;
            }

            // Mettre à jour l'affichage de l'extension
            if (isEnabled) {
                extensionStatus.className = 'status success';
                extensionStatus.textContent = '✓ Extension activée';
                statusSpan.textContent = 'Activée';
                statusSpan.style.color = 'green';
            } else {
                extensionStatus.className = 'status error';
                extensionStatus.textContent = '✗ Extension désactivée';
                statusSpan.textContent = 'Désactivée';
                statusSpan.style.color = 'red';
            }

            // Mettre à jour le statut global
            if (isEnabled && hasAllUrls) {
                statusSpan.textContent = 'Entièrement opérationnelle';
                statusSpan.style.color = 'green';
            } else if (isEnabled && !hasAllUrls) {
                statusSpan.textContent = 'Fonctionnalité limitée';
                statusSpan.style.color = 'orange';
            }

        } catch (error) {
            console.error('Error updating status:', error);
            permissionsStatus.className = 'status error';
            permissionsStatus.textContent = 'Erreur lors de la vérification du statut';
        }
    }

    // Écouter les changements de permissions
    chrome.permissions.onAdded.addListener(() => {
        updateStatus();
    });

    chrome.permissions.onRemoved.addListener(() => {
        updateStatus();
    });

    // Écouter les changements de paramètres
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes.extensionEnabled) {
            updateStatus();
        }
    });
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
