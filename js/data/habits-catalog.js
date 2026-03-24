// Catalogue d'habitudes pré-définies

export const HABIT_CATEGORIES = [
  {
    id: 'morning',
    name: 'Routine matinale',
    icon: '🌅',
    habits: [
      { name: 'Se lever tôt', icon: '⏰', color: '#E8845A', frequency: 'daily' },
      { name: 'Faire son lit', icon: '🛏️', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Boire de l\'eau', icon: '💧', color: '#5B8DEF', frequency: 'daily' },
      { name: 'Méditer', icon: '🧘', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#5B8DEF', frequency: 'daily' },
    ]
  },
  {
    id: 'health',
    name: 'Santé',
    icon: '💪',
    habits: [
      { name: 'Sport 30 min', icon: '🏋️', color: '#E8845A', frequency: 'daily' },
      { name: 'Manger sainement', icon: '🥗', color: '#5CB85C', frequency: 'daily' },
      { name: 'Pas de sucre', icon: '🚫', color: '#D9534F', frequency: 'daily' },
      { name: 'Dormir 8h', icon: '😴', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Marcher 30 min', icon: '🚶', color: '#5CB85C', frequency: 'daily' },
      { name: 'Boire 2L d\'eau', icon: '💧', color: '#5B8DEF', frequency: 'daily' },
    ]
  },
  {
    id: 'mind',
    name: 'Mental',
    icon: '🧠',
    habits: [
      { name: 'Lire 20 min', icon: '📖', color: '#D4A853', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#C7A04F', frequency: 'daily' },
      { name: 'Gratitude', icon: '🙏', color: '#D4A853', frequency: 'daily' },
      { name: 'Pas de réseaux sociaux', icon: '📵', color: '#D9534F', frequency: 'daily' },
      { name: 'Apprendre quelque chose', icon: '🎓', color: '#5B8DEF', frequency: 'daily' },
    ]
  },
  {
    id: 'productivity',
    name: 'Productivité',
    icon: '🎯',
    habits: [
      { name: 'Deep work 2h', icon: '💻', color: '#E8845A', frequency: 'weekly_5' },
      { name: 'Travailler sur son projet', icon: '🚀', color: '#D4A853', frequency: 'daily' },
      { name: 'To-do list du jour', icon: '✅', color: '#5CB85C', frequency: 'daily' },
      { name: 'Pas de procrastination', icon: '⚡', color: '#E8845A', frequency: 'daily' },
    ]
  },
  {
    id: 'evening',
    name: 'Routine du soir',
    icon: '🌙',
    habits: [
      { name: 'Bilan de la journée', icon: '📋', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Préparer le lendemain', icon: '📆', color: '#5B8DEF', frequency: 'daily' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#D9534F', frequency: 'daily' },
      { name: 'Méditer le soir', icon: '🌙', color: '#9B7BCC', frequency: 'daily' },
    ]
  }
];

export const HABIT_PACKS = [
  {
    id: 'beginner',
    name: 'Pack Débutant',
    description: 'Les fondamentaux pour commencer',
    icon: '🌱',
    color: '#5CB85C',
    habits: [
      { name: 'Boire 2L d\'eau', icon: '💧', color: '#5B8DEF', frequency: 'daily' },
      { name: 'Marcher 30 min', icon: '🚶', color: '#5CB85C', frequency: 'daily' },
      { name: 'Lire 15 min', icon: '📖', color: '#D4A853', frequency: 'daily' },
      { name: 'Méditer 5 min', icon: '🧘', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Se coucher avant minuit', icon: '🌙', color: '#9B7BCC', frequency: 'daily' },
    ]
  },
  {
    id: 'warrior',
    name: 'Pack Warrior',
    description: 'Pour ceux qui veulent se dépasser',
    icon: '⚔️',
    color: '#E8845A',
    habits: [
      { name: 'Se lever à 6h', icon: '⏰', color: '#E8845A', frequency: 'daily' },
      { name: 'Sport 45 min', icon: '🏋️', color: '#E8845A', frequency: 'daily' },
      { name: 'Pas de sucre', icon: '🚫', color: '#D9534F', frequency: 'daily' },
      { name: 'Lire 30 min', icon: '📖', color: '#D4A853', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#5B8DEF', frequency: 'daily' },
      { name: 'Travailler sur son projet', icon: '🚀', color: '#D4A853', frequency: 'daily' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#D9534F', frequency: 'daily' },
    ]
  },
  {
    id: 'entrepreneur',
    name: 'Pack Entrepreneur',
    description: 'Optimise ta productivité',
    icon: '💼',
    color: '#D4A853',
    habits: [
      { name: 'Se lever tôt', icon: '⏰', color: '#E8845A', frequency: 'daily' },
      { name: 'Deep work 2h', icon: '💻', color: '#E8845A', frequency: 'weekly_5' },
      { name: 'Apprendre une compétence', icon: '🎓', color: '#5B8DEF', frequency: 'daily' },
      { name: 'Networking', icon: '🤝', color: '#D4A853', frequency: 'weekly_3' },
      { name: 'Bilan de la journée', icon: '📋', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Lire 20 min', icon: '📖', color: '#D4A853', frequency: 'daily' },
    ]
  },
  {
    id: 'wellbeing',
    name: 'Pack Bien-être',
    description: 'Prends soin de toi',
    icon: '🧘',
    color: '#9B7BCC',
    habits: [
      { name: 'Méditer 10 min', icon: '🧘', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#C7A04F', frequency: 'daily' },
      { name: 'Gratitude (3 choses)', icon: '🙏', color: '#D4A853', frequency: 'daily' },
      { name: 'Yoga / Étirements', icon: '🤸', color: '#9B7BCC', frequency: 'daily' },
      { name: 'Temps en nature', icon: '🌿', color: '#5CB85C', frequency: 'daily' },
      { name: 'Digital detox 1h', icon: '📵', color: '#D9534F', frequency: 'daily' },
    ]
  }
];

// All unique habits from catalog for individual selection
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
