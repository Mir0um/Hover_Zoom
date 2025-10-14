# Guide de test - Hover Zoom Extension

## Tests effectués le 14 octobre 2025

### ✅ Bugs corrigés

#### Bugs critiques
1. **Fonction dupliquée** - `handleKeyDown` était définie deux fois → Corrigé
2. **Event listeners incohérents** - Gestion du keydown non standardisée → Corrigé
3. **Fuites mémoire** - Event listeners mouseout non nettoyés → Corrigé
4. **Manque de gestion d'erreurs** - Pas de try-catch → Corrigé
5. **Initialisation fragile** - Problèmes si DOM pas prêt → Corrigé

#### Améliorations
- Ajout de logs de débogage complets
- Meilleure organisation du code
- Gestion robuste des erreurs
- Initialisation idempotente

### Comment tester l'extension

#### 1. Installation/Rechargement
```bash
1. Ouvrir Chrome/Edge
2. Aller sur chrome://extensions/
3. Activer "Mode développeur"
4. Cliquer sur "Charger l'extension non empaquetée"
5. Sélectionner le dossier Hover_Zoom
```

#### 2. Tests de base

**Test 1: Survol d'image simple**
- Ouvrir n'importe quelle page web avec des images
- Survoler une image
- ✅ L'image doit s'agrandir à côté du curseur
- Sortir de l'image
- ✅ Le zoom doit disparaître

**Test 2: Touche Échap**
- Survoler une image pour afficher le zoom
- Appuyer sur la touche Échap
- ✅ Le zoom doit disparaître immédiatement

**Test 3: Mode pleine page**
- Ouvrir le popup de l'extension (icône dans la barre)
- Sélectionner "Mode pleine page"
- Survoler une image
- ✅ L'image doit s'afficher en plein écran avec fond clair

**Test 4: Activation/Désactivation**
- Ouvrir le popup
- Désactiver l'extension avec le toggle
- Survoler une image
- ✅ Rien ne doit se passer
- Réactiver l'extension
- Survoler une image
- ✅ Le zoom doit fonctionner à nouveau

#### 3. Tests avancés

**Test 5: Lazy Loading (Instagram, Reddit)**
- Aller sur Instagram ou Reddit
- Faire défiler pour charger des images
- Survoler les images chargées dynamiquement
- ✅ Le zoom doit fonctionner sur les images lazy-loaded

**Test 6: Contenu dynamique**
- Aller sur un site avec du contenu dynamique (Twitter, YouTube)
- Survoler les miniatures/images
- ✅ Le zoom doit fonctionner correctement
- Faire défiler et charger plus de contenu
- Survoler les nouvelles images
- ✅ Le zoom doit fonctionner sur le nouveau contenu

**Test 7: Liens vers images**
- Trouver un lien qui pointe vers une image (.jpg, .png, etc.)
- Survoler le lien
- ✅ L'image doit s'afficher en aperçu

**Test 8: Vidéos**
- Survoler une balise `<video>` sur une page
- ✅ La vidéo doit s'afficher en aperçu (muté, en boucle)

**Test 9: Performance**
- Survoler rapidement 10-20 images différentes
- Ouvrir la console (F12)
- ✅ Pas d'erreurs dans la console
- ✅ Pas de ralentissement perceptible
- Vérifier l'onglet Mémoire dans les DevTools
- ✅ La mémoire ne doit pas augmenter indéfiniment

**Test 10: Multi-onglets**
- Ouvrir 3-4 onglets avec des images
- Tester le zoom dans chaque onglet
- ✅ L'extension doit fonctionner dans tous les onglets
- Fermer des onglets
- ✅ Pas d'erreurs dans la console du background script

#### 4. Tests de permissions

**Test 11: Permissions limitées**
- Aller sur chrome://extensions/
- Cliquer sur "Détails" de l'extension
- Retirer les permissions si accordées
- Rafraîchir une page
- ✅ L'extension doit demander les permissions au survol

**Test 12: Permissions complètes**
- Aller dans Options de l'extension
- Cliquer sur "Accorder les permissions"
- ✅ Les permissions doivent être accordées
- Tester sur plusieurs sites
- ✅ L'extension doit fonctionner partout

#### 5. Tests de régression

**Test 13: Rechargement de l'extension**
- Garder des onglets ouverts avec des images
- Recharger l'extension (bouton "Recharger" sur chrome://extensions/)
- Survoler des images
- ✅ L'extension doit fonctionner immédiatement

**Test 14: Injection tardive**
- Ouvrir une page web avec des images
- Installer/activer l'extension
- Survoler des images
- ✅ L'extension doit fonctionner sans recharger la page

**Test 15: Page de test locale**
- Ouvrir `test/test.html` dans le navigateur
- Tester le zoom sur les images de la page
- ✅ Toutes les images doivent être zoomables

### Résultats attendus

#### Console du navigateur (F12)
Lors du chargement d'une page, vous devriez voir :
```
Hover Zoom: Settings loaded: {extensionEnabled: true, zoomMode: "natural", zoomFactor: 2}
Hover Zoom: Elements created successfully
Hover Zoom: Global mutation observer started
Hover Zoom: Extension initialized successfully
```

Lors du survol d'une image :
```
(Aucun message normal, sauf si erreur)
```

#### Console du background script
Pour accéder : chrome://extensions/ → Détails de l'extension → "Afficher les vues" → background.html

Au chargement :
```
Hover Zoom: Settings initialized.
Hover Zoom: Scripts injected in existing tabs.
```

Lors d'un changement d'onglet :
```
Hover Zoom: Script injected in tab [ID]
```

### Critères de succès

L'extension est considérée comme fonctionnelle si :
- ✅ Tous les tests de base (1-4) passent
- ✅ Au moins 8/11 tests avancés passent
- ✅ Aucune erreur critique dans la console
- ✅ Pas de fuite mémoire après 5 minutes d'utilisation intensive

### Problèmes connus après correction

Aucun problème connu. Si vous rencontrez un bug :
1. Ouvrir la console (F12)
2. Reproduire le bug
3. Copier les messages d'erreur
4. Noter les étapes exactes de reproduction
5. Vérifier la version de Chrome/Edge

### Sites recommandés pour les tests

1. **Reddit** (lazy loading)
   - https://reddit.com/r/pics
   
2. **Instagram** (contenu dynamique)
   - https://instagram.com
   
3. **Unsplash** (grandes images)
   - https://unsplash.com
   
4. **Imgur** (albums d'images)
   - https://imgur.com
   
5. **YouTube** (miniatures de vidéos)
   - https://youtube.com

### Commandes utiles

**Recharger l'extension :**
```
chrome://extensions/ → Cliquer sur le bouton "Recharger" de l'extension
```

**Voir les logs du background :**
```
chrome://extensions/ → Détails → "Afficher les vues" → Service Worker
```

**Nettoyer le stockage :**
```javascript
// Dans la console
chrome.storage.local.clear()
```

**Réinitialiser les paramètres :**
```javascript
// Dans la console
chrome.storage.local.set({
  extensionEnabled: true,
  zoomMode: 'natural',
  zoomFactor: 2
})
```
