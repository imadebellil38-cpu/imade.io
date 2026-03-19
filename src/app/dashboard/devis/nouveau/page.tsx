'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface LigneDevis {
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  total: number
  ordre: number
}

const UNITES = ['forfait', 'h', 'm²', 'ml', 'pièce', 'kg', 'lot', 'u']

export default function NouveauDevisPage() {
  const router = useRouter()

  // Step state
  const [etape, setEtape] = useState<1 | 2 | 3>(1)

  // Step 1
  const [description, setDescription] = useState('')

  // Step 2
  const [lignes, setLignes] = useState<LigneDevis[]>([])
  const [clientNom, setClientNom] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAdresse, setClientAdresse] = useState('')
  const [clientTelephone, setClientTelephone] = useState('')
  const [adresseChantier, setAdresseChantier] = useState('')
  const [conditionsReglement, setConditionsReglement] = useState('Paiement à 30 jours')
  const [notes, setNotes] = useState('')
  const [tauxTVA, setTauxTVA] = useState(20)

  // UI state
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')

  // Totals
  const totalHT = lignes.reduce((sum, l) => sum + l.total, 0)
  const totalTVA = Math.round(totalHT * tauxTVA / 100 * 100) / 100
  const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100

  const formatPrix = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)

  // Step 1 -> Generate
  const genererDevis = useCallback(async () => {
    if (description.trim().length < 10) {
      setErreur('La description doit contenir au moins 10 caractères.')
      return
    }

    setLoading(true)
    setErreur('')

    try {
      const res = await fetch('/api/devis/generer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la génération')
      }

      const data = await res.json()
      setLignes(data.lignes)
      setTauxTVA(data.taux_tva)
      if (data.client_nom) setClientNom(data.client_nom)
      if (data.adresse_chantier) setAdresseChantier(data.adresse_chantier)
      setEtape(2)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }, [description])

  // Edit line
  const updateLigne = (index: number, field: keyof LigneDevis, value: string | number) => {
    setLignes(prev => {
      const updated = [...prev]
      const ligne = { ...updated[index], [field]: value }
      if (field === 'quantite' || field === 'prix_unitaire') {
        ligne.total = Math.round(ligne.quantite * ligne.prix_unitaire * 100) / 100
      }
      updated[index] = ligne
      return updated
    })
  }

  // Add line
  const ajouterLigne = () => {
    setLignes(prev => [
      ...prev,
      {
        description: '',
        quantite: 1,
        unite: 'forfait',
        prix_unitaire: 0,
        total: 0,
        ordre: prev.length,
      },
    ])
  }

  // Remove line
  const supprimerLigne = (index: number) => {
    setLignes(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, ordre: i })))
  }

  // Save
  const sauvegarder = useCallback(async (statut: 'brouillon' | 'envoye') => {
    if (lignes.length === 0) {
      setErreur('Le devis doit contenir au moins une ligne.')
      return
    }

    setSaving(true)
    setErreur('')

    try {
      const res = await fetch('/api/devis/sauvegarder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_nom: clientNom,
          client_email: clientEmail,
          client_adresse: clientAdresse,
          client_telephone: clientTelephone,
          description_chantier: description,
          adresse_chantier: adresseChantier,
          lignes,
          total_ht: totalHT,
          taux_tva: tauxTVA,
          total_tva: totalTVA,
          total_ttc: totalTTC,
          conditions_reglement: conditionsReglement,
          notes,
          statut,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      const data = await res.json()
      router.push(`/dashboard/devis/${data.id}`)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setSaving(false)
    }
  }, [lignes, clientNom, clientEmail, clientAdresse, clientTelephone, description, adresseChantier, totalHT, tauxTVA, totalTVA, totalTTC, conditionsReglement, notes, router])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
        <p className="text-gray-500 mt-1">Décrivez le chantier, l&apos;IA génère votre devis.</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors ${
                etape === step
                  ? 'bg-blue-600 text-white'
                  : etape > step
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {etape > step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className={`text-sm hidden sm:inline ${etape >= step ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {step === 1 && 'Description'}
              {step === 2 && 'Vérification'}
              {step === 3 && 'Confirmation'}
            </span>
            {step < 3 && <div className={`flex-1 h-0.5 ${etape > step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {erreur && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start justify-between">
          <span>{erreur}</span>
          <button onClick={() => setErreur('')} className="ml-3 font-medium underline shrink-0">
            Fermer
          </button>
        </div>
      )}

      {/* STEP 1: Description */}
      {etape === 1 && (
        <div className="card p-6">
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Décrivez le chantier en quelques lignes
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Plus la description est détaillée, plus le devis sera précis. Mentionnez le client, l&apos;adresse, les surfaces, les matériaux souhaités.
          </p>
          <textarea
            id="description"
            className="input-field w-full min-h-[200px] resize-y"
            placeholder="Ex : Rénovation salle de bain pour M. Dupont au 12 rue des Lilas, 75020 Paris. Dépose ancienne baignoire, pose receveur de douche 90x120, carrelage mural 15m², plomberie complète, pose d'un meuble vasque..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">
              {description.length} caractère{description.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={genererDevis}
              disabled={loading || description.trim().length < 10}
              className="btn-accent px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Génération en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  Générer le devis
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Review & Edit */}
      {etape === 2 && (
        <div className="space-y-6">
          {/* Lines */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Lignes du devis</h2>
              <button onClick={ajouterLigne} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ajouter
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-2 font-medium w-2/5">Description</th>
                    <th className="pb-2 font-medium w-20 text-center">Qté</th>
                    <th className="pb-2 font-medium w-24 text-center">Unité</th>
                    <th className="pb-2 font-medium w-28 text-right">Prix unit.</th>
                    <th className="pb-2 font-medium w-28 text-right">Total</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lignes.map((ligne, index) => (
                    <tr key={index} className="group">
                      <td className="py-2 pr-2">
                        <input
                          type="text"
                          className="input-field w-full text-sm py-1.5"
                          value={ligne.description}
                          onChange={(e) => updateLigne(index, 'description', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input-field w-full text-sm py-1.5 text-center"
                          value={ligne.quantite}
                          onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-1">
                        <select
                          className="input-field w-full text-sm py-1.5 text-center"
                          value={ligne.unite}
                          onChange={(e) => updateLigne(index, 'unite', e.target.value)}
                        >
                          {UNITES.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input-field w-full text-sm py-1.5 text-right"
                          value={ligne.prix_unitaire}
                          onChange={(e) => updateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-1 text-right font-medium text-gray-900">
                        {formatPrix(ligne.total)}
                      </td>
                      <td className="py-2 pl-1">
                        <button
                          onClick={() => supprimerLigne(index)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          title="Supprimer cette ligne"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-4">
              {lignes.map((ligne, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-gray-400">Ligne {index + 1}</span>
                    <button
                      onClick={() => supprimerLigne(index)}
                      className="text-gray-400 hover:text-red-500 p-1 -mt-1 -mr-1"
                      title="Supprimer cette ligne"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <input
                      type="text"
                      className="input-field w-full text-sm"
                      value={ligne.description}
                      onChange={(e) => updateLigne(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Qté</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-field w-full text-sm"
                        value={ligne.quantite}
                        onChange={(e) => updateLigne(index, 'quantite', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Unité</label>
                      <select
                        className="input-field w-full text-sm"
                        value={ligne.unite}
                        onChange={(e) => updateLigne(index, 'unite', e.target.value)}
                      >
                        {UNITES.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Prix unit.</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-field w-full text-sm"
                        value={ligne.prix_unitaire}
                        onChange={(e) => updateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right text-sm font-semibold text-gray-900">
                    Total : {formatPrix(ligne.total)}
                  </div>
                </div>
              ))}
            </div>

            {lignes.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Aucune ligne. Cliquez sur &quot;Ajouter&quot; pour commencer.</p>
            )}
          </div>

          {/* Client info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client-nom" className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
                <input
                  id="client-nom"
                  type="text"
                  className="input-field w-full"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  placeholder="M. Dupont"
                />
              </div>
              <div>
                <label htmlFor="client-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="client-email"
                  type="email"
                  className="input-field w-full"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label htmlFor="client-telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  id="client-telephone"
                  type="tel"
                  className="input-field w-full"
                  value={clientTelephone}
                  onChange={(e) => setClientTelephone(e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label htmlFor="client-adresse" className="block text-sm font-medium text-gray-700 mb-1">Adresse client</label>
                <input
                  id="client-adresse"
                  type="text"
                  className="input-field w-full"
                  value={clientAdresse}
                  onChange={(e) => setClientAdresse(e.target.value)}
                  placeholder="12 rue des Lilas, 75015 Paris"
                />
              </div>
            </div>
          </div>

          {/* Chantier & conditions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Chantier et conditions</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="adresse-chantier" className="block text-sm font-medium text-gray-700 mb-1">Adresse du chantier</label>
                <input
                  id="adresse-chantier"
                  type="text"
                  className="input-field w-full"
                  value={adresseChantier}
                  onChange={(e) => setAdresseChantier(e.target.value)}
                  placeholder="Si différente de l'adresse client"
                />
              </div>
              <div>
                <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 mb-1">Conditions de règlement</label>
                <input
                  id="conditions"
                  type="text"
                  className="input-field w-full"
                  value={conditionsReglement}
                  onChange={(e) => setConditionsReglement(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / remarques</label>
                <textarea
                  id="notes"
                  className="input-field w-full min-h-[80px] resize-y"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total HT</span>
                <span className="font-medium">{formatPrix(totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  TVA
                  <select
                    className="input-field text-sm py-0.5 px-1 w-20"
                    value={tauxTVA}
                    onChange={(e) => setTauxTVA(parseFloat(e.target.value))}
                  >
                    <option value={5.5}>5,5%</option>
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                  </select>
                </span>
                <span className="font-medium">{formatPrix(totalTVA)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-gray-900 font-semibold">Total TTC</span>
                <span className="text-lg font-bold text-blue-600">{formatPrix(totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setEtape(1)}
              className="btn-primary px-4 py-2.5 order-2 sm:order-1"
            >
              Retour
            </button>
            <button
              onClick={() => setEtape(3)}
              disabled={lignes.length === 0}
              className="btn-accent px-6 py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm */}
      {etape === 3 && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé du devis</h2>

            {clientNom && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{clientNom}</p>
                {clientEmail && <p className="text-sm text-gray-600">{clientEmail}</p>}
                {clientTelephone && <p className="text-sm text-gray-600">{clientTelephone}</p>}
                {clientAdresse && <p className="text-sm text-gray-600">{clientAdresse}</p>}
              </div>
            )}

            {adresseChantier && (
              <div className="mb-4">
                <span className="text-sm text-gray-500">Adresse du chantier :</span>
                <p className="text-sm font-medium text-gray-900">{adresseChantier}</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 space-y-2">
              {lignes.map((ligne, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-700">
                    {ligne.description}
                    <span className="text-gray-400 ml-2">
                      ({ligne.quantite} {ligne.unite} x {formatPrix(ligne.prix_unitaire)})
                    </span>
                  </span>
                  <span className="font-medium text-gray-900 shrink-0 ml-4">{formatPrix(ligne.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total HT</span>
                <span>{formatPrix(totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA ({tauxTVA}%)</span>
                <span>{formatPrix(totalTVA)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Total TTC</span>
                <span className="text-blue-600">{formatPrix(totalTTC)}</span>
              </div>
            </div>

            {conditionsReglement && (
              <p className="text-xs text-gray-500 mt-4">Conditions : {conditionsReglement}</p>
            )}
            {notes && (
              <p className="text-xs text-gray-500 mt-1">Notes : {notes}</p>
            )}
          </div>

          {/* Final actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={() => setEtape(2)}
              disabled={saving}
              className="btn-primary px-4 py-2.5 order-2 sm:order-1"
            >
              Modifier le devis
            </button>
            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              <button
                onClick={() => sauvegarder('brouillon')}
                disabled={saving}
                className="btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer en brouillon'}
              </button>
              <button
                onClick={() => sauvegarder('envoye')}
                disabled={saving}
                className="btn-accent px-5 py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer et voir le PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
