import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { facture_reference, client_email, client_nom, montant_ttc, date_echeance } = await req.json()

    if (!client_email) {
      return NextResponse.json({ error: 'Email du client requis' }, { status: 400 })
    }

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      // Demo mode - simulate success
      return NextResponse.json({ success: true, demo: true })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const formattedDate = new Date(date_echeance).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

    const formattedMontant = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(montant_ttc)

    await resend.emails.send({
      from: 'QuotiPro <noreply@quotipro.fr>',
      to: client_email,
      subject: `Relance - Facture ${facture_reference} en attente de paiement`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">QuotiPro</h1>
          </div>
          <div style="background: white; border: 1px solid #e5e7eb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Bonjour ${client_nom},</p>
            <p>Nous nous permettons de vous rappeler que la facture <strong>${facture_reference}</strong> d'un montant de <strong>${formattedMontant}</strong> est arrivée à échéance le <strong>${formattedDate}</strong>.</p>
            <p>Si le paiement a déjà été effectué, veuillez ne pas tenir compte de ce message.</p>
            <p>Dans le cas contraire, nous vous remercions de bien vouloir procéder au règlement dans les meilleurs délais.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 14px;">Cordialement,<br/>L'équipe QuotiPro</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur relance:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de la relance' }, { status: 500 })
  }
}
