import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { devis_id } = await request.json()

    if (!devis_id) {
      return NextResponse.json({ error: 'ID du devis requis' }, { status: 400 })
    }

    // Récupérer le devis avec ses lignes
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select('*, lignes:devis_lignes(*)')
      .eq('id', devis_id)
      .eq('artisan_id', user.id)
      .single()

    if (devisError || !devis) {
      return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 })
    }

    // Générer la référence de la facture
    const { count } = await supabase
      .from('factures')
      .select('*', { count: 'exact', head: true })
      .eq('artisan_id', user.id)

    const numero = (count || 0) + 1
    const reference = `FAC-${new Date().getFullYear()}-${String(numero).padStart(4, '0')}`

    // Créer la facture
    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .insert({
        reference,
        artisan_id: user.id,
        client_id: devis.client_id,
        devis_id: devis.id,
        statut: 'brouillon',
        total_ht: devis.total_ht,
        taux_tva: devis.taux_tva,
        total_tva: devis.total_tva,
        total_ttc: devis.total_ttc,
        conditions_reglement: devis.conditions_reglement || 'Paiement à 30 jours',
        notes: devis.notes || null,
        mode_paiement: 'virement',
      })
      .select('id, reference')
      .single()

    if (factureError) throw factureError

    // Copier les lignes du devis dans la facture
    if (devis.lignes && devis.lignes.length > 0) {
      const lignes = devis.lignes.map((ligne: { description: string; quantite: number; unite: string; prix_unitaire: number; total: number; ordre: number }) => ({
        facture_id: facture.id,
        description: ligne.description,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prix_unitaire: ligne.prix_unitaire,
        total: ligne.total,
        ordre: ligne.ordre,
      }))

      const { error: lignesError } = await supabase
        .from('facture_lignes')
        .insert(lignes)

      if (lignesError) throw lignesError
    }

    return NextResponse.json({ id: facture.id, reference: facture.reference })
  } catch (error) {
    console.error('Erreur conversion devis en facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la conversion du devis en facture.' },
      { status: 500 }
    )
  }
}
