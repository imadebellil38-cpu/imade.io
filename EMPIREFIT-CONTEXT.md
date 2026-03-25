# EmpireFit — CLAUDE.md
# Copie ce fichier dans le repo -empirefit sur GitHub

## Le Projet
EmpireFit est une application sportive complète : tracking sport + nutrition + calories/macros + social.
Créé par Imade (imadebellil38-cpu). C'est le 2ème projet de l'univers "Empire" après EmpireTrack (habit tracker).

## Contexte & Décisions Prises
- Le créateur a déjà fait EmpireTrack (https://github.com/imadebellil38-cpu/imade.io) avec succès
- EmpireTrack utilise : Vanilla JS (ES modules) + Supabase + PWA + pas de bundler
- EmpireFit doit utiliser la **même stack** mais avec un **style différent**
- Le créateur veut un style **manga/empire, dark mode agressif, couleurs chaudes** (orange/rouge/noir)
- L'app est d'abord pour lui et ses potes, pas le public

## Règle d'or
**À chaque modification, toujours proposer ce qu'on pourrait améliorer ensuite.**

## Workflow obligatoire
- **Ne jamais demander confirmation pour corriger un problème.** Trouver le bug → corriger → pusher.
- **Un seul commit propre**, pas 6 itérations.
- **Ne toucher que ce qui est demandé.** Pas de modifications "bonus".
- **Agir, pas expliquer.** Ne pas dire "voilà le problème" puis attendre. Juste résoudre.
- **Toujours vérifier les 2 modes (dark + light)** avant de pusher.
- **Toujours merger dans main et pusher automatiquement.**

## Stack technique
- Vanilla JS (ES modules) + CSS
- Supabase (PostgreSQL + Realtime)
- PWA avec Service Worker
- Pas de bundler (imports directs)
- Scanner photo : Claude Vision API ou Google Gemini API pour reconnaissance d'aliments
- Base nutritionnelle : Open Food Facts API (gratuit, open-source)

## Design & Thème
- **Style : manga/empire, agressif, sportif**
- Mode sombre par défaut : fond noir #0A0A0A
- Couleur principale : orange vif #FF6B2B
- Couleur secondaire : rouge #EF4444
- Accent : doré #FBBF24
- Font display : Space Grotesk ou Outfit (bold, géométrique)
- Font body : Inter
- Animations fluides, transitions smooth
- Inspiration : Solo Leveling (rangs E → SSS), style RPG

## Conventions
- Français pour tout le contenu utilisateur
- CSS variables pour les couleurs (pas de hardcoded)
- Light mode : toujours ajouter les overrides [data-theme="light"]
- Tester sur mobile (max-width 480px) ET desktop (768px+)
- Mode offline : Service Worker + cache des assets

## Architecture (même structure qu'EmpireTrack)
- pages/ : composants pleine page (render + destroy)
- components/ : éléments réutilisables
- services/ : appels API Supabase
- lib/ : utilitaires (dates, colors, DOM, store, supabase)
- data/ : données statiques

## Analyse Concurrentielle (résumé)

### Ce qui marche chez les concurrents :
- MyFitnessPal : base de données alimentaire énorme (14M+ items)
- MacroFactor : algorithme adaptatif qui ajuste les macros chaque semaine selon le poids réel
- Strong/Hevy : simplicité pour logger les séances muscu (3 taps max)
- Strava : aspect social et compétitif (classements, kudos, clubs)
- Level Up : gamification anime (rangs E→SSS, quêtes, guildes)
- Foodvisor : meilleur scanner photo IA pour la nourriture

### Ce que les gens DÉTESTENT :
- Logging trop long — 80% des gens arrêtent parce que c'est trop chiant
- Trop de features — les apps qui font tout font rien bien
- Abonnements chers — MyFitnessPal à 20€/mois
- Pas de mode offline — ça marche pas à la salle
- Social forcé — les vrais sportifs veulent tracker, pas liker
- Pas de personnalisation — programmes imposés pas flexibles

### Ce qui MANQUE sur le marché :
1. Scanner photo qui marche VRAIMENT bien
2. Sport + Nutrition dans la même app mais SIMPLE
3. Gamification style manga/anime sans être ridicule
4. Gratuit et sans pub
5. Mode offline
6. Challenge entre potes pour la muscu/nutrition (Strava c'est que cardio)

## Features Prioritaires

### Phase 1 — MVP
1. **Profil sportif** : objectif (prise de masse, sèche, maintien), poids, taille, âge → calcul TDEE automatique
2. **Tracking nutrition** :
   - Scanner photo IA → reconnaissance aliment + calories/macros
   - Recherche manuelle dans base Open Food Facts
   - Scanner code-barres
   - Quick-add favoris et repas récents
   - Dashboard macros du jour (protéines, glucides, lipides, calories)
   - Cocher si repas mangé ou pas
3. **Tracking entraînement** :
   - Logger séances (exercices, séries, reps, poids)
   - Bibliothèque d'exercices par groupe musculaire
   - Timer de repos
   - Historique et progression
4. **Dashboard quotidien** : résumé calories + entraînement + objectif

### Phase 2 — Social
5. **Classement entre potes** (comme EmpireTrack)
6. **Partage de séances** — feed social
7. **Défis** — challenge sur une semaine/un mois

### Phase 3 — Gamification
8. **Système de rangs** : E → D → C → B → A → S → SS → SSS
9. **XP** pour chaque séance loggée, chaque repas tracké
10. **Badges/achievements** sportifs
11. **Avatar** qui évolue avec la progression

### Phase 4 — Intelligence
12. **Plans repas générés** selon l'objectif et les macros
13. **Liste de courses automatique**
14. **Suggestions de progression** (poids à mettre, exercices à ajouter)
15. **Insights** : "Tu manques de protéines le weekend", "Ton bench press stagne depuis 2 semaines"

## Leçons Apprises d'EmpireTrack
- Le scroll dans les modals sur mobile est CRITIQUE — toujours tester
- Les boutons doivent être bien visibles (couleur, taille, contraste)
- Le mode offline est important (Service Worker + cache)
- Les messages de motivation personnalisés marchent bien
- Le catalogue doit être riche et bien organisé par catégories
- L'onglet "Perso" (création custom) doit être en 2ème position, pas en dernier
- Le choix de fréquence/options doit se faire AVANT l'ajout
- Un bouton ✕ fermer sur chaque modal
- Responsive desktop : min 768px avec layout adapté
- Les couleurs doivent être cohérentes et pas trop nombreuses
- Les animations canvas donnent un effet premium
- Le logo doit être fait par un vrai outil de design (pas Python/PIL)

## Comptes
- Même groupe de potes qu'EmpireTrack (18 personnes + marc)
- Même pattern d'emails : prenom@empirefit.app
- Mot de passe par défaut : empire2026
- rafael (pas raphael)

## Référence EmpireTrack
Le code source d'EmpireTrack est sur https://github.com/imadebellil38-cpu/imade.io
Tu peux t'en inspirer pour l'architecture, les patterns, et les composants.
Mais le design doit être DIFFÉRENT (couleurs chaudes, style sportif).
