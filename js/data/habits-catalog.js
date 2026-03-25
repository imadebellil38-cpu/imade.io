// Catalogue d'habitudes pré-définies - Neon vibrant colors

export const HABIT_CATEGORIES = [
  {
    id: 'morning',
    name: 'Routine matinale',
    icon: '🌅',
    habits: [
      { name: 'Se lever tôt', icon: '⏰', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Faire son lit', icon: '🛏️', color: '#A78BFA', frequency: 'daily' },
      { name: 'Boire de l\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Méditer', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#22D3EE', frequency: 'daily' },
    ]
  },
  {
    id: 'health',
    name: 'Santé',
    icon: '💪',
    habits: [
      { name: 'Sport 30 min', icon: '🏋️', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Manger sainement', icon: '🥗', color: '#00ff88', frequency: 'daily' },
      { name: 'Pas de sucre', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Dormir 8h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
      { name: 'Marcher 30 min', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: 'Boire 2L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
    ]
  },
  {
    id: 'mind',
    name: 'Mental',
    icon: '🧠',
    habits: [
      { name: 'Lire 20 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#F472B6', frequency: 'daily' },
      { name: 'Gratitude', icon: '🙏', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas de réseaux sociaux', icon: '📵', color: '#EF4444', frequency: 'daily' },
      { name: 'Apprendre quelque chose', icon: '🎓', color: '#38BDF8', frequency: 'daily' },
    ]
  },
  {
    id: 'productivity',
    name: 'Productivité',
    icon: '🎯',
    habits: [
      { name: 'Deep work 2h', icon: '💻', color: '#FF6B6B', frequency: 'weekly_5' },
      { name: 'Travailler sur son projet', icon: '🚀', color: '#FBBF24', frequency: 'daily' },
      { name: 'To-do list du jour', icon: '✅', color: '#00ff88', frequency: 'daily' },
      { name: 'Pas de procrastination', icon: '⚡', color: '#F472B6', frequency: 'daily' },
    ]
  },
  {
    id: 'evening',
    name: 'Routine du soir',
    icon: '🌙',
    habits: [
      { name: 'Bilan de la journée', icon: '📋', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Préparer le lendemain', icon: '📆', color: '#38BDF8', frequency: 'daily' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#EF4444', frequency: 'daily' },
      { name: 'Méditer le soir', icon: '🌙', color: '#A78BFA', frequency: 'daily' },
    ]
  }
];

export const HABIT_PACKS = [
  {
    id: 'beginner',
    name: 'Pack Débutant',
    description: 'Les fondamentaux pour commencer',
    icon: '🌱',
    color: '#00ff88',
    habits: [
      { name: 'Boire 2L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Marcher 30 min', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: 'Lire 15 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Méditer 5 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Se coucher avant minuit', icon: '🌙', color: '#A78BFA', frequency: 'daily' },
    ]
  },
  {
    id: 'warrior',
    name: 'Pack Warrior',
    description: 'Pour ceux qui veulent se dépasser',
    icon: '⚔️',
    color: '#FF6B6B',
    habits: [
      { name: 'Se lever à 6h', icon: '⏰', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Sport 45 min', icon: '🏋️', color: '#F472B6', frequency: 'daily' },
      { name: 'Pas de sucre', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Lire 30 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#22D3EE', frequency: 'daily' },
      { name: 'Travailler sur son projet', icon: '🚀', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#EF4444', frequency: 'daily' },
    ]
  },
  {
    id: 'entrepreneur',
    name: 'Pack Entrepreneur',
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
    name: 'Pack Bien-être',
    description: 'Prends soin de toi',
    icon: '🧘',
    color: '#8B5CF6',
    habits: [
      { name: 'Méditer 10 min', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#F472B6', frequency: 'daily' },
      { name: 'Gratitude (3 choses)', icon: '🙏', color: '#FBBF24', frequency: 'daily' },
      { name: 'Yoga / Étirements', icon: '🤸', color: '#A78BFA', frequency: 'daily' },
      { name: 'Temps en nature', icon: '🌿', color: '#00ff88', frequency: 'daily' },
      { name: 'Digital detox 1h', icon: '📵', color: '#EF4444', frequency: 'daily' },
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
