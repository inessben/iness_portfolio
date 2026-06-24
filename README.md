# 🌕 Iness Ben Aissa — Portfolio 3D

Portfolio interactif sous forme d'exploration spatiale en 3D.  
Le visiteur explore le monde pour découvrir le profil à l'aide d'un avatar.

---

## ✨ Concept

L'idée c'est de remplacer les pages statiques classiques par une vraie expérience.  
Le visiteur contrôle un personnage, se déplace, et découvre le contenu (bio, projets, compétences, contact).

---

## 🚀 Stack technique

| Outil | Rôle |
|---|---|
| [Three.js](https://threejs.org/) | moteur 3D (scène, shaders, lumières, particules) |
| [TWEEN.js](https://github.com/tweenjs/tween.js) | animations fluides (transitions caméra) |
| [CSS2DRenderer](https://threejs.org/docs/#examples/en/renderers/CSS2DRenderer) | labels HTML qui suivent les objets 3D |
| [Vite](https://vitejs.dev/) | bundler / dev server |

---

## 🎮 Contrôles

| Touche / Action | Effet |
|---|---|
| `↑ ↓ ← →` | déplacer le personnage |
| Clic + glisser | tourner la caméra |
| `Espace` | basculer en vue première personne |
| `Échap` | revenir à la caméra orbitale |
| S'approcher d'une zone | ouvre la carte de contenu |

---

## 🗺️ Les 4 zones

| Zone | Contenu |
|---|---|---|
| **About** (Nord) | présentation |
| **Projects** (Est) | projets réalisés |
| **Skills** (Sud) | compétences |
| **Contact** (Ouest) | liens & contact |

---

## ⚙️ Lancer le projet

```bash
# installer les dépendances
npm install

# lancer en développement
npm run dev

# build pour la production
npm run build

# prévisualiser le build
npm run preview
```

*Fait avec 🖤 et beaucoup de Three.js*
