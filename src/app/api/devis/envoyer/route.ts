import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { devis_id, email_destinataire } = await request.json()

    if (!devis_id || !email_destinataire) {
      return NextResponse.json({ error: 'ID du devis et email requis' }, { status: 400 })
    }

    // Récupérer le devis et le profil
    const { data: devis } = await supabase
      .from('devis')
      .select('*, client:clients(*)')
      .eq('id', devis_id)
      .single()

    const { data: profil } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!devis || !profil) {
      return NextResponse.json({ error: 'Devis ou profil introuvable' }, { status: 404 })
    }

    // Envoyer l'email
    await resend.emails.send({
      from: `${profil.nom_entreprise} <devis@quotipro.fr>`,
      to: email_destinataire,
      subject: `Devis ${devis.reference} - ${profil.nom_entreprise}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Devis ${devis.reference}</h2>
          <p>Bonjour${devis.client?.nom ? ` ${devis.client.nom}` : ''},</p>
          <p>Veuillez trouver ci-joint notre devis ${devis.reference} d'un montant de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(devis.total_ttc)} TTC.</p>
          <p>Ce devis est valable jusqu'au ${new Date(devis.date_validite).toLocaleDateString('fr-FR')}.</p>
          <p>N'hésitez pas à nous contacter pour toute question.</p>
          <p>Cordialement,<br/>${profil.nom_entreprise}<br/>${profil.telephone}<br/>${profil.email}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Ce devis a été généré par QuotiPro</p>
        </div>
      `,
    })

    // Mettre à jour le statut du devis
    await supabase
      .from('devis')
      .update({ statut: 'envoye' })
      .eq('id', devis_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email." },
      { status: 500 }
    )
  }
}
