'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import type { Devis, Profile } from '@/types/database'
import DevisPDF from '@/components/pdf/DevisPDF'
import SignaturePad from '@/components/ui/SignaturePad'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <span>Chargement du PDF...</span> }
)

const statutConfig: Record<string, { label: string; bg: string; text: string }> = {
  brouillon: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700' },
  envoye: { label: 'Envoyé', bg: 'bg-blue-100', text: 'text-blue-700' },
  vu: { label: 'Vu', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  accepte: { label: 'Accepté', bg: 'bg-green-100', text: 'text-green-700' },
  refuse: { label: 'Refusé', bg: 'bg-red-100', text: 'text-red-700' },
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function DevisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [devis, setDevis] = useState<Devis | null>(null)
  const [profil, setProfil] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [envoyerLoading, setEnvoyerLoading] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailDestinataire, setEmailDestinataire] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showSignature, setShowSignature] = useState(false)
  const [signatureData, setSignatureData] = useState<{ image: string; name: string; date: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const { data: devisData } = await supabase
        .from('devis')
        .select('*, client:clients(*), lignes:devis_lignes(*)')
        .eq('id', id)
        .single()

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profilData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setProfil(profilData)
      }

      if (devisData) {
        if (devisData.lignes) {
          devisData.lignes.sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
        }
        setDevis(devisData)
        if (devisData.client?.email) {
          setEmailDestinataire(devisData.client.email)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [id])

  async function handleEnvoyerEmail() {
    if (!emailDestinataire) return
    setEnvoyerLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/devis/envoyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devis_id: id, email_destinataire: emailDestinataire }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Devis envoyé avec succès !' })
        setShowEmailModal(false)
        setDevis((prev) => prev ? { ...prev, statut: 'envoye' } : prev)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || "Erreur lors de l'envoi" })
      }
    } catch {
      setMessage({ type: 'error', text: "Erreur lors de l'envoi de l'email" })
    } finally {
      setEnvoyerLoading(false)
    }
  }

  async function handleChangeStatut(newStatut: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('devis')
      .update({ statut: newStatut })
      .eq('id', id)

    if (!error) {
      setDevis((prev) => prev ? { ...prev, statut: newStatut as Devis['statut'] } : prev)
    }
  }

  function handleSignatureSave(imageDataUrl: string, signerName: string) {
    const sigData = {
      image: imageDataUrl,
      name: signerName,
      date: new Date().toISOString(),
    }
    setSignatureData(sigData)
    setShowSignature(false)
    // Store in localStorage for demo mode
    localStorage.setItem(`signature-${id}`, JSON.stringify(sigData))
    setMessage({ type: 'success', text: `Devis signé par ${signerName}` })
    handleChangeStatut('accepte')
  }

  // Load signature from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`signature-${id}`)
    if (saved) {
      setSignatureData(JSON.parse(saved))
    }
  }, [id])

  function handleWhatsApp() {
    if (!devis) return
    const text = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint le devis ${devis.reference} d'un montant de ${formatMontant(devis.total_ttc)} TTC.\n\nCordialement`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (!devis) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-700">Devis introuvable</h2>
        <button
          onClick={() => router.push('/dashboard/historique')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Retour à l&apos;historique
        </button>
      </div>
    )
  }

  const statut = statutConfig[devis.statut] || statutConfig.brouillon

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push('/dashboard/historique')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
          >
            &larr; Retour
          </button>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Devis {devis.reference}</h1>
          <p className="text-gray-500">Créé le {formatDate(devis.date_creation)}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statut.bg} ${statut.text}`}>
            {statut.label}
          </span>
          {devis && profil && (
            <PDFDownloadLink
              document={<DevisPDF devis={devis} profil={profil} signature={signatureData} />}
              fileName={`devis-${devis.reference}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button
                  disabled={pdfLoading}
                  className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#15304f] transition disabled:opacity-50"
                >
                  {pdfLoading ? 'Préparation...' : 'Télécharger PDF'}
                </button>
              )}
            </PDFDownloadLink>
          )}
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Envoyer par email
          </button>
          <button
            onClick={handleWhatsApp}
            className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1da851] transition"
          >
            WhatsApp
          </button>
          <button
            onClick={() => setShowSignature(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            Faire signer
          </button>
          <select
            value={devis.statut}
            onChange={(e) => handleChangeStatut(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="brouillon">Brouillon</option>
            <option value="envoye">Envoyé</option>
            <option value="vu">Vu</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>
          </select>
        </div>
      </div>

      {/* Infos client */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 border-b pb-2">Informations client</h2>
        {devis.client ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="font-medium">{devis.client.nom}</p>
            </div>
            {devis.client.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{devis.client.email}</p>
              </div>
            )}
            {devis.client.telephone && (
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="font-medium">{devis.client.telephone}</p>
              </div>
            )}
            {devis.client.adresse && (
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">{devis.client.adresse}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Aucun client associé</p>
        )}
        {devis.adresse_chantier && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Adresse du chantier</p>
            <p className="font-medium">{devis.adresse_chantier}</p>
          </div>
        )}
      </div>

      {/* Description du chantier */}
      {devis.description_chantier && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 border-b pb-2">Description du chantier</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{devis.description_chantier}</p>
        </div>
      )}

      {/* Tableau des prestations */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 border-b pb-2">Prestations</h2>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[#1e3a5f] text-white">
              <th className="text-left p-3 rounded-tl-lg">Description</th>
              <th className="text-center p-3">Quantité</th>
              <th className="text-center p-3">Unité</th>
              <th className="text-right p-3">Prix unit. HT</th>
              <th className="text-right p-3 rounded-tr-lg">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {devis.lignes?.map((ligne, index) => (
              <tr key={ligne.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3">{ligne.description}</td>
                <td className="p-3 text-center">{ligne.quantite}</td>
                <td className="p-3 text-center">{ligne.unite}</td>
                <td className="p-3 text-right">{formatMontant(ligne.prix_unitaire)}</td>
                <td className="p-3 text-right font-medium">{formatMontant(ligne.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-col items-end gap-2">
          <div className="flex justify-between w-64">
            <span className="text-gray-600">Total HT</span>
            <span className="font-medium">{formatMontant(devis.total_ht)}</span>
          </div>
          <div className="flex justify-between w-64">
            <span className="text-gray-600">TVA ({devis.taux_tva}%)</span>
            <span className="font-medium">{formatMontant(devis.total_tva)}</span>
          </div>
          <div className="flex justify-between w-64 bg-[#1e3a5f] text-white p-3 rounded-lg text-lg">
            <span className="font-bold">Total TTC</span>
            <span className="font-bold">{formatMontant(devis.total_ttc)}</span>
          </div>
        </div>
      </div>

      {/* Conditions */}
      {devis.conditions_reglement && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 border-b pb-2">Conditions de règlement</h2>
          <p className="text-gray-700">{devis.conditions_reglement}</p>
        </div>
      )}

      {/* Notes */}
      {devis.notes && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 border-b pb-2">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{devis.notes}</p>
        </div>
      )}

      {/* Signature */}
      {signatureData && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4 border-b pb-2">Signature</h2>
          <div className="flex items-end gap-6">
            <div>
              <img src={signatureData.image} alt="Signature" className="h-20 border-b border-gray-300" />
              <p className="text-sm text-gray-600 mt-2">{signatureData.name}</p>
              <p className="text-xs text-gray-400">Signé le {formatDate(signatureData.date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validité */}
      <div className="text-sm text-gray-500 text-center">
        Devis valable jusqu&apos;au {formatDate(devis.date_validite)}
      </div>

      {/* Modal signature */}
      {showSignature && (
        <SignaturePad
          onSave={handleSignatureSave}
          onClose={() => setShowSignature(false)}
        />
      )}

      {/* Modal envoi email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">Envoyer le devis par email</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email du destinataire
            </label>
            <input
              type="email"
              value={emailDestinataire}
              onChange={(e) => setEmailDestinataire(e.target.value)}
              placeholder="client@email.com"
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleEnvoyerEmail}
                disabled={envoyerLoading || !emailDestinataire}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {envoyerLoading ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
