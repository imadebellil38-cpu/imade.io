'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  nom_entreprise: string
  siret: string
  adresse: string
  telephone: string
  email: string
  garantie_decennale: string
  mentions_legales: string
  taux_tva: string
  logo_url: string
}

const defaultProfile: Profile = {
  nom_entreprise: '',
  siret: '',
  adresse: '',
  telephone: '',
  email: '',
  garantie_decennale: '',
  mentions_legales: '',
  taux_tva: '20',
  logo_url: '',
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement profil:', error)
        return
      }

      if (data) {
        setProfile({
          nom_entreprise: data.nom_entreprise || '',
          siret: data.siret || '',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          email: data.email || user.email || '',
          garantie_decennale: data.garantie_decennale || '',
          mentions_legales: data.mentions_legales || '',
          taux_tva: data.taux_tva?.toString() || '20',
          logo_url: data.logo_url || '',
        })
      } else {
        setProfile((prev) => ({ ...prev, email: user.email || '' }))
      }
    } catch {
      console.error('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (userId: string): Promise<string | null> => {
    if (!logoFile) return profile.logo_url || null

    const supabase = createClient()
    const fileExt = logoFile.name.split('.').pop()
    const filePath = `${userId}/logo.${fileExt}`

    const { error } = await supabase.storage
      .from('logos')
      .upload(filePath, logoFile, { upsert: true })

    if (error) {
      console.error('Erreur upload logo:', error)
      return profile.logo_url || null
    }

    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Vous devez être connecté.')
        return
      }

      const logoUrl = await handleLogoUpload(user.id)

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nom_entreprise: profile.nom_entreprise,
          siret: profile.siret,
          adresse: profile.adresse,
          telephone: profile.telephone,
          email: profile.email,
          garantie_decennale: profile.garantie_decennale,
          mentions_legales: profile.mentions_legales,
          taux_tva: parseFloat(profile.taux_tva) || 20,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Une erreur inattendue est survenue.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-700">Mon profil</h1>
        <p className="mt-1 text-gray-600">
          Complétez vos informations pour générer des devis professionnels
        </p>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
          <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Profil enregistré avec succès !
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations entreprise */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations de l&apos;entreprise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l&apos;entreprise
              </label>
              <input
                id="nom_entreprise"
                type="text"
                value={profile.nom_entreprise}
                onChange={(e) => handleChange('nom_entreprise', e.target.value)}
                className="input-field"
                placeholder="Mon Entreprise BTP"
              />
            </div>

            <div>
              <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
                SIRET
              </label>
              <input
                id="siret"
                type="text"
                value={profile.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
                className="input-field"
                placeholder="123 456 789 00012"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                id="adresse"
                type="text"
                value={profile.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                className="input-field"
                placeholder="12 rue de la Paix, 75002 Paris"
              />
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                value={profile.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                className="input-field"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail de contact
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-field"
                placeholder="contact@entreprise.fr"
              />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Logo de l&apos;entreprise
          </h2>
          <div className="flex items-center gap-4">
            {profile.logo_url && (
              <img
                src={profile.logo_url}
                alt="Logo"
                className="h-16 w-16 object-contain rounded border border-gray-200"
              />
            )}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                {profile.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
              </label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700 file:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Informations légales */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations légales &amp; fiscales
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="garantie_decennale" className="block text-sm font-medium text-gray-700 mb-1">
                Garantie décennale
              </label>
              <input
                id="garantie_decennale"
                type="text"
                value={profile.garantie_decennale}
                onChange={(e) => handleChange('garantie_decennale', e.target.value)}
                className="input-field"
                placeholder="Assureur, numéro de contrat..."
              />
            </div>

            <div>
              <label htmlFor="taux_tva" className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA par défaut (%)
              </label>
              <input
                id="taux_tva"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={profile.taux_tva}
                onChange={(e) => handleChange('taux_tva', e.target.value)}
                className="input-field max-w-[200px]"
                placeholder="20"
              />
            </div>

            <div>
              <label htmlFor="mentions_legales" className="block text-sm font-medium text-gray-700 mb-1">
                Mentions légales
              </label>
              <textarea
                id="mentions_legales"
                rows={4}
                value={profile.mentions_legales}
                onChange={(e) => handleChange('mentions_legales', e.target.value)}
                className="input-field"
                placeholder="Conditions de paiement, pénalités de retard..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer le profil'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
