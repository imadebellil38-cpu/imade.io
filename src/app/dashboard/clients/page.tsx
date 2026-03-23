'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/types/database'

interface ClientWithDevisCount extends Client {
  devis_count: number
}

const emptyForm = { nom: '', email: '', telephone: '', adresse: '' }

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithDevisCount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithDevisCount | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    const supabase = createClient()

    const { data: clientsData } = await supabase
      .from('clients')
      .select('*, devis(id)')
      .order('nom', { ascending: true })

    if (clientsData) {
      const withCount: ClientWithDevisCount[] = clientsData.map((c: any) => {
        const { devis, ...rest } = c as Record<string, unknown> & { devis?: unknown[] }
        return {
          ...(rest as unknown as Client),
          devis_count: Array.isArray(devis) ? devis.length : 0,
        }
      })
      setClients(withCount)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const filteredClients = clients.filter((c) => {
    const searchLower = search.toLowerCase()
    return (
      !search ||
      c.nom.toLowerCase().includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower))
    )
  })

  function openAddModal() {
    setEditingClient(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(client: ClientWithDevisCount) {
    setEditingClient(client)
    setForm({
      nom: client.nom,
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingClient(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) return

    setSaving(true)
    const supabase = createClient()

    if (editingClient) {
      await supabase
        .from('clients')
        .update({
          nom: form.nom.trim(),
          email: form.email.trim() || null,
          telephone: form.telephone.trim() || null,
          adresse: form.adresse.trim() || null,
        })
        .eq('id', editingClient.id)
    } else {
      await supabase.from('clients').insert({
        nom: form.nom.trim(),
        email: form.email.trim() || null,
        telephone: form.telephone.trim() || null,
        adresse: form.adresse.trim() || null,
      })
    }

    setSaving(false)
    closeModal()
    await loadClients()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('clients').delete().eq('id', id)
    setDeleteConfirm(null)
    await loadClients()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-primary-600">Clients</h1>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter un client
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="input-field"
        />
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
      </p>

      {filteredClients.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">
            {search
              ? 'Aucun client ne correspond à votre recherche.'
              : 'Aucun client pour l\'instant.'}
          </p>
          {!search && (
            <button
              onClick={openAddModal}
              className="btn-primary"
            >
              Ajouter votre premier client
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Nom</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">T&eacute;l&eacute;phone</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Adresse</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-500">Devis</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-primary-600">{c.nom}</td>
                    <td className="p-4 text-gray-700">{c.email || '-'}</td>
                    <td className="p-4 text-gray-700">{c.telephone || '-'}</td>
                    <td className="p-4 text-gray-500 max-w-[200px] truncate">{c.adresse || '-'}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-primary-600 text-sm font-medium">
                        {c.devis_count}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 transition rounded-lg hover:bg-gray-100"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {deleteConfirm === c.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(c.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredClients.map((c) => (
              <div
                key={c.id}
                className="card"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-primary-600">{c.nom}</h3>
                    {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
                  </div>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-primary-600 text-xs font-medium flex-shrink-0">
                    {c.devis_count}
                  </span>
                </div>
                {c.telephone && (
                  <p className="text-sm text-gray-500 mb-1">
                    <svg className="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {c.telephone}
                  </p>
                )}
                {c.adresse && (
                  <p className="text-sm text-gray-400 truncate">{c.adresse}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <button
                    onClick={() => openEditModal(c)}
                    className="btn-secondary flex-1 text-center text-sm !py-1.5"
                  >
                    Modifier
                  </button>
                  {deleteConfirm === c.id ? (
                    <div className="flex-1 flex gap-1">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="flex-1 text-center text-sm py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 text-center text-sm py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(c.id)}
                      className="flex-1 text-center text-sm py-1.5 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeModal}></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-primary-600">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">T&eacute;l&eacute;phone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="input-field"
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <textarea
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Adresse du client"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.nom.trim()}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Enregistrement...' : editingClient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
