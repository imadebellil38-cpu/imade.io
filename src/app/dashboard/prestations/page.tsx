'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Prestation } from '@/types/database'

type Unite = Prestation['unite']

const UNITES: { value: Unite; label: string }[] = [
  { value: 'h', label: 'Heure (h)' },
  { value: 'forfait', label: 'Forfait' },
  { value: 'm²', label: 'm²' },
  { value: 'pièce', label: 'Pièce' },
  { value: 'ml', label: 'Mètre linéaire (ml)' },
  { value: 'kg', label: 'Kilogramme (kg)' },
]

interface PrestationForm {
  nom: string
  description: string
  prix_unitaire: string
  unite: Unite
}

const emptyForm: PrestationForm = {
  nom: '',
  description: '',
  prix_unitaire: '',
  unite: 'h',
}

function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(prix)
}

function getUniteLabel(unite: Unite): string {
  return UNITES.find((u) => u.value === unite)?.label ?? unite
}

export default function PrestationsPage() {
  const [prestations, setPrestations] = useState<Prestation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PrestationForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<PrestationForm>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadPrestations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPrestations() {
    setLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: fetchError } = await supabase
        .from('prestations')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setPrestations(data ?? [])
    } catch {
      setError('Impossible de charger les prestations.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error: insertError } = await supabase.from('prestations').insert({
        artisan_id: user.id,
        nom: form.nom.trim(),
        description: form.description.trim() || null,
        prix_unitaire: parseFloat(form.prix_unitaire),
        unite: form.unite,
      })

      if (insertError) throw insertError
      setForm(emptyForm)
      setShowForm(false)
      await loadPrestations()
    } catch {
      setError('Erreur lors de l\'ajout de la prestation.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(id: string) {
    setSubmitting(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('prestations')
        .update({
          nom: editForm.nom.trim(),
          description: editForm.description.trim() || null,
          prix_unitaire: parseFloat(editForm.prix_unitaire),
          unite: editForm.unite,
        })
        .eq('id', id)

      if (updateError) throw updateError
      setEditingId(null)
      await loadPrestations()
    } catch {
      setError('Erreur lors de la mise à jour.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette prestation ?')) return
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('prestations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setPrestations((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  function startEdit(prestation: Prestation) {
    setEditingId(prestation.id)
    setEditForm({
      nom: prestation.nom,
      description: prestation.description ?? '',
      prix_unitaire: String(prestation.prix_unitaire),
      unite: prestation.unite,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes prestations</h1>
        <p className="text-gray-500 mt-1">
          Votre catalogue de prestations habituelles
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary mb-6 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Ajouter une prestation
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nouvelle prestation
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                id="nom"
                type="text"
                required
                className="input-field"
                placeholder="Ex : Pose de carrelage"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                className="input-field"
                rows={2}
                placeholder="Description optionnelle..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire (EUR HT) *
                </label>
                <input
                  id="prix"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={form.prix_unitaire}
                  onChange={(e) =>
                    setForm({ ...form, prix_unitaire: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="unite" className="block text-sm font-medium text-gray-700 mb-1">
                  Unite
                </label>
                <select
                  id="unite"
                  className="input-field"
                  value={form.unite}
                  onChange={(e) =>
                    setForm({ ...form, unite: e.target.value as Unite })
                  }
                >
                  {UNITES.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Ajout en cours...' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setForm(emptyForm)
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          Chargement...
        </div>
      )}

      {/* Empty state */}
      {!loading && prestations.length === 0 && (
        <div className="card text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-gray-500">
            Aucune prestation. Ajoutez vos prestations habituelles pour que
            l&apos;IA puisse proposer vos tarifs.
          </p>
        </div>
      )}

      {/* Prestations grid */}
      {!loading && prestations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {prestations.map((prestation) =>
            editingId === prestation.id ? (
              /* Edit mode */
              <div key={prestation.id} className="card border-2 border-primary-400">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={editForm.nom}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nom: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="input-field"
                      rows={2}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix (EUR HT) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="input-field"
                        value={editForm.prix_unitaire}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            prix_unitaire: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unite
                      </label>
                      <select
                        className="input-field"
                        value={editForm.unite}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            unite: e.target.value as Unite,
                          })
                        }
                      >
                        {UNITES.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdate(prestation.id)}
                      disabled={submitting}
                      className="btn-primary text-sm"
                    >
                      {submitting ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div key={prestation.id} className="card group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {prestation.nom}
                    </h3>
                    {prestation.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {prestation.description}
                      </p>
                    )}
                    <p className="text-primary-600 font-medium mt-2">
                      {formatPrix(prestation.prix_unitaire)}{' '}
                      <span className="text-gray-400 font-normal text-sm">
                        / {getUniteLabel(prestation.unite)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(prestation)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(prestation.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
