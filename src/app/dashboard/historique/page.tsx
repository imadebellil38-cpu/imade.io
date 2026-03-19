'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Devis } from '@/types/database'
import Link from 'next/link'

const statutConfig: Record<string, { label: string; bg: string; text: string }> = {
  brouillon: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700' },
  envoye: { label: 'Envoyé', bg: 'bg-blue-100', text: 'text-blue-700' },
  vu: { label: 'Vu', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  accepte: { label: 'Accepté', bg: 'bg-green-100', text: 'text-green-700' },
  refuse: { label: 'Refusé', bg: 'bg-red-100', text: 'text-red-700' },
}

const tabs = [
  { key: 'tous', label: 'Tous' },
  { key: 'brouillon', label: 'Brouillon' },
  { key: 'envoye', label: 'Envoyé' },
  { key: 'accepte', label: 'Accepté' },
  { key: 'refuse', label: 'Refusé' },
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

export default function HistoriquePage() {
  const router = useRouter()
  const [devisList, setDevisList] = useState<Devis[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadDevis() {
      const supabase = createClient()
      const { data } = await supabase
        .from('devis')
        .select('*, client:clients(*)')
        .order('created_at', { ascending: false })

      if (data) {
        setDevisList(data)
      }
      setLoading(false)
    }

    loadDevis()
  }, [])

  const filteredDevis = devisList.filter((d) => {
    const matchTab = activeTab === 'tous' || d.statut === activeTab
    const searchLower = search.toLowerCase()
    const matchSearch =
      !search ||
      d.reference.toLowerCase().includes(searchLower) ||
      d.client?.nom?.toLowerCase().includes(searchLower)
    return matchTab && matchSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Historique des devis</h1>
        <Link
          href="/dashboard/devis/nouveau"
          className="px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#15304f] transition text-center"
        >
          Nouveau devis
        </Link>
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par référence ou nom de client..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredDevis.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 text-5xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-4">
            {search || activeTab !== 'tous'
              ? 'Aucun devis ne correspond à votre recherche.'
              : 'Aucun devis pour l\'instant. Créez votre premier devis !'}
          </p>
          {!search && activeTab === 'tous' && (
            <Link
              href="/dashboard/devis/nouveau"
              className="inline-block px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#15304f] transition"
            >
              Créer un devis
            </Link>
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
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Montant TTC</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDevis.map((d) => {
                  const statut = statutConfig[d.statut] || statutConfig.brouillon
                  return (
                    <tr
                      key={d.id}
                      onClick={() => router.push(`/dashboard/devis/${d.id}`)}
                      className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="p-4 font-medium text-[#1e3a5f]">{d.reference}</td>
                      <td className="p-4 text-gray-700">{d.client?.nom || '-'}</td>
                      <td className="p-4 text-gray-500">{formatDate(d.date_creation)}</td>
                      <td className="p-4 text-right font-medium">{formatMontant(d.total_ttc)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                          {statut.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/devis/${d.id}`)
                          }}
                          className="text-sm text-blue-600 hover:underline"
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
            {filteredDevis.map((d) => {
              const statut = statutConfig[d.statut] || statutConfig.brouillon
              return (
                <div
                  key={d.id}
                  onClick={() => router.push(`/dashboard/devis/${d.id}`)}
                  className="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1e3a5f]">{d.reference}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                      {statut.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{d.client?.nom || '-'}</span>
                    <span className="font-medium">{formatMontant(d.total_ttc)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{formatDate(d.date_creation)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
