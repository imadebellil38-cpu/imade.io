'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { demoProfile, demoDevis } from '@/lib/demo/data'
import { isDemoMode } from '@/lib/demo/data'
import type { Devis, Profile } from '@/types/database'
import Link from 'next/link'

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
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  // Initialize with demo data immediately to avoid loading spinner
  const demo = isDemoMode()
  const [profile, setProfile] = useState<Profile | null>(demo ? demoProfile : null)
  const [devisList, setDevisList] = useState<Devis[]>(demo ? (demoDevis as Devis[]) : [])
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return // Already loaded with demo data

    async function loadData() {
      try {
        const supabase = createClient()

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        const { data: devisData } = await supabase
          .from('devis')
          .select('*, client:clients(*)')
          .order('created_at', { ascending: false })

        if (devisData) {
          setDevisList(devisData)
        }
      } catch (err) {
        console.error('Erreur chargement dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [demo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const devisThisMonth = devisList.filter((d) => d.date_creation >= startOfMonth)
  const devisAcceptes = devisList.filter((d) => d.statut === 'accepte')
  const devisAcceptesThisMonth = devisList.filter(
    (d) => d.statut === 'accepte' && d.date_creation >= startOfMonth
  )
  const caThisMonth = devisAcceptesThisMonth.reduce((sum, d) => sum + d.total_ttc, 0)
  const tauxAcceptation =
    devisList.length > 0
      ? Math.round((devisAcceptes.length / devisList.length) * 100)
      : 0

  const recentDevis = devisList.slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">
          Bienvenue{profile?.nom_entreprise ? `, ${profile.nom_entreprise}` : ''} !
        </h1>
        <p className="text-gray-500 mt-1">
          Voici un aper&ccedil;u de votre activit&eacute;
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Devis ce mois */}
        <div className="card flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Devis ce mois</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">{devisThisMonth.length}</p>
          </div>
        </div>

        {/* Devis acceptés */}
        <div className="card flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Devis accept&eacute;s</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{devisAcceptes.length}</p>
          </div>
        </div>

        {/* CA ce mois */}
        <div className="card flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">CA ce mois</p>
            <p className="text-3xl font-bold text-accent-500 mt-1">{formatMontant(caThisMonth)}</p>
          </div>
        </div>

        {/* Taux d'acceptation */}
        <div className="card flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Taux d&apos;acceptation</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{tauxAcceptation}%</p>
          </div>
        </div>
      </div>

      {/* CA Chart - 6 derniers mois */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-primary-600 mb-4">Chiffre d&apos;affaires</h2>
          <div className="flex items-end gap-2 h-40">
            {(() => {
              const months: { label: string; ca: number }[] = []
              for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
                const label = d.toLocaleDateString('fr-FR', { month: 'short' })
                const ca = devisList
                  .filter(dv => dv.statut === 'accepte' && dv.date_creation >= d.toISOString() && dv.date_creation <= end.toISOString())
                  .reduce((s, dv) => s + dv.total_ttc, 0)
                months.push({ label, ca })
              }
              const maxCA = Math.max(...months.map(m => m.ca), 1)
              return months.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">
                    {m.ca > 0 ? formatMontant(m.ca).replace(',00', '').replace('€', '').trim() + '€' : ''}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400 transition-all"
                    style={{ height: `${Math.max((m.ca / maxCA) * 100, 4)}%` }}
                  />
                  <span className="text-xs text-gray-500">{m.label}</span>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Top clients */}
        <div className="card">
          <h2 className="text-lg font-semibold text-primary-600 mb-4">Top clients</h2>
          {(() => {
            const clientCA: Record<string, { nom: string; total: number }> = {}
            devisList.filter(d => d.statut === 'accepte').forEach(d => {
              const nom = d.client?.nom || 'Inconnu'
              if (!clientCA[nom]) clientCA[nom] = { nom, total: 0 }
              clientCA[nom].total += d.total_ttc
            })
            const top = Object.values(clientCA).sort((a, b) => b.total - a.total).slice(0, 3)
            if (top.length === 0) return <p className="text-gray-400 text-sm">Aucun devis accepté</p>
            return (
              <div className="space-y-3">
                {top.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                      }`}>{i + 1}</span>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{c.nom}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">{formatMontant(c.total)}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link
          href="/dashboard/devis/nouveau"
          className="btn-primary flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau devis
        </Link>
        <Link
          href="/dashboard/historique"
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Voir historique
        </Link>
      </div>

      {/* Recent devis */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary-600">Derniers devis</h2>
          <Link href="/dashboard/historique" className="text-sm text-primary-600 hover:underline">
            Voir tout
          </Link>
        </div>

        {recentDevis.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">Aucun devis pour l&apos;instant.</p>
            <Link
              href="/dashboard/devis/nouveau"
              className="inline-block mt-3 text-sm text-primary-600 hover:underline"
            >
              Cr&eacute;er votre premier devis
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-500">R&eacute;f&eacute;rence</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-500">Client</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-500">Montant TTC</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-500">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDevis.map((d) => {
                    const statut = statutConfig[d.statut] || statutConfig.brouillon
                    return (
                      <tr key={d.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                        <td className="p-3">
                          <Link href={`/dashboard/devis/${d.id}`} className="font-medium text-primary-600 hover:underline">
                            {d.reference}
                          </Link>
                        </td>
                        <td className="p-3 text-gray-700">{d.client?.nom || '-'}</td>
                        <td className="p-3 text-gray-500">{formatDate(d.date_creation)}</td>
                        <td className="p-3 text-right font-medium">{formatMontant(d.total_ttc)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                            {statut.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {recentDevis.map((d) => {
                const statut = statutConfig[d.statut] || statutConfig.brouillon
                return (
                  <Link
                    key={d.id}
                    href={`/dashboard/devis/${d.id}`}
                    className="block rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary-600">{d.reference}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                        {statut.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{d.client?.nom || '-'}</span>
                      <span className="font-medium">{formatMontant(d.total_ttc)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{formatDate(d.date_creation)}</div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
