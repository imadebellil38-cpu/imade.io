export interface Profile {
  id: string
  user_id: string
  nom_entreprise: string
  siret: string
  adresse: string
  telephone: string
  email: string
  logo_url: string | null
  garantie_decennale: string | null
  mentions_legales: string | null
  taux_tva: number
  created_at: string
  updated_at: string
}

export interface Prestation {
  id: string
  artisan_id: string
  nom: string
  description: string | null
  prix_unitaire: number
  unite: 'h' | 'forfait' | 'm²' | 'pièce' | 'ml' | 'kg'
  created_at: string
}

export interface Client {
  id: string
  artisan_id: string
  nom: string
  email: string | null
  adresse: string | null
  telephone: string | null
  created_at: string
}

export interface Devis {
  id: string
  reference: string
  artisan_id: string
  client_id: string
  statut: 'brouillon' | 'envoye' | 'vu' | 'accepte' | 'refuse'
  date_creation: string
  date_validite: string
  description_chantier: string
  adresse_chantier: string | null
  total_ht: number
  taux_tva: number
  total_tva: number
  total_ttc: number
  conditions_reglement: string | null
  notes: string | null
  created_at: string
  updated_at: string
  client?: Client
  lignes?: DevisLigne[]
}

export interface DevisLigne {
  id: string
  devis_id: string
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  total: number
  ordre: number
}

export interface Facture {
  id: string
  reference: string
  artisan_id: string
  client_id: string | null
  devis_id: string | null
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee'
  date_emission: string
  date_echeance: string
  total_ht: number
  taux_tva: number
  total_tva: number
  total_ttc: number
  conditions_reglement: string | null
  notes: string | null
  mode_paiement: 'virement' | 'cheque' | 'especes' | 'carte' | 'autre'
  created_at: string
  updated_at: string
  client?: Client
  lignes?: FactureLigne[]
  devis?: Devis
}

export interface FactureLigne {
  id: string
  facture_id: string
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  total: number
  ordre: number
}
