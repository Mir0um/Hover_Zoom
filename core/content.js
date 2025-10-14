(() => {
    // Empêcher les injections multiples avec un identifiant unique
    const scriptId = 'hover-zoom-content-script';
    if (window[scriptId]) {
        return;
    }
    window[scriptId] = true;

    let settings = { extensionEnabled: true, zoomMode: 'natural', zoomFactor: 2 };
    
    let zoomOverlay, zoomOverlayImage, zoomOverlayVideo;
    let zoomViewer, zoomViewerImage, zoomViewerVideo;
    let rafId = null;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let currentHoveredElement = null;
    let mutationObserver = null;
    let isExtensionActive = true;

    // Fonction pour charger les paramètres
    async function loadSettings() {
        try {
            const data = await chrome.storage.local.get(['extensionEnabled', 'zoomMode', 'zoomFactor']);
            settings = {
                extensionEnabled: data.extensionEnabled !== false,
                zoomMode: data.zoomMode || 'natural',
                zoomFactor: data.zoomFactor || 2
            };
            isExtensionActive = settings.extensionEnabled;
            
            console.log('Hover Zoom: Settings loaded:', settings);
            
            if (!isExtensionActive) {
                hideAllZoom();
                removeEventListeners();
            } else {
                addEventListeners();
            }
        } catch (error) {
            console.error('Hover Zoom: Error loading settings:', error);
            // Utiliser les valeurs par défaut en cas d'erreur
            settings = {
                extensionEnabled: true,
                zoomMode: 'natural',
                zoomFactor: 2
            };
            isExtensionActive = true;
            addEventListeners();
        }
    }

    // Fonction pour gérer la touche Escape
    function handleKeyDown(event) {
        if (!isExtensionActive) return;
        if (event.key === 'Escape') {
            hideAllZoom();
        }
    }

    // Fonction pour ajouter les event listeners
    function addEventListeners() {
        // Supprimer d'abord pour éviter les doublons
        removeEventListeners();
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('keydown', handleKeyDown, true);
        
        // Ajouter des listeners pour détecter les changements dynamiques d'images
        document.addEventListener('load', handleImageLoad, true);
        document.addEventListener('error', handleImageError, true);
    }

    // Fonction pour supprimer les event listeners
    function removeEventListeners() {
        document.removeEventListener('mouseover', handleMouseOver, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('load', handleImageLoad, true);
        document.removeEventListener('error', handleImageError, true);
    }

    // Gestionnaire pour les images qui se chargent dynamiquement
    function handleImageLoad(event) {
        if (!isExtensionActive || !settings.extensionEnabled) return;
        
        const target = event.target;
        
        // Si c'est l'élément actuellement survolé qui a chargé une nouvelle image
        if (target === currentHoveredElement && (target.tagName === 'IMG' || target.tagName === 'VIDEO')) {
            console.log('Hover Zoom: Media loaded dynamically, updating overlay');
            
            let mediaUrl = null;
            let mediaType = 'image';
            
            try {
                if (target.tagName === 'IMG' && target.src) {
                    mediaUrl = target.src;
                    mediaType = 'image';
                } else if (target.tagName === 'VIDEO' && (target.currentSrc || target.src)) {
                    mediaUrl = target.currentSrc || target.src;
                    mediaType = 'video';
                }
                
                if (mediaUrl) {
                    // Mettre à jour l'overlay avec la nouvelle image
                    showZoom(mediaUrl, { clientX: lastMouseX, clientY: lastMouseY }, mediaType);
                }
            } catch (error) {
                console.error('Hover Zoom: Error in handleImageLoad:', error);
            }
        }
    }

    // Gestionnaire pour les erreurs de chargement d'images
    function handleImageError(event) {
        const target = event.target;
        
        // Si l'élément actuellement survolé a une erreur de chargement
        if (target === currentHoveredElement && (target.tagName === 'IMG' || target.tagName === 'VIDEO')) {
            console.log('Hover Zoom: Media failed to load, hiding overlay');
            hideAllZoom();
        }
    }

    // Fonction utilitaire pour vérifier si une URL pointe vers une image
    // C'est plus robuste que de simplement vérifier l'extension.
    function isImageUrl(url) {
        try {
            // Utilise l'API URL pour analyser le lien (gère aussi les URLs relatives)
            const path = new URL(url, location.href).pathname.toLowerCase();
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.apng', '.ico', '.tif', '.tiff'];
            // Vérifie si le chemin de l'URL se termine par une extension d'image
            return imageExtensions.some(ext => path.endsWith(ext));
        } catch (e) {
            // Si l'URL est invalide (ex: "javascript:void(0)")
            return false;
        }
    }

    function isVideoUrl(url) {
        try {
            const path = new URL(url, location.href).pathname.toLowerCase();
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.mkv', '.flv'];
            return videoExtensions.some(ext => path.endsWith(ext));
        } catch (e) {
            return false;
        }
    }

    function createZoomElements() {
        if (document.getElementById('image-zoom-overlay')) {
            console.log('Hover Zoom: Elements already created');
            return;
        }

        try {
            zoomOverlay = document.createElement('div');
            zoomOverlay.id = 'image-zoom-overlay';
            zoomOverlayImage = document.createElement('img');
            zoomOverlayVideo = document.createElement('video');
            Object.assign(zoomOverlayVideo, { autoplay: true, muted: true, loop: true });
            zoomOverlay.appendChild(zoomOverlayImage);
            zoomOverlay.appendChild(zoomOverlayVideo);

            zoomViewer = document.createElement('div');
            zoomViewer.id = 'image-zoom-viewer';
            zoomViewerImage = document.createElement('img');
            zoomViewerVideo = document.createElement('video');
            Object.assign(zoomViewerVideo, { autoplay: true, muted: true, loop: true });
            zoomViewer.appendChild(zoomViewerImage);
            zoomViewer.appendChild(zoomViewerVideo);

            // Attendre que le body soit disponible
            if (document.body) {
                document.body.appendChild(zoomOverlay);
                document.body.appendChild(zoomViewer);
            } else {
                // Si le body n'est pas encore disponible, attendre qu'il soit chargé
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(zoomOverlay);
                    document.body.appendChild(zoomViewer);
                });
            }
            
            console.log('Hover Zoom: Elements created successfully');
        } catch (error) {
            console.error('Hover Zoom: Error creating elements:', error);
        }
    }

    function hideAllZoom() {
        if (zoomOverlay) {
            zoomOverlay.style.display = 'none';
        }
        if (zoomViewer) {
            zoomViewer.style.display = 'none';
        }
        if (zoomOverlayImage instanceof HTMLElement) {
            zoomOverlayImage.removeAttribute('src');
            zoomOverlayImage.style.width = '';
            zoomOverlayImage.style.height = '';
            zoomOverlayImage.onerror = null;
            zoomOverlayImage.onload = null;
        }
        if (zoomViewerImage instanceof HTMLElement) {
            zoomViewerImage.removeAttribute('src');
            zoomViewerImage.style.width = '';
            zoomViewerImage.style.height = '';
            zoomViewerImage.onerror = null;
            zoomViewerImage.onload = null;
        }
        if (zoomOverlayVideo instanceof HTMLVideoElement) {
            zoomOverlayVideo.pause();
            zoomOverlayVideo.removeAttribute('src');
            zoomOverlayVideo.style.width = '';
            zoomOverlayVideo.style.height = '';
            zoomOverlayVideo.onerror = null;
            zoomOverlayVideo.onloadedmetadata = null;
        }
        if (zoomViewerVideo instanceof HTMLVideoElement) {
            zoomViewerVideo.pause();
            zoomViewerVideo.removeAttribute('src');
            zoomViewerVideo.style.width = '';
            zoomViewerVideo.style.height = '';
            zoomViewerVideo.onerror = null;
            zoomViewerVideo.onloadedmetadata = null;
        }

        document.removeEventListener('mousemove', handleMouseMove);
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        
        // Arrêter l'observation des mutations
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObserver = null;
        }
        currentHoveredElement = null;
        // La gestion du mouseout est maintenant sur l'élément lui-même, pas besoin de le retirer ici.
    }

    // MODIFIÉ: Logique de détection unifiée avec support du lazy loading
    function handleMouseOver(event) {
        if (!isExtensionActive || !settings.extensionEnabled) return;
        
        const target = event.target;
        
        // Vérifier que les éléments de zoom sont créés
        if (!zoomOverlay || !zoomViewer) {
            console.warn('Hover Zoom: Zoom elements not created yet, attempting to create');
            createZoomElements();
            // Wait a bit for elements to be added to DOM
            setTimeout(() => {
                if (zoomOverlay && zoomViewer) {
                    handleMouseOver(event);
                }
            }, 50);
            return;
        }
        
        let mediaUrl = null;
        let mediaType = 'image';

        try {
            // Cas 1: C'est une balise <img>
            if (target.tagName === 'IMG') {
                if (target.clientWidth < 50 || target.clientHeight < 50) return;
                
                // Priorité 1: src classique
                if (target.src && target.src !== '' && !target.src.includes('data:image')) {
                    mediaUrl = target.src;
                    mediaType = 'image';
                }
                // Priorité 2: data-src pour lazy loading
                else if (target.getAttribute('data-src')) {
                    mediaUrl = target.getAttribute('data-src');
                    mediaType = 'image';
                }
                // Priorité 3: autres attributs de lazy loading
                else if (target.getAttribute('data-lazy-src')) {
                    mediaUrl = target.getAttribute('data-lazy-src');
                    mediaType = 'image';
                }
                else if (target.getAttribute('data-original')) {
                    mediaUrl = target.getAttribute('data-original');
                    mediaType = 'image';
                }
                // Priorité 4: srcset (prendre la première image)
                else if (target.srcset) {
                    const srcsetUrl = target.srcset.split(',')[0].trim().split(' ')[0];
                    if (srcsetUrl) {
                        mediaUrl = srcsetUrl;
                        mediaType = 'image';
                    }
                }
            }
            // Cas 1b: Balise <video>
            else if (target.tagName === 'VIDEO' && (target.currentSrc || target.src)) {
                if (target.clientWidth < 50 || target.clientHeight < 50) return;
                mediaUrl = target.currentSrc || target.src;
                mediaType = 'video';
            }
            // Cas 2: C'est un lien <a> qui pointe vers une image
            else if (target.tagName === 'A' && target.href) {
                if (isImageUrl(target.href)) {
                    mediaUrl = target.href;
                    mediaType = 'image';
                } else if (isVideoUrl(target.href)) {
                    mediaUrl = target.href;
                    mediaType = 'video';
                }
            }

            // Si on a trouvé une URL d'image, on lance la prévisualisation
            if (mediaUrl) {
                currentHoveredElement = target;
                
                // Retirer l'ancien écouteur si présent
                const oldHandler = target._hoverZoomMouseOutHandler;
                if (oldHandler) {
                    target.removeEventListener('mouseout', oldHandler);
                }
                
                // Créer un nouveau gestionnaire de sortie
                const mouseOutHandler = (event) => {
                    // Vérifier que la souris est vraiment sortie de l'élément
                    const relatedTarget = event.relatedTarget;
                    if (!relatedTarget || !target.contains(relatedTarget)) {
                        hideAllZoom();
                    }
                };
                
                // Stocker le gestionnaire pour pouvoir le retirer plus tard
                target._hoverZoomMouseOutHandler = mouseOutHandler;
                
                // Ajouter l'écouteur
                target.addEventListener('mouseout', mouseOutHandler, { once: true });
                
                showZoom(mediaUrl, event, mediaType);
                // Observer les changements sur l'élément
                observeElementChanges(target);
            }
        } catch (error) {
            console.error('Hover Zoom: Error in handleMouseOver:', error);
        }
    }
    
    // AMÉLIORÉ: Observer les changements d'attributs de l'élément survolé avec détection plus robuste
    function observeElementChanges(element) {
        // Arrêter toute observation précédente
        if (mutationObserver) {
            mutationObserver.disconnect();
        }
        
        mutationObserver = new MutationObserver((mutations) => {
            let shouldUpdateOverlay = false;
            let shouldHideOverlay = false;
            let newMediaUrl = null;
            let newMediaType = 'image';
            
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.target === currentHoveredElement) {
                    const attrName = mutation.attributeName;
                    const oldValue = mutation.oldValue;
                    const newValue = mutation.target.getAttribute(attrName);
                    
                    // Détecter les changements de source (src, href, data-src, etc.)
                    if ((attrName === 'src' || attrName === 'currentSrc' || attrName === 'href' || 
                         attrName === 'data-src' || attrName === 'data-lazy-src' || attrName === 'data-original' || attrName === 'srcset')) {
                        // Vérifier si la valeur a réellement changé
                        if (oldValue !== newValue) {
                            console.log(`Hover Zoom: ${attrName} changed from "${oldValue}" to "${newValue}"`);
                            
                            // Déterminer la nouvelle URL et le type
                            if (currentHoveredElement.tagName === 'IMG') {
                                // Priorité 1: src classique
                                if (currentHoveredElement.src && currentHoveredElement.src !== '' && !currentHoveredElement.src.includes('data:image')) {
                                    newMediaUrl = currentHoveredElement.src;
                                    newMediaType = 'image';
                                    shouldUpdateOverlay = true;
                                }
                                // Priorité 2: data-src pour lazy loading
                                else if (currentHoveredElement.getAttribute('data-src')) {
                                    newMediaUrl = currentHoveredElement.getAttribute('data-src');
                                    newMediaType = 'image';
                                    shouldUpdateOverlay = true;
                                }
                                // Priorité 3: autres attributs de lazy loading
                                else if (currentHoveredElement.getAttribute('data-lazy-src')) {
                                    newMediaUrl = currentHoveredElement.getAttribute('data-lazy-src');
                                    newMediaType = 'image';
                                    shouldUpdateOverlay = true;
                                }
                                else if (currentHoveredElement.getAttribute('data-original')) {
                                    newMediaUrl = currentHoveredElement.getAttribute('data-original');
                                    newMediaType = 'image';
                                    shouldUpdateOverlay = true;
                                }
                                // Priorité 4: srcset
                                else if (currentHoveredElement.srcset) {
                                    const srcsetUrl = currentHoveredElement.srcset.split(',')[0].trim().split(' ')[0];
                                    if (srcsetUrl) {
                                        newMediaUrl = srcsetUrl;
                                        newMediaType = 'image';
                                        shouldUpdateOverlay = true;
                                    }
                                } else {
                                    shouldHideOverlay = true;
                                }
                            } else if (currentHoveredElement.tagName === 'VIDEO' && (currentHoveredElement.currentSrc || currentHoveredElement.src)) {
                                newMediaUrl = currentHoveredElement.currentSrc || currentHoveredElement.src;
                                newMediaType = 'video';
                                shouldUpdateOverlay = true;
                            } else if (currentHoveredElement.tagName === 'A' && currentHoveredElement.href) {
                                if (isImageUrl(currentHoveredElement.href)) {
                                    newMediaUrl = currentHoveredElement.href;
                                    newMediaType = 'image';
                                    shouldUpdateOverlay = true;
                                } else if (isVideoUrl(currentHoveredElement.href)) {
                                    newMediaUrl = currentHoveredElement.href;
                                    newMediaType = 'video';
                                    shouldUpdateOverlay = true;
                                } else {
                                    shouldHideOverlay = true;
                                }
                            } else {
                                shouldHideOverlay = true;
                            }
                        }
                    }
                    // Détecter les changements de visibilité
                    else if (attrName === 'style' || attrName === 'class' || attrName === 'hidden') {
                        if (!isElementStillValid(currentHoveredElement)) {
                            shouldHideOverlay = true;
                            console.log('Hover Zoom: Element became invisible or invalid');
                        }
                    }
                }
            }
            
            // Appliquer les changements
            if (shouldHideOverlay) {
                hideAllZoom();
            } else if (shouldUpdateOverlay && newMediaUrl) {
                console.log(`Hover Zoom: Updating overlay with new ${newMediaType}: ${newMediaUrl}`);
                // Utiliser la dernière position de la souris connue
                showZoom(newMediaUrl, { clientX: lastMouseX, clientY: lastMouseY }, newMediaType);
            }
        });
        
        // Observer les changements d'attributs sur l'élément avec oldValue pour détecter les vrais changements
        mutationObserver.observe(element, {
            attributes: true,
            attributeFilter: ['src', 'href', 'currentSrc', 'style', 'class', 'hidden', 'data-src', 'data-lazy-src', 'data-original', 'srcset'],
            attributeOldValue: true
        });
        
        // Observer aussi les changements sur le parent pour détecter les suppressions d'éléments
        if (element.parentNode) {
            mutationObserver.observe(element.parentNode, {
                childList: true
            });
        }
    }
    
    function handleMouseMove(event) {
        if (settings.zoomMode !== 'natural') return;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                positionViewer(lastMouseX, lastMouseY);
                rafId = null;
            });
        }
    }

    // MODIFIÉ: La fonction accepte directement une URL et le type de média
    function showZoom(mediaUrl, event, type = 'image') {
        hideAllZoom();

        if (settings.zoomMode === 'page') {
            if (type === 'video') {
                zoomOverlayImage.removeAttribute('src');
                zoomOverlayImage.style.width = '';
                zoomOverlayImage.style.height = '';

                zoomOverlayVideo.onerror = hideAllZoom;
                zoomOverlayVideo.onloadedmetadata = () => {
                    zoomOverlayVideo.onerror = null;
                    zoomOverlayVideo.onloadedmetadata = null;
                };
                zoomOverlayVideo.src = mediaUrl;
                zoomOverlayVideo.style.display = 'block';
                zoomOverlayImage.style.display = 'none';
            } else {
                zoomOverlayVideo.pause();
                zoomOverlayVideo.removeAttribute('src');
                zoomOverlayVideo.style.width = '';
                zoomOverlayVideo.style.height = '';

                zoomOverlayImage.onerror = hideAllZoom;
                zoomOverlayImage.onload = () => {
                    zoomOverlayImage.onerror = null;
                    zoomOverlayImage.onload = null;
                };
                zoomOverlayImage.src = mediaUrl;
                zoomOverlayImage.style.display = 'block';
                zoomOverlayVideo.style.display = 'none';
            }
            zoomOverlay.style.display = 'flex';
        } else { // Mode "natural" (scaled)
            if (type === 'video') {
                if (zoomViewerImage instanceof HTMLElement) {
                    zoomViewerImage.removeAttribute('src');
                    zoomViewerImage.style.width = '';
                    zoomViewerImage.style.height = '';
                }

                zoomViewerVideo.onerror = hideAllZoom;
                zoomViewerVideo.src = mediaUrl;
                zoomViewerVideo.onloadedmetadata = () => {
                    zoomViewerVideo.onerror = null;
                    const dimensions = {
                        width: zoomViewerVideo.videoWidth * settings.zoomFactor,
                        height: zoomViewerVideo.videoHeight * settings.zoomFactor
                    };
                    adjustViewerSize(zoomViewerVideo, dimensions, event);
                    zoomViewerVideo.onloadedmetadata = null;
                };
                zoomViewerImage.style.display = 'none';
                zoomViewerVideo.style.display = 'block';
            } else {
                if (zoomViewerVideo instanceof HTMLVideoElement) {
                    zoomViewerVideo.pause();
                    zoomViewerVideo.removeAttribute('src');
                    zoomViewerVideo.style.width = '';
                    zoomViewerVideo.style.height = '';
                }

                zoomViewerImage.onerror = hideAllZoom;
                zoomViewerImage.src = mediaUrl;
                zoomViewerImage.onload = () => {
                    zoomViewerImage.onerror = null;
                    const dimensions = {
                        width: zoomViewerImage.naturalWidth * settings.zoomFactor,
                        height: zoomViewerImage.naturalHeight * settings.zoomFactor
                    };
                    adjustViewerSize(zoomViewerImage, dimensions, event);
                    zoomViewerImage.onload = null;
                };
                zoomViewerVideo.style.display = 'none';
                zoomViewerImage.style.display = 'block';
            }
            document.addEventListener('mousemove', handleMouseMove);
            positionViewer(event.clientX, event.clientY);
            zoomViewer.style.display = 'block';
        }
    }
    
    function adjustViewerSize(element, dimensions, event) {
        const offset = 20;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const spaceLeft = event.clientX - offset;
        const spaceRight = viewportWidth - event.clientX - offset;
        const maxHorizontalSpace = Math.max(spaceLeft, spaceRight);

        let newWidth = dimensions.width;
        let newHeight = dimensions.height;

        const widthLimit = Math.min(maxHorizontalSpace, viewportWidth * 0.9);
        const heightLimit = viewportHeight * 0.9;
        const ratio = Math.min(widthLimit / newWidth, heightLimit / newHeight, 1);
        newWidth *= ratio;
        newHeight *= ratio;

        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;
    }

    function positionViewer(mouseX, mouseY) {
        if (!zoomViewer || zoomViewer.style.display === 'none') return;

        const offset = 20;
        const viewerWidth = zoomViewer.offsetWidth;
        const viewerHeight = zoomViewer.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const spaceRight = viewportWidth - mouseX - offset;
        const spaceLeft = mouseX - offset;

        let left;
        if (spaceRight >= spaceLeft) {
            left = Math.min(mouseX + offset, viewportWidth - viewerWidth - offset);
        } else {
            left = Math.max(offset, mouseX - viewerWidth - offset);
        }

        let top = mouseY - (viewerHeight / 2);
        if (top < offset) top = offset;
        if (top + viewerHeight > viewportHeight - offset) {
            top = viewportHeight - viewerHeight - offset;
        }

        zoomViewer.style.left = `${left}px`;
        zoomViewer.style.top = `${top}px`;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'SETTINGS_UPDATED') {
            loadSettings().then(() => {
                if (zoomViewer && zoomViewer.style.display === 'block' && settings.zoomMode === 'natural') {
                    const activeElement = zoomViewerVideo.style.display === 'block' ? zoomViewerVideo : zoomViewerImage;
                    if (activeElement) {
                        const dimensions = activeElement instanceof HTMLVideoElement
                            ? {
                                width: activeElement.videoWidth * settings.zoomFactor,
                                height: activeElement.videoHeight * settings.zoomFactor
                              }
                            : {
                                width: activeElement.naturalWidth * settings.zoomFactor,
                                height: activeElement.naturalHeight * settings.zoomFactor
                              };
                        adjustViewerSize(activeElement, dimensions, { clientX: lastMouseX, clientY: lastMouseY });
                        positionViewer(lastMouseX, lastMouseY);
                    }
                }
            });
        } else if (request.type === 'EXTENSION_DISABLED') {
            isExtensionActive = false;
            hideAllZoom();
            removeEventListeners();
        }
    });

    // Initialisation avec gestion du chargement du DOM
    function initializeExtension() {
        console.log('Hover Zoom: Initializing extension');
        createZoomElements();
        loadSettings();
        setupLazyLoadingListeners();
        
        // Observer les changements globaux pour les applications SPA et les images dynamiques
        startGlobalObserver();
        
        console.log('Hover Zoom: Extension initialized successfully');
    }
    
    // Fonction pour démarrer l'observateur global
    function startGlobalObserver() {
        let lastUrl = location.href;
        let globalMutationObserver = new MutationObserver((mutations) => {
        const currentUrl = location.href;
        let shouldHideZoom = false;
        
        // Vérifier si l'URL a changé
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            shouldHideZoom = true;
            console.log('Hover Zoom: URL changed, hiding overlay');
        }
        
        // Vérifier les mutations pour détecter les changements d'images
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                // Vérifier si des éléments ont été supprimés
                for (const removedNode of mutation.removedNodes) {
                    if (removedNode === currentHoveredElement || 
                        (removedNode.nodeType === Node.ELEMENT_NODE && 
                         removedNode.contains && removedNode.contains(currentHoveredElement))) {
                        shouldHideZoom = true;
                        console.log('Hover Zoom: Hovered element removed from DOM');
                        break;
                    }
                }
                
                // Vérifier si de nouvelles images ont été ajoutées (lazy loading)
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType === Node.ELEMENT_NODE) {
                        const newImages = addedNode.tagName === 'IMG' ? [addedNode] : 
                                         addedNode.querySelectorAll ? addedNode.querySelectorAll('img, video') : [];
                        
                        // Ajouter des listeners pour les nouvelles images
                        newImages.forEach(img => {
                            img.addEventListener('load', handleImageLoad, true);
                            img.addEventListener('error', handleImageError, true);
                        });
                    }
                }
            } else if (mutation.type === 'attributes') {
                // Vérifier si l'élément survolé a changé
                if (mutation.target === currentHoveredElement) {
                    const attrName = mutation.attributeName;
                    if (attrName === 'src' || attrName === 'href' || attrName === 'style' || attrName === 'class') {
                        // Vérifier si l'élément est toujours visible et valide
                        if (!isElementStillValid(currentHoveredElement)) {
                            shouldHideZoom = true;
                            console.log('Hover Zoom: Hovered element is no longer valid');
                        }
                    }
                }
                
                // Détecter les changements data-src pour le lazy loading
                if (mutation.attributeName === 'data-src' || 
                    mutation.attributeName === 'data-lazy-src' ||
                    mutation.attributeName === 'data-original') {
                    const target = mutation.target;
                    if (target === currentHoveredElement && target.tagName === 'IMG') {
                        // L'image lazy-loaded a changé de source
                        const newSrc = target.getAttribute('data-src') || 
                                      target.getAttribute('data-lazy-src') ||
                                      target.getAttribute('data-original');
                        if (newSrc && newSrc !== target.src) {
                            console.log('Hover Zoom: Lazy-loaded image detected, waiting for src update');
                            // Attendre que l'image soit vraiment chargée
                            setTimeout(() => {
                                if (target === currentHoveredElement && target.src && target.src !== '') {
                                    showZoom(target.src, { clientX: lastMouseX, clientY: lastMouseY }, 'image');
                                }
                            }, 100);
                        }
                    }
                }
            }
        }
        
        if (shouldHideZoom) {
            hideAllZoom();
        }
    });
    
        // Observer avec une configuration plus complète pour capturer tous les changements
        globalMutationObserver.observe(document, { 
            subtree: true, 
            childList: true, 
            attributes: true,
            attributeFilter: ['src', 'href', 'style', 'class', 'hidden', 'data-src', 'data-lazy-src', 'data-original', 'srcset'],
            attributeOldValue: true
        });
        
        console.log('Hover Zoom: Global mutation observer started');
    }

    // Ajouter des listeners aux images existantes pour le lazy loading
    function setupLazyLoadingListeners() {
        const allImages = document.querySelectorAll('img, video');
        allImages.forEach(media => {
            media.addEventListener('load', handleImageLoad, true);
            media.addEventListener('error', handleImageError, true);
        });
    }
    
    // Re-scanner périodiquement pour les nouveaux éléments (utile pour le contenu infini)
    let rescanInterval = setInterval(() => {
        if (!document.hidden && isExtensionActive) {
            setupLazyLoadingListeners();
        }
    }, 5000); // Toutes les 5 secondes

    // Fonction pour vérifier si un élément est toujours valide
    function isElementStillValid(element) {
        if (!element || !element.isConnected) {
            return false;
        }
        
        // Vérifier si l'élément est visible
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }
        
        // Vérifier si l'élément a encore une source valide
        if (element.tagName === 'IMG') {
            return element.src && element.src !== '';
        } else if (element.tagName === 'VIDEO') {
            return (element.src || element.currentSrc) && (element.src !== '' || element.currentSrc !== '');
        } else if (element.tagName === 'A') {
            return element.href && element.href !== '' && (isImageUrl(element.href) || isVideoUrl(element.href));
        }
        
        return true;
    }

    // Observer les changements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            hideAllZoom();
        }
    });

    // Observer les changements de focus
    window.addEventListener('blur', () => {
        hideAllZoom();
    });

    // Observer les redimensionnements de fenêtre
    window.addEventListener('resize', () => {
        if (zoomViewer && zoomViewer.style.display === 'block') {
            // Repositionner l'overlay si nécessaire
            positionViewer(lastMouseX, lastMouseY);
        }
    });

    // Nettoyage en cas de déchargement de la page
    window.addEventListener('beforeunload', () => {
        hideAllZoom();
        removeEventListeners();
        if (mutationObserver) {
            mutationObserver.disconnect();
        }
        if (rescanInterval) {
            clearInterval(rescanInterval);
        }
    });
    
    // Initialiser l'extension en fonction de l'état du document
    if (document.readyState === 'loading') {
        // Le document est encore en cours de chargement
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        // Le document est déjà chargé (cas d'injection tardive)
        initializeExtension();
    }
})();
