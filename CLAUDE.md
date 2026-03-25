# EmpireTrack - Instructions

## Règle d'or
**À chaque modification, toujours proposer ce qu'on pourrait améliorer ensuite.**
Après chaque commit, lister 3-5 améliorations possibles classées par impact.

## Stack technique
- Vanilla JS (ES modules) + CSS
- Supabase (PostgreSQL + Realtime)
- PWA avec Service Worker
- Pas de bundler (imports directs)

## Thème
- Mode sombre : fond #050510, accent vert néon #00ff88, secondaire violet #8B5CF6
- Mode clair : fond #f5f5f0, accent vert #059669
- Font display : Space Grotesk
- Font body : Inter

## Conventions
- Français pour tout le contenu utilisateur
- Utiliser les helpers dom.js (html, $, on, delegate)
- Utiliser hexToRgba de lib/color.js (pas dupliquer)
- CSS variables pour les couleurs (pas de hardcoded)
- Light mode : toujours ajouter les overrides [data-theme="light"]
- Tester sur mobile (max-width 480px)

## Architecture
- pages/ : composants pleine page (render + destroy)
- components/ : éléments réutilisables
- services/ : appels API Supabase
- lib/ : utilitaires (dates, colors, DOM, store, supabase)
- data/ : données statiques (habitudes, citations, badges)
