import Link from 'next/link'

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 13h4" />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.09 6.26L20 10.27l-4.91 3.82L16.18 22 12 17.77 7.82 22l1.09-7.91L4 10.27l5.91-2.01z" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
    </svg>
  )
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function ClipboardCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4l-10 8L2 4" />
    </svg>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function UserCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
    </svg>
  )
}

const features = [
  {
    icon: BoltIcon,
    title: 'Devis IA en quelques secondes',
    description: 'Decrivez votre chantier en langage courant et obtenez un devis detaille et chiffre instantanement.',
  },
  {
    icon: DocumentIcon,
    title: 'Factures professionnelles',
    description: 'Transformez vos devis acceptes en factures conformes en un clic. Numerotation automatique incluse.',
  },
  {
    icon: ClipboardCheckIcon,
    title: 'Suivi des statuts',
    description: 'Brouillon, envoye, accepte, refuse : suivez chaque devis et facture a chaque etape du processus.',
  },
  {
    icon: MailIcon,
    title: 'PDF & envoi par email',
    description: 'Generez des PDF professionnels et envoyez-les directement par email a vos clients depuis la plateforme.',
  },
  {
    icon: GridIcon,
    title: 'Catalogue de prestations',
    description: 'Creez et gerez votre catalogue de prestations avec vos tarifs pour accelerer la creation de devis.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Conformite facturation 2026',
    description: 'QuotiPro respecte les obligations de facturation electronique entrant en vigueur en 2026 en France.',
  },
]

const plans = [
  {
    name: 'Gratuit',
    price: '0',
    period: '',
    description: 'Pour demarrer et tester QuotiPro',
    features: ['5 devis par mois', '1 utilisateur', 'Export PDF', 'Catalogue basique', 'Support communautaire'],
    cta: 'Commencer gratuitement',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29',
    period: '/mois',
    description: 'Pour les artisans independants',
    features: ['Devis illimites', 'Facturation complete', 'Envoi par email', 'Catalogue avance', 'Support prioritaire', 'Personnalisation PDF'],
    cta: 'Essayer 14 jours gratuit',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '59',
    period: '/mois',
    description: 'Pour les equipes et entreprises',
    features: ['Tout le plan Pro', 'Multi-utilisateurs', 'Acces API', 'Support dedie', 'Tableau de bord avance', 'Integration comptable'],
    cta: 'Contacter les ventes',
    highlighted: false,
  },
]

const testimonials = [
  {
    name: 'Thomas Durand',
    role: 'Plombier a Lyon',
    quote: 'Avant QuotiPro, je passais mes soirees a faire mes devis. Maintenant, je decris le chantier et c\'est pret en 30 secondes. Mes clients sont impressionnes par le rendu professionnel.',
    rating: 5,
  },
  {
    name: 'Marie-Claire Petit',
    role: 'Electricienne a Bordeaux',
    quote: 'La facturation electronique me faisait peur pour 2026. Avec QuotiPro, je suis deja conforme et sereine. Le suivi des statuts m\'a fait gagner un temps fou.',
    rating: 5,
  },
  {
    name: 'Karim Benali',
    role: 'Peintre en batiment a Marseille',
    quote: 'Le catalogue de prestations est genial : je cree un devis en quelques clics avec mes tarifs habituels. J\'ai double mon nombre de devis envoyes depuis que j\'utilise QuotiPro.',
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-800">QuotiPro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#fonctionnement" className="hover:text-primary-600 transition-colors">Comment ca marche</a>
            <a href="#fonctionnalites" className="hover:text-primary-600 transition-colors">Fonctionnalites</a>
            <a href="#tarifs" className="hover:text-primary-600 transition-colors">Tarifs</a>
            <a href="#temoignages" className="hover:text-primary-600 transition-colors">Temoignages</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm text-primary-100">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Conforme facturation electronique 2026</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/20 backdrop-blur border border-accent-400/30 text-sm text-accent-300 font-medium animate-pulse">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              <span>Nouveau : Dictez vos devis a la voix !</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Creez vos devis BTP<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
              en quelques secondes
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Decrivez votre chantier, l&apos;intelligence artificielle genere votre devis professionnel.
            Plus de temps perdu le soir a chiffrer vos projets.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5"
            >
              Commencer gratuitement
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#fonctionnement"
              className="inline-flex items-center px-6 py-4 rounded-xl text-white font-semibold border border-white/25 hover:bg-white/10 transition-all duration-200"
            >
              Voir la demo
            </a>
          </div>
          <p className="mt-6 text-sm text-primary-200">
            Gratuit pour commencer. Sans carte bancaire.
          </p>
        </div>
      </section>

      {/* Comment ca marche */}
      <section id="fonctionnement" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">Comment ca marche</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Trois etapes simples pour passer de la description du chantier au devis envoye.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-600 text-white mb-6 shadow-lg shadow-primary-600/20 group-hover:scale-110 transition-transform duration-300">
                <ChatBubbleIcon className="w-10 h-10" />
              </div>
              <div className="absolute top-10 left-full hidden md:block w-full">
                <svg className="w-full h-4 text-primary-300" viewBox="0 0 200 20" fill="none">
                  <path d="M0 10h180m0 0l-8-6m8 6l-8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />
                </svg>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-bold mb-3">Etape 1</span>
              <h3 className="text-xl font-bold text-primary-800 mb-2">Decrivez</h3>
              <p className="text-gray-500 leading-relaxed">
                Tapez la description de votre chantier en langage courant. Pas besoin de jargon technique.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent-500 text-white mb-6 shadow-lg shadow-accent-500/20 group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="w-10 h-10" />
              </div>
              <div className="absolute top-10 left-full hidden md:block w-full">
                <svg className="w-full h-4 text-primary-300" viewBox="0 0 200 20" fill="none">
                  <path d="M0 10h180m0 0l-8-6m8 6l-8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />
                </svg>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-accent-100 text-accent-600 text-xs font-bold mb-3">Etape 2</span>
              <h3 className="text-xl font-bold text-primary-800 mb-2">L&apos;IA genere</h3>
              <p className="text-gray-500 leading-relaxed">
                Notre intelligence artificielle cree un devis detaille avec vos tarifs et prestations habituels.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-600 text-white mb-6 shadow-lg shadow-primary-600/20 group-hover:scale-110 transition-transform duration-300">
                <SendIcon className="w-10 h-10" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-600 text-xs font-bold mb-3">Etape 3</span>
              <h3 className="text-xl font-bold text-primary-800 mb-2">Envoyez</h3>
              <p className="text-gray-500 leading-relaxed">
                PDF professionnel genere et pret a envoyer par email directement a votre client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
              Tout ce qu&apos;il vous faut pour gerer vos devis
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Des fonctionnalites pensees par et pour les artisans du BTP.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-primary-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
              Des tarifs simples et transparents
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Choisissez le plan adapte a votre activite. Evolue avec vous.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/30 scale-[1.03] border-2 border-primary-500'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-xs font-bold rounded-full shadow-lg">
                    Le plus populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-primary-800'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.highlighted ? 'text-primary-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>
                <div className="mb-8">
                  <span className={`text-5xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-primary-800'}`}>
                    {plan.price}&euro;
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-primary-200' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-accent-300' : 'text-accent-500'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-gray-600'}`}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`block text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-accent-500 hover:bg-accent-600 text-white shadow-lg shadow-accent-500/30'
                      : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="temoignages" className="py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Des artisans du BTP partout en France utilisent QuotiPro au quotidien.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-accent-500" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="w-10 h-10 text-primary-300" />
                  <div>
                    <p className="font-semibold text-primary-800 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
            Pret a gagner du temps sur vos devis ?
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Rejoignez des centaines d&apos;artisans BTP qui ont deja simplifie leur quotidien avec QuotiPro.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center px-8 py-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-accent-500/30 hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-0.5"
          >
            Commencer gratuitement
            <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-6 text-sm text-primary-200">
            5 devis gratuits par mois. Sans engagement.
          </p>
        </div>
      </section>

      {/* Counters */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2 500+', label: 'Devis generees' },
              { value: '450+', label: 'Artisans inscrits' },
              { value: '98%', label: 'Taux de satisfaction' },
              { value: '< 30s', label: 'Temps moyen par devis' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50" id="faq">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-primary-800 mb-12">Questions frequentes</h2>
          <div className="space-y-4">
            {[
              {
                q: 'QuotiPro est-il gratuit ?',
                a: 'Oui, le plan Gratuit vous permet de creer jusqu\'a 5 devis par mois sans engagement. Pour un usage illimite, passez au plan Pro a 19€/mois.',
              },
              {
                q: 'Comment fonctionne la creation vocale ?',
                a: 'Cliquez sur le bouton micro, dictez la description de votre chantier en francais, et l\'IA genere automatiquement les lignes de votre devis avec les prix.',
              },
              {
                q: 'Mes donnees sont-elles securisees ?',
                a: 'Absolument. Vos donnees sont stockees sur des serveurs securises en Europe, avec chiffrement de bout en bout. Nous sommes conformes au RGPD.',
              },
              {
                q: 'Puis-je utiliser QuotiPro sur mon telephone ?',
                a: 'Oui ! QuotiPro est une application web installable (PWA). Vous pouvez l\'ajouter a votre ecran d\'accueil et l\'utiliser comme une app native, meme hors-ligne.',
              },
              {
                q: 'La signature electronique a-t-elle une valeur legale ?',
                a: 'Oui, la signature electronique est reconnue par la loi francaise (article 1367 du Code civil). Le devis signe est juridiquement contraignant.',
              },
              {
                q: 'Est-ce conforme a la facturation electronique 2026 ?',
                a: 'QuotiPro est concu pour etre conforme aux exigences de la reforme de la facturation electronique qui entre en vigueur en 2026.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 transition">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-200 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">QuotiPro</span>
              </div>
              <p className="text-sm leading-relaxed text-primary-300">
                L&apos;outil de devis et facturation intelligent pour les artisans du BTP en France.
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalites</a></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Essai gratuit</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Ressources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Centre d&apos;aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guide facturation 2026</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Mentions legales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialite</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CGV</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-primary-400">
              &copy; 2026 QuotiPro. Tous droits reserves.
            </p>
            <div className="flex items-center gap-4 text-primary-400">
              <span className="text-xs">Fait avec soin pour les artisans francais</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
