import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { description } = await request.json()

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'La description doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    // Récupérer le catalogue de prestations de l'artisan
    const { data: prestations } = await supabase
      .from('prestations')
      .select('*')
      .eq('artisan_id', user.id)

    // Récupérer le profil pour le taux de TVA
    const { data: profil } = await supabase
      .from('profiles')
      .select('taux_tva')
      .eq('user_id', user.id)
      .single()

    const catalogueText = prestations && prestations.length > 0
      ? prestations.map((p: { nom: string; prix_unitaire: number; unite: string; description?: string }) => `- ${p.nom}: ${p.prix_unitaire}€/${p.unite}${p.description ? ` (${p.description})` : ''}`).join('\n')
      : 'Aucune prestation définie - utiliser des prix de marché raisonnables pour un artisan BTP en France.'

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Tu es un assistant spécialisé dans la création de devis pour artisans BTP en France.

À partir de la description suivante d'un chantier, génère les lignes de devis détaillées.

CATALOGUE DE PRESTATIONS DE L'ARTISAN :
${catalogueText}

DESCRIPTION DU CHANTIER :
${description}

INSTRUCTIONS :
- Utilise les prix du catalogue de l'artisan quand c'est applicable
- Si une prestation n'est pas dans le catalogue, propose un prix de marché raisonnable
- Détaille chaque prestation (fourniture + main d'œuvre séparément si pertinent)
- Extrais le nom du client et l'adresse du chantier si mentionnés
- Utilise des unités cohérentes (h pour heures, forfait, m², pièce, ml, kg)

Réponds UNIQUEMENT avec un JSON valide au format suivant :
{
  "client_nom": "nom du client si mentionné, sinon chaîne vide",
  "adresse_chantier": "adresse si mentionnée, sinon chaîne vide",
  "lignes": [
    {
      "description": "Description de la prestation",
      "quantite": 1,
      "unite": "forfait",
      "prix_unitaire": 100.00
    }
  ]
}`
        }
      ]
    })

    // Extraire le JSON de la réponse
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    // Trouver le JSON dans la réponse (peut être entouré de markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Erreur lors de la génération du devis. Réessayez.' },
        { status: 500 }
      )
    }

    const result = JSON.parse(jsonMatch[0])

    // Calculer les totaux
    const lignes = result.lignes.map((ligne: { description: string; quantite: number; unite: string; prix_unitaire: number }, index: number) => ({
      ...ligne,
      total: Math.round(ligne.quantite * ligne.prix_unitaire * 100) / 100,
      ordre: index,
    }))

    const totalHT = lignes.reduce((sum: number, l: { total: number }) => sum + l.total, 0)
    const tauxTVA = profil?.taux_tva || 20
    const totalTVA = Math.round(totalHT * tauxTVA / 100 * 100) / 100
    const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100

    return NextResponse.json({
      client_nom: result.client_nom || '',
      adresse_chantier: result.adresse_chantier || '',
      lignes,
      total_ht: totalHT,
      taux_tva: tauxTVA,
      total_tva: totalTVA,
      total_ttc: totalTTC,
    })
  } catch (error) {
    console.error('Erreur génération devis:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du devis. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
