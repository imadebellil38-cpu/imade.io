// Catalogue d'habitudes pré-définies

export const HABIT_CATEGORIES = [
  {
    id: 'morning',
    name: 'Routine matinale',
    icon: '🌅',
    habits: [
      { name: 'Se lever tôt', icon: '⏰', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Se lever à 5h30', icon: '🌅', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Faire son lit', icon: '🛏️', color: '#A78BFA', frequency: 'daily' },
      { name: 'Boire de l\'eau au réveil', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Méditer 5 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Méditer 10 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Méditer 20 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#22D3EE', frequency: 'daily' },
      { name: 'Soleil 30 min après réveil', icon: '☀️', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas de téléphone 30 min', icon: '📵', color: '#EF4444', frequency: 'daily' },
      { name: 'Skincare routine', icon: '🧴', color: '#F472B6', frequency: 'daily' },
      { name: 'Affirmations positives', icon: '💪', color: '#00ff88', frequency: 'daily' },
    ]
  },
  {
    id: 'training',
    name: 'Entraînement',
    icon: '🏋️',
    habits: [
      { name: 'Musculation', icon: '🏋️', color: '#FF6B6B', frequency: 'weekly_3' },
      { name: 'Musculation 5x/semaine', icon: '🏋️', color: '#FF6B6B', frequency: 'weekly_5' },
      { name: 'Cardio Zone 2', icon: '🫀', color: '#F472B6', frequency: 'weekly_3' },
      { name: 'Courir 30 min', icon: '🏃', color: '#34D399', frequency: 'weekly_3' },
      { name: 'Courir 5 km', icon: '🏃', color: '#34D399', frequency: 'weekly_3' },
      { name: 'Sprint / HIIT', icon: '⚡', color: '#FBBF24', frequency: 'custom:2' },
      { name: '10 000 pas', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: '15 000 pas', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: 'Stretching 10 min', icon: '🤸', color: '#A78BFA', frequency: 'daily' },
      { name: 'Yoga 15 min', icon: '🧘', color: '#A78BFA', frequency: 'daily' },
      { name: 'Foam roller', icon: '🧻', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Abdos 10 min', icon: '💪', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Pompes (sets)', icon: '💪', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Tractions', icon: '💪', color: '#F472B6', frequency: 'weekly_3' },
      { name: 'Boxe / Arts martiaux', icon: '🥊', color: '#EF4444', frequency: 'weekly_3' },
      { name: 'Natation', icon: '🏊', color: '#38BDF8', frequency: 'weekly_3' },
      { name: 'Vélo', icon: '🚴', color: '#34D399', frequency: 'weekly_3' },
      { name: 'Sport collectif', icon: '⚽', color: '#FBBF24', frequency: 'custom:2' },
      { name: 'Noter sa séance', icon: '📝', color: '#38BDF8', frequency: 'weekly_3' },
      { name: 'S\'étirer avant de dormir', icon: '🤸', color: '#A78BFA', frequency: 'daily' },
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: '🥗',
    habits: [
      { name: 'Manger 2g protéines/kg', icon: '🥩', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Manger sainement (80%)', icon: '🥗', color: '#00ff88', frequency: 'daily' },
      { name: 'Manger 5 fruits/légumes', icon: '🍎', color: '#34D399', frequency: 'daily' },
      { name: 'Pas de sucre raffiné', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas d\'ultra-transformé', icon: '🍔', color: '#F472B6', frequency: 'daily' },
      { name: 'Pas de fast food', icon: '🍟', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas d\'alcool', icon: '🍷', color: '#EF4444', frequency: 'daily' },
      { name: 'Boire 2L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Boire 3L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Meal prep', icon: '🍱', color: '#FBBF24', frequency: 'custom:0' },
      { name: 'Cuisiner soi-même', icon: '👨‍🍳', color: '#FBBF24', frequency: 'daily' },
      { name: 'Créatine 5g', icon: '💊', color: '#A78BFA', frequency: 'daily' },
      { name: 'Prendre ses vitamines', icon: '💊', color: '#A78BFA', frequency: 'daily' },
      { name: 'Jeûne intermittent 16h', icon: '⏱️', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Pas de grignotage', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas de soda', icon: '🥤', color: '#EF4444', frequency: 'daily' },
    ]
  },
  {
    id: 'recovery',
    name: 'Sommeil & Récupération',
    icon: '😴',
    habits: [
      { name: 'Dormir 7h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
      { name: 'Dormir 8h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
      { name: 'Même heure coucher/lever', icon: '🕐', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas de caféine après 14h', icon: '☕', color: '#F472B6', frequency: 'daily' },
      { name: 'Chambre froide & noire', icon: '🌑', color: '#38BDF8', frequency: 'daily' },
      { name: 'Sieste 20 min', icon: '💤', color: '#A78BFA', frequency: 'daily' },
      { name: 'Lumière tamisée le soir', icon: '🕯️', color: '#FBBF24', frequency: 'daily' },
      { name: 'Routine du soir', icon: '🌙', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Lire avant de dormir', icon: '📖', color: '#FBBF24', frequency: 'daily' },
    ]
  },
  {
    id: 'mind',
    name: 'Mental & Discipline',
    icon: '🧠',
    habits: [
      { name: 'Lire 15 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Lire 20 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Lire 30 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#F472B6', frequency: 'daily' },
      { name: 'Gratitude (3 choses)', icon: '🙏', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas de réseaux sociaux', icon: '📵', color: '#EF4444', frequency: 'daily' },
      { name: 'Limiter les réseaux à 30 min', icon: '📱', color: '#EF4444', frequency: 'daily' },
      { name: 'Apprendre quelque chose', icon: '🎓', color: '#38BDF8', frequency: 'daily' },
      { name: 'Visualisation objectifs', icon: '🎯', color: '#00ff88', frequency: 'daily' },
      { name: 'Sortir de sa zone de confort', icon: '🔥', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Écouter un podcast', icon: '🎧', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Pratiquer une langue', icon: '🌍', color: '#38BDF8', frequency: 'daily' },
      { name: 'Pas de plainte / négativité', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Prier', icon: '🤲', color: '#A78BFA', frequency: 'daily' },
      { name: 'Dhikr / Méditation spirituelle', icon: '📿', color: '#8B5CF6', frequency: 'daily' },
    ]
  },
  {
    id: 'productivity',
    name: 'Productivité',
    icon: '🚀',
    habits: [
      { name: 'Deep work 1h', icon: '💻', color: '#FF6B6B', frequency: 'weekly_5' },
      { name: 'Deep work 2h', icon: '💻', color: '#FF6B6B', frequency: 'weekly_5' },
      { name: 'Travailler sur son projet', icon: '🚀', color: '#FBBF24', frequency: 'daily' },
      { name: 'To-do list du jour', icon: '✅', color: '#00ff88', frequency: 'daily' },
      { name: 'Bilan de la journée', icon: '📋', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Préparer le lendemain', icon: '📆', color: '#38BDF8', frequency: 'daily' },
      { name: 'Ranger son espace', icon: '🧹', color: '#A78BFA', frequency: 'daily' },
      { name: 'Inbox zero', icon: '📧', color: '#34D399', frequency: 'daily' },
      { name: 'Apprendre une compétence', icon: '🎓', color: '#38BDF8', frequency: 'daily' },
      { name: 'Networking', icon: '🤝', color: '#FBBF24', frequency: 'weekly_3' },
      { name: 'Coder / Pratiquer', icon: '💻', color: '#00ff88', frequency: 'daily' },
      { name: 'Réviser ses cours', icon: '📚', color: '#A78BFA', frequency: 'weekly_5' },
    ]
  },
  {
    id: 'social',
    name: 'Social & Relations',
    icon: '🤝',
    habits: [
      { name: 'Appeler un proche', icon: '📞', color: '#F472B6', frequency: 'daily' },
      { name: 'Envoyer un message positif', icon: '💬', color: '#38BDF8', frequency: 'daily' },
      { name: 'Passer du temps en famille', icon: '👨‍👩‍👧‍👦', color: '#FBBF24', frequency: 'daily' },
      { name: 'Aider quelqu\'un', icon: '🤲', color: '#00ff88', frequency: 'daily' },
      { name: 'Rencontrer quelqu\'un de nouveau', icon: '👋', color: '#A78BFA', frequency: 'custom:2' },
      { name: 'Pas de téléphone en compagnie', icon: '📵', color: '#EF4444', frequency: 'daily' },
      { name: 'Écouter activement', icon: '👂', color: '#8B5CF6', frequency: 'daily' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    habits: [
      { name: 'Suivre ses dépenses', icon: '💰', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas de dépenses inutiles', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Épargner', icon: '🏦', color: '#00ff88', frequency: 'custom:1' },
      { name: 'Lire sur la finance', icon: '📊', color: '#38BDF8', frequency: 'weekly_3' },
      { name: 'Investir', icon: '📈', color: '#34D399', frequency: 'custom:1' },
    ]
  },
  {
    id: 'creative',
    name: 'Créativité',
    icon: '🎨',
    habits: [
      { name: 'Dessiner / Peindre', icon: '🎨', color: '#F472B6', frequency: 'daily' },
      { name: 'Écrire (créatif)', icon: '✍️', color: '#A78BFA', frequency: 'daily' },
      { name: 'Jouer d\'un instrument', icon: '🎸', color: '#FBBF24', frequency: 'daily' },
      { name: 'Prendre des photos', icon: '📷', color: '#38BDF8', frequency: 'daily' },
      { name: 'Créer du contenu', icon: '🎬', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Écouter de la musique', icon: '🎵', color: '#8B5CF6', frequency: 'daily' },
    ]
  },
  {
    id: 'hygiene',
    name: 'Hygiène & Soins',
    icon: '🪥',
    habits: [
      { name: 'Se brosser les dents 2x', icon: '🪥', color: '#38BDF8', frequency: 'daily' },
      { name: 'Fil dentaire', icon: '🦷', color: '#38BDF8', frequency: 'daily' },
      { name: 'Skincare matin', icon: '🧴', color: '#F472B6', frequency: 'daily' },
      { name: 'Skincare soir', icon: '🧴', color: '#F472B6', frequency: 'daily' },
      { name: 'Crème solaire', icon: '☀️', color: '#FBBF24', frequency: 'daily' },
      { name: 'Posture droite', icon: '🧍', color: '#A78BFA', frequency: 'daily' },
      { name: 'Marcher dehors 20 min', icon: '🌳', color: '#34D399', frequency: 'daily' },
    ]
  },
];

export const HABIT_PACKS = [
  {
    id: 'beginner',
    name: 'Débutant',
    description: 'Les fondamentaux pour commencer',
    icon: '🌱',
    color: '#00ff88',
    habits: [
      { name: 'Boire 2L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: '10 000 pas', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: 'Lire 15 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Méditer 5 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Dormir 8h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
    ]
  },
  {
    id: 'physique',
    name: 'Physique',
    description: 'Construis ton corps',
    icon: '🏋️',
    color: '#FF6B6B',
    habits: [
      { name: 'Musculation', icon: '🏋️', color: '#FF6B6B', frequency: 'weekly_3' },
      { name: 'Manger 2g protéines/kg', icon: '🥩', color: '#F472B6', frequency: 'daily' },
      { name: 'Créatine 5g', icon: '💊', color: '#A78BFA', frequency: 'daily' },
      { name: 'Boire 3L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Dormir 8h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#22D3EE', frequency: 'daily' },
      { name: '10 000 pas', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: 'Stretching 10 min', icon: '🤸', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas d\'alcool', icon: '🍷', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas de sucre raffiné', icon: '🚫', color: '#EF4444', frequency: 'daily' },
    ]
  },
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Mode discipline totale',
    icon: '⚔️',
    color: '#FF6B6B',
    habits: [
      { name: 'Se lever à 5h30', icon: '⏰', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Musculation', icon: '🏋️', color: '#F472B6', frequency: 'weekly_5' },
      { name: 'Cold shower', icon: '🧊', color: '#22D3EE', frequency: 'daily' },
      { name: 'Pas de sucre raffiné', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Lire 30 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Deep work 2h', icon: '💻', color: '#8B5CF6', frequency: 'weekly_5' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas d\'alcool', icon: '🍷', color: '#EF4444', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#F472B6', frequency: 'daily' },
    ]
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Optimise ta productivité',
    icon: '💼',
    color: '#FBBF24',
    habits: [
      { name: 'Se lever tôt', icon: '⏰', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Deep work 2h', icon: '💻', color: '#F472B6', frequency: 'weekly_5' },
      { name: 'Apprendre une compétence', icon: '🎓', color: '#38BDF8', frequency: 'daily' },
      { name: 'Networking', icon: '🤝', color: '#FBBF24', frequency: 'weekly_3' },
      { name: 'Bilan de la journée', icon: '📋', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Lire 20 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
    ]
  },
  {
    id: 'wellbeing',
    name: 'Bien-être',
    description: 'Prends soin de toi',
    icon: '🧘',
    color: '#8B5CF6',
    habits: [
      { name: 'Méditer 10 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#F472B6', frequency: 'daily' },
      { name: 'Gratitude (3 choses)', icon: '🙏', color: '#FBBF24', frequency: 'daily' },
      { name: 'Yoga 15 min', icon: '🤸', color: '#A78BFA', frequency: 'daily' },
      { name: 'Marcher dehors 20 min', icon: '🌳', color: '#00ff88', frequency: 'daily' },
      { name: 'Limiter les réseaux à 30 min', icon: '📵', color: '#EF4444', frequency: 'daily' },
    ]
  },
  {
    id: 'student',
    name: 'Étudiant',
    description: 'Réussis tes études',
    icon: '📚',
    color: '#38BDF8',
    habits: [
      { name: 'Réviser ses cours', icon: '📚', color: '#A78BFA', frequency: 'weekly_5' },
      { name: 'Deep work 1h', icon: '💻', color: '#FF6B6B', frequency: 'daily' },
      { name: 'To-do list du jour', icon: '✅', color: '#00ff88', frequency: 'daily' },
      { name: 'Lire 15 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Dormir 8h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
      { name: 'Pas de réseaux sociaux', icon: '📵', color: '#EF4444', frequency: 'daily' },
    ]
  },
];

// All unique habits from catalog
export function getAllCatalogHabits() {
  const seen = new Set();
  const all = [];
  for (const cat of HABIT_CATEGORIES) {
    for (const h of cat.habits) {
      if (!seen.has(h.name)) {
        seen.add(h.name);
        all.push({ ...h, category: cat.id });
      }
    }
  }
  return all;
}
