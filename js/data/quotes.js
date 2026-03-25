// Citations motivantes — une par jour
export const QUOTES = [
  "Chaque action est un vote pour le type de personne que tu veux devenir.",
  "Tu ne montes pas au niveau de tes objectifs. Tu descends au niveau de tes systèmes.",
  "1% par jour. Dans un an, tu seras 37 fois meilleur.",
  "Les habitudes sont les intérêts composés du développement personnel.",
  "Le succès est le produit de ses habitudes quotidiennes, pas de transformations uniques.",
  "Ce n'est pas une question de motivation. C'est une question d'identité.",
  "Sois le type de personne qui fait ça, pas celui qui essaie.",
  "La discipline, c'est choisir entre ce que tu veux maintenant et ce que tu veux le plus.",
  "Chaque journée est une occasion de construire la personne que tu veux être.",
  "Le moment parfait n'existe pas. Le moment, c'est maintenant.",
  "L'excellence n'est pas un acte, mais une habitude.",
  "On est ce qu'on répète chaque jour.",
  "La douleur de la discipline est temporaire. La douleur du regret est permanente.",
  "Petit à petit, l'oiseau fait son nid.",
  "Le meilleur moment pour planter un arbre, c'était il y a 20 ans. Le deuxième meilleur moment, c'est maintenant.",
  "Ta routine du matin détermine ta journée. Ta journée détermine ta vie.",
  "Ne brise pas la chaîne.",
  "Les gens surestiment ce qu'ils peuvent faire en un jour et sous-estiment ce qu'ils peuvent faire en un an.",
  "La constance bat le talent quand le talent n'est pas constant.",
  "Chaque empire a été construit brique par brique.",
  "Celui qui déplace une montagne commence par déplacer de petites pierres.",
  "Le secret du changement, c'est de concentrer toute ton énergie non pas à lutter contre le passé mais à construire l'avenir.",
  "Fais aujourd'hui ce que les autres ne veulent pas faire. Demain, tu feras ce que les autres ne peuvent pas faire.",
  "La motivation te met en route. L'habitude te fait continuer.",
  "Un voyage de mille lieues commence par un seul pas.",
  "Ce n'est pas parce que c'est difficile qu'on n'ose pas. C'est parce qu'on n'ose pas que c'est difficile.",
  "Deviens tellement bon qu'ils ne pourront pas t'ignorer.",
  "Le progrès, pas la perfection.",
  "Chaque check, c'est une victoire. Chaque victoire construit ton empire.",
  "Tu n'as pas besoin de voir tout l'escalier. Juste la première marche.",
  "La différence entre ordinaire et extraordinaire, c'est ce petit extra.",
];

export function getQuoteOfDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
