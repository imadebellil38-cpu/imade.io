import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">QuotiPro</h1>
        <div className="flex gap-3">
          <Link href="/auth/login" className="btn-secondary text-sm">
            Connexion
          </Link>
          <Link href="/auth/register" className="btn-accent text-sm">
            Essai gratuit
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Vos devis pro en<br />
          <span className="text-accent-400">quelques secondes</span>
        </h2>
        <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
          Décrivez votre chantier, l&apos;IA génère votre devis.
          Simple, rapide, professionnel.
        </p>
        <Link
          href="/auth/register"
          className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg"
        >
          Commencer gratuitement
        </Link>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-lg mb-2">Décrivez</h3>
            <p className="text-primary-200 text-sm">
              Tapez la description de votre chantier en langage courant
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2">L&apos;IA génère</h3>
            <p className="text-primary-200 text-sm">
              Le devis est créé automatiquement avec vos tarifs habituels
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-semibold text-lg mb-2">Envoyez</h3>
            <p className="text-primary-200 text-sm">
              PDF professionnel prêt à envoyer à votre client
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
