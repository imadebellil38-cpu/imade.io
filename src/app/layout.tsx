import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QuotiPro - Devis intelligents pour artisans BTP',
  description: 'Créez vos devis professionnels en quelques secondes grâce à l\'IA. Conçu pour les artisans du BTP.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
