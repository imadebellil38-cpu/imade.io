import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Créer ou récupérer le client
    let clientId: string | null = null
    if (body.client_nom) {
      // Chercher un client existant
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('artisan_id', user.id)
        .eq('nom', body.client_nom)
        .single()

      if (existingClient) {
        clientId = existingClient.id
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            artisan_id: user.id,
            nom: body.client_nom,
            email: body.client_email || null,
            adresse: body.client_adresse || null,
            telephone: body.client_telephone || null,
          })
          .select('id')
          .single()

        if (clientError) throw clientError
        clientId = newClient.id
      }
    } else if (body.client_id) {
      clientId = body.client_id
    }

    // Mise à jour d'une facture existante
    if (body.id) {
      const { data: facture, error: factureError } = await supabase
        .from('factures')
        .update({
          client_id: clientId,
          statut: body.statut || 'brouillon',
          date_emission: body.date_emission || undefined,
          date_echeance: body.date_echeance || undefined,
          total_ht: body.total_ht,
          taux_tva: body.taux_tva,
          total_tva: body.total_tva,
          total_ttc: body.total_ttc,
          conditions_reglement: body.conditions_reglement || 'Paiement à 30 jours',
          notes: body.notes || null,
          mode_paiement: body.mode_paiement || 'virement',
        })
        .eq('id', body.id)
        .eq('artisan_id', user.id)
        .select('id, reference')
        .single()

      if (factureError) throw factureError

      // Supprimer les anciennes lignes et réinsérer
      await supabase
        .from('facture_lignes')
        .delete()
        .eq('facture_id', facture.id)

      if (body.lignes && body.lignes.length > 0) {
        const lignes = body.lignes.map((ligne: { description: string; quantite: number; unite: string; prix_unitaire: number; total: number; ordre: number }) => ({
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
    }

    // Création d'une nouvelle facture
    const { count } = await supabase
      .from('factures')
      .select('*', { count: 'exact', head: true })
      .eq('artisan_id', user.id)

    const numero = (count || 0) + 1
    const reference = `FAC-${new Date().getFullYear()}-${String(numero).padStart(4, '0')}`

    const { data: facture, error: factureError } = await supabase
      .from('factures')
      .insert({
        reference,
        artisan_id: user.id,
        client_id: clientId,
        devis_id: body.devis_id || null,
        statut: body.statut || 'brouillon',
        total_ht: body.total_ht,
        taux_tva: body.taux_tva,
        total_tva: body.total_tva,
        total_ttc: body.total_ttc,
        conditions_reglement: body.conditions_reglement || 'Paiement à 30 jours',
        notes: body.notes || null,
        mode_paiement: body.mode_paiement || 'virement',
      })
      .select('id, reference')
      .single()

    if (factureError) throw factureError

    // Insérer les lignes de la facture
    if (body.lignes && body.lignes.length > 0) {
      const lignes = body.lignes.map((ligne: { description: string; quantite: number; unite: string; prix_unitaire: number; total: number; ordre: number }) => ({
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
    console.error('Erreur sauvegarde facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la facture.' },
      { status: 500 }
    )
  }
}
