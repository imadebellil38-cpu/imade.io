# EmpireTrack - Instructions

## Règle d'or
**À chaque modification, toujours proposer ce qu'on pourrait améliorer ensuite.**
Après chaque commit, lister 3-5 améliorations possibles classées par impact.

## Workflow obligatoire
- **Ne jamais demander confirmation pour corriger un problème.** Trouver le bug → corriger → merger dans la branche de déploiement → pusher. Tout d'un coup.
- **Toujours vérifier la branche de déploiement** (CI/CD, GitHub Pages, etc.) AVANT de coder. Pusher directement sur la bonne branche.
- **Un seul commit propre**, pas 6 itérations. Réfléchir avant de pusher, vérifier que le code fonctionne (pas de conflits inline styles vs CSS, pas de cache qui bloque).
- **Ne toucher que ce qui est demandé.** Pas de modifications "bonus" sur d'autres composants.
- **Agir, pas expliquer.** Ne pas dire "voilà le problème" puis attendre. Juste résoudre et passer à la suite.
- **Toujours vérifier les 2 modes (dark + light)** avant de pusher. Chaque modification CSS/JS doit fonctionner dans les deux thèmes. Relire le code pour s'assurer qu'aucun style ne casse l'autre mode.
- **Toujours merger dans master et pusher automatiquement.** Ne jamais laisser des changements uniquement sur la feature branch. Le site se déploie depuis master (GitHub Pages).

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
