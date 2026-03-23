'use client'

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Devis, Profile } from '@/types/database'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  entreprise: {
    textAlign: 'right',
  },
  entrepriseNom: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  titre: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 5,
  },
  reference: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 8,
    borderBottom: '1 solid #1e3a5f',
    paddingBottom: 4,
  },
  clientSection: {
    backgroundColor: '#f5f7fa',
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontFamily: 'Helvetica-Bold',
    width: 120,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    color: '#fff',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5 solid #ddd',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5 solid #ddd',
    backgroundColor: '#f9fafb',
  },
  colDescription: { width: '40%' },
  colQuantite: { width: '12%', textAlign: 'center' },
  colUnite: { width: '12%', textAlign: 'center' },
  colPrixUnitaire: { width: '18%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },
  totaux: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    width: 250,
  },
  totalLabel: {
    width: 150,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  totalTTC: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 250,
    backgroundColor: '#1e3a5f',
    color: '#fff',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
  },
  mentions: {
    marginTop: 30,
    fontSize: 8,
    color: '#888',
    borderTop: '0.5 solid #ddd',
    paddingTop: 10,
  },
  conditions: {
    marginTop: 15,
    fontSize: 9,
    padding: 10,
    backgroundColor: '#f5f7fa',
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#aaa',
  },
  validite: {
    marginBottom: 20,
    fontSize: 9,
  },
})

interface DevisPDFProps {
  devis: Devis
  profil: Profile
  signature?: { image: string; name: string; date: string } | null
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

export default function DevisPDF({ devis, profil, signature }: DevisPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            {profil.logo_url && (
              <Image src={profil.logo_url} style={styles.logo} />
            )}
            <Text style={styles.entrepriseNom}>{profil.nom_entreprise}</Text>
            <Text>{profil.adresse}</Text>
            <Text>Tél : {profil.telephone}</Text>
            <Text>{profil.email}</Text>
            {profil.siret && <Text>SIRET : {profil.siret}</Text>}
            {profil.garantie_decennale && (
              <Text>Garantie décennale : {profil.garantie_decennale}</Text>
            )}
          </View>
          <View style={styles.entreprise}>
            <Text style={styles.titre}>DEVIS</Text>
            <Text style={styles.reference}>{devis.reference}</Text>
            <Text>Date : {formatDate(devis.date_creation)}</Text>
          </View>
        </View>

        {/* Infos client */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Client</Text>
          {devis.client && <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>{devis.client.nom}</Text>}
          {devis.client?.adresse && <Text>{devis.client.adresse}</Text>}
          {devis.client?.telephone && <Text>Tél : {devis.client.telephone}</Text>}
          {devis.client?.email && <Text>{devis.client.email}</Text>}
          {devis.adresse_chantier && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Adresse du chantier :</Text>
              <Text>{devis.adresse_chantier}</Text>
            </View>
          )}
        </View>

        {/* Validité */}
        <View style={styles.validite}>
          <Text>Validité du devis : {formatDate(devis.date_validite)}</Text>
        </View>

        {/* Tableau des prestations */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQuantite}>Qté</Text>
            <Text style={styles.colUnite}>Unité</Text>
            <Text style={styles.colPrixUnitaire}>Prix unit. HT</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {devis.lignes?.map((ligne, index) => (
            <View key={ligne.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.colDescription}>{ligne.description}</Text>
              <Text style={styles.colQuantite}>{ligne.quantite}</Text>
              <Text style={styles.colUnite}>{ligne.unite}</Text>
              <Text style={styles.colPrixUnitaire}>{formatMontant(ligne.prix_unitaire)}</Text>
              <Text style={styles.colTotal}>{formatMontant(ligne.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totaux */}
        <View style={styles.totaux}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{formatMontant(devis.total_ht)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({devis.taux_tva}%)</Text>
            <Text style={styles.totalValue}>{formatMontant(devis.total_tva)}</Text>
          </View>
          <View style={styles.totalTTC}>
            <Text style={{ width: 150, textAlign: 'right', paddingRight: 10 }}>Total TTC</Text>
            <Text style={{ width: 100, textAlign: 'right' }}>{formatMontant(devis.total_ttc)}</Text>
          </View>
        </View>

        {/* Conditions de règlement */}
        {devis.conditions_reglement && (
          <View style={styles.conditions}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Conditions de règlement</Text>
            <Text>{devis.conditions_reglement}</Text>
          </View>
        )}

        {/* Mentions légales */}
        <View style={styles.mentions}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Mentions légales</Text>
          {profil.mentions_legales ? (
            <Text>{profil.mentions_legales}</Text>
          ) : (
            <>
              <Text>Devis valable {Math.round((new Date(devis.date_validite).getTime() - new Date(devis.date_creation).getTime()) / (1000 * 60 * 60 * 24))} jours à compter de la date d&apos;émission.</Text>
              <Text>Le client dispose d&apos;un délai de rétractation de 14 jours à compter de la signature du devis.</Text>
              <Text>En cas de litige, le tribunal compétent sera celui du siège social de l&apos;entreprise.</Text>
            </>
          )}
        </View>

        {/* Signature */}
        {signature && (
          <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Bon pour accord</Text>
              <Image src={signature.image} style={{ width: 150, height: 60 }} />
              <Text style={{ fontSize: 8, marginTop: 4 }}>{signature.name}</Text>
              <Text style={{ fontSize: 8, color: '#888' }}>Signé le {formatDate(signature.date)}</Text>
            </View>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>{profil.nom_entreprise} - SIRET : {profil.siret} - {profil.adresse}</Text>
          <Text>Généré par QuotiPro</Text>
        </View>
      </Page>
    </Document>
  )
}
