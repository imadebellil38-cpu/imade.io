import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuotiPro - Devis & Factures intelligents pour artisans BTP',
  description: 'Créez vos devis et factures professionnels en quelques secondes grâce à l\'IA. Gestion complète pour artisans et entreprises du BTP. Conforme facturation électronique 2026.',
  keywords: 'devis BTP, facture artisan, logiciel bâtiment, facturation électronique 2026, devis IA, gestion chantier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
