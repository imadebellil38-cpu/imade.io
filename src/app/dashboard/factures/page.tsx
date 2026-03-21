'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

const tabs = [
  { key: 'tous', label: 'Tous' },
  { key: 'brouillon', label: 'Brouillon' },
  { key: 'envoyee', label: 'Envoyée' },
  { key: 'payee', label: 'Payée' },
  { key: 'en_retard', label: 'En retard' },
]

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function FacturesPage() {
  const router = useRouter()
  const [facturesList, setFacturesList] = useState<Facture[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tous')
  const [search, setSearch] = useState('')
  const [convertirLoading, setConvertirLoading] = useState(false)
  const [showConvertirModal, setShowConvertirModal] = useState(false)
  const [devisDisponibles, setDevisDisponibles] = useState<{ id: string; reference: string; client_nom: string; total_ttc: number }[]>([])

  useEffect(() => {
    async function loadFactures() {
      const supabase = createClient()
      const { data } = await supabase
        .from('factures')
        .select('*, client:clients(*)')
        .order('created_at', { ascending: false })

      if (data) {
        setFacturesList(data)
      }
      setLoading(false)
    }

    loadFactures()
  }, [])

  async function openConvertirModal() {
    setShowConvertirModal(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('devis')
      .select('id, reference, total_ttc, client:clients(nom)')
      .in('statut', ['accepte', 'envoye'])
      .order('created_at', { ascending: false })

    if (data) {
      setDevisDisponibles(
        data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          reference: d.reference as string,
          client_nom: (d.client as { nom?: string } | null)?.nom || '-',
          total_ttc: d.total_ttc as number,
        }))
      )
    }
  }

  async function convertirDevis(devisId: string) {
    setConvertirLoading(true)
    try {
      const res = await fetch('/api/factures/convertir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devis_id: devisId }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/dashboard/factures/${data.id}`)
      }
    } catch (error) {
      console.error('Erreur conversion:', error)
    } finally {
      setConvertirLoading(false)
      setShowConvertirModal(false)
    }
  }

  const filteredFactures = facturesList.filter((f) => {
    const matchTab = activeTab === 'tous' || f.statut === activeTab
    const searchLower = search.toLowerCase()
    const matchSearch =
      !search ||
      f.reference.toLowerCase().includes(searchLower) ||
      f.client?.nom?.toLowerCase().includes(searchLower)
    return matchTab && matchSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary-600">Factures</h1>
        <div className="flex gap-2">
          <button
            onClick={openConvertirModal}
            className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-center text-sm"
          >
            Convertir un devis
          </button>
          <Link
            href="/dashboard/factures/nouvelle"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center text-sm"
          >
            Nouvelle facture
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par référence ou nom de client..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 outline-none"
        />
      </div>

      {/* Onglets de filtre */}
      <div className="flex gap-1 mb-6 overflow-x-auto border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition border-b-2 ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredFactures.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-5xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-4">
            {search || activeTab !== 'tous'
              ? 'Aucune facture ne correspond à votre recherche.'
              : 'Aucune facture pour l\'instant. Créez votre première facture !'}
          </p>
          {!search && activeTab === 'tous' && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={openConvertirModal}
                className="inline-block px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
              >
                Convertir un devis
              </button>
              <Link
                href="/dashboard/factures/nouvelle"
                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Créer une facture
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Référence</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Client</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Date émission</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Échéance</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Montant TTC</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFactures.map((f) => {
                  const statut = statutConfig[f.statut] || statutConfig.brouillon
                  return (
                    <tr
                      key={f.id}
                      onClick={() => router.push(`/dashboard/factures/${f.id}`)}
                      className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="p-4 font-medium text-primary-600">{f.reference}</td>
                      <td className="p-4 text-gray-700">{f.client?.nom || '-'}</td>
                      <td className="p-4 text-gray-500">{formatDate(f.date_emission)}</td>
                      <td className="p-4 text-gray-500">{formatDate(f.date_echeance)}</td>
                      <td className="p-4 text-right font-medium">{formatMontant(f.total_ttc)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                          {statut.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/factures/${f.id}`)
                          }}
                          className="text-sm text-accent-500 hover:underline"
                        >
                          Voir
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Cartes mobile */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredFactures.map((f) => {
              const statut = statutConfig[f.statut] || statutConfig.brouillon
              return (
                <div
                  key={f.id}
                  onClick={() => router.push(`/dashboard/factures/${f.id}`)}
                  className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-primary-600">{f.reference}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                      {statut.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{f.client?.nom || '-'}</span>
                    <span className="font-medium">{formatMontant(f.total_ttc)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>Émise le {formatDate(f.date_emission)}</span>
                    <span>Échéance: {formatDate(f.date_echeance)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Modal Convertir un devis */}
      {showConvertirModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary-600">Convertir un devis en facture</h2>
                <button
                  onClick={() => setShowConvertirModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {devisDisponibles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun devis disponible pour conversion.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {devisDisponibles.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => convertirDevis(d.id)}
                      disabled={convertirLoading}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition text-left disabled:opacity-50"
                    >
                      <div>
                        <div className="font-medium text-primary-600">{d.reference}</div>
                        <div className="text-sm text-gray-500">{d.client_nom}</div>
                      </div>
                      <div className="font-medium">{formatMontant(d.total_ttc)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
