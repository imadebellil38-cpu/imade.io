'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Facture } from '@/types/database'
import Link from 'next/link'

const statutConfig: Record<string, { label: string; bg: string; text: string }> = {
  brouillon: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700' },
  envoyee: { label: 'Envoyée', bg: 'bg-blue-100', text: 'text-blue-700' },
  payee: { label: 'Payée', bg: 'bg-green-100', text: 'text-green-700' },
  en_retard: { label: 'En retard', bg: 'bg-red-100', text: 'text-red-700' },
  annulee: { label: 'Annulée', bg: 'bg-orange-100', text: 'text-orange-700' },
}

const modePaiementLabels: Record<string, string> = {
  virement: 'Virement bancaire',
  cheque: 'Chèque',
  especes: 'Espèces',
  carte: 'Carte bancaire',
  autre: 'Autre',
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

export default function FactureDetailPage() {
  const router = useRouter()
  const params = useParams()
  const factureId = params.id as string

  const [facture, setFacture] = useState<Facture | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  useEffect(() => {
    async function loadFacture() {
      const supabase = createClient()
      const { data } = await supabase
        .from('factures')
        .select('*, client:clients(*), lignes:facture_lignes(*), devis:devis(id, reference)')
        .eq('id', factureId)
        .single()

      if (data) {
        // Sort lignes by ordre
        if (data.lignes) {
          data.lignes.sort((a: { ordre: number }, b: { ordre: number }) => a.ordre - b.ordre)
        }
        setFacture(data as unknown as Facture)
      }
      setLoading(false)
    }

    loadFacture()
  }, [factureId])

  async function updateStatut(newStatut: string) {
    if (!facture) return
    setActionLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('factures')
        .update({ statut: newStatut })
        .eq('id', facture.id)

      if (!error) {
        setFacture({ ...facture, statut: newStatut as Facture['statut'] })
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
    } finally {
      setActionLoading(false)
      setShowStatusMenu(false)
    }
  }

  async function handleDownloadPDF() {
    // Placeholder for PDF generation
    alert('La génération de PDF sera disponible prochainement.')
  }

  async function handleSendEmail() {
    // Placeholder for email sending
    alert('L\'envoi par email sera disponible prochainement.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!facture) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">Facture introuvable.</p>
          <Link
            href="/dashboard/factures"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Retour aux factures
          </Link>
        </div>
      </div>
    )
  }

  const statut = statutConfig[facture.statut] || statutConfig.brouillon

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href="/dashboard/factures"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            &larr; Retour aux factures
          </Link>
          <h1 className="text-2xl font-bold text-primary-600">{facture.reference}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
              {statut.label}
            </span>
            {facture.devis && (
              <Link
                href={`/dashboard/devis/${facture.devis_id}`}
                className="text-sm text-accent-500 hover:underline"
              >
                Issu du devis {(facture.devis as unknown as { reference: string }).reference}
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Envoyer par email
          </button>
          {facture.statut !== 'payee' && facture.statut !== 'annulee' && (
            <button
              onClick={() => updateStatut('payee')}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Marquer payée
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={actionLoading}
              className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-sm disabled:opacity-50"
            >
              Changer statut
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[160px]">
                {Object.entries(statutConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateStatut(key)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      facture.statut === key ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Détails de la facture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Informations client */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Client</h2>
          {facture.client ? (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{facture.client.nom}</p>
              {facture.client.email && <p className="text-sm text-gray-600">{facture.client.email}</p>}
              {facture.client.telephone && <p className="text-sm text-gray-600">{facture.client.telephone}</p>}
              {facture.client.adresse && <p className="text-sm text-gray-600">{facture.client.adresse}</p>}
            </div>
          ) : (
            <p className="text-gray-400">Aucun client associé</p>
          )}
        </div>

        {/* Informations facture */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Détails</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date d&apos;émission</span>
              <span className="text-sm font-medium">{formatDate(facture.date_emission)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Date d&apos;échéance</span>
              <span className="text-sm font-medium">{formatDate(facture.date_echeance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Mode de paiement</span>
              <span className="text-sm font-medium">{modePaiementLabels[facture.mode_paiement] || facture.mode_paiement}</span>
            </div>
            {facture.conditions_reglement && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Conditions</span>
                <span className="text-sm font-medium">{facture.conditions_reglement}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lignes de facture */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Lignes de facturation</h2>
        </div>

        {/* Tableau desktop */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Description</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Qté</th>
                <th className="text-center p-4 text-sm font-medium text-gray-500">Unité</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Prix unitaire</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {facture.lignes && facture.lignes.length > 0 ? (
                facture.lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-b last:border-b-0">
                    <td className="p-4 text-gray-700">{ligne.description}</td>
                    <td className="p-4 text-right text-gray-600">{ligne.quantite}</td>
                    <td className="p-4 text-center text-gray-600">{ligne.unite}</td>
                    <td className="p-4 text-right text-gray-600">{formatMontant(ligne.prix_unitaire)}</td>
                    <td className="p-4 text-right font-medium">{formatMontant(ligne.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400">Aucune ligne</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cartes mobile */}
        <div className="md:hidden p-4 space-y-3">
          {facture.lignes && facture.lignes.length > 0 ? (
            facture.lignes.map((ligne) => (
              <div key={ligne.id} className="border rounded-lg p-3">
                <p className="font-medium text-gray-700 mb-1">{ligne.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{ligne.quantite} {ligne.unite} x {formatMontant(ligne.prix_unitaire)}</span>
                  <span className="font-medium text-gray-900">{formatMontant(ligne.total)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Aucune ligne</p>
          )}
        </div>
      </div>

      {/* Totaux */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="max-w-xs ml-auto space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total HT</span>
            <span className="text-sm font-medium">{formatMontant(facture.total_ht)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">TVA ({facture.taux_tva}%)</span>
            <span className="text-sm font-medium">{formatMontant(facture.total_tva)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="font-bold text-primary-600">Total TTC</span>
              <span className="font-bold text-primary-600 text-lg">{formatMontant(facture.total_ttc)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {facture.notes && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{facture.notes}</p>
        </div>
      )}
    </div>
  )
}
