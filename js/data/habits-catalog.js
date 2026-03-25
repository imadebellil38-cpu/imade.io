// Catalogue d'habitudes pré-définies - Neon vibrant colors

export const HABIT_CATEGORIES = [
  {
    id: 'morning',
    name: 'Routine matinale',
    icon: '🌅',
    habits: [
      { name: 'Se lever tôt', icon: '⏰', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Faire son lit', icon: '🛏️', color: '#A78BFA', frequency: 'daily' },
      { name: 'Boire de l\'eau au réveil', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Méditer', icon: '🧘', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Cold shower', icon: '🧊', color: '#22D3EE', frequency: 'daily' },
      { name: 'Soleil 30 min après réveil', icon: '☀️', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas de caféine 90 min', icon: '☕', color: '#F472B6', frequency: 'daily' },
    ]
  },
  {
    id: 'training',
    name: 'Entraînement',
    icon: '🏋️',
    habits: [
      { name: 'Musculation', icon: '🏋️', color: '#FF6B6B', frequency: 'weekly_3' },
      { name: 'Cardio Zone 2 (30-45 min)', icon: '🫀', color: '#F472B6', frequency: 'weekly_3' },
      { name: 'Stretching 10 min', icon: '🤸', color: '#A78BFA', frequency: 'daily' },
      { name: '10 000 pas', icon: '🚶', color: '#34D399', frequency: 'daily' },
      { name: 'Sprint / HIIT', icon: '⚡', color: '#FBBF24', frequency: 'custom:2' },
      { name: 'Noter sa séance', icon: '📝', color: '#38BDF8', frequency: 'weekly_3' },
      { name: 'Foam roller', icon: '🧻', color: '#8B5CF6', frequency: 'daily' },
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: '🥩',
    habits: [
      { name: 'Manger 2g protéines/kg', icon: '🥩', color: '#FF6B6B', frequency: 'daily' },
      { name: 'Manger sainement (80%)', icon: '🥗', color: '#00ff88', frequency: 'daily' },
      { name: 'Pas de sucre raffiné', icon: '🚫', color: '#EF4444', frequency: 'daily' },
      { name: 'Meal prep', icon: '🍱', color: '#FBBF24', frequency: 'custom:0' },
      { name: 'Boire 3L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
      { name: 'Créatine 5g', icon: '💊', color: '#A78BFA', frequency: 'daily' },
      { name: 'Pas d\'alcool', icon: '🍷', color: '#EF4444', frequency: 'daily' },
      { name: 'Pas d\'ultra-transformé', icon: '🍔', color: '#F472B6', frequency: 'daily' },
    ]
  },
  {
    id: 'recovery',
    name: 'Récupération',
    icon: '😴',
    habits: [
      { name: 'Dormir 8h', icon: '😴', color: '#A78BFA', frequency: 'daily' },
      { name: 'Même heure coucher/lever', icon: '🕐', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Pas d\'écran 1h avant', icon: '📱', color: '#EF4444', frequency: 'daily' },
      { name: 'Chambre froide & noire', icon: '🌑', color: '#38BDF8', frequency: 'daily' },
      { name: 'Sieste 20 min', icon: '💤', color: '#A78BFA', frequency: 'daily' },
      { name: 'Lumière tamisée le soir', icon: '🕯️', color: '#FBBF24', frequency: 'daily' },
    ]
  },
  {
    id: 'mind',
    name: 'Mental & Discipline',
    icon: '🧠',
    habits: [
      { name: 'Lire 20 min', icon: '📖', color: '#FBBF24', frequency: 'daily' },
      { name: 'Journaling', icon: '📝', color: '#F472B6', frequency: 'daily' },
      { name: 'Gratitude (3 choses)', icon: '🙏', color: '#FBBF24', frequency: 'daily' },
      { name: 'Pas de réseaux sociaux', icon: '📵', color: '#EF4444', frequency: 'daily' },
      { name: 'Apprendre quelque chose', icon: '🎓', color: '#38BDF8', frequency: 'daily' },
      { name: 'Visualisation objectifs', icon: '🎯', color: '#00ff88', frequency: 'daily' },
      { name: 'Sortir de sa zone de confort', icon: '🔥', color: '#FF6B6B', frequency: 'daily' },
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
      { name: 'Bilan de la journée', icon: '📋', color: '#8B5CF6', frequency: 'daily' },
      { name: 'Préparer le lendemain', icon: '📆', color: '#38BDF8', frequency: 'daily' },
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
      { name: 'Boire 3L d\'eau', icon: '💧', color: '#38BDF8', frequency: 'daily' },
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
