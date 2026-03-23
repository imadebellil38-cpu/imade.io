import type { Profile, Client, Devis, Prestation, Facture } from '@/types/database'

export const DEMO_USER_ID = 'demo-user-001'

export const demoProfile: Profile = {
  id: 'profile-001',
  user_id: DEMO_USER_ID,
  nom_entreprise: 'ProspectHunter BTP',
  siret: '12345678901234',
  adresse: '15 Rue des Artisans, 75011 Paris',
  telephone: '06 12 34 56 78',
  email: 'admin@prospecthunter.com',
  logo_url: null,
  garantie_decennale: 'Assurance Décennale N°DEC-2024-001',
  mentions_legales: 'Auto-entrepreneur - Dispensé d\'immatriculation au RCS',
  taux_tva: 10,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-03-20T14:30:00Z',
}

export const demoClients: Client[] = [
  {
    id: 'client-001',
    artisan_id: DEMO_USER_ID,
    nom: 'Marie Dupont',
    email: 'marie.dupont@email.fr',
    adresse: '8 Avenue Victor Hugo, 75016 Paris',
    telephone: '06 98 76 54 32',
    created_at: '2024-02-01T09:00:00Z',
  },
  {
    id: 'client-002',
    artisan_id: DEMO_USER_ID,
    nom: 'Jean Martin',
    email: 'jean.martin@email.fr',
    adresse: '22 Rue de la Paix, 92100 Boulogne',
    telephone: '07 11 22 33 44',
    created_at: '2024-02-15T11:00:00Z',
  },
  {
    id: 'client-003',
    artisan_id: DEMO_USER_ID,
    nom: 'Sophie Laurent',
    email: 'sophie.laurent@email.fr',
    adresse: '5 Rue du Commerce, 75015 Paris',
    telephone: '06 55 44 33 22',
    created_at: '2024-03-01T08:30:00Z',
  },
]

export const demoPrestations: Prestation[] = [
  {
    id: 'prest-001',
    artisan_id: DEMO_USER_ID,
    nom: 'Peinture intérieure',
    description: 'Peinture murs et plafonds - 2 couches',
    prix_unitaire: 25,
    unite: 'm²',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prest-002',
    artisan_id: DEMO_USER_ID,
    nom: 'Pose carrelage',
    description: 'Pose carrelage sol avec joints',
    prix_unitaire: 45,
    unite: 'm²',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prest-003',
    artisan_id: DEMO_USER_ID,
    nom: 'Plomberie - intervention',
    description: 'Intervention plomberie standard',
    prix_unitaire: 60,
    unite: 'h',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'prest-004',
    artisan_id: DEMO_USER_ID,
    nom: 'Électricité - point lumineux',
    description: 'Installation point lumineux complet',
    prix_unitaire: 85,
    unite: 'pièce',
    created_at: '2024-01-20T10:00:00Z',
  },
]

const now = new Date()
const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

export const demoDevis: Devis[] = [
  {
    id: 'devis-001',
    reference: 'DEV-2026-001',
    artisan_id: DEMO_USER_ID,
    client_id: 'client-001',
    statut: 'accepte',
    date_creation: `${thisMonth}-05T10:00:00Z`,
    date_validite: `${thisMonth}-30T10:00:00Z`,
    description_chantier: 'Rénovation salle de bain complète',
    adresse_chantier: '8 Avenue Victor Hugo, 75016 Paris',
    total_ht: 4500,
    taux_tva: 10,
    total_tva: 450,
    total_ttc: 4950,
    conditions_reglement: '30% à la commande, solde à la livraison',
    notes: null,
    created_at: `${thisMonth}-05T10:00:00Z`,
    updated_at: `${thisMonth}-06T14:00:00Z`,
    client: demoClients[0],
    lignes: [
      { id: 'l1', devis_id: 'devis-001', description: 'Dépose ancienne salle de bain', quantite: 1, unite: 'forfait', prix_unitaire: 800, total: 800, ordre: 1 },
      { id: 'l2', devis_id: 'devis-001', description: 'Pose carrelage sol', quantite: 12, unite: 'm²', prix_unitaire: 45, total: 540, ordre: 2 },
      { id: 'l3', devis_id: 'devis-001', description: 'Pose carrelage mural', quantite: 20, unite: 'm²', prix_unitaire: 50, total: 1000, ordre: 3 },
      { id: 'l4', devis_id: 'devis-001', description: 'Plomberie complète', quantite: 1, unite: 'forfait', prix_unitaire: 2160, total: 2160, ordre: 4 },
    ],
  },
  {
    id: 'devis-002',
    reference: 'DEV-2026-002',
    artisan_id: DEMO_USER_ID,
    client_id: 'client-002',
    statut: 'envoye',
    date_creation: `${thisMonth}-12T09:00:00Z`,
    date_validite: `${thisMonth}-28T09:00:00Z`,
    description_chantier: 'Peinture appartement T3',
    adresse_chantier: '22 Rue de la Paix, 92100 Boulogne',
    total_ht: 2800,
    taux_tva: 10,
    total_tva: 280,
    total_ttc: 3080,
    conditions_reglement: 'Paiement à réception de facture',
    notes: 'Peinture bio demandée par le client',
    created_at: `${thisMonth}-12T09:00:00Z`,
    updated_at: `${thisMonth}-12T09:00:00Z`,
    client: demoClients[1],
    lignes: [
      { id: 'l5', devis_id: 'devis-002', description: 'Peinture salon + séjour', quantite: 45, unite: 'm²', prix_unitaire: 25, total: 1125, ordre: 1 },
      { id: 'l6', devis_id: 'devis-002', description: 'Peinture 2 chambres', quantite: 35, unite: 'm²', prix_unitaire: 25, total: 875, ordre: 2 },
      { id: 'l7', devis_id: 'devis-002', description: 'Peinture plafonds', quantite: 40, unite: 'm²', prix_unitaire: 20, total: 800, ordre: 3 },
    ],
  },
  {
    id: 'devis-003',
    reference: 'DEV-2026-003',
    artisan_id: DEMO_USER_ID,
    client_id: 'client-003',
    statut: 'brouillon',
    date_creation: `${thisMonth}-18T15:00:00Z`,
    date_validite: `${thisMonth}-30T15:00:00Z`,
    description_chantier: 'Installation électrique cuisine',
    adresse_chantier: '5 Rue du Commerce, 75015 Paris',
    total_ht: 1700,
    taux_tva: 10,
    total_tva: 170,
    total_ttc: 1870,
    conditions_reglement: null,
    notes: null,
    created_at: `${thisMonth}-18T15:00:00Z`,
    updated_at: `${thisMonth}-18T15:00:00Z`,
    client: demoClients[2],
    lignes: [
      { id: 'l8', devis_id: 'devis-003', description: 'Points lumineux cuisine', quantite: 6, unite: 'pièce', prix_unitaire: 85, total: 510, ordre: 1 },
      { id: 'l9', devis_id: 'devis-003', description: 'Prises électriques', quantite: 8, unite: 'pièce', prix_unitaire: 65, total: 520, ordre: 2 },
      { id: 'l10', devis_id: 'devis-003', description: 'Tableau électrique', quantite: 1, unite: 'forfait', prix_unitaire: 670, total: 670, ordre: 3 },
    ],
  },
  {
    id: 'devis-004',
    reference: 'DEV-2026-004',
    artisan_id: DEMO_USER_ID,
    client_id: 'client-001',
    statut: 'accepte',
    date_creation: '2026-02-10T10:00:00Z',
    date_validite: '2026-03-10T10:00:00Z',
    description_chantier: 'Rénovation cuisine',
    adresse_chantier: '8 Avenue Victor Hugo, 75016 Paris',
    total_ht: 6200,
    taux_tva: 10,
    total_tva: 620,
    total_ttc: 6820,
    conditions_reglement: '50% à la commande',
    notes: null,
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
    client: demoClients[0],
  },
]

export const demoFactures: Facture[] = [
  {
    id: 'facture-001',
    reference: 'FAC-2026-001',
    artisan_id: DEMO_USER_ID,
    client_id: 'client-001',
    devis_id: 'devis-004',
    statut: 'payee',
    date_emission: '2026-02-20T10:00:00Z',
    date_echeance: '2026-03-20T10:00:00Z',
    total_ht: 6200,
    taux_tva: 10,
    total_tva: 620,
    total_ttc: 6820,
    conditions_reglement: '50% à la commande',
    notes: null,
    mode_paiement: 'virement',
    created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
    client: demoClients[0],
  },
]

export function isDemoMode(): boolean {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    return !url || url === 'your_supabase_url' || !key || key === 'your_supabase_anon_key'
  } catch {
    return true
  }
}
