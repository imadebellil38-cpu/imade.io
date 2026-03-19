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
    }

    // Générer la référence du devis
    const { count } = await supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('artisan_id', user.id)

    const numero = (count || 0) + 1
    const reference = `DEV-${new Date().getFullYear()}-${String(numero).padStart(4, '0')}`

    // Créer le devis
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .insert({
        reference,
        artisan_id: user.id,
        client_id: clientId,
        statut: body.statut || 'brouillon',
        description_chantier: body.description_chantier,
        adresse_chantier: body.adresse_chantier || null,
        total_ht: body.total_ht,
        taux_tva: body.taux_tva,
        total_tva: body.total_tva,
        total_ttc: body.total_ttc,
        conditions_reglement: body.conditions_reglement || 'Paiement à 30 jours',
        notes: body.notes || null,
      })
      .select('id, reference')
      .single()

    if (devisError) throw devisError

    // Insérer les lignes du devis
    if (body.lignes && body.lignes.length > 0) {
      const lignes = body.lignes.map((ligne: { description: string; quantite: number; unite: string; prix_unitaire: number; total: number; ordre: number }) => ({
        devis_id: devis.id,
        description: ligne.description,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prix_unitaire: ligne.prix_unitaire,
        total: ligne.total,
        ordre: ligne.ordre,
      }))

      const { error: lignesError } = await supabase
        .from('devis_lignes')
        .insert(lignes)

      if (lignesError) throw lignesError
    }

    return NextResponse.json({ id: devis.id, reference: devis.reference })
  } catch (error) {
    console.error('Erreur sauvegarde devis:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du devis.' },
      { status: 500 }
    )
  }
}
