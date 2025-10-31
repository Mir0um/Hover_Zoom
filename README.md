# Hover Zoom
*[English version](README_EN.md)*

![Icône de l'extension](icons/icon128.png)

Une extension Chrome simple, légère et efficace conçue pour l'accessibilité. Elle permet d'agrandir les images et vidéos au survol de la souris, aidant ainsi les utilisateurs, notamment ceux ayant une déficience visuelle, à naviguer sur le web plus confortablement.

[![Licence: MIT](https://img.shields.io/badge/Licence-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0.6-green.svg)](https://github.com/Mir0um/Hover_Zoom)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue.svg)](https://chromewebstore.google.com/detail/gkhghnhoflimlafecekklclepijjaemp)

---

## Démonstration

![Démonstration de Hover Zoom](demo.gif)

## Fonctionnalités principales

### 🖼️ Détection Intelligente des Médias
*   **Agrandissement au survol** : Pas besoin de cliquer, il suffit de passer la souris sur un élément pour l'activer.
*   **Détection Multi-Source** : Fonctionne sur les balises `<img>` et `<video>` ainsi que sur les liens `<a>` pointant vers des fichiers image ou vidéo.
*   **Support du Lazy Loading** : Détecte automatiquement les images chargées en différé via `data-src`, `data-lazy-src`, `data-original` et `srcset`.
*   **Contenu Dynamique** : Surveillance en temps réel des changements de DOM pour détecter les médias ajoutés dynamiquement (SPAs, scroll infini).
*   **Formats d'images supportés** : `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.apng`, `.ico`, `.tif`, `.tiff`
*   **Formats vidéo supportés** : `.mp4`, `.webm`, `.ogg`, `.ogv`, `.mov`, `.mkv`, `.flv`

### 🎬 Lecture Vidéo Optimisée
*   **Lecture automatique** : Les vidéos se lancent automatiquement en mode muet et boucle dans la fenêtre d'aperçu.
*   **Gestion intelligente** : Arrêt automatique de la lecture lors de la fermeture de l'aperçu pour économiser les ressources.

### 📐 Modes d'Affichage Flexibles
1.  **Mode Naturel (côté)** : Affiche le média agrandi dans une fenêtre flottante à côté du curseur.
    *   Facteur de zoom configurable (par défaut 2x, ajustable de 1x à l'infini par pas de 0,1)
    *   Positionnement intelligent : se place automatiquement à droite ou à gauche pour rester visible
    *   Idéal pour une inspection rapide sans perdre le contexte de la page
2.  **Mode Pleine Page (superposé)** : Affiche le média en grand format superposé au contenu de la page.
    *   Occupe toute la largeur de la fenêtre
    *   Parfait pour voir les détails en haute résolution
    *   Fond semi-transparent pour garder le contexte

### ⚙️ Configuration et Contrôle
*   **Interface Popup Intuitive** : Activez/désactivez l'extension et changez de mode d'affichage en un clic.
*   **Page d'Options Complète** : Gestion avancée des permissions d'accès aux sites web.
*   **Gestion des Permissions** : 
    *   Fonctionne avec `activeTab` pour un accès minimal
    *   Permission optionnelle `<all_urls>` pour une activation automatique sur tous les sites
    *   Interface pour accorder/révoquer les permissions par site
*   **Sauvegarde Automatique** : Tous vos réglages sont sauvegardés instantanément et synchronisés entre les onglets.

### ⌨️ Contrôles Pratiques
*   **Fermeture rapide avec Échap** : Appuyez sur `Échap` pour fermer instantanément toute prévisualisation.
*   **Animations Fluides** : Transitions en douceur avec des effets d'animation lors de l'affichage et du masquage.

### 🚀 Performance et Compatibilité
*   **Architecture Manifest V3** : Utilise la dernière version de l'API Chrome Extensions pour une meilleure sécurité et performance.
*   **Service Worker Optimisé** : Consommation minimale de ressources en arrière-plan.
*   **Injection Intelligente** : Les scripts ne sont activés que sur les pages où ils sont nécessaires.
*   **Protection Anti-Injection Multiple** : Système de verrou pour éviter les conflits et doublons.

## Langues supportées

L'extension est disponible en **27 langues** :

🌍 **Européennes** : Français, Anglais, Allemand, Espagnol, Italien, Néerlandais, Polonais, Portugais, Russe, Suédois, Norvégien, Finnois, Danois, Tchèque, Hongrois, Ukrainien, Turc

🌏 **Asiatiques** : Chinois simplifié, Japonais, Coréen, Hindi, Thaï, Vietnamien, Indonésien, Malais

🌍 **Autres** : Arabe, Bengali

L'interface s'adapte automatiquement à la langue de votre navigateur.

## Installation

Vous pouvez installer l'extension directement depuis le [Chrome Web Store](https://chromewebstore.google.com/detail/gkhghnhoflimlafecekklclepijjaemp).

### Installation Manuelle (Développeurs)

1.  **Téléchargez le projet** :
    ```bash
    git clone https://github.com/Mir0um/Hover_Zoom.git
    ```
    *OU téléchargez le projet en tant que fichier ZIP et décompressez-le.*

2.  **Ouvrez Google Chrome** et naviguez vers `chrome://extensions`.

3.  **Activez le Mode Développeur** : Cochez l'interrupteur en haut à droite de la page.

4.  **Chargez l'extension** :
    *   Cliquez sur **"Charger l'extension non empaquetée"**
    *   Sélectionnez le dossier du projet (celui qui contient `manifest.json`)

5.  **C'est terminé !** L'icône de Hover Zoom devrait apparaître dans votre barre d'outils Chrome.

### Gestion des Permissions

Lors de la première utilisation, l'extension fonctionne avec un accès minimal (`activeTab`). Pour une expérience optimale sur tous les sites :

1.  Cliquez sur l'icône de l'extension
2.  Cliquez sur **"Ouvrir les options"** ou **"Gérer les permissions"**
3.  Accordez la permission `<all_urls>` si vous le souhaitez

Vous pouvez révoquer cette permission à tout moment depuis la page d'options.

## Comment l'utiliser

### Configuration Rapide
1.  **Cliquez sur l'icône** de l'extension dans la barre d'outils pour ouvrir le popup.
2.  **Activez l'extension** avec l'interrupteur principal.
3.  **Choisissez votre mode** d'agrandissement :
    *   `Mode Naturel (côté)` : Idéal pour inspecter rapidement des images sans perdre le contexte
    *   `Mode Pleine Page (superposé)` : Parfait pour voir une image dans les moindres détails
4.  **Réglez le facteur de zoom** (uniquement en mode naturel) selon vos besoins.

### Utilisation Quotidienne
*   Survolez simplement n'importe quelle image ou vidéo pour l'agrandir
*   L'aperçu s'affiche automatiquement et suit votre souris
*   Appuyez sur `Échap` ou déplacez votre souris hors de l'élément pour fermer
*   Les modifications sont sauvegardées instantanément et appliquées à tous les onglets

## Architecture Technique

### Structure du Projet
```
Hover_Zoom/
├── manifest.json           # Configuration Manifest V3
├── core/
│   ├── background.js      # Service Worker (gestion lifecycle)
│   ├── content.js         # Script principal (830 lignes)
│   ├── permissions.js     # Gestion des permissions
│   └── zoom.css           # Styles des overlays
├── popup/                 # Interface popup
├── options/               # Page d'options complète
├── _locales/             # Traductions (27 langues)
└── icons/                # Icônes de l'extension
```

### Flux de Données
1.  L'utilisateur survole un média → `content.js` détecte via `handleMouseOver()`
2.  Extraction de l'URL depuis `src`, `data-src`, `data-lazy-src`, etc.
3.  Affichage selon le mode : `natural` (viewer latéral) ou `page` (overlay plein écran)
4.  Synchronisation des paramètres via `chrome.storage.local`
5.  Le Service Worker (`background.js`) réinjecte les scripts lors des changements de configuration

## Contributions

Les contributions sont les bienvenues ! Si vous avez des idées d'amélioration ou des corrections de bugs, n'hésitez pas à :

1.  **Forker le projet**
2.  **Créer une branche** : `git checkout -b feature/ma-fonctionnalite`
3.  **Commiter vos changements** : `git commit -m 'Ajout de ma-fonctionnalite'`
4.  **Pousser vers la branche** : `git push origin feature/ma-fonctionnalite`
5.  **Ouvrir une Pull Request**

### Guide de Contribution

Avant de contribuer, veuillez consulter le fichier [.github/copilot-instructions.md](.github/copilot-instructions.md) qui contient :
*   Les conventions de code du projet
*   Les patterns critiques à respecter
*   Les workflows de développement
*   Les checklist de tests

### Signaler un Bug

Si vous trouvez un bug, ouvrez une [issue](https://github.com/Mir0um/Hover_Zoom/issues) avec :
*   Une description claire du problème
*   Les étapes pour le reproduire
*   Votre version de Chrome et de l'extension
*   Des captures d'écran si pertinent

## Roadmap

### Version Actuelle : 2.0.6
✅ Architecture Manifest V3  
✅ Support du lazy loading  
✅ Détection de contenu dynamique  
✅ 27 langues supportées  
✅ Gestion avancée des permissions  

### Prochaines Versions
🔜 Mode zoom personnalisable par site  
🔜 Support des GIFs animés avec contrôles  
🔜 Raccourcis clavier personnalisables  
🔜 Mode sombre pour l'interface  
🔜 Support des galeries d'images  

## FAQ

### L'extension ne fonctionne pas sur un site
Vérifiez que l'extension est activée dans le popup et que vous avez accordé les permissions nécessaires. Certains sites (comme `chrome://` ou `file://`) sont protégés par Chrome.

### Comment désactiver temporairement l'extension ?
Cliquez sur l'icône de l'extension et désactivez l'interrupteur principal. Vous pouvez aussi utiliser le gestionnaire d'extensions de Chrome.

### Les vidéos ne se lisent pas
Assurez-vous que votre navigateur supporte le format vidéo et que le site autorise la lecture automatique. L'extension lit les vidéos en mode muet pour contourner les restrictions.

### Comment changer la taille du zoom ?
En mode naturel, vous pouvez ajuster le facteur de zoom dans le popup (de 1x à l'infini par pas de 0,1).

## Crédits

*   **Créateur** : Sartoris Jean-Paul (Miroum)
*   **Inspiration** : Ce projet est fortement inspiré par l'excellente extension [**Imagus** de TheFantasticWarrior](https://github.com/TheFantasticWarrior/chrome-extension-imagus), qui a défini des standards élevés dans ce domaine.

## Licence

Ce projet est distribué sous la [Licence MIT](LICENSE). Vous êtes libre de l'utiliser, le modifier et le distribuer.

---

## Support

Si vous appréciez cette extension, n'hésitez pas à :
*   ⭐ Mettre une étoile sur GitHub
*   ✍️ Laisser un avis sur le Chrome Web Store
*   🐛 Signaler les bugs ou proposer des améliorations
*   💬 Partager l'extension avec vos amis

**Développé avec ❤️ pour améliorer l'accessibilité du web**
